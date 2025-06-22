import asyncio
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
from sqlalchemy import text

from test_spectrum_system.complaints.routes import router as complaints_router
from test_spectrum_system.config.core import settings
from test_spectrum_system.db.database import create_db_and_tables, engine

from .exceptions.base import ApplicationException

app = FastAPI(title=settings.PROJECT_NAME)

# Set up CORS middleware
origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(complaints_router, prefix="/api", tags=["complaints"])


@app.exception_handler(ApplicationException)
async def application_exception_handler(request: Request, exc: ApplicationException):
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
    return {"Hello": "World"}


@app.on_event("startup")
async def on_startup():
    # Wait for the database to be ready
    max_retries = 10
    retry_interval = 2
    for attempt in range(max_retries):
        try:
            async with engine.connect() as connection:
                await connection.execute(text("SELECT 1"))
            logger.info("Database connection successful.")
            break
        except Exception as e:
            logger.warning(
                f"DB conn attempt {attempt + 1}/{max_retries} failed: {e}"
            )
            if attempt + 1 == max_retries:
                logger.error("DB connection failed after multiple retries. Exiting.")
                raise
            await asyncio.sleep(retry_interval)

    # Create the database tables
    await create_db_and_tables()
