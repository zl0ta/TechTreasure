import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductGrid } from "@/components/product/product-grid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@shared/schema";

export default function Products() {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("name");

  // Parse URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category') || '';
    const search = urlParams.get('search') || '';
    
    setSelectedCategory(category);
    setSearchQuery(search);
  }, [location]);

  const { data: productsData, isLoading } = useQuery<{ products: Product[]; total: number }>({
    queryKey: ['/api/products', { 
      category: selectedCategory, 
      search: searchQuery, 
      page: currentPage, 
      limit: 12 
    }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
      });
      
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCategory) params.append('category', selectedCategory);
    
    navigate(`/products?${params.toString()}`);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    const actualCategory = category === 'all' ? '' : category;
    setSelectedCategory(actualCategory);
    const params = new URLSearchParams();
    if (actualCategory) params.append('category', actualCategory);
    if (searchQuery) params.append('search', searchQuery);
    
    navigate(`/products?${params.toString()}`);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSearchQuery("");
    navigate('/products');
    setCurrentPage(1);
  };

  const categories = [
    { label: "Laptops", value: "laptops" },
    { label: "Phones", value: "phones" },
    { label: "Headphones", value: "headphones" },
    { label: "PCs", value: "pcs" },
  ];

  const totalPages = Math.ceil((productsData?.total || 0) / 12);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4" data-testid="text-products-title">Products</h1>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-products"
              />
            </div>
          </form>
          
          <div className="flex gap-2">
            <Select value={selectedCategory || 'all'} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-48" data-testid="select-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" data-testid="button-sort">
                  Sort <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy("name")} data-testid="sort-name">
                  Name A-Z
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("price-low")} data-testid="sort-price-low">
                  Price: Low to High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("price-high")} data-testid="sort-price-high">
                  Price: High to Low
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Active Filters */}
        {(selectedCategory || searchQuery) && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {selectedCategory && (
              <Badge variant="secondary" data-testid={`badge-filter-category-${selectedCategory}`}>
                Category: {categories.find(c => c.value === selectedCategory)?.label}
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" data-testid="badge-filter-search">
                Search: {searchQuery}
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground" data-testid="text-loading">Loading products...</p>
        </div>
      ) : productsData?.products && productsData.products.length > 0 ? (
        <>
          <div className="mb-6">
            <p className="text-muted-foreground" data-testid="text-results-count">
              Showing {productsData.products.length} of {productsData.total} products
            </p>
          </div>
          
          <ProductGrid products={productsData.products} />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                data-testid="button-prev-page"
              >
                Previous
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  data-testid={`button-page-${page}`}
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                data-testid="button-next-page"
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4" data-testid="text-no-products">
            No products found matching your criteria.
          </p>
          <Button onClick={clearFilters} data-testid="button-clear-search">
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
