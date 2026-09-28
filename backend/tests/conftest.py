import pytest
from app.main import app
from app.dependencies.auth import get_current_user

def mock_get_current_user():
    return {
        "id": "test-user-id-001",
        "name": "Test Investigator",
        "email": "test.investigator@example.test",
        "role": "INVESTIGATOR",
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-01-01T00:00:00Z"
    }

@pytest.fixture(autouse=True)
def setup_auth_override(request):
    # For test_auth.py, test the real authentication dependency flow
    if "test_auth.py" in request.node.fspath.strpath:
        app.dependency_overrides.pop(get_current_user, None)
    else:
        app.dependency_overrides[get_current_user] = mock_get_current_user
    yield
    app.dependency_overrides.pop(get_current_user, None)
