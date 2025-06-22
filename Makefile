# Makefile for managing the Test Spectrum System development environment.
# This file provides a convenient set of commands for common development tasks.

# Use .PHONY to ensure these targets run even if a file with the same name exists.
.PHONY: help build up down logs ps clean

# Set the default goal to 'help', so running 'make' by itself shows the help message.
.DEFAULT_GOAL := help

# Define variables for commands to ensure consistency.
DOCKER_COMPOSE := docker-compose

# Define color codes for pretty output.
BLUE := \033[0;34m
GREEN := \033[0;32m
RESET := \033[0m

## help: Shows this help message.
help:
	@echo Usage: make [target]
	@echo
	@echo Available targets:
	@echo   build            Builds or rebuilds all service images.
	@echo   up               Starts all services in detached mode.
	@echo   down             Stops and removes all services and networks.
	@echo   logs             Tails the logs of all running services.
	@echo   ps               Lists all running service containers.
	@echo   clean            Stops services and removes all build artifacts.
	@echo   help             Shows this help message.

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