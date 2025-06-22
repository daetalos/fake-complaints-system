# Makefile for managing the Test Spectrum System development environment.
# This file provides a convenient set of commands for common development tasks.

# Use .PHONY to ensure these targets run even if a file with the same name exists.
.PHONY: help setup build up down logs ps clean lint format

# Set the default goal to 'help', so running 'make' by itself shows the help message.
.DEFAULT_GOAL := help

# Define variables for commands to ensure consistency.
DOCKER_COMPOSE := docker-compose


## help: Shows this help message.
help:
	@echo Usage: make [target]
	@echo
	@echo Available targets:
	@echo   setup            Installs all dependencies and sets up the dev environment.
	@echo   build            Builds or rebuilds all service images.
	@echo   up               Starts all services in detached mode.
	@echo   down             Stops and removes all services and networks.
	@echo   logs             Tails the logs of all running services.
	@echo   ps               Lists all running service containers.
	@echo   clean            Stops services and removes all build artifacts.
	@echo   help             Shows this help message.
	@echo
	@echo Code Quality:
	@echo   lint             Checks the backend and frontend code for linting errors.
	@echo   format           Formats the backend code according to project standards.

## setup: Installs all project dependencies and development tools like pre-commit hooks.
setup:
	@echo "Setting up development environment..."
	@echo "Installing backend dependencies..."
	(cd backend && poetry install)
	@echo "Installing frontend dependencies..."
	(cd frontend && npm install)
	@echo "Installing pre-commit hooks..."
	(cd backend && poetry run pre-commit install)
	@echo "Setup complete."

## build: Builds or rebuilds all services defined in docker-compose.yml.
build:
	@echo Building all services...
	$(DOCKER_COMPOSE) build
	@echo Build complete.

## up: Starts all services in detached mode. Use 'make build' first if needed.
up:
	@echo Starting all services...
	$(DOCKER_COMPOSE) up -d
	@echo Services are up and running.

## down: Stops and removes all services, networks, and volumes.
down:
	@echo Stopping all services...
	$(DOCKER_COMPOSE) down
	@echo Services stopped.

## logs: Tails the logs of all running services.
logs:
	@echo Tailing logs... (Press Ctrl+C to stop)
	$(DOCKER_COMPOSE) logs -f

## ps: Lists all running service containers.
ps:
	@echo Current container status:
	$(DOCKER_COMPOSE) ps

## clean: Stops services and removes all build artifacts and temporary files.
# Note: The following lines for removing Python cache files only work on Unix-like systems.
# On Windows, delete __pycache__ and .pyc files manually or use a PowerShell script.
clean: down
	@echo Cleaning up Docker artifacts...
	$(DOCKER_COMPOSE) rm -f
	@echo Cleaning up Python artifacts...
	@echo Cleaning up frontend build artifacts...
	@echo Cleanup complete.

## lint: Checks the backend and frontend code for any linting issues.
lint:
	@echo "Linting backend code..."
	(cd backend && poetry run ruff check .)
	@echo "Linting frontend code..."
	(cd frontend && npm run lint)
	@echo "Linting complete."

## format: Formats the backend Python code according to ruff standards.
format:
	@echo Formatting backend code...
	(cd backend && poetry run ruff format .)
	(cd backend && poetry run ruff check --fix .)
	@echo Formatting complete. 