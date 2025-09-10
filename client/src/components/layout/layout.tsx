import { Header } from "./header";
import { Footer } from "./footer";
import { CartSlide } from "../cart/cart-slide";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onCartClick={() => setIsCartOpen(true)} />
      <main>{children}</main>
      <Footer />
      <CartSlide isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
