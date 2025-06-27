from datetime import datetime
from unittest.mock import AsyncMock, Mock
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from test_spectrum_system.complaints.models import Complainant, ComplaintCategory
from test_spectrum_system.db.database import get_db
from test_spectrum_system.main import app

# Create a test client
client = TestClient(app)


@pytest.fixture
def mock_db_session():
    """Mock database session for testing"""
    return AsyncMock()


@pytest.fixture
def sample_complaint_categories():
    """Sample complaint categories for testing"""
    return [
        ComplaintCategory(
            category_id=uuid4(),
            main_category="Clinical",
            sub_category="Diagnosis"
        ),
        ComplaintCategory(
            category_id=uuid4(),
            main_category="Clinical",
            sub_category="Treatment"
        ),
        ComplaintCategory(
            category_id=uuid4(),
            main_category="Administrative",
            sub_category="Billing"
        )
    ]


@pytest.fixture
def sample_complainant():
    """Sample complainant for testing"""
    return Complainant(
        complainant_id=uuid4(),
        name="John Doe",
        email="john.doe@example.com",
        phone="123-456-7890",
        address_line1="123 Main St",
        address_line2="Apt 4B",
        city="Anytown",
        postcode="12345",
        created_at=datetime.now(),
        updated_at=datetime.now()
    )


def test_get_complaint_categories_success(mock_db_session, sample_complaint_categories):
    """Test fetching complaint categories successfully"""
    # Override the dependency
    async def override_get_db():
        return mock_db_session

    app.dependency_overrides[get_db] = override_get_db

    try:
        # Setup mock
        mock_result = Mock()
        mock_result.scalars.return_value.all.return_value = sample_complaint_categories
        mock_db_session.execute.return_value = mock_result

        # Make request
        response = client.get("/api/complaint-categories/")

        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2  # 2 main categories
        assert any(cat["main_category"] == "Clinical" for cat in data)
        assert any(cat["main_category"] == "Administrative" for cat in data)
    finally:
        # Clean up
        app.dependency_overrides.clear()


def test_create_complainant_success(mock_db_session, sample_complainant):
    """Test creating a new complainant successfully"""
    # Override the dependency
    async def override_get_db():
        return mock_db_session

    app.dependency_overrides[get_db] = override_get_db

    try:
        # Setup mock
        mock_db_session.add = Mock()
        mock_db_session.commit = AsyncMock()
        mock_db_session.refresh = AsyncMock()

        # Mock the refresh to set the ID
        def mock_refresh(obj):
            obj.complainant_id = sample_complainant.complainant_id
            obj.created_at = sample_complainant.created_at
            obj.updated_at = sample_complainant.updated_at

        mock_db_session.refresh.side_effect = mock_refresh

        # Request data
        complainant_data = {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "phone": "123-456-7890",
            "address_line1": "123 Main St",
            "address_line2": "Apt 4B",
            "city": "Anytown",
            "postcode": "12345"
        }

        # Make request
        response = client.post("/api/complainants/", json=complainant_data)

        # Assertions
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "John Doe"
        assert data["email"] == "john.doe@example.com"
        assert data["address_line1"] == "123 Main St"

        # Verify database operations
        mock_db_session.add.assert_called_once()
        mock_db_session.commit.assert_called_once()
        mock_db_session.refresh.assert_called_once()
    finally:
        # Clean up
        app.dependency_overrides.clear()


def test_get_complainant_success(mock_db_session, sample_complainant):
    """Test retrieving a complainant by ID successfully"""
    # Override the dependency
    async def override_get_db():
        return mock_db_session

    app.dependency_overrides[get_db] = override_get_db

    try:
        # Setup mock
        mock_db_session.get.return_value = sample_complainant

        # Make request
        response = client.get(f"/api/complainants/{sample_complainant.complainant_id}")

        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "John Doe"
        assert data["email"] == "john.doe@example.com"

        # Verify database call
        mock_db_session.get.assert_called_once_with(
            Complainant, str(sample_complainant.complainant_id)
        )
    finally:
        # Clean up
        app.dependency_overrides.clear()


def test_get_complainant_not_found(mock_db_session):
    """Test retrieving a non-existent complainant returns 404"""
    # Override the dependency
    async def override_get_db():
        return mock_db_session

    app.dependency_overrides[get_db] = override_get_db

    try:
        # Setup mock
        mock_db_session.get.return_value = None

        # Make request
        fake_id = str(uuid4())
        response = client.get(f"/api/complainants/{fake_id}")

        # Assertions
        assert response.status_code == 404
        data = response.json()
        assert data["detail"] == "Complainant not found"
    finally:
        # Clean up
        app.dependency_overrides.clear()


def test_list_complainants_success(mock_db_session, sample_complainant):
    """Test listing complainants successfully"""
    # Override the dependency
    async def override_get_db():
        return mock_db_session

    app.dependency_overrides[get_db] = override_get_db

    try:
        # Setup mock
        mock_result = Mock()
        mock_result.scalars.return_value.all.return_value = [sample_complainant]
        mock_db_session.execute.return_value = mock_result

        # Make request
        response = client.get("/api/complainants")

        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "John Doe"
        assert data[0]["email"] == "john.doe@example.com"
    finally:
        # Clean up
        app.dependency_overrides.clear()


def test_list_complainants_with_search(mock_db_session, sample_complainant):
    """Test searching complainants by query"""
    # Override the dependency
    async def override_get_db():
        return mock_db_session

    app.dependency_overrides[get_db] = override_get_db

    try:
        # Setup mock
        mock_result = Mock()
        mock_result.scalars.return_value.all.return_value = [sample_complainant]
        mock_db_session.execute.return_value = mock_result

        # Make request with search query
        response = client.get("/api/complainants?q=john")

        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "John Doe"
    finally:
        # Clean up
        app.dependency_overrides.clear()


def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
