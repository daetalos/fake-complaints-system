import time
from fastapi import FastAPI, Request
from loguru import logger
from .config.logging import LOG_LEVEL, ENVIRONMENT  # Import to initialize logging

app = FastAPI(title="Test Spectrum System", version="0.1.0")

@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    """
    Middleware to log incoming requests and outgoing responses.
    """
    start_time = time.time()
    
    logger.info(
        "Incoming request",
        extra={
            "event_type": "api_request",
            "method": request.method,
            "path": request.url.path,
            "ip_address": request.client.host if request.client else "unknown",
            "user_agent": request.headers.get("user-agent", "unknown")
        }
    )
    
    try:
        response = await call_next(request)
        duration_ms = (time.time() - start_time) * 1000
        
        logger.info(
            "Outgoing response",
            extra={
                "event_type": "api_response", 
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": round(duration_ms, 2),
            }
        )
        
        return response
        
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        logger.exception(
            "Request failed",
            extra={
                "event_type": "api_error",
                "method": request.method,
                "path": request.url.path,
                "duration_ms": round(duration_ms, 2),
                "error": str(e)
            }
        )
        # Re-raise the exception to be handled by FastAPI's default exception handlers
        raise

@app.get("/")
def read_root():
    """
    Root endpoint for health checks.
    """
    logger.info("Root endpoint was called.")
    return {"Hello": "World"} 