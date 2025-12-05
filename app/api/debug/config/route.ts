import { NextResponse } from 'next/server';
import { getAppConfig, isSearchAvailable } from '@/lib/app-config';

export async function GET() {
  const config = getAppConfig();
  const searchAvailable = isSearchAvailable(config);
  
  return NextResponse.json({
    useSyntheticData: config.useSyntheticData,
    searchProvider: config.searchProvider,
    hasSearchApiKey: !!config.searchApiKey,
    searchApiKeyLength: config.searchApiKey?.length || 0,
    searchAvailable,
    env: {
      USE_SYNTHETIC_DATA: process.env.USE_SYNTHETIC_DATA,
      NEXT_PUBLIC_USE_SYNTHETIC_DATA: process.env.NEXT_PUBLIC_USE_SYNTHETIC_DATA,
      SEARCH_API_PROVIDER: process.env.SEARCH_API_PROVIDER,
      hasTavilyKey: !!process.env.TAVILY_API_KEY,
      tavilyKeyLength: process.env.TAVILY_API_KEY?.length || 0,
    }
  });
}
