import { Link } from "wouter";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">TechTreasure</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Your premier destination for the latest technology - laptops, phones, headphones, and custom PCs.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" asChild data-testid="link-facebook">
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <i className="fab fa-facebook"></i>
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild data-testid="link-twitter">
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <i className="fab fa-twitter"></i>
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild data-testid="link-instagram">
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <i className="fab fa-instagram"></i>
                </a>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-home">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-products">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-blog">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-help">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-shipping">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-returns">
                  Returns
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <i className="fas fa-map-marker-alt text-muted-foreground"></i>
                <span className="text-muted-foreground">123 Commerce St, City, State 12345</span>
              </li>
              <li className="flex items-center space-x-2">
                <i className="fas fa-phone text-muted-foreground"></i>
                <span className="text-muted-foreground">(555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <i className="fas fa-envelope text-muted-foreground"></i>
                <span className="text-muted-foreground">support@techtreasure.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground">© 2023 TechTreasure. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-privacy">
              Privacy Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-terms">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
