import { useState, useEffect } from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@shared/schema";

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  // Load wishlist from localStorage
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const wishlistIds = JSON.parse(localStorage.getItem('wishlist') || '[]');
        if (wishlistIds.length === 0) {
          setIsLoading(false);
          return;
        }

        // Fetch product details for each wishlist item
        const productPromises = wishlistIds.map(async (id: string) => {
          const response = await fetch(`/api/products/${id}`);
          if (response.ok) {
            return response.json();
          }
          return null;
        });

        const products = await Promise.all(productPromises);
        setWishlistItems(products.filter(p => p !== null));
      } catch (error) {
        console.error('Failed to load wishlist:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();
  }, []);

  const removeFromWishlist = (productId: string) => {
    const updatedItems = wishlistItems.filter(item => item.id !== productId);
    setWishlistItems(updatedItems);
    
    // Update localStorage
    const wishlistIds = updatedItems.map(item => item.id);
    localStorage.setItem('wishlist', JSON.stringify(wishlistIds));
  };

  const addToCartAndRemove = (product: Product) => {
    addToCart({ productId: product.id, quantity: 1 });
    removeFromWishlist(product.id);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    localStorage.removeItem('wishlist');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4" data-testid="text-wishlist-title">
          My Wishlist
        </h1>
        <p className="text-muted-foreground">
          Keep track of products you love and want to buy later
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-6">
            Start adding products you love to your wishlist
          </p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Header Actions */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">
              {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist
            </p>
            <Button 
              variant="outline" 
              onClick={clearWishlist}
              data-testid="button-clear-wishlist"
            >
              Clear All
            </Button>
          </div>

          {/* Wishlist Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="relative mb-4">
                    <Link href={`/products/${product.id}`}>
                      {product.images?.[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-md cursor-pointer"
                          loading="lazy"
                        />
                      )}
                    </Link>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFromWishlist(product.id)}
                      data-testid={`button-remove-${product.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>
                    
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-semibold text-lg line-clamp-2 cursor-pointer hover:text-primary">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-2xl font-bold text-primary">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => addToCartAndRemove(product)}
                        data-testid={`button-add-to-cart-${product.id}`}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add to Cart
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => removeFromWishlist(product.id)}
                        data-testid={`button-remove-wishlist-${product.id}`}
                      >
                        <Heart className="h-4 w-4 fill-current text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}