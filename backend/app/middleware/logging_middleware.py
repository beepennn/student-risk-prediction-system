import logging
import time

from fastapi import Request


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(message)s",
)

logger = logging.getLogger("student-risk-api")


async def logging_middleware(
    request: Request,
    call_next,
):
    start_time = time.time()

    response = await call_next(request)

    process_time = (
        time.time() - start_time
    ) * 1000

    client_ip = (
        request.client.host
        if request.client
        else "Unknown"
    )

    logger.info(
        "%s | %s | %s | %d | %.2f ms | %s",
        request.method,
        request.url.path,
        response.status_code,
        response.status_code,
        process_time,
        client_ip,
    )

    return response