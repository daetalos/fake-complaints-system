import sys

from loguru import logger

# Remove default handler to avoid duplicates
logger.remove()

# Add a simple, colored, human-readable logger to the console.
# This is all that's needed for a basic, working sample.
logger.add(
    sys.stdout,
    level="INFO",
    format=(
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}:{function}:{line}</cyan> - "
        "<level>{message}</level>"
    ),
    colorize=True,
    backtrace=True,
    diagnose=True,
)
