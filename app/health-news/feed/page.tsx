'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, RefreshCw, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { HealthArticle } from '@/lib/health-news/types';

const ARTICLES_PER_PAGE = 6;

export default function FeedPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<HealthArticle[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadArticles = () => {
    const stored = sessionStorage.getItem('health-articles');
    if (stored) {
      setArticles(JSON.parse(stored));
    } else {
      router.push('/health-news');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    loadArticles();
    setIsRefreshing(false);
  };

  const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  const currentArticles = articles.slice(startIndex, endIndex);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-8 py-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Health Informer
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-card hover:bg-accent transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Today&apos;s Health News
            </h1>
            <p className="text-muted-foreground">
              {articles.length} articles summarized and simplified for you
            </p>
          </div>

          {/* Articles Grid */}
          {currentArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentArticles.map((article, index) => (
                <Link
                  key={article.id}
                  href={`/health-news/article/${article.id}`}
                  className="group block bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 opacity-0 animate-fade-up"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'forwards',
                  }}
                >
                  {/* Image */}
                  <div className="relative h-48 bg-muted overflow-hidden">
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="text-xs font-medium text-white/90 bg-black/40 px-2 py-1 rounded">
                        {article.source}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <span>{formatDate(article.date)}</span>
                    </div>

                    <h2 className="font-semibold text-lg mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {article.title}
                    </h2>

                    {article.summary && (
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                            TL;DR
                          </span>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {article.summary.tldr}
                          </p>
                        </div>

                        <div>
                          <span className="text-xs font-semibold text-teal-600 uppercase tracking-wide">
                            Key Takeaways
                          </span>
                          <ul className="mt-1 space-y-1">
                            {article.summary.keyTakeaways.slice(0, 2).map((takeaway, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-emerald-600 mt-0.5">•</span>
                                <span className="line-clamp-1">{takeaway}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-4 text-sm font-medium text-emerald-600 group-hover:gap-3 transition-all">
                      <span>Read full article</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles found</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-card hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg transition-colors ${
                      page === currentPage
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                        : 'bg-card border hover:bg-accent'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-card hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-6 border-t mt-auto">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>Powered by AI • Making health news accessible to everyone</p>
        </div>
      </footer>
    </div>
  );
}
