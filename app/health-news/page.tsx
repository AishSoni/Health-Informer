'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Newspaper, Heart } from 'lucide-react';
import { HealthNewsProvider } from '@/context/HealthNewsContext';
import { ThemeToggle } from '@/components/theme-toggle';

function ArticleLoadingContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/health-news/articles');
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to load articles');
        }

        // Store articles in sessionStorage for access across pages
        sessionStorage.setItem('health-articles', JSON.stringify(data.articles));

        // Simulate loading delay for better UX
        setTimeout(() => {
          router.push('/health-news/summarize');
        }, 1500);
      } catch (err) {
        console.error('Error loading articles:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load articles';
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    loadArticles();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-8 py-4 border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Health Informer
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          {isLoading ? (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 mb-8 opacity-0 animate-fade-up [animation-duration:500ms] [animation-delay:100ms] [animation-fill-mode:forwards]">
                <Newspaper className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 opacity-0 animate-fade-up [animation-duration:500ms] [animation-delay:200ms] [animation-fill-mode:forwards]">
                Loading Health News
              </h1>

              <p className="text-lg text-muted-foreground mb-8 opacity-0 animate-fade-up [animation-duration:500ms] [animation-delay:300ms] [animation-fill-mode:forwards]">
                Fetching the latest health articles for you...
              </p>

              <div className="flex justify-center opacity-0 animate-fade-up [animation-duration:500ms] [animation-delay:400ms] [animation-fill-mode:forwards]">
                <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
              </div>

              {/* Skeleton Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 opacity-0 animate-fade-up [animation-duration:500ms] [animation-delay:500ms] [animation-fill-mode:forwards]">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 rounded-lg border bg-card">
                    <div className="w-full h-32 bg-muted rounded-md mb-3 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-3/4 mb-2 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                  </div>
                ))}
              </div>
            </>
          ) : error ? (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-8">
                <Newspaper className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Error Loading Articles
              </h1>

              <p className="text-lg text-muted-foreground mb-8">{error}</p>

              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                Try Again
              </button>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default function HealthNewsPage() {
  return (
    <HealthNewsProvider>
      <ArticleLoadingContent />
    </HealthNewsProvider>
  );
}
