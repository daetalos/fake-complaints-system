
from test_spectrum_system.exceptions.base import ApplicationException, NotFoundError


def test_application_exception_basic():
    """
    Test that ApplicationException can be instantiated with a basic message.
    """
    exc = ApplicationException(message="A generic error occurred.")
    assert exc.status_code == 500
    assert exc.error_code == "ApplicationException"
    assert exc.message == "A generic error occurred."
    assert exc.details == {}


def test_application_exception_custom_values():
    """
    Test that ApplicationException can be instantiated with custom values.
    """
    exc = ApplicationException(
        status_code=418,
        error_code="I_AM_A_TEAPOT",
        message="I cannot brew coffee.",
        details={"reason": "short and stout"},
    )
    assert exc.status_code == 418
    assert exc.error_code == "I_AM_A_TEAPOT"
    assert exc.message == "I cannot brew coffee."
    assert exc.details == {"reason": "short and stout"}


def test_not_found_error():
    """
    Test that NotFoundError is configured correctly for a specific resource.
    """
    exc = NotFoundError(
        resource="User",
        identifier="123",
        error_code="RESOURCE_NOT_FOUND",
    )
    assert exc.status_code == 404
    assert exc.error_code == "RESOURCE_NOT_FOUND"
    assert exc.message == "User not found (ID: 123)"
    assert exc.details == {"resource": "User", "identifier": "123"}
