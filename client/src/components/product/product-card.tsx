import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useState, useEffect } from "react";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  variant?: 'standard' | 'large' | 'compact';
}

export function ProductCard({ product, variant = 'standard' }: ProductCardProps) {
  const { addToCart, isAddingToCart } = useCart();
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Check if product is in wishlist on mount
  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsInWishlist(wishlist.includes(product.id));
  }, [product.id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking add to cart
    e.stopPropagation();
    addToCart({ productId: product.id, quantity: 1 });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const newIsInWishlist = !isInWishlist;
    
    if (newIsInWishlist) {
      // Add to wishlist
      if (!wishlist.includes(product.id)) {
        wishlist.push(product.id);
      }
    } else {
      // Remove from wishlist
      const index = wishlist.indexOf(product.id);
      if (index > -1) {
        wishlist.splice(index, 1);
      }
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    setIsInWishlist(newIsInWishlist);
  };

  if (variant === 'large') {
    return (
      <Link href={`/products/${product.id}`}>
        <Card className="md:col-span-2 lg:row-span-2 product-card-hover cursor-pointer overflow-hidden" data-testid={`card-product-${product.id}`}>
          {product.images?.[0] && (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-64 lg:h-80 object-cover"
              loading="lazy"
              data-testid={`img-product-${product.id}`}
            />
          )}
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" data-testid={`badge-category-${product.id}`}>
                {product.category}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleWishlistToggle}
                className={isInWishlist ? "text-red-500 hover:text-red-600" : ""}
                data-testid={`button-wishlist-${product.id}`}
              >
                <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
              </Button>
            </div>
            <h3 className="text-xl font-semibold mb-2" data-testid={`text-product-name-${product.id}`}>
              {product.name}
            </h3>
            <p className="text-muted-foreground mb-4" data-testid={`text-product-description-${product.id}`}>
              {product.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold" data-testid={`text-product-price-${product.id}`}>
                ${product.price.toFixed(2)}
              </span>
              <Button 
                onClick={handleAddToCart} 
                disabled={isAddingToCart}
                data-testid={`button-add-to-cart-${product.id}`}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={`/products/${product.id}`}>
        <Card className="md:col-span-2 product-card-hover cursor-pointer" data-testid={`card-product-${product.id}`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              {product.images?.[0] && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                  loading="lazy"
                  data-testid={`img-product-${product.id}`}
                />
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant="secondary" data-testid={`badge-category-${product.id}`}>
                    {product.category}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleWishlistToggle}
                    className={isInWishlist ? "text-red-500 hover:text-red-600" : ""}
                    data-testid={`button-wishlist-${product.id}`}
                  >
                    <Heart className={`h-3 w-3 ${isInWishlist ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                <h3 className="font-semibold mb-1" data-testid={`text-product-name-${product.id}`}>
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-2" data-testid={`text-product-description-${product.id}`}>
                  {product.description.length > 50 ? `${product.description.substring(0, 50)}...` : product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold" data-testid={`text-product-price-${product.id}`}>
                    ${product.price.toFixed(2)}
                  </span>
                  <Button 
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    data-testid={`button-add-to-cart-${product.id}`}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Standard variant
  return (
    <Link href={`/products/${product.id}`}>
      <Card className="product-card-hover cursor-pointer overflow-hidden" data-testid={`card-product-${product.id}`}>
        {product.images?.[0] && (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-48 object-cover"
            loading="lazy"
            data-testid={`img-product-${product.id}`}
          />
        )}
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" data-testid={`badge-category-${product.id}`}>
              {product.category}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleWishlistToggle}
              className={isInWishlist ? "text-red-500 hover:text-red-600" : ""}
              data-testid={`button-wishlist-${product.id}`}
            >
              <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </Button>
          </div>
          <h3 className="font-semibold mb-2" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold" data-testid={`text-product-price-${product.id}`}>
              ${product.price.toFixed(2)}
            </span>
            <Button 
              size="sm" 
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              data-testid={`button-add-to-cart-${product.id}`}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
