import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductGrid } from "@/components/product/product-grid";
import { BlogCard } from "@/components/blog/blog-card";
import { Input } from "@/components/ui/input";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useCart } from "@/hooks/use-cart";
import { ShoppingCart } from "lucide-react";
import type { Product, BlogPost } from "@shared/schema";

export default function Home() {
  const { addToCart } = useCart();

  // Featured products query
  const { data: productsData } = useQuery<{ products: Product[]; total: number }>({
    queryKey: ['/api/products', { limit: 8 }],
    queryFn: async () => {
      const response = await fetch('/api/products?limit=8');
      return response.json();
    },
  });

  // Blog posts query
  const { data: blogData } = useQuery<{ posts: BlogPost[]; total: number }>({
    queryKey: ['/api/blog', { limit: 3 }],
    queryFn: async () => {
      const response = await fetch('/api/blog?limit=3');
      return response.json();
    },
  });

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="text-hero-title">
              Tech Treasures Await
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90" data-testid="text-hero-description">
              Discover the latest in laptops, phones, headphones, and custom PCs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90" data-testid="button-shop-now">
                <Link href="/products">Shop Now</Link>
              </Button>
              <Button variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" data-testid="button-learn-more">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Product Slider */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-featured-slider-title">Featured Tech</h2>
          
          {productsData?.products && productsData.products.length >= 3 ? (
            <Carousel className="w-full max-w-5xl mx-auto" opts={{ align: "start", loop: true }}>
              <CarouselContent className="-ml-2 md:-ml-4">
                {productsData.products.slice(0, 3).map((product) => (
                  <CarouselItem key={product.id} className="pl-2 md:pl-4" data-testid={`slider-item-${product.id}`}>
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-12">
                        <div className="flex flex-col justify-center space-y-6">
                          <div>
                            <h3 className="text-3xl md:text-4xl font-bold mb-4" data-testid={`slider-product-name-${product.id}`}>
                              {product.name}
                            </h3>
                            <p className="text-lg text-primary-foreground/90 mb-6" data-testid={`slider-product-description-${product.id}`}>
                              {product.description}
                            </p>
                            <div className="flex items-center gap-4">
                              <span className="text-3xl font-bold" data-testid={`slider-product-price-${product.id}`}>
                                ${product.price.toFixed(2)}
                              </span>
                              <Button 
                                className="bg-accent text-accent-foreground hover:bg-accent/90"
                                onClick={() => addToCart({ productId: product.id, quantity: 1 })}
                                data-testid={`slider-add-to-cart-${product.id}`}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Add to Cart
                              </Button>
                            </div>
                          </div>
                          <Link 
                            href={`/products/${product.id}`} 
                            className="text-primary-foreground/80 hover:text-primary-foreground font-medium"
                            data-testid={`slider-view-details-${product.id}`}
                          >
                            View Details →
                          </Link>
                        </div>
                        
                        <div className="relative">
                          {product.images?.[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
                              loading="lazy"
                              data-testid={`slider-product-image-${product.id}`}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-12" />
              <CarouselNext className="hidden md:flex -right-12" />
            </Carousel>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground" data-testid="text-no-featured-products">Loading featured products...</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-categories-title">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Laptops', icon: 'fas fa-laptop', count: '45+ models', value: 'laptops', color: 'text-primary' },
              { name: 'Phones', icon: 'fas fa-mobile-alt', count: '30+ models', value: 'phones', color: 'text-accent' },
              { name: 'Headphones', icon: 'fas fa-headphones', count: '25+ models', value: 'headphones', color: 'text-green-500' },
              { name: 'PCs', icon: 'fas fa-desktop', count: '20+ builds', value: 'pcs', color: 'text-orange-500' },
            ].map((category) => (
              <Link key={category.value} href={`/products?category=${category.value}`}>
                <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer" data-testid={`card-category-${category.value}`}>
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 bg-${category.color}/10 rounded-lg flex items-center justify-center mx-auto mb-4`}>
                      <i className={`${category.icon} ${category.color} text-2xl`}></i>
                    </div>
                    <h3 className="font-semibold mb-2" data-testid={`text-category-name-${category.value}`}>{category.name}</h3>
                    <p className="text-sm text-muted-foreground" data-testid={`text-category-count-${category.value}`}>{category.count}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold" data-testid="text-featured-products-title">Featured Products</h2>
            <Link href="/products" className="text-primary hover:text-primary/80 font-medium" data-testid="link-view-all-products">
              View All →
            </Link>
          </div>
          
          {productsData?.products && productsData.products.length > 0 ? (
            <Carousel className="w-full" opts={{ align: "start", dragFree: true }}>
              <CarouselContent className="-ml-2 md:-ml-4">
                {productsData.products.map((product) => (
                  <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4" data-testid={`featured-product-${product.id}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <Link href={`/products/${product.id}`} className="block" data-testid={`link-product-${product.id}`}>
                          {product.images?.[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-48 object-cover rounded-md mb-4"
                              loading="lazy"
                              data-testid={`img-product-${product.id}`}
                            />
                          )}
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2" data-testid={`text-product-name-${product.id}`}>
                            {product.name}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-2" data-testid={`text-product-description-${product.id}`}>
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-primary" data-testid={`text-product-price-${product.id}`}>
                              ${product.price.toFixed(2)}
                            </span>
                            <Button 
                              size="sm" 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addToCart({ productId: product.id, quantity: 1 });
                              }}
                              data-testid={`button-add-cart-${product.id}`}
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-12" />
              <CarouselNext className="hidden md:flex -right-12" />
            </Carousel>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground" data-testid="text-no-products">No products available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Blog Preview */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold" data-testid="text-blog-title">Latest from Our Blog</h2>
            <Link href="/blog" className="text-primary hover:text-primary/80 font-medium" data-testid="link-view-all-blog">
              View All →
            </Link>
          </div>
          
          {blogData?.posts && blogData.posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogData.posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground" data-testid="text-no-blog-posts">No blog posts available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4" data-testid="text-newsletter-title">Stay Updated</h2>
          <p className="text-xl mb-8 text-primary-foreground/90" data-testid="text-newsletter-description">
            Get the latest deals and product updates delivered to your inbox
          </p>
          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex gap-4">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-primary-foreground text-foreground"
              data-testid="input-newsletter-email"
            />
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" data-testid="button-subscribe">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
