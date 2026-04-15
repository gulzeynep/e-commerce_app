from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from api import database

app = FastAPI(title="E-Commerce Recommendation API")

#CORS (Cross Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://172.18.0.6:5173"], #add allowed domains only 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    """Checks if the API is running."""
    return {"status": "Recommendation API is running"}

@app.get("/browsing-history/{user_id}")
async def get_history(user_id: str):
    """Gets the browsing history according to user id. """
    try:
        products = await database.get_browsing_history(user_id)
        return {"user-id": user_id, 
                "products": products, 
                "type": "history"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching browsing history: {e}")

@app.delete("/browsing-history/{user_id}/{product_id}")
async def delete_history(user_id: str, product_id: str):
    """Deletes a product from a users browsing history. (Soft Delete)"""
    try:
        result = await database.delete_history_item(user_id, product_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting item: {e}")

@app.get("/best-sellers/general")
async def get_general():
    """Gets the general best seller list."""
    try:
        products = await database.get_general_best_sellers()
        return {"type": "general", 
                "products": products}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching general best sellers: {e}")

@app.get("/best-sellers/personalized/{user_id}")
async def get_personalized(user_id: str):
    """Gets the personalized best seller list according to user id."""
    try:
        products = await database.get_personalized_best_sellers(user_id)
        return {"user-id": user_id, 
                "type": "personalized", 
                "products": products}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing personalized data: {e}")
    
@app.get("/catalog")
async def get_catalog():
    """
    Gets the full product catalog grouped by categories.
    """
    try:
        catalog = await database.get_product_catalog()
        return {"type": "catalog", "data": catalog}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching catalog: {str(e)}")