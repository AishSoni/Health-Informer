import { NextRequest, NextResponse } from 'next/server';
import { UnifiedSearchClient } from '@/lib/unified-search-client';
import { SEARCH_CONFIG } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Simple search endpoint for highlights mode to get article sources
 * Returns just the raw search results without AI processing
 */
export async function POST(request: NextRequest) {
  try {
    const { query, limit } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const searchClient = new UnifiedSearchClient();
    const searchResults = await searchClient.search(query, {
      limit: limit || SEARCH_CONFIG.MAX_SOURCES_PER_SEARCH
    });

    const sources = searchResults.data.map(r => ({
      url: r.url,
      title: r.title,
      content: r.content || r.markdown,
      score: r.score
    }));

    return NextResponse.json({
      sources,
      query,
      success: true
    });
  } catch (error) {
    console.error('Article search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed', success: false },
      { status: 500 }
    );
  }
}
