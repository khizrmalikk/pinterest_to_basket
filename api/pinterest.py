import json
import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import time
import re

from api.google import search_image_with_google_lens

def setup_driver(headless: bool = True):
    """Set up Chrome driver with optimized options"""
    options = Options()
    
    # Performance optimizations
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-software-rasterizer")
    options.add_argument("--disable-extensions")
    options.add_argument("--window-size=1920,1080")
    
    # Additional options for better stability
    options.add_argument("--disable-infobars")
    options.add_argument("--disable-notifications")
    options.add_argument("--disable-popup-blocking")
    options.add_argument("--ignore-certificate-errors")
    
    # Add headers to mimic real browser
    options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    try:
        # Simple driver initialization without ChromeDriverManager
        return webdriver.Chrome(options=options)
    except Exception as e:
        print(f"Driver setup error: {e}")
        raise

def is_pinterest_image_url(url):
    """Check if URL is a Pinterest image URL"""
    return bool(re.match(r'https?://i\.pinimg\.com/.*', url))

def get_highest_quality_url(url):
    """Convert Pinterest image URL to highest quality version"""
    if not is_pinterest_image_url(url):
        return url
    
    # Extract the path components
    parts = url.split('/')
    if len(parts) >= 5:
        # Rebuild URL with 'originals' size
        return '/'.join(parts[:-2] + ['originals'] + [parts[-1]])
    return url

def scrape_pinterest_board(board_url):
    """Scrape all image URLs from a Pinterest board"""
    driver = None
    try:
        driver = setup_driver()
        logging.info(f"Attempting to scrape URL: {board_url}")
        
        driver.get(board_url)
        time.sleep(5)  # Initial wait for page load
        
        # Scroll multiple times to load more images
        for _ in range(3):
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
        
        image_urls = set()
        
        # Focus on the main board container and grid items
        strategies = [
            # Strategy 1: Find images within board grid items
            lambda: driver.find_elements(By.CSS_SELECTOR, "div[data-grid-item] img"),
            # Strategy 2: Find images within pin containers
            lambda: driver.find_elements(By.CSS_SELECTOR, "div[data-test-id='pin'] img"),
            # Strategy 3: Find images within board pins
            lambda: driver.find_elements(By.CSS_SELECTOR, "div[data-test-pin] img"),
            # Strategy 4: Fallback to pinimg.com images within the board
            lambda: driver.find_elements(By.CSS_SELECTOR, "div[data-test-id='board-feed'] img[src*='pinimg.com']")
        ]
        
        for strategy in strategies:
            images = strategy()
            logging.info(f"Found {len(images)} images with strategy")
            
            for img in images:
                try:
                    src = img.get_attribute('src')
                    if src and is_pinterest_image_url(src):
                        image_urls.add(src)
                except Exception as e:
                    logging.warning(f"Error processing image: {str(e)}")
                    continue
        
        final_urls = list(set(image_urls))
        logging.info(f"Final number of unique images found: {len(final_urls)}")
        logging.info("Image URLs found:")
        for idx, url in enumerate(final_urls, 1):
            logging.info(f"{idx}. {url}")
        
        return final_urls
        
    except Exception as e:
        logging.error(f"Error scraping Pinterest board: {str(e)}")
        if driver:
            with open('pinterest_error.html', 'w', encoding='utf-8') as f:
                f.write(driver.page_source)
        raise
    
    finally:
        if driver:
            driver.quit()

def get_board_items(board_url):
    """Get shopping results for all images in a Pinterest board"""
    try:
        # Get image URLs from Pinterest board
        image_urls = scrape_pinterest_board(board_url)
        
        # Search each image with Google Lens and compile results
        results = {}
        for index, image_url in enumerate(image_urls, 1):
            lens_results = search_image_with_google_lens(image_url)
            results[f"item{index}"] = lens_results
        
        return results
    except Exception as e:
        logging.error(f"Error processing board items: {str(e)}")
        raise

# Example usage
if __name__ == "__main__":
    board_url = "https://www.pinterest.com/khizm5050/stuff-to-buy/"
    results = get_board_items(board_url)
    print(json.dumps(results, indent=2))
