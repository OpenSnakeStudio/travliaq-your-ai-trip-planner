import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Eye, ArrowRight, Search } from "lucide-react";
import Navigation from "@/components/Navigation";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string | null;
  published_at: string;
  view_count: number;
};

const Blog = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(posts);
    }
  }, [searchQuery, posts]);

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, cover_image, published_at, view_count")
      .eq("published", true)
      .order("published_at", { ascending: false });

    if (!error && data) {
      setPosts(data);
      setFilteredPosts(data);
    }
    setIsLoading(false);
  };

  const handlePostClick = (slug: string) => {
    navigate(`/blog/${slug}`);
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-subtle">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-travliaq-turquoise via-travliaq-deep-blue to-travliaq-deep-blue text-white py-24 md:py-32 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Animated gradient orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-travliaq-turquoise/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            
            {/* Decorative lines */}
            <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="absolute bottom-1/4 right-0 w-full h-px bg-gradient-to-r from-transparent via-travliaq-turquoise/30 to-transparent" />
            
            {/* Floating icons */}
            <div className="absolute top-20 right-1/4 text-6xl opacity-10 animate-[float_6s_ease-in-out_infinite]">
              ✈️
            </div>
            <div className="absolute bottom-32 left-1/4 text-5xl opacity-10 animate-[float_8s_ease-in-out_infinite]" style={{ animationDelay: '2s' }}>
              🗺️
            </div>
            <div className="absolute top-1/3 right-1/3 text-4xl opacity-10 animate-[float_7s_ease-in-out_infinite]" style={{ animationDelay: '1s' }}>
              📸
            </div>
          </div>

          <div className="container max-w-6xl mx-auto px-4 relative z-10">
            <div className="text-center space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 animate-fade-in">
                <span className="w-2 h-2 bg-travliaq-turquoise rounded-full animate-pulse" />
                <span className="text-sm font-medium tracking-wide">Blog de voyage</span>
              </div>

              {/* Main title */}
              <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <span className="bg-gradient-to-r from-white via-white to-travliaq-turquoise bg-clip-text text-transparent">
                  Carnets de Voyage
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Inspirations, conseils d'experts et récits authentiques pour préparer votre prochaine aventure
              </p>

              {/* Decorative divider */}
              <div className="flex items-center justify-center gap-3 pt-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="w-12 h-px bg-gradient-to-r from-transparent to-travliaq-turquoise" />
                <div className="w-2 h-2 rounded-full bg-travliaq-turquoise" />
                <div className="w-24 h-px bg-travliaq-turquoise" />
                <div className="w-2 h-2 rounded-full bg-travliaq-turquoise" />
                <div className="w-12 h-px bg-gradient-to-l from-transparent to-travliaq-turquoise" />
              </div>
            </div>
          </div>

          {/* Bottom wave decoration */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg className="w-full h-16 md:h-24 text-background" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor"/>
            </svg>
          </div>
        </section>

        {/* Search Section */}
        <section className="container max-w-6xl mx-auto px-4 -mt-8 relative z-20">
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-travliaq-turquoise to-travliaq-deep-blue rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative bg-background rounded-2xl shadow-2xl border border-border overflow-hidden">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 transition-colors group-hover:text-travliaq-turquoise" />
                <Input
                  placeholder="Rechercher un article..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-14 pr-6 h-16 text-lg border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>
          </div>
        </section>

      {/* Posts Grid */}
      <section className="container max-w-6xl mx-auto px-4 pb-20">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="aspect-video bg-muted" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">
              {searchQuery
                ? "Aucun article trouvé pour votre recherche"
                : "Aucun article publié pour le moment"}
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <Card
                key={post.id}
                className="overflow-hidden hover:shadow-golden transition-all cursor-pointer group"
                onClick={() => handlePostClick(post.slug)}
                style={{ animationDelay: `${index * 100}ms` }}
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
                    <span className="text-6xl">📝</span>
                  </div>
                )}

                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-bold text-travliaq-deep-blue group-hover:text-travliaq-turquoise transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  {post.excerpt && (
                    <p className="text-muted-foreground line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(post.published_at).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{post.view_count}</span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full group-hover:bg-travliaq-turquoise group-hover:text-white transition-all"
                  >
                    Lire l'article
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
    </>
  );
};

export default Blog;
