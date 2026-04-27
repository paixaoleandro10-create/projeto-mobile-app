from datetime import UTC, datetime

import pytest

from app.models import MobileEvent, ReportGrade, Student, Subject
from app.services.mobile_seed import seed_mobile_data


def test_healthcheck(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["database"] == "ok"


def test_readiness(client):
    response = client.get("/api/v1/health/ready")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ready"
    assert payload["database"] == "ok"


def test_create_record_and_summary(client):
    create_payload = {
        "event_time": datetime.now(UTC).isoformat(),
        "category": "sales",
        "metric_value": 125.4,
        "source": "seed",
        "status": "ok",
        "notes": "initial dataset",
    }
    create_response = client.post("/api/v1/analytics/records", json=create_payload)
    assert create_response.status_code == 201
    created_record = create_response.json()
    assert created_record["category"] == "sales"

    list_response = client.get("/api/v1/analytics/records")
    assert list_response.status_code == 200
    assert len(list_response.json()) >= 1

    summary_response = client.get("/api/v1/analytics/summary", params={"period": "day"})
    assert summary_response.status_code == 200
    summary_items = summary_response.json()
    assert len(summary_items) >= 1
    assert summary_items[0]["category"] == "sales"


def test_mobile_endpoints(client):
    dashboard_response = client.get("/api/v1/mobile/dashboard")
    assert dashboard_response.status_code == 200
    dashboard_payload = dashboard_response.json()
    assert set(dashboard_payload.keys()) == {"overview", "tasks", "performance"}
    assert isinstance(dashboard_payload["tasks"], list)
    assert isinstance(dashboard_payload["performance"], list)
    assert isinstance(dashboard_payload["overview"]["weighted_gpa"], str)
    assert isinstance(dashboard_payload["overview"]["progress_percent"], int)
    assert isinstance(dashboard_payload["overview"]["class_rank"], str)

    subjects_response = client.get("/api/v1/mobile/subjects")
    assert subjects_response.status_code == 200
    subjects_payload = subjects_response.json()
    assert set(subjects_payload.keys()) == {"subjects"}
    assert len(subjects_payload["subjects"]) >= 1
    first_subject = subjects_payload["subjects"][0]
    assert {"id", "subject", "teacher", "grade", "average", "accent", "students"} <= set(
        first_subject.keys()
    )

    schedule_response = client.get("/api/v1/mobile/schedule")
    assert schedule_response.status_code == 200
    schedule_payload = schedule_response.json()
    assert set(schedule_payload.keys()) == {"month_label", "default_day", "events"}
    assert isinstance(schedule_payload["default_day"], int)
    assert isinstance(schedule_payload["events"], list)

    report_response = client.get("/api/v1/mobile/report")
    assert report_response.status_code == 200
    report_payload = report_response.json()
    assert set(report_payload.keys()) == {"student", "summary", "lines"}
    assert {"name", "class_name", "student_id"} <= set(report_payload["student"].keys())
    assert {"overall", "status"} <= set(report_payload["summary"].keys())
    assert isinstance(report_payload["lines"], list)


@pytest.mark.parametrize(
    "route",
    [
        "/mobile",
        "/mobile/subjects",
        "/mobile/schedule",
        "/mobile/report",
        "/mobile-web",
    ],
)
def test_mobile_frontend_routes(route, client):
    response = client.get(route)
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "Modo local sem Node" in response.text
    assert '<meta charset="UTF-8"' in response.text
    assert "Experiência" in response.text
    assert "conteúdo" in response.text
    assert "Matérias" in response.text
    assert "Fundação Web de Dados" in response.text


def test_mobile_frontend_static_assets(client):
    css_response = client.get("/mobile/static/styles.css")
    assert css_response.status_code == 200
    assert "--mobile-bg" in css_response.text
    assert ".chip-link" in css_response.text
    assert ".chip-api" in css_response.text

    js_response = client.get("/mobile/static/app.js")
    assert js_response.status_code == 200
    assert "API_BASE = \"/api/v1/mobile\"" in js_response.text
    assert "ROUTE_TO_SCREEN" in js_response.text
    assert "history.pushState" in js_response.text
    assert "/mobile/subjects" in js_response.text

    legacy_css_response = client.get("/mobile-web/static/styles.css")
    assert legacy_css_response.status_code == 200

    manifest_response = client.get("/mobile/static/manifest.webmanifest")
    assert manifest_response.status_code == 200
    manifest_payload = manifest_response.json()
    assert manifest_payload["start_url"] == "/mobile"
    assert manifest_payload["display"] == "standalone"
    assert "Fundação Web de Dados" in manifest_payload["name"]
    assert "Experiência" in manifest_payload["description"]

    sw_response = client.get("/mobile/sw.js")
    assert sw_response.status_code == 200
    assert "CACHE_NAME" in sw_response.text
    assert "addEventListener(\"install\"" in sw_response.text

    icon_response = client.get("/mobile/static/icons/icon.svg")
    assert icon_response.status_code == 200


def test_web_frontend_static_page(client):
    html_response = client.get("/web")
    assert html_response.status_code == 200
    assert "text/html" in html_response.headers["content-type"]
    assert '<meta charset="UTF-8"' in html_response.text
    assert "Resumo Acadêmico" in html_response.text
    assert "conteúdo" in html_response.text
    assert "Experiência Web" in html_response.text
    assert "Experiência Mobile" in html_response.text
    assert "Navegação rápida" in html_response.text

    css_response = client.get("/web/static/styles.css")
    assert css_response.status_code == 200
    assert "--web-bg" in css_response.text
    assert ".summary-grid" in css_response.text

    js_response = client.get("/web/static/app.js")
    assert js_response.status_code == 200
    assert "Promise.all" in js_response.text
    assert "API_BASE = \"/api/v1/mobile\"" in js_response.text

    labels_response = client.get("/web/static/labels.js")
    assert labels_response.status_code == 200
    assert "Fundação Web de Dados" in labels_response.text


def test_mobile_web_route_supports_manual_fallback_toggle(client):
    fallback_mobile_response = client.get("/mobile?forceFallback=1")
    assert fallback_mobile_response.status_code == 200
    assert "Modo local sem Node" in fallback_mobile_response.text

    fallback_legacy_response = client.get("/mobile-web?forceFallback=1")
    assert fallback_legacy_response.status_code == 200
    assert "Modo local sem Node" in fallback_legacy_response.text


def test_mobile_telemetry_endpoint(client):
    response = client.post(
        "/api/v1/mobile/telemetry",
        json={"event": "fallback_used", "screen": "dashboard", "reason": "timeout"},
    )
    assert response.status_code == 202


@pytest.mark.parametrize("event_name", ["fallback_used", "contract_error", "query_error"])
def test_mobile_telemetry_accepts_all_known_events(client, event_name):
    response = client.post(
        "/api/v1/mobile/telemetry",
        json={"event": event_name, "screen": "dashboard", "reason": "validation-check"},
    )
    assert response.status_code == 202


def test_mobile_telemetry_rejects_unknown_event(client):
    response = client.post(
        "/api/v1/mobile/telemetry",
        json={"event": "unknown_event", "screen": "dashboard", "reason": "invalid"},
    )
    assert response.status_code == 422


def test_mobile_endpoints_when_database_empty(client, db_session):
    db_session.query(MobileEvent).delete()
    db_session.query(ReportGrade).delete()
    db_session.query(Student).delete()
    db_session.query(Subject).delete()
    db_session.commit()

    dashboard_response = client.get("/api/v1/mobile/dashboard")
    dashboard_payload = dashboard_response.json()
    assert dashboard_response.status_code == 200
    assert dashboard_payload["tasks"] == []
    assert dashboard_payload["performance"] == []
    assert dashboard_payload["overview"]["progress_percent"] == 0

    subjects_response = client.get("/api/v1/mobile/subjects")
    subjects_payload = subjects_response.json()
    assert subjects_response.status_code == 200
    assert subjects_payload["subjects"] == []

    schedule_response = client.get("/api/v1/mobile/schedule")
    schedule_payload = schedule_response.json()
    assert schedule_response.status_code == 200
    assert schedule_payload["events"] == []

    report_response = client.get("/api/v1/mobile/report")
    report_payload = report_response.json()
    assert report_response.status_code == 200
    assert report_payload["lines"] == []
    assert report_payload["student"]["student_id"] == "-"

    seed_mobile_data(db_session)
