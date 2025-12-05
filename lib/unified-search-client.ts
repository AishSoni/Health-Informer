/* eslint-disable @typescript-eslint/no-explicit-any */
import { TavilyClient } from './tavily';
import { getAppConfig } from './app-config';
import { API_PROVIDERS } from './config';

export interface UnifiedSearchResult {
  url: string;
  title: string;
  description: string;
  markdown: string;
  html: string;
  content: string;
  scraped: boolean;
}

export interface UnifiedSearchResponse {
  data: UnifiedSearchResult[];
  results: any[];
}

export interface UnifiedScrapeResult {
  markdown: string;
  html: string;
  metadata: any;
  success: boolean;
  error?: string;
}

export interface SearchClientInterface {
  search(query: string, options?: any): Promise<UnifiedSearchResponse>;
  scrapeUrl(url: string, timeoutMs?: number): Promise<UnifiedScrapeResult>;
}

export class UnifiedSearchClient implements SearchClientInterface {
  private client: TavilyClient;
  private provider: string;

  constructor(providedApiKey?: string) {
    const config = getAppConfig();
    this.provider = config.searchProvider;
    
    // For now, only Tavily is implemented for Health Informer
    // You can extend this later with Firecrawl if needed
    if (this.provider === API_PROVIDERS.SEARCH.TAVILY || !providedApiKey) {
      this.client = new TavilyClient(providedApiKey || config.searchApiKey);
    } else {
      this.client = new TavilyClient(providedApiKey || config.searchApiKey);
    }
  }

  async search(query: string, options?: any): Promise<UnifiedSearchResponse> {
    try {
      // Tavily options
      const tavilyOptions = {
        max_results: options?.limit || 10,
        search_depth: 'advanced' as const,
        include_raw_content: true,
        include_answer: true,
      };
      
      const response = await this.client.search(query, tavilyOptions);
      
      // Format results
      const formattedResults: UnifiedSearchResult[] = response.results.map(result => ({
        url: result.url,
        title: result.title,
        description: result.content,
        markdown: result.raw_content || result.content,
        html: result.raw_content || result.content,
        content: result.raw_content || result.content,
        scraped: !!result.raw_content
      }));
      
      return {
        data: formattedResults,
        results: response.results
      };
    } catch (error: any) {
      console.error('Search error:', error);
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  async scrapeUrl(url: string, timeoutMs?: number): Promise<UnifiedScrapeResult> {
    return this.client.scrapeUrl(url, timeoutMs);
  }
}
