from fastapi.responses import JSONResponse


def success_response(
    data=None,
    message="Success",
    status_code=200,
):
    return JSONResponse(
        status_code=status_code,
        content={
            "success": True,
            "message": message,
            "status_code": status_code,
            "data": data,
        },
    )