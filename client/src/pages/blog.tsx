import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/blog/blog-card";
import type { BlogPost } from "@shared/schema";

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  const { data: blogData, isLoading } = useQuery<{ posts: BlogPost[]; total: number }>({
    queryKey: ['/api/blog', { page: currentPage, limit: postsPerPage, search: searchQuery }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: postsPerPage.toString(),
      });
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      const response = await fetch(`/api/blog?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }
      return response.json();
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const totalPages = Math.ceil((blogData?.total || 0) / postsPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4" data-testid="text-blog-title">Our Blog</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Stay updated with the latest trends, tips, and insights
        </p>
        
        {/* Search */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-blog"
            />
          </div>
        </form>
      </div>

      {/* Blog Posts */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground" data-testid="text-loading-blog">Loading articles...</p>
        </div>
      ) : blogData?.posts && blogData.posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {blogData.posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                data-testid="button-blog-prev"
              >
                Previous
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  data-testid={`button-blog-page-${page}`}
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                data-testid="button-blog-next"
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground" data-testid="text-no-blog-posts">No blog posts available at the moment.</p>
        </div>
      )}
    </div>
  );
}
