import logging
from serpapi import GoogleSearch

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def search_image_with_google_lens(image_url):
    logger.info(f"Starting Google Lens search for image URL: {image_url}")
    
    params = {
        "engine": "google_lens",
        "url": image_url,
        "api_key": "efa2dcba3e084ebb072b4255980b0e7587042962a9a86e7f95481709ccfe46e8"
    }
    logger.debug(f"Search parameters: {params}")

    try:
        search = GoogleSearch(params)
        results = search.get_dict()
        
        # Log the entire response
        logger.info(f"Full API Response: {results}")
        
        # Get results and filter for items with prices
        shopping_results = results.get("shopping_results", [])
        visual_matches = results.get("visual_matches", [])
        
        items_to_format = shopping_results or visual_matches
        
        # Filter items that have prices and format them
        formatted_results = []
        for item in items_to_format:
            price = item.get("price")
            if price:
                # Remove asterisk from price if it exists
                if isinstance(price, str):
                    price = price.replace('*', '')
                elif isinstance(price, dict) and 'value' in price:
                    price['value'] = price['value'].replace('*', '')
                
                formatted_results.append({
                    "title": item.get("title", "Unknown"),
                    "images": [{"link": item.get("thumbnail", item.get("image", ""))}],
                    "rating": item.get("rating"),
                    "reviews": item.get("reviews_count", item.get("reviews")),
                    "shopping_results": [{
                        "source": item.get("source", "Unknown"),
                        "price": price,
                        "extracted_price": item.get("extracted_price", 0),
                        "link": item.get("link", "#")
                    }]
                })
        
        logger.info(f"Formatted results: {formatted_results}")
        return formatted_results
    
    except Exception as e:
        logger.error(f"Error during Google Lens search: {str(e)}")
        raise