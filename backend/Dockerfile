FROM python:3.11-slim

# Set environment variables to configure Poetry
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    POETRY_CACHE_DIR=/tmp/poetry_cache \
    PYTHONUNBUFFERED=1

# Install netcat for the entrypoint health check
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install poetry

# Set the working directory for the entire application
WORKDIR /app

# Copy the files required by Poetry into the WORKDIR
COPY pyproject.toml poetry.lock ./

# Install project dependencies
# This creates the .venv in /app/.venv
# --no-root skips installing the project itself, which we will handle with PYTHONPATH
RUN poetry install --only main --no-root && rm -rf $POETRY_CACHE_DIR

# Copy alembic.ini so migrations can be run in the container
COPY alembic.ini .

# Copy the application source code, preserving the src directory structure
COPY ./src ./src

# Copy and set up the entrypoint script
COPY entrypoint.sh .
RUN chmod +x /app/entrypoint.sh

# Add the src directory to the python path
ENV PYTHONPATH="${PYTHONPATH}:/app/src"

# Expose the port the app runs on
EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]

# Command to run the application using the full path to the venv python
CMD ["/app/.venv/bin/python", "-m", "uvicorn", "test_spectrum_system.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--app-dir", "src"] 