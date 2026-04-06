from datetime import datetime, timezone

import httpx

from app.core.config import get_settings
from app.schemas.analytic_record import ExternalSummaryRead

SIMULATED_EXTERNAL_PAYLOAD = [
    {"metric_value": 11.2},
    {"metric_value": 12.7},
    {"metric_value": 9.4},
    {"metric_value": 15.1},
]


async def summarize_external_metrics(simulate: bool = False) -> ExternalSummaryRead:
    settings = get_settings()
    source_name = "simulated-external-api"
    payload = SIMULATED_EXTERNAL_PAYLOAD

    if not simulate and settings.external_api_url:
        try:
            async with httpx.AsyncClient(timeout=settings.external_api_timeout_seconds) as client:
                response = await client.get(str(settings.external_api_url))
                response.raise_for_status()
                response_payload = response.json()
                if isinstance(response_payload, list):
                    payload = response_payload
                    source_name = str(settings.external_api_url)
        except Exception:
            payload = SIMULATED_EXTERNAL_PAYLOAD
            source_name = "simulated-fallback"

    values = [float(item.get("metric_value", 0)) for item in payload if isinstance(item, dict)]
    if not values:
        values = [0.0]

    return ExternalSummaryRead(
        source=source_name,
        collected_at=datetime.now(timezone.utc),
        total_items=len(values),
        average_value=round(sum(values) / len(values), 2),
        max_value=max(values),
        min_value=min(values),
    )
