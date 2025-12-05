'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Heart, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { getAppConfig, isSearchAvailable } from '@/lib/app-config';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const config = getAppConfig();
    setSearchEnabled(isSearchAvailable(config));
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
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
                <li>Get an API key from <a href="https://tavily.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Tavily</a> or <a href="https://firecrawl.dev" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Firecrawl</a></li>
                <li>Add it to your <code className="bg-background px-2 py-1 rounded">.env.local</code> file</li>
                <li>Set <code className="bg-background px-2 py-1 rounded">USE_SYNTHETIC_DATA="false"</code></li>
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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Ask any health question..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 h-14 text-lg"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) {
                  // TODO: Trigger search
                  console.log('Searching for:', query);
                }
              }}
            />
          </div>

          <div className="text-center text-muted-foreground py-12">
            <p>Search functionality coming soon...</p>
            <p className="text-sm mt-2">This will integrate LangGraph-based research with live web search.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
