from fastapi import APIRouter, status

router = APIRouter(prefix="/ingestion", tags=["ingestion"])


@router.post(
    "/iot-webhook",
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
    summary="Ponto reservado para ingestão IoT futura",
    description=(
        "Endpoint reservado para evolução futura via webhook/dispositivos IoT. "
        "Não faz parte do escopo inicial e retorna 501 por design."
    ),
)
def iot_webhook_placeholder() -> dict[str, str]:
    return {
        "status": "not_implemented",
        "message": "IoT ingestion is planned for a future iteration.",
    }
