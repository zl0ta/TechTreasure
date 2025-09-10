import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BlogPost } from "@shared/schema";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <Link href={`/blog/${post.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" data-testid={`card-blog-${post.id}`}>
        {post.image && (
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-48 object-cover"
            loading="lazy"
            data-testid={`img-blog-${post.id}`}
          />
        )}
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-3">
            <Badge variant="secondary" data-testid={`badge-blog-category-${post.id}`}>
              {post.category}
            </Badge>
            <span className="text-xs text-muted-foreground" data-testid={`text-blog-date-${post.id}`}>
              {formattedDate}
            </span>
          </div>
          <h3 className="text-xl font-semibold mb-3" data-testid={`text-blog-title-${post.id}`}>
            {post.title}
          </h3>
          <p className="text-muted-foreground mb-4" data-testid={`text-blog-excerpt-${post.id}`}>
            {post.excerpt}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground" data-testid={`text-blog-read-time-${post.id}`}>
              {post.readTime} min read
            </span>
            <span className="text-primary hover:text-primary/80 font-medium" data-testid={`link-read-more-${post.id}`}>
              Read More →
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
