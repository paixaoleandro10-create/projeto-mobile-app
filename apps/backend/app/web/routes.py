from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import FileResponse

router = APIRouter(include_in_schema=False)

_static_dir = Path(__file__).resolve().parent / "static"
_mobile_web_index = _static_dir / "mobile-web" / "index.html"
_mobile_web_service_worker = _static_dir / "mobile-web" / "sw.js"
_web_index = _static_dir / "web" / "index.html"


@router.get("/web")
@router.get("/web/")
def web_index() -> FileResponse:
    return FileResponse(_web_index)


@router.get("/mobile")
@router.get("/mobile/")
@router.get("/mobile/subjects")
@router.get("/mobile/subjects/")
@router.get("/mobile/schedule")
@router.get("/mobile/schedule/")
@router.get("/mobile/report")
@router.get("/mobile/report/")
@router.get("/mobile-web")
@router.get("/mobile-web/")
def mobile_web_index() -> FileResponse:
    return FileResponse(_mobile_web_index)


@router.get("/mobile/sw.js")
def mobile_service_worker() -> FileResponse:
    return FileResponse(
        _mobile_web_service_worker,
        media_type="application/javascript",
        headers={"Cache-Control": "no-cache"},
    )
