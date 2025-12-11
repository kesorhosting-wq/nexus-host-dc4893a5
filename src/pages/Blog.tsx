import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useGameStore } from "@/store/gameStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar, ArrowRight } from "lucide-react";

const Blog = () => {
  const { brand } = useGameStore();
  const { t } = useLanguage();

  const posts = [
    {
      title: "Getting Started with Minecraft Server Hosting",
      excerpt: "Learn how to set up and optimize your Minecraft server for the best gaming experience.",
      date: "2024-01-15",
      category: "Tutorial",
    },
    {
      title: "FiveM Server Optimization Guide",
      excerpt: "Tips and tricks to make your FiveM server run smoothly with high player counts.",
      date: "2024-01-10",
      category: "Guide",
    },
    {
      title: "New Data Center in Singapore",
      excerpt: "Announcing our new Asia-Pacific data center for lower latency gaming.",
      date: "2024-01-05",
      category: "News",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              {brand.name} <span className="text-gradient">{t('blog.title')}</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('blog.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {posts.map((post, i) => (
              <article key={i} className="glass rounded-xl border border-border/50 overflow-hidden group hover:border-primary/50 transition-colors">
                <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20" />
                <div className="p-6">
                  <span className="text-xs text-primary font-medium">{post.category}</span>
                  <h2 className="font-display text-xl font-semibold mt-2 mb-3 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground text-sm mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {post.date}
                    </div>
                    <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
