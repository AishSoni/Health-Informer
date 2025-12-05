'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Sparkles, Heart, Settings } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { OnboardingModal } from '@/components/onboarding-modal';
import { hasCompletedOnboarding, getUserPreferences } from '@/lib/user-preferences';
import { getAppConfig, isSearchAvailable } from '@/lib/app-config';

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [preferences, setPreferences] = useState(getUserPreferences());
  const [searchAvailable, setSearchAvailable] = useState(false);

  useEffect(() => {
    const hasOnboarded = hasCompletedOnboarding();
    setShowOnboarding(!hasOnboarded);
    setPreferences(getUserPreferences());
    
    const config = getAppConfig();
    const searchAvail = isSearchAvailable(config);
    
    console.log('[Home Page Debug] searchAvailable:', searchAvail);
    console.log('[Home Page Debug] config.useSyntheticData:', config.useSyntheticData);
    console.log('[Home Page Debug] config.hasSearchApiKey:', !!config.searchApiKey);
    console.log('[Home Page Debug] NEXT_PUBLIC_SEARCH_AVAILABLE:', process.env.NEXT_PUBLIC_SEARCH_AVAILABLE);
    
    setSearchAvailable(searchAvail);
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setPreferences(getUserPreferences());
  };

  return (
    <>
      <OnboardingModal open={showOnboarding} onComplete={handleOnboardingComplete} />
      
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
            <div className="flex items-center gap-2">
              <Link href="/settings">
                <Settings className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 mb-8">
              <Heart className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Your Daily Health News,{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Simplified
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              AI-powered health news curator that breaks down complex medical articles into easy-to-understand summaries and personalized insights.
            </p>

            {/* Dual Mode Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
              <Link
                href="/health-news/search"
                className={`group relative p-8 rounded-2xl border-2 ${
                  searchAvailable 
                    ? 'border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950' 
                    : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-60 cursor-not-allowed'
                } transition-all duration-200 hover:shadow-xl`}
                onClick={(e) => !searchAvailable && e.preventDefault()}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-full ${
                    searchAvailable 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600' 
                      : 'bg-gray-400 dark:bg-gray-600'
                  } flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Search className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Search for News</h2>
                  <p className="text-sm text-muted-foreground">
                    {searchAvailable 
                      ? 'Ask any health question and get AI-researched answers with citations'
                      : 'Requires search API key (Tavily/Firecrawl)'}
                  </p>
                  {!searchAvailable && (
                    <span className="mt-3 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full">
                      Demo Mode
                    </span>
                  )}
                </div>
              </Link>

              <Link
                href="/health-news/highlights"
                className="group relative p-8 rounded-2xl border-2 border-teal-200 dark:border-teal-800 hover:border-teal-400 dark:hover:border-teal-600 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950 dark:to-cyan-950 transition-all duration-200 hover:shadow-xl"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Today&apos;s Highlights</h2>
                  <p className="text-sm text-muted-foreground">
                    Personalized health news curated based on your interests and preferences
                  </p>
                  {preferences.onboarded && preferences.interests.length > 0 && (
                    <span className="mt-3 text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200 px-3 py-1 rounded-full">
                      {preferences.interests.length} interests tracked
                    </span>
                  )}
                </div>
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4 mx-auto">
                  <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">AI Summaries</h3>
                <p className="text-sm text-muted-foreground">
                  Concise TL;DR + key takeaways for every article
                </p>
              </div>
              
              <div className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-4 mx-auto">
                  <Search className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Live Research</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time web search with cited sources
                </p>
              </div>
              
              <div className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mb-4 mx-auto">
                  <Heart className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Personalized</h3>
                <p className="text-sm text-muted-foreground">
                  Content tailored to your health interests
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-4 sm:px-6 lg:px-8 py-6 border-t">
          <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
            <p>Powered by AI · Built for clarity and understanding</p>
          </div>
        </footer>
      </div>
    </>
  );
}
