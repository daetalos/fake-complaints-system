# src/test_spectrum_system/exceptions/base.py
from typing import Optional, Dict, Any

class ApplicationException(Exception):
    """Base application exception with structured data for consistent error handling."""

    def __init__(
        self,
        message: str,
        error_code: str = None,
        details: Optional[Dict[str, Any]] = None,
        status_code: int = 500
    ):
        self.message = message
        self.error_code = error_code or self.__class__.__name__
        self.details = details or {}
        self.status_code = status_code
        super().__init__(self.message)

    def __str__(self):
        return f"[{self.error_code}] {self.message} (Details: {self.details})"

class ValidationError(ApplicationException):
    """Exception for data validation errors (HTTP 400)."""
    def __init__(self, message: str, field: str = None, **kwargs):
        super().__init__(message, status_code=400, **kwargs)
        if field:
            self.details["field"] = field

class NotFoundError(ApplicationException):
    """Exception for resources that cannot be found (HTTP 404)."""
    def __init__(self, resource: str, identifier: str = None, **kwargs):
        message = f"{resource} not found"
        if identifier:
            message += f" (ID: {identifier})"
        super().__init__(message, status_code=404, **kwargs)

class BusinessLogicError(ApplicationException):
    """Exception for violations of business rules (HTTP 422)."""
    def __init__(self, message: str, **kwargs):
        super().__init__(message, status_code=422, **kwargs) 