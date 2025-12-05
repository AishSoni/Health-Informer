'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Sparkles, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/theme-toggle';
import { getUserPreferences, hasCompletedOnboarding } from '@/lib/user-preferences';
import { getAppConfig } from '@/lib/app-config';
import type { HealthArticle, ArticleSummary } from '@/lib/health-news/types';

export default function HighlightsPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<HealthArticle[]>([]);
  const [summaries, setSummaries] = useState<Map<number, ArticleSummary>>(new Map());
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [useSynthetic, setUseSynthetic] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    if (!hasCompletedOnboarding()) {
      router.push('/');
      return;
    }

    const config = getAppConfig();
    setUseSynthetic(config.useSyntheticData);
    
    loadArticles();
  }, [router]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const preferences = getUserPreferences();
      
      // In synthetic mode or always, use mock articles
      const response = await fetch('/api/health-news/articles');
      const data = await response.json();
      
      // Filter articles based on user preferences
      let filtered = data.articles as HealthArticle[];
      if (preferences.interests.length > 0) {
        // Simple keyword matching - in production, use better semantic matching
        filtered = filtered.filter((article: HealthArticle) => {
          const content = `${article.title} ${article.content}`.toLowerCase();
          return preferences.interests.some(interest => 
            content.includes(interest.replace('-', ' '))
          );
        });
      }
      
      // Take top 6 articles
      setArticles(filtered.slice(0, 6));
      setLoading(false);
      
      // Start summarizing
      if (filtered.length > 0) {
        summarizeArticles(filtered.slice(0, 6));
      }
    } catch (error) {
      console.error('Failed to load articles:', error);
      setLoading(false);
    }
  };

  const summarizeArticles = async (articlesToSummarize: HealthArticle[]) => {
    setSummarizing(true);
    const newSummaries = new Map(summaries);
    
    for (let i = 0; i < articlesToSummarize.length; i++) {
      const article = articlesToSummarize[i];
      setCurrentIndex(i);
      
      try {
        const response = await fetch('/api/health-news/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ article }),
        });
        
        if (response.ok) {
          const data = await response.json();
          newSummaries.set(article.id, data.summary);
          setSummaries(new Map(newSummaries));
        }
      } catch (error) {
        console.error(`Failed to summarize article ${article.id}:`, error);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setSummarizing(false);
  };

  const handleRefresh = () => {
    setSummaries(new Map());
    loadArticles();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg">Today&apos;s Highlights</span>
            </div>
            <ThemeToggle />
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg">Today&apos;s Highlights</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={summarizing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${summarizing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {useSynthetic && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
          <div className="container mx-auto px-4 py-3 text-center text-sm text-yellow-800 dark:text-yellow-200">
            <Sparkles className="inline w-4 h-4 mr-2" />
            Demo Mode: Using mock articles. Add search API keys to access live health news.
          </div>
        </div>
      )}

      {summarizing && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800">
          <div className="container mx-auto px-4 py-3 text-center text-sm text-emerald-800 dark:text-emerald-200">
            Generating AI summaries... {currentIndex + 1} of {articles.length}
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No articles match your interests. Try updating your preferences.
            </p>
            <Link href="/">
              <Button>Update Preferences</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => {
              const summary = summaries.get(article.id);
              
              return (
                <Card 
                  key={article.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/health-news/article/${article.id}`)}
                >
                  {article.imageUrl && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={article.imageUrl}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>{article.source}</span>
                      <span>{new Date(article.date).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-semibold text-lg mb-3 line-clamp-2">{article.title}</h3>
                    
                    {summary ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                          <p className="text-sm text-emerald-900 dark:text-emerald-100 font-medium">
                            {summary.tldr}
                          </p>
                        </div>
                        <ul className="space-y-2">
                          {summary.keyTakeaways.map((takeaway, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <span className="text-teal-600 dark:text-teal-400 mt-0.5">•</span>
                              <span className="text-muted-foreground">{takeaway}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
