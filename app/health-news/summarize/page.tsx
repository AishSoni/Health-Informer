'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, Heart, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { HealthArticle } from '@/lib/health-news/types';

export default function SummarizePage() {
  const router = useRouter();
  const [articles, setArticles] = useState<HealthArticle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [summarizedArticles, setSummarizedArticles] = useState<HealthArticle[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Load articles from sessionStorage
    const stored = sessionStorage.getItem('health-articles');
    if (stored) {
      const loadedArticles = JSON.parse(stored);
      setArticles(loadedArticles);
      startSummarization(loadedArticles);
    } else {
      router.push('/health-news');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startSummarization = async (articlesToSummarize: HealthArticle[]) => {
    const results: HealthArticle[] = [];

    for (let i = 0; i < articlesToSummarize.length; i++) {
      setCurrentIndex(i);
      const article = articlesToSummarize[i];

      try {
        const response = await fetch('/api/health-news/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            articleId: article.id,
            title: article.title,
            content: article.content,
          }),
        });

        const data = await response.json();

        if (data.success) {
          const summarizedArticle = { ...article, summary: data.summary };
          results.push(summarizedArticle);
          setSummarizedArticles([...results]);
        } else {
          throw new Error(data.error || 'Summarization failed');
        }
      } catch (err) {
        console.error(`Error summarizing article ${article.id}:`, err);
        // Continue with other articles even if one fails
        results.push(article);
        setSummarizedArticles([...results]);
      }

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    // Save summarized articles
    sessionStorage.setItem('health-articles', JSON.stringify(results));
    setIsProcessing(false);

    // Navigate to feed after brief delay
    setTimeout(() => {
      router.push('/health-news/feed');
    }, 1500);
  };

  const progress = articles.length > 0 ? ((currentIndex + 1) / articles.length) * 100 : 0;
  const isComplete = !isProcessing && summarizedArticles.length === articles.length;

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
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 mb-6">
              {isComplete ? (
                <CheckCircle2 className="w-8 h-8 text-white" />
              ) : (
                <Sparkles className="w-8 h-8 text-white animate-pulse" />
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              {isComplete ? 'Summaries Complete!' : 'Creating AI Summaries'}
            </h1>

            <p className="text-lg text-muted-foreground">
              {isComplete
                ? 'All articles have been summarized'
                : `Processing article ${currentIndex + 1} of ${articles.length}`}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center mt-2">
              {Math.round(progress)}% Complete
            </p>
          </div>

          {/* Current Article Being Processed */}
          {articles[currentIndex] && !isComplete && (
            <div className="bg-card border rounded-xl p-6 mb-6 animate-fade-up">
              <div className="flex items-start gap-4">
                <Loader2 className="w-6 h-6 text-emerald-600 animate-spin flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    {articles[currentIndex].title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Generating TL;DR and key takeaways...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Summarized Articles Preview */}
          <div className="space-y-4">
            {summarizedArticles.slice(-3).map((article, idx) => (
              <div
                key={article.id}
                className="bg-card border rounded-xl p-6 opacity-0 animate-fade-up"
                style={{
                  animationDelay: `${idx * 100}ms`,
                  animationFillMode: 'forwards',
                }}
              >
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-3">{article.title}</h3>
                    {article.summary && (
                      <>
                        <div className="mb-3">
                          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                            TL;DR
                          </span>
                          <p className="text-sm text-muted-foreground mt-1">
                            {article.summary.tldr}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-teal-600 uppercase tracking-wide">
                            Key Takeaways
                          </span>
                          <ul className="mt-1 space-y-1">
                            {article.summary.keyTakeaways.map((takeaway, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-emerald-600 mt-1">•</span>
                                <span>{takeaway}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
