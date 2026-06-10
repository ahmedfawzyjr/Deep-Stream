from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "results-api"}

def test_get_pipeline_results():
    response = client.get("/v1/results/pipelines/pipeline-001")
    assert response.status_code == 200
    data = response.json()
    assert data["result_id"] == "pipeline-001"
    assert "resolved_tier" in data
    assert len(data["detections"]) > 0
