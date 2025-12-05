import Link from 'next/link';
import { Newspaper, Sparkles, Heart } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
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

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 mb-8 opacity-0 animate-fade-up [animation-duration:500ms] [animation-delay:100ms] [animation-fill-mode:forwards]">
            <Newspaper className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 opacity-0 animate-fade-up [animation-duration:500ms] [animation-delay:200ms] [animation-fill-mode:forwards]">
            Your Daily Health News,{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Simplified
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto opacity-0 animate-fade-up [animation-duration:500ms] [animation-delay:300ms] [animation-fill-mode:forwards]">
            AI-powered health news curator that breaks down complex medical articles into easy-to-understand summaries and friendly explanations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center opacity-0 animate-fade-up [animation-duration:500ms] [animation-delay:400ms] [animation-fill-mode:forwards]">
            <Link
              href="/health-news"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Get Started
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 opacity-0 animate-fade-up [animation-duration:500ms] [animation-delay:500ms] [animation-fill-mode:forwards]">
            <div className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">AI Summaries</h3>
              <p className="text-sm text-muted-foreground">
                2-line TL;DR + 3 key takeaways for every article
              </p>
            </div>
            
            <div className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-4 mx-auto">
                <Newspaper className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Curated Feed</h3>
              <p className="text-sm text-muted-foreground">
                Daily health news from trusted sources
              </p>
            </div>
            
            <div className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mb-4 mx-auto">
                <Heart className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Friendly Tone</h3>
              <p className="text-sm text-muted-foreground">
                Complex medical jargon explained simply
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-6 border-t">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>Powered by AI • Making health news accessible to everyone</p>
        </div>
      </footer>
    </div>
  );
}
