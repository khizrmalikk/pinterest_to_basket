'use client'

import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ProductCard } from "@/components/prod_card";
import { ArrowUpDown, ShoppingBasket, Filter } from "lucide-react";
import { getStoredBasketItems, setStoredBasketItems } from "@/lib/localStorage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Home() {
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');
  const [basketItems, setBasketItems] = useState<any[]>(getStoredBasketItems());
  const [boardUrl, setBoardUrl] = useState("");
  const [boardError, setBoardError] = useState<string | null>(null);
  const [isBoardLoading, setIsBoardLoading] = useState(false);
  const [filterType, setFilterType] = useState<'closest' | 'cheapest' | 'expensive'>('closest');
  
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      // Optional: Check if it's an image URL
      return url.match(/\.(jpeg|jpg|gif|png|webp)$/) !== null;
    } catch (e) {
      return false;
    }
  };

  const handleSearch = async () => {
    setError(null);
    setSearchResults([]);
    setIsLoading(true);

    if (!imageUrl.trim()) {
      setError("Please enter an image URL");
      setIsLoading(false);
      return;
    }

    if (!isValidUrl(imageUrl)) {
      setError("Please enter a valid image URL");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/py/search-image?image_url=${encodeURIComponent(imageUrl)}&use_dummy=true`);
      const data = await response.json();
      
      if (data.error) {
        console.error("Search error:", data.error);
        setError(data.error);
        return;
      }
      
      console.log("API Response:", data);
      
      setSearchResults(data.results || []);
      
      if (!data.results || data.results.length === 0) {
        setError("No results found for this image");
      }
    } catch (error) {
      console.error("Failed to search:", error);
      setError("Failed to perform search. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = () => {
    // Cycle through sort orders: none -> asc -> desc -> none
    const newSortOrder = sortOrder === 'none' ? 'asc' : sortOrder === 'asc' ? 'desc' : 'none';
    setSortOrder(newSortOrder);

    if (newSortOrder === 'none') {
      // Reset to original order
      setSearchResults([...searchResults]);
    } else {
      // Sort the results
      const sortedResults = [...searchResults].sort((a, b) => {
        const priceA = a.shopping_results[0]?.extracted_price || 0;
        const priceB = b.shopping_results[0]?.extracted_price || 0;
        return newSortOrder === 'asc' ? priceA - priceB : priceB - priceA;
      });
      setSearchResults(sortedResults);
    }
  };

  const addToBasket = (item: any) => {
    const updatedItems = [...basketItems, item];
    setBasketItems(updatedItems);
    setStoredBasketItems(updatedItems);
    alert('Item added to basket!');
  };

  const handleBoardSearch = async () => {
    setBoardError(null);
    setSearchResults([]);
    setIsBoardLoading(true);

    if (!boardUrl.trim()) {
      setBoardError("Please enter a Pinterest board URL");
      setIsBoardLoading(false);
      return;
    }

    try {
      // Replace with your actual board search API endpoint
      const response = await fetch(`/api/py/search-board?board_url=${encodeURIComponent(boardUrl)}`);
      const data = await response.json();
      
      if (data.error) {
        console.error("Search error:", data.error);
        setBoardError(data.error);
        return;
      }
      
      setSearchResults(data.results || []);
      
      if (!data.results || data.results.length === 0) {
        setBoardError("No results found for this board");
      }
    } catch (error) {
      console.error("Failed to search:", error);
      setBoardError("Failed to perform search. Please try again.");
    } finally {
      setIsBoardLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 right-4 z-50 rounded-full"
        asChild
      >
        <a href="/basket">
          <ShoppingBasket className="h-6 w-6" />
        </a>
      </Button>

      <main className="flex min-h-screen flex-col items-center p-24">
        <h1 className="text-6xl font-bold mb-8">Board2Basket</h1>
        
        {/* Board search section */}
        <div className="flex flex-col gap-4 w-full max-w-sm mb-8">
          <div className="flex gap-2">
            <Input 
              type="text" 
              placeholder="Enter Pinterest board URL..."
              className={`w-full ${boardError ? 'border-red-500' : ''}`}
              value={boardUrl}
              onChange={(e) => {
                setBoardUrl(e.target.value);
                setBoardError(null);
              }}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterType('closest')}>
                  Closest match
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('cheapest')}>
                  Cheapest
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('expensive')}>
                  Most expensive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {boardError && (
            <p className="text-red-500 text-sm">{boardError}</p>
          )}
          <Button 
            className="w-full" 
            onClick={handleBoardSearch} 
            disabled={isBoardLoading}
          >
            {isBoardLoading ? "Searching..." : "Search Board"}
          </Button>
        </div>

        <h1 className="text-2xl font-bold mb-8">OR</h1>

        {/* Search section */}
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <Input 
            type="text" 
            placeholder="Enter your image URL..."
            className={`w-full ${error ? 'border-red-500' : ''}`}
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setError(null);
            }}
          />
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          <Button 
            className="w-full" 
            onClick={handleSearch} 
            disabled={isLoading}
          >
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>

        {/* Original Image Display */}
        {imageUrl && !error && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Original Image</h2>
            <img 
              src={imageUrl} 
              alt="Original search image" 
              className="max-w-sm rounded-lg shadow-md"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                setError("Failed to load image");
              }}
            />
          </div>
        )}

        <h1 className="text-2xl font-bold mb-8 pt-8">OR</h1>
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <FileUpload />
        </div>
        
        {/* Results section */}
        {searchResults.length > 0 && (
          <div className="mt-12 w-full max-w-6xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Search Results</h2>
              <Button
                variant="outline"
                onClick={handleSort}
                className="flex items-center gap-2"
              >
                <ArrowUpDown className="h-4 w-4" />
                Sort by Price
                {sortOrder !== 'none' && (
                  <span className="ml-2">
                    ({sortOrder === 'asc' ? '↑' : '↓'})
                  </span>
                )}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((result, index) => (
                <ProductCard
                  key={index}
                  title={result.title}
                  rating={result.rating}
                  reviews={result.reviews}
                  imageUrl={result.images[0].link}
                  shoppingResults={result.shopping_results}
                  onAddToBasket={() => addToBasket(result)}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
