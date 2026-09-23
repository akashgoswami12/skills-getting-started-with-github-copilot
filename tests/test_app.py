from fastapi.testclient import TestClient

from src.app import app

client = TestClient(app)


def test_unregister_participant_removes_email_from_activity():
    response = client.delete(
        "/activities/Chess Club/participants?email=michael@mergington.edu"
    )

    assert response.status_code == 200
    assert "michael@mergington.edu" not in (
        client.get("/activities").json()["Chess Club"]["participants"]
    )

    data = response.json()
    assert "michael@mergington.edu" in data["message"]
    assert "Chess Club" in data["message"]
