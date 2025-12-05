'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, Heart, ArrowLeft, AlertCircle, ExternalLink, Loader2, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { getAppConfig, isSearchAvailable } from '@/lib/app-config';

interface Source {
  url: string;
  title: string;
  content?: string;
  summary?: string;
}

interface SearchState {
  phase: string;
  message: string;
  sources: Source[];
  answer: string;
  searching: boolean;
  error: string | null;
  startTime: number | null;
  elapsedTime: number;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchState, setSearchState] = useState<SearchState>({
    phase: 'idle',
    message: '',
    sources: [],
    answer: '',
    searching: false,
    error: null,
    startTime: null,
    elapsedTime: 0
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const config = getAppConfig();
    setSearchEnabled(isSearchAvailable(config));
    setLoading(false);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (searchState.searching && searchState.startTime) {
      interval = setInterval(() => {
        setSearchState(prev => ({
          ...prev,
          elapsedTime: Date.now() - (prev.startTime || Date.now())
        }));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [searchState.searching, searchState.startTime]);

  const handleSearch = async () => {
    if (!query.trim() || searchState.searching) return;

    // Reset state
    setSearchState({
      phase: 'understanding',
      message: 'Starting search...',
      sources: [],
      answer: '',
      searching: true,
      error: null,
      startTime: Date.now(),
      elapsedTime: 0
    });

    // Create abort controller
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/health-news/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response stream');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6));
              
              if (event.type === 'phase-update') {
                setSearchState(prev => ({
                  ...prev,
                  phase: event.phase,
                  message: event.message
                }));
              } else if (event.type === 'found') {
                setSearchState(prev => ({
                  ...prev,
                  sources: event.sources || []
                }));
              } else if (event.type === 'content-chunk') {
                setSearchState(prev => ({
                  ...prev,
                  answer: prev.answer + event.chunk
                }));
              } else if (event.type === 'final-result') {
                setSearchState(prev => ({
                  ...prev,
                  phase: 'complete',
                  message: 'Search complete',
                  answer: event.content,
                  sources: event.sources || prev.sources
                }));
              } else if (event.type === 'done') {
                setSearchState(prev => ({
                  ...prev,
                  searching: false
                }));
                break;
              } else if (event.type === 'error') {
                setSearchState(prev => ({
                  ...prev,
                  error: event.message,
                  searching: false
                }));
              }
            } catch (e) {
              console.error('Error parsing event:', e);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setSearchState(prev => ({
          ...prev,
          error: error.message || 'Search failed',
          searching: false
        }));
      }
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 100);
    return `${seconds}.${milliseconds}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!searchEnabled) {
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
                <span className="font-semibold text-lg">Search Health News</span>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
            </div>
            
            <h1 className="text-3xl font-bold">Search Unavailable</h1>
            
            <p className="text-muted-foreground text-lg">
              Search mode requires a search API key (Tavily or Firecrawl).
            </p>
            
            <div className="p-6 bg-muted rounded-lg text-left space-y-4">
              <h2 className="font-semibold">To enable search:</h2>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Get an API key from <a href="https://tavily.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Tavily</a></li>
                <li>Add it to your <code className="bg-background px-2 py-1 rounded">.env.local</code> file</li>
                <li>Set <code className="bg-background px-2 py-1 rounded">NEXT_PUBLIC_SEARCH_AVAILABLE="true"</code></li>
                <li>Restart the development server</li>
              </ol>
            </div>

            <div className="pt-4">
              <Link href="/health-news/highlights">
                <Button size="lg">
                  Try Highlights Mode Instead
                </Button>
              </Link>
            </div>
          </div>
        </main>
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
              <span className="font-semibold text-lg">Search Health News</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Search Input */}
        <Card className="p-6 mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Ask any health question..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-12 h-12 text-base"
                disabled={searchState.searching}
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={!query.trim() || searchState.searching}
              size="lg"
              className="px-8"
            >
              {searchState.searching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching
                </>
              ) : (
                'Search'
              )}
            </Button>
          </div>
        </Card>

        {/* Search Progress */}
        {searchState.searching && (
          <Card className="p-6 mb-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                <div>
                  <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                    {searchState.message}
                  </p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Phase: {searchState.phase}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTime(searchState.elapsedTime)}</span>
              </div>
            </div>
            
            {searchState.sources.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-2">
                  Sources found: {searchState.sources.length}
                </p>
                <div className="flex flex-wrap gap-2">
                  {searchState.sources.slice(0, 6).map((source, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      <FileText className="w-3 h-3 mr-1" />
                      {new URL(source.url).hostname}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Error */}
        {searchState.error && (
          <Card className="p-6 mb-8 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-100">Search Error</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{searchState.error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Answer */}
        {searchState.answer && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Answer</h2>
              <div className="prose prose-emerald dark:prose-invert max-w-none">
                <MarkdownRenderer content={searchState.answer} />
              </div>
            </Card>

            {/* Sources */}
            {searchState.sources.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Sources ({searchState.sources.length})</h3>
                <div className="space-y-3">
                  {searchState.sources.map((source, idx) => (
                    <a
                      key={idx}
                      id={`source-${idx + 1}`}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 rounded-lg border hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors group scroll-mt-20"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs font-semibold">Source {idx + 1}</Badge>
                            <p className="font-semibold text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                              {source.title}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{source.url}</p>
                          {source.summary && (
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {source.summary}
                            </p>
                          )}
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex-shrink-0" />
                      </div>
                    </a>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Example queries */}
        {!searchState.searching && !searchState.answer && (
          <div className="text-center py-12 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Try asking about:</h3>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {[
                  'Latest diabetes treatment options',
                  'Benefits of Mediterranean diet',
                  'How to improve sleep quality',
                  'Mental health and exercise',
                  'Vitamin D deficiency symptoms'
                ].map((example, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery(example)}
                    className="text-sm"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
