export interface HealthArticle {
  id: string;
  title: string;
  source: string;
  date: string;
  imageUrl: string;
  content: string;
  summary?: ArticleSummary;
  rewrittenContent?: string;
}

export interface ArticleSummary {
  tldr: string;
  keyTakeaways: string[];
}

export interface SummarizeResponse {
  articleId: string;
  summary: ArticleSummary;
  success: boolean;
  error?: string;
}

export interface RewriteResponse {
  articleId: string;
  rewrittenContent: string;
  success: boolean;
  error?: string;
}
