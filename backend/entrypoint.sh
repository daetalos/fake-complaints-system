#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Wait for the database to be ready
# We use netcat (nc) to check if the port is open on the 'db' host
echo "Waiting for database to be ready..."
while ! nc -z db 5432; do
  sleep 1
done
echo "Database is ready."

# Run database migrations
echo "Running database migrations..."
poetry run alembic upgrade head
echo "Database migrations complete."

# Seed database with initial data (idempotent - safe to run multiple times)
# This ensures categories, patients, and cases are available for testing
echo "Seeding database with initial data..."
poetry run python src/test_spectrum_system/scripts/seed_data.py
echo "Database seeding complete."

# Execute the main command (passed as arguments to this script)
# This will be the uvicorn server command from the Dockerfile's CMD
exec "$@" 