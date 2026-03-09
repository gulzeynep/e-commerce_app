import pytest
from unittest.mock import patch, MagicMock, AsyncMock
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from etl.etl import run_etl, init_db

pytestmark = pytest.mark.asyncio


# init db 
@patch("etl.etl.engine")
async def test_init_db(mock_engine):
    mock_conn = AsyncMock()
    mock_engine.begin.return_value.__aenter__.return_value = mock_conn

    await init_db()

    mock_conn.run_sync.assert_called_once()


# etl 
@patch("etl.etl.init_db", new_callable=AsyncMock)
@patch("etl.etl.AsyncSessionLocal")
@patch("etl.etl.redis_client", new_callable=AsyncMock)
async def test_run_etl_success(mock_redis, mock_session_local, mock_init_db):
    
    mock_session = AsyncMock()
    mock_session.add_all = MagicMock()
    
    mock_session_local.return_value.__aenter__.return_value = mock_session

    mock_session.execute.side_effect = [
        None,  
        None,  
        [MagicMock(product_id="p1", unique_buyers=15)], 
        [MagicMock(category_id="c1", product_id="p2", unique_buyers=10)], 
    ]

    await run_etl()

    mock_init_db.assert_called_once() 
    assert mock_session.execute.call_count == 4 
    assert mock_session.add_all.call_count == 2 
    mock_session.commit.assert_called_once() 
    
    mock_redis.delete.assert_called_once_with("best_sellers:general")


# etl db - rollback
@patch("etl.etl.init_db", new_callable=AsyncMock)
@patch("etl.etl.AsyncSessionLocal")
async def test_run_etl_db_error_triggers_rollback(mock_session_local, mock_init_db):
    
    mock_session = AsyncMock()
    mock_session_local.return_value.__aenter__.return_value = mock_session
    mock_session.execute.side_effect = Exception("mock db down")

    await run_etl()

    mock_session.rollback.assert_called_once() 
    mock_session.commit.assert_not_called() 


# redis
@patch("etl.etl.init_db", new_callable=AsyncMock)
@patch("etl.etl.AsyncSessionLocal")
@patch("etl.etl.redis_client", new_callable=AsyncMock)
async def test_run_etl_redis_error_ignored(mock_redis, mock_session_local, mock_init_db):
    
    mock_session = AsyncMock()
    
    mock_session.add_all = MagicMock()
    
    mock_session_local.return_value.__aenter__.return_value = mock_session
    mock_session.execute.side_effect = [None, None, [], []]
    mock_redis.delete.side_effect = Exception("redis connection failure")

    await run_etl()

    mock_session.commit.assert_called_once()
    mock_session.rollback.assert_not_called()