import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  id: number;
  title: string;
  price: number;
  coverImage: string;
  quantity: number;
}

interface CartContextType {
  cart: {
    items: CartItem[];
  };
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<{ items: CartItem[] }>(() => {
    // Load cart from localStorage on initial render
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : { items: [] };
  });
  
  const { toast } = useToast();

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.items.find(i => i.id === item.id);
      
      if (existingItem) {
        // Update quantity of existing item
        return {
          ...prevCart,
          items: prevCart.items.map(i => 
            i.id === item.id 
              ? { ...i, quantity: i.quantity + item.quantity } 
              : i
          )
        };
      } else {
        // Add new item
        return {
          ...prevCart,
          items: [...prevCart.items, item]
        };
      }
    });
    
    toast({
      title: "Added to cart",
      description: `${item.title} has been added to your cart.`,
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prevCart => ({
      ...prevCart,
      items: prevCart.items.filter(item => item.id !== id)
    }));
  };

  const updateQuantity = (id: number, quantity: number) => {
    setCart(prevCart => ({
      ...prevCart,
      items: prevCart.items.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    }));
  };

  const clearCart = () => {
    setCart({ items: [] });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
