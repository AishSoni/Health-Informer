'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { HealthArticle } from '@/lib/health-news/types';

interface HealthNewsContextType {
  articles: HealthArticle[];
  setArticles: (articles: HealthArticle[]) => void;
  updateArticleSummary: (articleId: string, summary: { tldr: string; keyTakeaways: string[] }) => void;
  updateArticleRewrite: (articleId: string, rewrittenContent: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const HealthNewsContext = createContext<HealthNewsContextType | undefined>(undefined);

export function HealthNewsProvider({ children }: { children: ReactNode }) {
  const [articles, setArticles] = useState<HealthArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const updateArticleSummary = (articleId: string, summary: { tldr: string; keyTakeaways: string[] }) => {
    setArticles((prev) =>
      prev.map((article) =>
        article.id === articleId ? { ...article, summary } : article
      )
    );
  };

  const updateArticleRewrite = (articleId: string, rewrittenContent: string) => {
    setArticles((prev) =>
      prev.map((article) =>
        article.id === articleId ? { ...article, rewrittenContent } : article
      )
    );
  };

  return (
    <HealthNewsContext.Provider
      value={{
        articles,
        setArticles,
        updateArticleSummary,
        updateArticleRewrite,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </HealthNewsContext.Provider>
  );
}

export function useHealthNews() {
  const context = useContext(HealthNewsContext);
  if (context === undefined) {
    throw new Error('useHealthNews must be used within a HealthNewsProvider');
  }
  return context;
}
