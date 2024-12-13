import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ExternalLink } from "lucide-react";

interface ShoppingResult {
  source: string;
  price: string | { value: string; extracted_value: number; currency: string };
  extracted_price: number;
  link: string;
}

interface ProductCardProps {
  title: string;
  rating?: number;
  reviews?: number;
  imageUrl: string;
  shoppingResults: ShoppingResult[];
  onAddToBasket?: () => void;
  showBasketButton?: boolean;
  onRemove?: () => void;
}

export function ProductCard({ title, rating, reviews, imageUrl, shoppingResults, onAddToBasket, showBasketButton = true, onRemove }: ProductCardProps) {
  // Sort shopping results by price
  const sortedResults = [...shoppingResults].sort((a, b) => a.extracted_price - b.extracted_price);
  const bestPrice = sortedResults[0];

  // Format the price depending on whether it's a string or an object
  const formatPrice = (price: string | { value: string; extracted_value: number; currency: string }) => {
    if (typeof price === 'string') return price;
    return price.value;
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl text-center">{title}</CardTitle>
        {rating && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>★ {rating}</span>
            {reviews && <span>({reviews} reviews)</span>}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="relative w-full aspect-square">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 384px"
          />
        </div>
        <div className="text-2xl font-bold">
          {bestPrice && formatPrice(bestPrice.price)}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 items-center">
        <Button className="w-full" variant="default" asChild>
          <a href={bestPrice?.link} target="_blank" rel="noopener noreferrer">
            Buy from {bestPrice?.source}
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </Button>
        {showBasketButton ? (
          <Button className="w-full" variant="secondary" onClick={onAddToBasket}>
            <Plus className="w-4 h-4 mr-2" />
            Add to Basket
          </Button>
        ) : onRemove && (
          <Button className="w-full" variant="destructive" onClick={onRemove}>
            Remove from Basket
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
