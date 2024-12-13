'use client'

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/prod_card";
import { getStoredBasketItems, setStoredBasketItems } from "@/lib/localStorage";

export default function Basket() {
  const [basketItems, setBasketItems] = useState<any[]>([]);
  
  useEffect(() => {
    setBasketItems(getStoredBasketItems());
  }, []);

  const clearBasket = () => {
    setBasketItems([]);
    setStoredBasketItems([]);
  };

  const removeFromBasket = (index: number) => {
    const updatedItems = basketItems.filter((_, i) => i !== index);
    setBasketItems(updatedItems);
    setStoredBasketItems(updatedItems);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-6xl font-bold mb-8">Your Basket</h1>
      
      {basketItems.length === 0 ? (
        <p className="text-gray-500">Your basket is empty</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {basketItems.map((item, index) => (
            <ProductCard
              key={index}
              title={item.title}
              rating={item.rating}
              reviews={item.reviews}
              imageUrl={item.images[0].link}
              shoppingResults={item.shopping_results}
              showBasketButton={false}
              onRemove={() => removeFromBasket(index)}
            />
          ))}
        </div>
      )}
      
      <Button
        className="mt-8"
        onClick={clearBasket}
        disabled={basketItems.length === 0}
      >
        Clear Basket
      </Button>
    </main>
  );
} 