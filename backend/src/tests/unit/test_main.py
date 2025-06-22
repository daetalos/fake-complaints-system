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
    json_response = response.json()
    assert json_response["detail"] == "Not Found"
