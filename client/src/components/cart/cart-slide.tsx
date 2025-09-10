import { X, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

interface CartSlideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSlide({ isOpen, onClose }: CartSlideProps) {
  const { cartItems, totalPrice, updateQuantity, removeFromCart, isLoading } = useCart();
  const [, navigate] = useLocation();

  const handleCheckout = () => {
    navigate('/checkout');
    onClose();
  };

  const handleViewCart = () => {
    navigate('/cart');
    onClose();
  };

  const shipping = totalPrice > 0 ? 9.99 : 0;
  const total = totalPrice + shipping;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
        onClick={onClose}
        data-testid="overlay-cart"
      />
      
      {/* Cart Slide */}
      <div className="fixed top-0 right-0 w-full md:w-96 h-full bg-card border-l border-border shadow-xl z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold" data-testid="text-cart-title">Shopping Cart</h2>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-cart">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8" data-testid="text-loading">Loading...</div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4" data-testid="text-empty-cart">Your cart is empty</p>
              <Button onClick={onClose} data-testid="button-continue-shopping">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex items-center space-x-4 p-4 border border-border rounded-lg" data-testid={`cart-item-${item.productId}`}>
                    {item.product?.images?.[0] && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-md"
                        loading="lazy"
                        data-testid={`img-product-${item.productId}`}
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium" data-testid={`text-product-name-${item.productId}`}>
                        {item.product?.name || 'Unknown Product'}
                      </h3>
                      <p className="text-sm text-muted-foreground" data-testid={`text-product-price-${item.productId}`}>
                        ${item.product?.price?.toFixed(2) || '0.00'}
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => updateQuantity({ productId: item.productId, quantity: Math.max(0, item.quantity - 1) })}
                          data-testid={`button-decrease-${item.productId}`}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm min-w-8 text-center" data-testid={`text-quantity-${item.productId}`}>
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => updateQuantity({ productId: item.productId, quantity: item.quantity + 1 })}
                          data-testid={`button-increase-${item.productId}`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeFromCart(item.productId)}
                      data-testid={`button-remove-${item.productId}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between" data-testid="row-subtotal">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between" data-testid="row-shipping">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t border-border pt-2" data-testid="row-total">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Cart Actions */}
              <div className="space-y-3 mt-6">
                <Button
                  className="w-full"
                  onClick={handleCheckout}
                  data-testid="button-checkout"
                >
                  Proceed to Checkout
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleViewCart}
                  data-testid="button-view-cart"
                >
                  View Full Cart
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
