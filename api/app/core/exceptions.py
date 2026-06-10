from fastapi import Request, status
from fastapi.responses import JSONResponse

class DeepStreamException(Exception):
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

async def deepstream_exception_handler(request: Request, exc: DeepStreamException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": exc.message},
    )

async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"success": False, "error": "An unexpected server error occurred: " + str(exc)},
    )
