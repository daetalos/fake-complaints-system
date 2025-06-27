from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from test_spectrum_system.main import app

client = TestClient(app)


def test_read_root():
    """
    Test that the root endpoint returns a 200 OK status code
    and the expected "Hello": "World" JSON response.
    """
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"Hello": "World"}


def test_error_handling_endpoint():
    """
    Test that the /error-test endpoint correctly triggers the
    ApplicationException handler and returns a 404 Not Found response.
    """
    response = client.get("/error-test")
    assert response.status_code == 404


def test_health_endpoint():
    """
    Test the /api/health endpoint returns proper status
    """
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@patch('test_spectrum_system.main.logger')
def test_logging_middleware_success(mock_logger):
    """
    Test logging middleware logs successful requests
    """
    response = client.get("/")

    assert response.status_code == 200
    mock_logger.info.assert_called()
    # Verify it was called with request info - check all calls
    call_args_list = [call[0][0] for call in mock_logger.info.call_args_list]
    assert any("Incoming request" in call_arg for call_arg in call_args_list)


def test_application_exception_handler():
    """
    Test the application exception handler middleware
    """
    # Create a custom exception that will be handled
    response = client.get("/error-test")

    # Should return 404 due to the exception handler
    assert response.status_code == 404


@pytest.mark.asyncio
@patch('test_spectrum_system.main.logger')
@patch('test_spectrum_system.main.engine')
async def test_startup_event_success(mock_engine, mock_logger):
    """
    Test successful startup event
    """
    # Mock successful database connection
    mock_connection = AsyncMock()
    mock_engine.connect.return_value.__aenter__.return_value = mock_connection
    mock_engine.connect.return_value.__aexit__.return_value = None

    # Import and call the startup function
    from test_spectrum_system.main import on_startup

    # Mock create_db_and_tables to avoid real DB calls
    with patch('test_spectrum_system.main.create_db_and_tables') as mock_create_db:
        mock_create_db.return_value = None
        await on_startup()
        mock_create_db.assert_called_once()


@pytest.mark.asyncio
@patch('test_spectrum_system.main.create_db_and_tables')
@patch('test_spectrum_system.main.engine')
@patch('test_spectrum_system.main.logger')
@patch('asyncio.sleep')
async def test_startup_event_retry_then_success(
    mock_sleep, mock_logger, mock_engine, mock_create_db
):
    """
    Test startup event with initial database connection failure then success
    """
    # Mock first connection failure, then success
    mock_engine.connect.side_effect = [
        Exception("Connection failed"),  # First attempt fails
        AsyncMock().__aenter__.return_value  # Second attempt succeeds
    ]

    # Mock successful table creation
    mock_create_db.return_value = None

    # Import and call the startup function
    from test_spectrum_system.main import on_startup

    # This should not raise an exception after retry
    await on_startup()

    # Verify retry behavior
    assert mock_engine.connect.call_count == 2
    mock_sleep.assert_called_once_with(2)  # Should wait 2 seconds between retries
    mock_logger.warning.assert_called_once()  # Should log the warning
    mock_logger.info.assert_called_with(
        "Database connection successful."
    )  # Should log success
    mock_create_db.assert_called_once()  # Should call create_db_and_tables once
