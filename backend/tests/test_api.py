import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, patch

from api.main import app

@pytest.mark.asyncio
async def test_get_catalog_endpoint():
    """Test if the catalog endpoint correctly formats the response."""
    mock_catalog_data = {
        "Electronics": ["laptop-1", "phone-1"],
        "Clothing": ["tshirt-1"]
    }
    
    with patch("api.database.get_product_catalog", new_callable=AsyncMock) as mock_get_catalog:
        mock_get_catalog.return_value = mock_catalog_data
        
        # FIX: Using ASGITransport for newer httpx versions
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.get("/catalog")
            
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "catalog"
        assert "Electronics" in data["data"]
        assert len(data["data"]["Electronics"]) == 2

@pytest.mark.asyncio
async def test_get_general_best_sellers_endpoint():
    """Test the general best sellers endpoint."""
    mock_best_sellers = [
        {"id": "laptop-1", "category": "Electronics"},
        {"id": "coffee-mug", "category": "Home"}
    ]
    
    with patch("api.database.get_general_best_sellers", new_callable=AsyncMock) as mock_get_general:
        mock_get_general.return_value = mock_best_sellers
        
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.get("/best-sellers/general")
            
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "general"
        assert len(data["products"]) == 2

@pytest.mark.asyncio
async def test_delete_history_endpoint():
    """Test the deletion of a browsing history item."""
    mock_response = {"status": "deleted", "product_id": "laptop-1"}
    
    with patch("api.database.delete_history_item", new_callable=AsyncMock) as mock_delete:
        mock_delete.return_value = mock_response
        
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.delete("/browsing-history/user-1/laptop-1")
            
        assert response.status_code == 200
        assert response.json()["status"] == "deleted"
        mock_delete.assert_awaited_once_with("user-1", "laptop-1")