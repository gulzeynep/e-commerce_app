import sys, os 
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from api import database

app = FastAPI(title="E-Commerce Recommendation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://172.18.0.6:5173"], #add allowed domains only 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Recommendation API is running"}

@app.get("/browsing-history/{user_id}")
async def get_history(user_id: str):
    try:
        products = await database.get_browsing_history(user_id)
        return {"user-id": user_id, 
                "products": products, 
                "type": "history"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching browsing history: {e}")

@app.delete("/browsing-history/{user_id}/{product_id}")
async def delete_history(user_id: str, product_id: str):
    try:
        result = await database.delete_history_item(user_id, product_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting item: {e}")

@app.get("/best-sellers/general")
async def get_general():
    try:
        products = await database.get_general_best_sellers()
        return {"type": "general", 
                "products": products}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching general best sellers: {e}")

@app.get("/best-sellers/personalized/{user_id}")
async def get_personalized(user_id: str):
    try:
        products = await database.get_personalized_best_sellers(user_id)
        return {"user-id": user_id, 
                "type": "personalized", 
                "products": products}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing personalized data: {e}")
    
# 1. Clear History Endpoint
@app.post("/browsing-history/{user_id}/clear")
async def clear_history(user_id: str):
    return await database.clear_user_history(user_id)

# 2. All Products Endpoint (Cached)
@app.get("/products/all")
async def get_all_products():
    products = await database.get_all_products()
    return {"products": products}

# 3. Unique Categories Endpoint (Cached)
@app.get("/products/categories")
async def get_categories():
    categories = await database.get_all_categories()
    return {"categories": categories}

# 4. Category-Specific Best Sellers (Cached)
@app.get("/best-sellers/category/{category_id}")
async def get_category_best_sellers(category_id: str):
    products = await database.get_products_by_category(category_id)
    return {"products": products}