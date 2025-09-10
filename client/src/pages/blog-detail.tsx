import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import type { BlogPost } from "@shared/schema";
import NotFound from "./not-found";

export default function BlogDetail() {
  const { id } = useParams();

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ['/api/blog', id],
    queryFn: async () => {
      const response = await fetch(`/api/blog/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Blog post not found');
        }
        throw new Error('Failed to fetch blog post');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground" data-testid="text-loading-blog">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return <NotFound />;
  }

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" asChild data-testid="button-back-to-blog">
          <Link href="/blog">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
        </Button>
      </div>

      <article className="max-w-4xl mx-auto">
        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" data-testid="badge-blog-category">
              {post.category}
            </Badge>
            <div className="flex items-center text-sm text-muted-foreground gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span data-testid="text-blog-date">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span data-testid="text-blog-read-time">{post.readTime} min read</span>
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-blog-title">
            {post.title}
          </h1>

          <p className="text-xl text-muted-foreground mb-6" data-testid="text-blog-excerpt">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Published on {formattedDate}
            </div>
            <Button variant="outline" size="sm" onClick={handleShare} data-testid="button-share">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Featured Image */}
        {post.image && (
          <div className="mb-8">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-auto rounded-lg"
              data-testid="img-blog-featured"
            />
          </div>
        )}

        <Separator className="mb-8" />

        {/* Article Content */}
        <div className="prose prose-lg max-w-none" data-testid="content-blog-article">
          {/* For demo purposes, we'll display the content as simple paragraphs */}
          {post.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-4 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Article Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Thanks for reading! Share this article if you found it helpful.
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare} data-testid="button-share-footer">
              <Share2 className="h-4 w-4 mr-2" />
              Share Article
            </Button>
            <Button variant="outline" size="sm" asChild data-testid="button-more-articles">
              <Link href="/blog">More Articles</Link>
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
}
