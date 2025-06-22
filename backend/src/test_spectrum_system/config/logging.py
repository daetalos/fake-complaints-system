from loguru import logger
import sys
import os
import json
from datetime import datetime

# Remove default handler
logger.remove()

# Configuration from environment
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Development: Human-readable colored logs
if ENVIRONMENT == "development":
    logger.add(
        sys.stdout,
        level=LOG_LEVEL,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        colorize=True,
        backtrace=True,
        diagnose=True,
    )
else:
    # Production: Structured JSON logs
    def json_formatter(record):
        log_obj = {
            "timestamp": record["time"].isoformat(),
            "level": record["level"].name,
            "message": record["message"],
            "module": record["name"],
            "function": record["function"],
            "line": record["line"],
            "extra": record["extra"],
        }
        return json.dumps(log_obj)

    logger.add(
        sys.stdout,
        level=LOG_LEVEL,
        format=json_formatter,
        serialize=False, # We are doing our own serialization
        backtrace=False,
        diagnose=False,
    )

# File logging with rotation
# Note: The 'logs' directory needs to exist.
os.makedirs("logs", exist_ok=True)

logger.add(
    "logs/app_{time:YYYY-MM-DD}.log",
    level=LOG_LEVEL,
    rotation="1 day",
    retention="30 days",
    compression="zip",
    format=json_formatter if ENVIRONMENT != "development" else "{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
)

# Error-only log file
logger.add(
    "logs/errors_{time:YYYY-MM-DD}.log",
    level="ERROR",
    rotation="1 day",
    retention="90 days",
    compression="zip",
    format=json_formatter if ENVIRONMENT != "development" else "{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
) 