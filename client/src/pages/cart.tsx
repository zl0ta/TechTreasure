import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";

export default function Cart() {
  const { cartItems, totalPrice, updateQuantity, removeFromCart, isLoading } = useCart();
  const { isAuthenticated } = useAuth();

  const shipping = totalPrice > 0 ? 9.99 : 0;
  const tax = totalPrice * 0.08; // 8% tax
  const total = totalPrice + shipping + tax;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground" data-testid="text-loading">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2" data-testid="text-empty-cart">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some products to your cart to get started.</p>
          <Button asChild data-testid="button-continue-shopping">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8" data-testid="text-cart-title">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle data-testid="text-cart-items-title">Cart Items ({cartItems.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex items-center space-x-4 py-4 border-b border-border last:border-b-0" data-testid={`cart-item-${item.productId}`}>
                  {/* Product Image */}
                  {item.product?.images?.[0] && (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-md"
                      loading="lazy"
                      data-testid={`img-cart-product-${item.productId}`}
                    />
                  )}
                  
                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold" data-testid={`text-cart-product-name-${item.productId}`}>
                      {item.product?.name || 'Unknown Product'}
                    </h3>
                    <p className="text-sm text-muted-foreground" data-testid={`text-cart-product-category-${item.productId}`}>
                      {item.product?.category}
                    </p>
                    <p className="font-medium" data-testid={`text-cart-product-price-${item.productId}`}>
                      ${item.product?.price?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity({ productId: item.productId, quantity: Math.max(0, item.quantity - 1) })}
                      data-testid={`button-cart-decrease-${item.productId}`}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center" data-testid={`text-cart-quantity-${item.productId}`}>
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity({ productId: item.productId, quantity: item.quantity + 1 })}
                      data-testid={`button-cart-increase-${item.productId}`}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Item Total */}
                  <div className="text-right">
                    <p className="font-semibold" data-testid={`text-cart-item-total-${item.productId}`}>
                      ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive mt-1"
                      onClick={() => removeFromCart(item.productId)}
                      data-testid={`button-cart-remove-${item.productId}`}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle data-testid="text-order-summary-title">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between" data-testid="row-subtotal">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between" data-testid="row-shipping">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between" data-testid="row-tax">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-semibold text-lg" data-testid="row-total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              
              <div className="space-y-2 mt-6">
                {isAuthenticated ? (
                  <Button asChild className="w-full" data-testid="button-proceed-checkout">
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild className="w-full" data-testid="button-login-checkout">
                      <Link href="/login">Login to Checkout</Link>
                    </Button>
                    <p className="text-sm text-muted-foreground text-center">
                      Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
                    </p>
                  </>
                )}
                
                <Button variant="outline" asChild className="w-full" data-testid="button-continue-shopping-cart">
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
