/* eslint-disable @typescript-eslint/no-explicit-any */

export interface TavilySearchOptions {
  search_depth?: 'basic' | 'advanced';
  max_results?: number;
  include_domains?: string[];
  exclude_domains?: string[];
  include_answer?: boolean;
  include_raw_content?: boolean;
  include_images?: boolean;
}

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  raw_content?: string;
}

export interface TavilySearchResponse {
  answer?: string;
  query: string;
  response_time: number;
  images?: string[];
  results: TavilySearchResult[];
}

export class TavilyClient {
  private apiKey: string;
  private baseUrl = 'https://api.tavily.com';

  constructor(providedApiKey?: string) {
    const apiKey = providedApiKey || process.env.TAVILY_API_KEY;
    if (!apiKey) {
      throw new Error('TAVILY_API_KEY is required');
    }
    this.apiKey = apiKey;
  }

  async search(query: string, options?: TavilySearchOptions): Promise<TavilySearchResponse> {
    try {
      const searchOptions: any = {
        api_key: this.apiKey,
        query,
        search_depth: options?.search_depth || 'basic',
        max_results: options?.max_results || 10,
        include_answer: options?.include_answer ?? true,
        include_raw_content: options?.include_raw_content ?? true,
        include_images: options?.include_images ?? false,
      };

      if (options?.include_domains) {
        searchOptions.include_domains = options.include_domains;
      }

      if (options?.exclude_domains) {
        searchOptions.exclude_domains = options.exclude_domains;
      }

      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchOptions),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Tavily API error: ${response.status} - ${errorText}`);
      }

      const data: TavilySearchResponse = await response.json();
      return data;
    } catch (error: any) {
      throw new Error(`Tavily search failed: ${error.message}`);
    }
  }

  async scrapeUrl(url: string, timeoutMs: number = 15000): Promise<{
    markdown: string;
    html: string;
    metadata: any;
    success: boolean;
    error?: string;
  }> {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Scraping timeout')), timeoutMs);
      });

      const scrapePromise = fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const html = await response.text();
        return {
          markdown: html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
          html,
          metadata: {},
          success: true
        };
      });

      const result = await Promise.race([scrapePromise, timeoutPromise]) as any;
      return result;
    } catch (error: any) {
      return {
        markdown: '',
        html: '',
        metadata: {},
        success: false,
        error: error.message.includes('timeout') ? 'timeout' : error.message
      };
    }
  }
}
