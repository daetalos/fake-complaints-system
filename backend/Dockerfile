FROM python:3.11-slim

# Set environment variables to configure Poetry
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    POETRY_CACHE_DIR=/tmp/poetry_cache \
    PYTHONUNBUFFERED=1

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

# Now, copy the application source code into the current working directory
COPY src/ .

# Add the app directory to the python path
ENV PYTHONPATH="${PYTHONPATH}:/app"

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application using the venv python
# The module path is now relative to the python path
# Command to run the application
# We use the full path to the executable inside the venv
CMD ["/app/.venv/bin/python", "-m", "uvicorn", "test_spectrum_system.main:app", "--host", "0.0.0.0", "--port", "8000"] 