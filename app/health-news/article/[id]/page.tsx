'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ArrowLeft, RefreshCw, Loader2, Sparkles, FileText } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { HealthArticle } from '@/lib/health-news/types';

export default function ArticleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;

  const [article, setArticle] = useState<HealthArticle | null>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [showRewritten, setShowRewritten] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArticle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  const loadArticle = () => {
    const stored = sessionStorage.getItem('health-articles');
    if (stored) {
      const articles: HealthArticle[] = JSON.parse(stored);
      const found = articles.find((a) => a.id === articleId);
      if (found) {
        setArticle(found);
        if (found.rewrittenContent) {
          setShowRewritten(true);
        }
      } else {
        router.push('/health-news/feed');
      }
    } else {
      router.push('/health-news');
    }
  };

  const handleRewrite = async () => {
    if (!article) return;

    setIsRewriting(true);
    setError(null);

    try {
      const response = await fetch('/api/health-news/rewrite', {
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
        const updatedArticle = { ...article, rewrittenContent: data.rewrittenContent };
        setArticle(updatedArticle);
        setShowRewritten(true);

        // Update in sessionStorage
        const stored = sessionStorage.getItem('health-articles');
        if (stored) {
          const articles: HealthArticle[] = JSON.parse(stored);
          const updatedArticles = articles.map((a) =>
            a.id === article.id ? updatedArticle : a
          );
          sessionStorage.setItem('health-articles', JSON.stringify(updatedArticles));
        }
      } else {
        throw new Error(data.error || 'Failed to rewrite article');
      }
    } catch (err) {
      console.error('Error rewriting article:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsRewriting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-8 py-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/health-news/feed" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Feed</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent hidden sm:inline">
                Health Informer
              </span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <article className="max-w-4xl mx-auto">
          {/* Hero Image */}
          <div className="relative h-64 sm:h-96 rounded-2xl overflow-hidden mb-8 opacity-0 animate-fade-up [animation-duration:500ms] [animation-delay:100ms] [animation-fill-mode:forwards]">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          {/* Article Header */}
          <div className="mb-8 opacity-0 animate-fade-up [animation-duration:500ms] [animation-delay:200ms] [animation-fill-mode:forwards]">
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
              <span className="font-medium">{article.source}</span>
              <span>•</span>
              <span>{formatDate(article.date)}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {article.title}
            </h1>

            {/* Summary Card */}
            {article.summary && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 mb-8">
                <div className="mb-4">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4" />
                    TL;DR
                  </span>
                  <p className="text-base text-foreground">{article.summary.tldr}</p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wide mb-2 block">
                    Key Takeaways
                  </span>
                  <ul className="space-y-2">
                    {article.summary.keyTakeaways.map((takeaway, i) => (
                      <li key={i} className="text-base text-foreground flex items-start gap-3">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                          {i + 1}.
                        </span>
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Toggle Buttons */}
          <div className="flex items-center gap-3 mb-6 opacity-0 animate-fade-up [animation-duration:500ms] [animation-delay:300ms] [animation-fill-mode:forwards]">
            <button
              onClick={() => setShowRewritten(false)}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-medium transition-all ${
                !showRewritten
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'bg-card border hover:bg-accent'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Original
            </button>

            <button
              onClick={() => {
                if (article.rewrittenContent) {
                  setShowRewritten(true);
                } else {
                  handleRewrite();
                }
              }}
              disabled={isRewriting}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-medium transition-all ${
                showRewritten
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'bg-card border hover:bg-accent'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isRewriting ? (
                <>
                  <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                  Rewriting...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  Simplified
                </>
              )}
            </button>

            {article.rewrittenContent && showRewritten && (
              <button
                onClick={handleRewrite}
                disabled={isRewriting}
                className="px-4 py-3 rounded-lg border bg-card hover:bg-accent transition-colors disabled:opacity-50"
                title="Regenerate simplified version"
              >
                <RefreshCw className={`w-4 h-4 ${isRewriting ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none opacity-0 animate-fade-up [animation-duration:500ms] [animation-delay:400ms] [animation-fill-mode:forwards]">
            {showRewritten && article.rewrittenContent ? (
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/10 dark:to-blue-900/10 border border-cyan-200 dark:border-cyan-800 rounded-xl p-8">
                <div className="flex items-center gap-2 mb-4 text-cyan-700 dark:text-cyan-400">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">AI-Simplified Version</span>
                </div>
                <div className="text-foreground whitespace-pre-line leading-relaxed">
                  {article.rewrittenContent}
                </div>
              </div>
            ) : (
              <div className="text-foreground whitespace-pre-line leading-relaxed">
                {article.content}
              </div>
            )}
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg opacity-0 animate-fade-up">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}
        </article>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-6 border-t mt-12">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          <p>Powered by AI • Making health news accessible to everyone</p>
        </div>
      </footer>
    </div>
  );
}
