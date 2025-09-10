import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Truck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const checkoutSchema = z.object({
  shippingAddress: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(5, "Valid zip code is required"),
    country: z.string().min(1, "Country is required"),
  }),
  paymentMethod: z.object({
    cardNumber: z.string().min(16, "Valid card number is required"),
    expiryDate: z.string().min(5, "Valid expiry date is required"),
    cvv: z.string().min(3, "Valid CVV is required"),
    cardholderName: z.string().min(1, "Cardholder name is required"),
  }),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, navigate] = useLocation();
  const { cartItems, totalPrice } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: {
        street: user?.address?.street || "",
        city: user?.address?.city || "",
        state: user?.address?.state || "",
        zipCode: user?.address?.zipCode || "",
        country: user?.address?.country || "US",
      },
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      // Calculate order details
      const shipping = 9.99;
      const tax = totalPrice * 0.08;
      const total = totalPrice + shipping + tax;

      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product?.price || 0,
        })),
        total,
        status: 'pending' as const,
        shippingAddress: data.shippingAddress,
      };

      const response = await apiRequest('POST', '/api/checkout', orderData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Order placed successfully!",
        description: "Thank you for your purchase. We'll send you a confirmation email shortly.",
      });
      navigate('/profile');
    },
    onError: (error: any) => {
      toast({
        title: "Checkout failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const shipping = 9.99;
  const tax = totalPrice * 0.08;
  const total = totalPrice + shipping + tax;

  const onSubmit = (data: CheckoutFormData) => {
    checkoutMutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8" data-testid="text-checkout-title">Checkout</h1>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" data-testid="text-shipping-title">
                  <Truck className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    {...register("shippingAddress.street")}
                    data-testid="input-street"
                  />
                  {errors.shippingAddress?.street && (
                    <p className="text-sm text-destructive mt-1">{errors.shippingAddress.street.message}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      {...register("shippingAddress.city")}
                      data-testid="input-city"
                    />
                    {errors.shippingAddress?.city && (
                      <p className="text-sm text-destructive mt-1">{errors.shippingAddress.city.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      {...register("shippingAddress.state")}
                      data-testid="input-state"
                    />
                    {errors.shippingAddress?.state && (
                      <p className="text-sm text-destructive mt-1">{errors.shippingAddress.state.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      {...register("shippingAddress.zipCode")}
                      data-testid="input-zip"
                    />
                    {errors.shippingAddress?.zipCode && (
                      <p className="text-sm text-destructive mt-1">{errors.shippingAddress.zipCode.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      {...register("shippingAddress.country")}
                      data-testid="input-country"
                    />
                    {errors.shippingAddress?.country && (
                      <p className="text-sm text-destructive mt-1">{errors.shippingAddress.country.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" data-testid="text-payment-title">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    {...register("paymentMethod.cardholderName")}
                    data-testid="input-cardholder-name"
                  />
                  {errors.paymentMethod?.cardholderName && (
                    <p className="text-sm text-destructive mt-1">{errors.paymentMethod.cardholderName.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    {...register("paymentMethod.cardNumber")}
                    data-testid="input-card-number"
                  />
                  {errors.paymentMethod?.cardNumber && (
                    <p className="text-sm text-destructive mt-1">{errors.paymentMethod.cardNumber.message}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      {...register("paymentMethod.expiryDate")}
                      data-testid="input-expiry"
                    />
                    {errors.paymentMethod?.expiryDate && (
                      <p className="text-sm text-destructive mt-1">{errors.paymentMethod.expiryDate.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      {...register("paymentMethod.cvv")}
                      data-testid="input-cvv"
                    />
                    {errors.paymentMethod?.cvv && (
                      <p className="text-sm text-destructive mt-1">{errors.paymentMethod.cvv.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-order-summary">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="flex items-center space-x-3" data-testid={`checkout-item-${item.productId}`}>
                      {item.product?.images?.[0] && (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded-md"
                          loading="lazy"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product?.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-sm">
                        ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between" data-testid="checkout-subtotal">
                    <span>Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between" data-testid="checkout-shipping">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between" data-testid="checkout-tax">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-semibold text-lg" data-testid="checkout-total">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={checkoutMutation.isPending}
                  data-testid="button-place-order"
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  {checkoutMutation.isPending ? 'Processing...' : 'Place Order'}
                </Button>
                
                <div className="text-xs text-muted-foreground text-center">
                  By placing your order, you agree to our Terms of Service and Privacy Policy.
                  Your payment information is secure and encrypted.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
