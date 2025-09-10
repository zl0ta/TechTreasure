import { ProductCard } from "./product-card";
import type { Product } from "@shared/schema";

interface ProductGridProps {
  products: Product[];
  variant?: 'mixed' | 'standard';
}

export function ProductGrid({ products, variant = 'standard' }: ProductGridProps) {
  if (variant === 'mixed' && products.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => {
          // Create mixed layout pattern
          if (index === 0) {
            return <ProductCard key={product.id} product={product} variant="large" />;
          } else if (index === 3 && products.length > 3) {
            return <ProductCard key={product.id} product={product} variant="compact" />;
          } else {
            return <ProductCard key={product.id} product={product} variant="standard" />;
          }
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} variant="standard" />
      ))}
    </div>
  );
}
