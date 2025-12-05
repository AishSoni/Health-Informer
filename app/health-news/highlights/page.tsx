'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Sparkles, RefreshCw, Clock, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [useSynthetic, setUseSynthetic] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [showResults, setShowResults] = useState(false);

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

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (summarizing) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [summarizing, startTime]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const preferences = getUserPreferences();
      const config = getAppConfig();
      
      console.log('[Highlights] Config:', {
        useSyntheticData: config.useSyntheticData,
        searchAvailable: config.searchAvailable,
        willUseWebSearch: !config.useSyntheticData && config.searchAvailable
      });
      
      let selectedArticles: HealthArticle[];
      
      // Use web search when synthetic data is off and search is available
      if (!config.useSyntheticData && config.searchAvailable) {
        // Build search query from user preferences
        const interestsQuery = preferences.interests.length > 0
          ? preferences.interests.join(' ')
          : 'general health';
        
        const query = `latest health news about ${interestsQuery}`;
        
        // Search for articles using the articles search endpoint
        const searchResponse = await fetch('/api/health-news/articles/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query,
            limit: 6
          })
        });
        
        if (!searchResponse.ok) {
          throw new Error('Search failed, falling back to mock articles');
        }
        
        const searchData = await searchResponse.json();
        
        // Convert search results to HealthArticle format
        selectedArticles = searchData.sources.map((source: any, idx: number) => ({
          id: idx + 1000, // Use high IDs to avoid conflicts
          title: source.title,
          content: source.content || source.summary || '',
          source: source.url,
          category: preferences.interests[0] || 'general',
          publishedAt: new Date().toISOString(),
          imageUrl: undefined
        }));
      } else {
        // Use mock articles in synthetic mode
        const response = await fetch('/api/health-news/articles');
        const data = await response.json();
        
        // Filter articles based on user preferences
        let filtered = data.articles as HealthArticle[];
        if (preferences.interests.length > 0) {
          // Simple keyword matching
          filtered = filtered.filter((article: HealthArticle) => {
            const content = `${article.title} ${article.content}`.toLowerCase();
            return preferences.interests.some(interest => 
              content.includes(interest.replace('-', ' '))
            );
          });
        }
        
        // Take top 6 articles
        selectedArticles = filtered.slice(0, 6);
      }
      
      setArticles(selectedArticles);
      setLoading(false);
      setShowResults(false);
      
      // Start summarizing immediately
      if (selectedArticles.length > 0) {
        summarizeArticles(selectedArticles);
      }
    } catch (error) {
      console.error('Failed to load articles:', error);
      
      // Fallback to mock articles on error
      try {
        const response = await fetch('/api/health-news/articles');
        const data = await response.json();
        const selectedArticles = (data.articles as HealthArticle[]).slice(0, 6);
        setArticles(selectedArticles);
        if (selectedArticles.length > 0) {
          summarizeArticles(selectedArticles);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
      
      setLoading(false);
    }
  };

  const summarizeArticles = async (articlesToSummarize: HealthArticle[]) => {
    setSummarizing(true);
    setStartTime(Date.now());
    setCurrentIndex(0);
    const newSummaries = new Map(summaries);
    
    for (let i = 0; i < articlesToSummarize.length; i++) {
      const article = articlesToSummarize[i];
      setCurrentIndex(i);
      
      try {
        const response = await fetch('/api/health-news/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            articleId: article.id,
            title: article.title,
            content: article.content 
          }),
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
    setShowResults(true);
  };

  const handleRefresh = () => {
    setSummaries(new Map());
    setShowResults(false);
    loadArticles();
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 100);
    return `${seconds}.${milliseconds}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your health highlights...</p>
        </div>
      </div>
    );
  }

  // Show research-style generation UI
  if (!showResults) {
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
            <ThemeToggle />
          </div>
        </header>

        {useSynthetic && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
            <div className="container mx-auto px-4 py-3 text-center text-sm text-yellow-800 dark:text-yellow-200">
              <Sparkles className="inline w-4 h-4 mr-2" />
              Demo Mode: Using mock articles with AI summaries
            </div>
          </div>
        )}

        <main className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Status Card */}
          <Card className="p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Generating Your Highlights</h2>
                  <p className="text-muted-foreground">AI-powered health news curation in progress</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Clock className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Time Elapsed</p>
                  <p className="text-lg font-semibold font-mono">{formatTime(elapsedTime)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <FileText className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Articles Processed</p>
                  <p className="text-lg font-semibold">{summaries.size} / {articles.length}</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((summaries.size / articles.length) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500"
                  style={{ width: `${(summaries.size / articles.length) * 100}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Articles List with Live Updates */}
          <div className="space-y-4">
            {articles.map((article, idx) => {
              const summary = summaries.get(article.id);
              const isProcessing = idx === currentIndex && !summary;
              const isComplete = !!summary;
              const isPending = idx > currentIndex;

              return (
                <Card 
                  key={article.id}
                  className={`p-6 transition-all duration-300 ${
                    isProcessing ? 'ring-2 ring-emerald-500 shadow-lg' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      {isComplete ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      ) : isProcessing ? (
                        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{article.title}</h3>
                          <p className="text-sm text-muted-foreground">{article.source}</p>
                        </div>
                        {article.imageUrl && (
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden ml-4">
                            <Image
                              src={article.imageUrl}
                              alt={article.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>

                      {isProcessing && (
                        <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                          <p className="text-sm text-emerald-700 dark:text-emerald-300 animate-pulse">
                            Analyzing article and generating summary...
                          </p>
                        </div>
                      )}

                      {isComplete && summary && (
                        <div className="mt-4 space-y-3 animate-fade-in">
                          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
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
                      )}

                      {isPending && (
                        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                          <p className="text-sm text-muted-foreground">Waiting to process...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // Final results view
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
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
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
            Demo Mode: Using mock articles with AI summaries
          </div>
        </div>
      )}

      {/* Success Banner */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800">
        <div className="container mx-auto px-4 py-3 text-center text-sm text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="inline w-4 h-4 mr-2" />
          Successfully generated {summaries.size} health news summaries in {formatTime(elapsedTime)}
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No articles match your interests. Try updating your preferences.
            </p>
            <Link href="/settings">
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
                    
                    {summary && (
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
