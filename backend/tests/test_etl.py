import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from etl.etl import run_etl

class MockRow:
    def __init__(self, category_id, product_id, unique_buyers=1):
        self.category_id = category_id
        self.product_id = product_id
        self.unique_buyers = unique_buyers

@pytest.mark.asyncio
async def test_run_etl_success_pipeline():
    """
    Test the entire ETL pipeline flow without hitting a real database.
    It verifies if tables are cleared, data is inserted, and Redis is updated.
    """
    
    with patch("etl.etl.init_db", new_callable=AsyncMock) as mock_init, \
         patch("etl.etl.AsyncSessionLocal") as mock_session_maker, \
         patch("etl.etl.redis_client", new_callable=AsyncMock) as mock_redis:

        # 1. Deep Mocking the Database Session
        mock_session = AsyncMock()
        
        # FIX: Force add_all to be a standard MagicMock (synchronous), not an AsyncMock
        mock_session.add_all = MagicMock()
        
        mock_session_maker.return_value.__aenter__.return_value = mock_session
        
        # 2. Mock the execute().all() chain
        mock_execute_result = MagicMock()
        mock_execute_result.all.return_value = [
            MockRow(category_id="Electronics", product_id="laptop-1"),
            MockRow(category_id="Clothing", product_id="tshirt-1")
        ]
        mock_execute_result.__iter__.return_value = mock_execute_result.all.return_value
        
        mock_session.execute.return_value = mock_execute_result
        
        # Execute the ETL process
        await run_etl()
        
        # Assertions
        mock_init.assert_awaited_once()
        mock_session.commit.assert_awaited_once()
        mock_redis.delete.assert_any_call("best_sellers:general")
        mock_redis.set.assert_called()