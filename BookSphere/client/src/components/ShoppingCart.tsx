import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/hooks/useCart";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShoppingCart({ isOpen, onClose }: ShoppingCartProps) {
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { toast } = useToast();

  const calculateSubtotal = () => {
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = cart.items.length > 0 ? 4.99 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleCheckout = async () => {
    try {
      // Create order in the database
      await apiRequest('POST', '/api/orders', {
        orderData: {
          userId: null, // Anonymous order for now
          totalAmount: total,
          status: 'pending'
        },
        orderItems: cart.items.map(item => ({
          bookId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      });

      // Clear the cart
      clearCart();

      // Show success message
      toast({
        title: "Order Placed!",
        description: "Your order has been successfully placed.",
        variant: "default",
      });

    } catch (error) {
      toast({
        title: "Checkout Failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-4 py-6 bg-primary text-white">
          <SheetTitle className="text-white">Shopping Cart</SheetTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4 text-white hover:text-gray-300 hover:bg-transparent"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <ShoppingBag className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <Button 
                onClick={onClose} 
                className="mt-4"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-gray-200">
                  <img 
                    src={item.coverImage} 
                    alt={item.title} 
                    className="w-16 h-20 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-serif font-medium">{item.title}</h3>
                    <div className="flex items-center mt-2">
                      <Button 
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-l-md"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <div className="w-10 h-8 flex items-center justify-center border-t border-b border-input">
                        {item.quantity}
                      </div>
                      <Button 
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-r-md"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    <Button 
                      variant="ghost"
                      size="sm"
                      className="text-sm text-destructive hover:text-destructive/80 p-0 h-auto"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {cart.items.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between pt-2">
                <span className="font-bold">Total</span>
                <span className="font-bold">${total.toFixed(2)}</span>
              </div>
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
