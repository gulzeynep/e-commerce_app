import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from api.main import app

client = TestClient(app)

# root
def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "Recommendation API is running"}


# browsing history 
@patch("api.main.database.get_browsing_history", new_callable=AsyncMock)
def test_get_history_success(mock_get_history):
    mock_get_history.return_value = [{"id": "p1", "category": "electronics"}]
    
    response = client.get("/browsing-history/user-123")
    
    assert response.status_code == 200
    data = response.json()
    assert data["user-id"] == "user-123"
    assert data["type"] == "history"
    assert len(data["products"]) == 1
    assert data["products"][0]["id"] == "p1"
    
    mock_get_history.assert_called_once_with("user-123")

@patch("api.main.database.get_browsing_history", new_callable=AsyncMock)
def test_get_history_error(mock_get_history):
    mock_get_history.side_effect = Exception("database connection disabled")
    
    response = client.get("/browsing-history/user-123")
    
    assert response.status_code == 500
    assert "Error fetching browsing history: database connection disabled" in response.json()["detail"]


# delete 
@patch("api.main.database.delete_history_item", new_callable=AsyncMock)
def test_delete_history(mock_delete_history):
    mock_delete_history.return_value = {"status": "deleted", "product_id": "prod-1"}
    
    response = client.delete("/browsing-history/user-123/prod-1")
    
    assert response.status_code == 200
    assert response.json() == {"status": "deleted", "product_id": "prod-1"}
    mock_delete_history.assert_called_once_with("user-123", "prod-1")


# general best sellers 
@patch("api.main.database.get_general_best_sellers", new_callable=AsyncMock)
def test_get_general_best_sellers(mock_get_general):
    mock_get_general.return_value = [{"id": "p1", "category": "books"}, {"id": "p2", "category": "home"}]
    
    response = client.get("/best-sellers/general")
    
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "general"
    assert len(data["products"]) == 2
    mock_get_general.assert_called_once()


# categorized best sellers 
@patch("api.main.database.get_personalized_best_sellers", new_callable=AsyncMock)
def test_get_personalized_best_sellers(mock_get_personalized):
    mock_get_personalized.return_value = [{"id": "p99", "category": "sports"}]
    
    response = client.get("/best-sellers/personalized/user-999")
    
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "personalized"
    assert data["user-id"] == "user-999"
    assert data["products"][0]["id"] == "p99"
    mock_get_personalized.assert_called_once_with("user-999")