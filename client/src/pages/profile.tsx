import { useQuery } from "@tanstack/react-query";
import { User, Package, MapPin, CreditCard, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import type { Order } from "@shared/schema";

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" data-testid="text-profile-title">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg" data-testid="text-user-name">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-muted-foreground" data-testid="text-user-email">{user?.email}</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Orders: {orders.length}</span>
                </div>
                
                {user?.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <p>{user.address.street}</p>
                      <p>{user.address.city}, {user.address.state} {user.address.zipCode}</p>
                      <p>{user.address.country}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" data-testid="button-edit-profile">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-logout">
                  <User className="h-4 w-4 mr-2" />
                  <span onClick={() => logout()}>Logout</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle data-testid="text-orders-title">Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground" data-testid="text-loading-orders">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4" data-testid="text-no-orders">No orders found</p>
                  <Button onClick={() => navigate('/products')} data-testid="button-start-shopping">
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="p-4" data-testid={`order-${order.id}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold" data-testid={`text-order-id-${order.id}`}>
                            Order #{order.id.slice(0, 8)}
                          </h3>
                          <p className="text-sm text-muted-foreground" data-testid={`text-order-date-${order.id}`}>
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(order.status)} data-testid={`badge-order-status-${order.id}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          <p className="font-semibold mt-1" data-testid={`text-order-total-${order.id}`}>
                            ${order.total.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Items:</h4>
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm" data-testid={`order-item-${order.id}-${index}`}>
                            <span>Product ID: {item.productId.slice(0, 8)} (Qty: {item.quantity})</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <Separator className="my-3" />

                      <div className="text-sm">
                        <p className="font-medium mb-1">Shipping Address:</p>
                        <div className="text-muted-foreground" data-testid={`text-shipping-address-${order.id}`}>
                          <p>{order.shippingAddress.street}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                          <p>{order.shippingAddress.country}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
