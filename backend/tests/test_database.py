import pytest
import json
from unittest.mock import AsyncMock, patch, MagicMock
from api import database

# A helper class to mock SQLAlchemy rows returned from the database
class MockRow:
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

@pytest.mark.asyncio
async def test_get_browsing_history():
    """Test fetching browsing history directly from the database layer."""
    mock_session = AsyncMock()
    mock_execute_result = MagicMock()
    mock_execute_result.all.return_value = [
        MockRow(productid="laptop-1", category_id="Electronics")
    ]
    mock_session.execute.return_value = mock_execute_result
    
    with patch("api.database.AsyncSessionLocal", return_value=AsyncMock(__aenter__=AsyncMock(return_value=mock_session))):
        result = await database.get_browsing_history("user-1")
        assert len(result) == 1
        assert result[0]["id"] == "laptop-1"
        assert result[0]["category"] == "Electronics"

@pytest.mark.asyncio
async def test_delete_history_item():
    """Test the soft-delete functionality in the database layer."""
    mock_session = AsyncMock()
    with patch("api.database.AsyncSessionLocal", return_value=AsyncMock(__aenter__=AsyncMock(return_value=mock_session))):
        result = await database.delete_history_item("user-1", "laptop-1")
        
        assert result["status"] == "deleted"
        assert result["product_id"] == "laptop-1"
        # Ensure that the transaction was committed
        mock_session.commit.assert_awaited_once()

@pytest.mark.asyncio
async def test_get_general_best_sellers_redis_hit():
    """Test if general best sellers are fetched from Redis without hitting the DB."""
    mock_redis_data = json.dumps([{"id": "laptop-1", "category": "Electronics"}])
    
    with patch("api.database.redis_client.get", new_callable=AsyncMock) as mock_redis_get:
        mock_redis_get.return_value = mock_redis_data
        
        result = await database.get_general_best_sellers()
        
        assert len(result) == 1
        assert result[0]["id"] == "laptop-1"
        # Ensure database was NOT called
        mock_redis_get.assert_awaited_once_with("best_sellers:general")

@pytest.mark.asyncio
async def test_get_general_best_sellers_db_hit():
    """Test fetching from DB when Redis cache is empty, and ensure Redis is updated."""
    mock_session = AsyncMock()
    mock_execute_result = MagicMock()
    mock_execute_result.all.return_value = [
        MockRow(product_id="phone-1", category_id="Electronics")
    ]
    mock_session.execute.return_value = mock_execute_result

    with patch("api.database.redis_client.get", new_callable=AsyncMock, return_value=None), \
         patch("api.database.redis_client.setex", new_callable=AsyncMock) as mock_redis_set, \
         patch("api.database.AsyncSessionLocal", return_value=AsyncMock(__aenter__=AsyncMock(return_value=mock_session))):
        
        result = await database.get_general_best_sellers()
        
        assert len(result) == 1
        assert result[0]["id"] == "phone-1"
        # Ensure new data is cached in Redis for 3600 seconds
        mock_redis_set.assert_awaited_once()

@pytest.mark.asyncio
async def test_get_personalized_best_sellers_with_history():
    """Test personalized recommendations when the user has enough history."""
    mock_session = AsyncMock()
    
    # 1st query: User's browsed categories
    mock_execute_cats = MagicMock()
    mock_execute_cats.all.return_value = [MockRow(category_id="Electronics")]
    
    # 2nd query: Category best sellers (mock 5 items to pass the condition)
    mock_execute_recs = MagicMock()
    mock_execute_recs.all.return_value = [
        MockRow(product_id=f"prod-{i}", category_id="Electronics") for i in range(5)
    ] 
    
    # Assign side effects to handle sequential execute calls
    mock_session.execute.side_effect = [mock_execute_cats, mock_execute_recs]

    with patch("api.database.AsyncSessionLocal", return_value=AsyncMock(__aenter__=AsyncMock(return_value=mock_session))):
        result = await database.get_personalized_best_sellers("user-1")
        assert len(result) == 5

@pytest.mark.asyncio
async def test_get_personalized_best_sellers_fallback():
    """Test if the system falls back to general best sellers for new users."""
    mock_session = AsyncMock()
    
    # Mock empty categories for a new user
    mock_execute_cats = MagicMock()
    mock_execute_cats.all.return_value = []
    mock_session.execute.return_value = mock_execute_cats

    with patch("api.database.AsyncSessionLocal", return_value=AsyncMock(__aenter__=AsyncMock(return_value=mock_session))), \
         patch("api.database.get_general_best_sellers", new_callable=AsyncMock) as mock_fallback:
        
        mock_fallback.return_value = [{"id": "general-top-1", "category": "Home"}]
        
        result = await database.get_personalized_best_sellers("user-new")
        
        assert len(result) == 1
        assert result[0]["id"] == "general-top-1"
        # Ensure the fallback function was triggered
        mock_fallback.assert_awaited_once()

@pytest.mark.asyncio
async def test_get_product_catalog_redis_hit():
    """Test fetching product catalog directly from Redis cache."""
    mock_catalog_data = json.dumps({"Books": ["book-1", "book-2"]})
    
    with patch("api.database.redis_client.get", new_callable=AsyncMock) as mock_redis_get:
        mock_redis_get.return_value = mock_catalog_data
        
        result = await database.get_product_catalog()
        
        assert "Books" in result
        assert len(result["Books"]) == 2

@pytest.mark.asyncio
async def test_get_product_catalog_db_hit():
    """Test fetching catalog from DB and updating Redis when cache is empty."""
    mock_session = AsyncMock()
    mock_execute_result = MagicMock()
    mock_execute_result.all.return_value = [
        MockRow(product_id="book-1", category_id="Books")
    ]
    mock_session.execute.return_value = mock_execute_result

    with patch("api.database.redis_client.get", new_callable=AsyncMock, return_value=None), \
         patch("api.database.redis_client.set", new_callable=AsyncMock) as mock_redis_set, \
         patch("api.database.AsyncSessionLocal", return_value=AsyncMock(__aenter__=AsyncMock(return_value=mock_session))):
        
        result = await database.get_product_catalog()
        
        assert "Books" in result
        assert result["Books"][0] == "book-1"
        mock_redis_set.assert_awaited_once()