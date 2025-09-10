import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, Filter, ChevronDown, Grid, List, Heart, ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductGrid } from "@/components/product/product-grid";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
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
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@shared/schema";

export default function Products() {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const { addToCart } = useCart();

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
      limit: itemsPerPage,
      sort: sortBy,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      brands: selectedBrands
    }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      
      if (sortBy !== 'name') params.append('sort', sortBy);
      if (priceRange[0] > 0) params.append('minPrice', priceRange[0].toString());
      if (priceRange[1] < 5000) params.append('maxPrice', priceRange[1].toString());
      
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      if (selectedBrands.length > 0) params.append('brands', selectedBrands.join(','));
      
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

  const totalPages = Math.ceil((productsData?.total || 0) / itemsPerPage);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const brands = ['Apple', 'Samsung', 'Sony', 'Dell', 'HP', 'Lenovo', 'Microsoft'];

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setPriceRange([0, 5000]);
    setSelectedBrands([]);
    navigate('/products');
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <div className="w-64 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Filters</h2>
            
            {/* Search */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <form onSubmit={handleSearch}>
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
              </div>
              
              <Separator />
              
              {/* Categories */}
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={selectedCategory || 'all'} onValueChange={handleCategoryChange}>
                  <SelectTrigger data-testid="select-category">
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
              </div>
              
              <Separator />
              
              {/* Price Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">Price Range</label>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={5000}
                    min={0}
                    step={50}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Brands */}
              <div>
                <label className="text-sm font-medium mb-2 block">Brands</label>
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <div key={brand} className="flex items-center space-x-2">
                      <Checkbox
                        id={brand}
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={() => toggleBrand(brand)}
                      />
                      <label htmlFor={brand} className="text-sm">{brand}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Reset Filters */}
              <Button 
                variant="outline" 
                onClick={resetFilters} 
                className="w-full"
                data-testid="button-reset-filters"
              >
                Reset All Filters
              </Button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-4" data-testid="text-products-title">Products</h1>
            
            {/* Top Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                {/* Sort */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" data-testid="button-sort">
                      Sort: {sortBy === 'name' ? 'A-Z' : sortBy === 'price-low' ? 'Price Low' : 'Price High'}
                      <ChevronDown className="ml-2 h-4 w-4" />
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
                
                {/* Items per page */}
                <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 per page</SelectItem>
                    <SelectItem value="24">24 per page</SelectItem>
                    <SelectItem value="48">48 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  data-testid="button-grid-view"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  data-testid="button-list-view"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Active Filters */}
            {(selectedCategory || searchQuery || priceRange[0] > 0 || priceRange[1] < 5000 || selectedBrands.length > 0) && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
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
                {(priceRange[0] > 0 || priceRange[1] < 5000) && (
                  <Badge variant="secondary">
                    Price: ${priceRange[0]} - ${priceRange[1]}
                  </Badge>
                )}
                {selectedBrands.map(brand => (
                  <Badge key={brand} variant="secondary">
                    {brand}
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {/* Products Display */}
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
              
              {/* Products Grid/List */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {productsData.products.map((product) => (
                    <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="relative mb-4">
                          {product.images?.[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-48 object-cover rounded-md"
                              loading="lazy"
                            />
                          )}
                          <Button
                            size="sm"
                            variant={wishlist.includes(product.id) ? "default" : "secondary"}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => toggleWishlist(product.id)}
                          >
                            <Heart className={`h-4 w-4 ${wishlist.includes(product.id) ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold text-primary">
                            ${product.price.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => addToCart({ productId: product.id, quantity: 1 })}
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Add to Cart
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/products/${product.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 mb-8">
                  {productsData.products.map((product) => (
                    <Card key={product.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex gap-6">
                          <div className="w-32 h-32 flex-shrink-0">
                            {product.images?.[0] && (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover rounded-md"
                                loading="lazy"
                              />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-xl">{product.name}</h3>
                              <Button
                                size="sm"
                                variant={wishlist.includes(product.id) ? "default" : "secondary"}
                                onClick={() => toggleWishlist(product.id)}
                              >
                                <Heart className={`h-4 w-4 ${wishlist.includes(product.id) ? 'fill-current' : ''}`} />
                              </Button>
                            </div>
                            
                            <p className="text-muted-foreground mb-4">
                              {product.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-primary">
                                ${product.price.toFixed(2)}
                              </span>
                              
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => addToCart({ productId: product.id, quantity: 1 })}
                                >
                                  <ShoppingCart className="h-4 w-4 mr-2" />
                                  Add to Cart
                                </Button>
                                <Button variant="outline" asChild>
                                  <Link href={`/products/${product.id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
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
                  
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                        data-testid={`button-page-${page}`}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
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
              <Button onClick={resetFilters} data-testid="button-clear-search">
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
