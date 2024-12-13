from fastapi import FastAPI
from .google import search_image_with_google_lens
from .pinterest import get_board_items
from .chrome_setup import setup_chrome
import os

### Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

# Dummy data for testing
DUMMY_DATA = [{'title': "Ganni Small Logo Oversized Sweatshirt M Casual Designer in Black, Men's (Size Medium)", 'images': [{'link': 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRSIPk4ZCtAmharsQvkTfTWEP94GqOUOJb04QV1fJ0DvFzX1bxR'}], 'rating': None, 'reviews': None, 'shopping_results': [{'source': 'Grailed', 'price': {'value': '$100.00', 'extracted_value': 100.0, 'currency': '$'}, 'extracted_price': 100.0, 'link': 'https://www.grailed.com/listings/67910788-designer-x-ganni-x-streetwear-ganni-small-logo-oversized-sweatshirt-m-casual-designer-rare'}]}, {'title': 'Gravity Outdoor Company Cross Weave Crewneck Sweatshirt', 'images': [{'link': 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcR4VnBj9qgdbizrHJmiyEuw3JjN82LqQ178AMJuIQ0oqD2sqzSz'}], 'rating': None, 'reviews': None, 'shopping_results': [{'source': 'Amazon.com', 'price': {'value': '$29.49', 'extracted_value': 29.49, 'currency': '$'}, 'extracted_price': 29.49, 'link': 'https://www.amazon.com/Gravity-Outdoor-Company-Crewneck-Sweatshirt/dp/B07S16HGCJ'}]}]

# # Setup Chrome when the API starts
# if os.environ.get('VERCEL'):
#     setup_chrome()

@app.get("/api/py/helloFastApi")
def hello_fast_api():
    return {"message": "Hello from FastAPI"}

@app.get("/api/py/search-image")
async def search_image(image_url: str, use_dummy: bool = False):
    try:
        if use_dummy:
            return {"results": DUMMY_DATA}
        results = search_image_with_google_lens(image_url)
        return {"results": results}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/py/dummy-search")
async def dummy_search():
    return {"results": DUMMY_DATA}

@app.get("/api/py/pinterest-board")
async def search_pinterest_board(board_url: str):
    try:
        results = get_board_items(board_url)
        return results
    except Exception as e:
        return {"error": str(e)}
    
@app.get("/api/py/pinterest-images")
async def get_pinterest_images(board_url: str):
    try:
        from .pinterest import scrape_pinterest_board
        image_urls = scrape_pinterest_board(board_url)
        return {"image_urls": image_urls}
    except Exception as e:
        return {"error": str(e)}