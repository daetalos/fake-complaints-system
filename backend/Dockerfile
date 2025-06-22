FROM python:3.11-slim

# Set environment variables to configure Poetry
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    POETRY_CACHE_DIR=/tmp/poetry_cache \
    PYTHONUNBUFFERED=1

# Set the working directory in the container
WORKDIR /app

# Install Poetry
RUN pip install poetry

# Copy the files required by Poetry
COPY pyproject.toml poetry.lock ./

# Install project dependencies
# --only main excludes development dependencies
RUN poetry install --only main && rm -rf $POETRY_CACHE_DIR

# Copy the rest of the application source code from the src directory
COPY ./src .

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
# We use the full path to the executable inside the venv
CMD ["/app/.venv/bin/python", "-m", "uvicorn", "test_spectrum_system.main:app", "--host", "0.0.0.0", "--port", "8000"] 