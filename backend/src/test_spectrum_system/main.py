import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger

from .exceptions.base import ApplicationException, NotFoundError

app = FastAPI(title="Test Spectrum System", version="0.1.0")

# CORS Middleware Configuration
# This allows the frontend (running on localhost:3000) to communicate with the backend.
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ApplicationException)
async def application_exception_handler(request: Request, exc: ApplicationException):
    """
    Catches and handles all custom ApplicationExceptions, logging them
    and returning a standardized JSON response.
    """
    log_message = (
        f"Application exception caught: {exc.error_code} on path {request.url.path}"
    )
    logger.error(log_message)

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.error_code,
            "message": exc.message,
            "details": exc.details,
        },
    )


@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    """
    Middleware to log incoming requests and outgoing responses.
    """
    start_time = time.time()
    logger.info(f"Incoming request: {request.method} {request.url.path}")

    try:
        response = await call_next(request)
        duration_ms = (time.time() - start_time) * 1000
        logger.info(f"Outgoing response: {response.status_code} in {duration_ms:.2f}ms")
        return response

    except Exception as e:
        logger.exception(f"Request failed: {e}")
        raise


@app.get("/")
def read_root():
    """
    Root endpoint for health checks.
    """
    logger.info("Root endpoint was called.")
    return {"Hello": "World"}


@app.get("/api/message")
def get_message():
    """
    Returns a simple message for the frontend to consume.
    """
    logger.info("Message API was called.")
    return {"message": "Hello from the backend!"}


@app.get("/error-test")
def test_error_handling():
    """
    An endpoint to test the custom error handling.
    """
    logger.info("Testing error handling by raising a NotFoundError.")
    raise NotFoundError(
        resource="Test Resource",
        identifier="123",
        error_code="RESOURCE_NOT_FOUND",
    )
