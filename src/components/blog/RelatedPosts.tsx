import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Eye } from "lucide-react";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string | null;
  published_at: string;
  view_count: number;
};

type RelatedPostsProps = {
  currentPostId: string;
  limit?: number;
};

export const RelatedPosts = ({ currentPostId, limit = 3 }: RelatedPostsProps) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, cover_image, published_at, view_count")
        .eq("published", true)
        .neq("id", currentPostId)
        .order("published_at", { ascending: false })
        .limit(limit);

      if (!error && data) {
        setPosts(data);
      }
      setIsLoading(false);
    };

    fetchRelatedPosts();
  }, [currentPostId, limit]);

  if (isLoading || posts.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="text-3xl font-bold text-travliaq-deep-blue mb-8">
        Articles recommandés
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card
            key={post.id}
            className="overflow-hidden hover:shadow-golden transition-all cursor-pointer group"
            onClick={() => navigate(`/blog/${post.slug}`)}
          >
            {post.cover_image ? (
              <div className="aspect-video overflow-hidden bg-muted">
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ) : (
              <div className="aspect-video bg-gradient-accent flex items-center justify-center">
                <span className="text-4xl">📝</span>
              </div>
            )}

            <div className="p-4 space-y-3">
              <h3 className="font-bold text-travliaq-deep-blue group-hover:text-travliaq-turquoise transition-colors line-clamp-2">
                {post.title}
              </h3>

              {post.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(post.published_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{post.view_count}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};
