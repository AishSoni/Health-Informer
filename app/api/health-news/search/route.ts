import { NextRequest } from 'next/server';
import { UnifiedSearchClient } from '@/lib/unified-search-client';
import { LangGraphLLMClient } from '@/lib/langgraph-llm-client';
import { SEARCH_CONFIG } from '@/lib/config';

export interface Source {
  url: string;
  title: string;
  content?: string;
  summary?: string;
}

export interface SearchEvent {
  type: string;
  phase?: string;
  message?: string;
  query?: string;
  sources?: Source[];
  content?: string;
  chunk?: string;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const { query } = await request.json();

  if (!query) {
    return new Response('Query is required', { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: SearchEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        // Phase 1: Understanding
        sendEvent({
          type: 'phase-update',
          phase: 'understanding',
          message: 'Analyzing your health question...'
        });

        const searchClient = new UnifiedSearchClient();
        const llmClient = new LangGraphLLMClient();

        // Phase 2: Searching
        sendEvent({
          type: 'phase-update',
          phase: 'searching',
          message: 'Searching health sources...'
        });

        sendEvent({
          type: 'searching',
          query,
          message: 'Searching for: ' + query
        });

        const searchResults = await searchClient.search(query, {
          limit: SEARCH_CONFIG.MAX_SOURCES_PER_SEARCH
        });

        const sources: Source[] = searchResults.data.map(r => ({
          url: r.url,
          title: r.title,
          content: r.content || r.markdown
        }));

        sendEvent({
          type: 'found',
          sources: sources.slice(0, 6),
          query
        });

        // Phase 3: Analyzing
        sendEvent({
          type: 'phase-update',
          phase: 'analyzing',
          message: 'Analyzing medical information...'
        });

        // Generate summaries for each source
        for (let i = 0; i < Math.min(sources.length, 6); i++) {
          const source = sources[i];
          
          sendEvent({
            type: 'source-processing',
            message: `Analyzing ${source.title}...`
          });

          if (source.content && source.content.length > 100) {
            try {
              const summaryPrompt = `Briefly summarize how this content relates to the question: "${query}"\n\nContent: ${source.content.substring(0, 2000)}\n\nProvide a 1-2 sentence summary:`;
              
              const summaryResult = await llmClient.invoke([{
                role: 'user',
                content: summaryPrompt
              }]);

              source.summary = summaryResult.content.trim();
              
              sendEvent({
                type: 'source-complete',
                message: source.summary
              });
            } catch (error) {
              console.error('Summary error:', error);
            }
          }
        }

        // Phase 4: Synthesizing
        sendEvent({
          type: 'phase-update',
          phase: 'synthesizing',
          message: 'Generating your answer...'
        });

        // Prepare context from sources
        const contextText = sources
          .slice(0, 6)
          .map((s, i) => `Source ${i + 1} (${s.title}):\n${s.summary || s.content?.substring(0, 500) || ''}`)
          .join('\n\n');

        const answerPrompt = `You are a health information assistant. Answer the user's question based ONLY on the provided sources. Be accurate, clear, and cite sources.

User Question: ${query}

Sources:
${contextText}

Provide a comprehensive but accessible answer. Use markdown formatting. 

IMPORTANT: When citing sources, use this EXACT format: [Source 1](#source-1) with the source number matching the numbered sources above. For example:
- "Studies show that exercise improves heart health [Source 1](#source-1)."
- "The Mediterranean diet has been linked to longevity [Source 2](#source-2) and reduced disease risk [Source 3](#source-3)."

Always cite your claims using this markdown link format.

Answer:`;

        // Stream the answer
        sendEvent({
          type: 'content-start',
          message: 'Generating answer...'
        });

        let fullAnswer = '';
        await llmClient.stream([{
          role: 'user',
          content: answerPrompt
        }], (chunk) => {
          fullAnswer += chunk;
          sendEvent({
            type: 'content-chunk',
            chunk
          });
        });

        // Post-process answer to ensure citations are markdown links
        // Convert any bare [Source N] text to markdown links [Source N](#source-N)
        fullAnswer = fullAnswer.replace(/\[Source (\d+)\](?!\()/g, '[Source $1](#source-$1)');

        // Phase 5: Complete
        sendEvent({
          type: 'phase-update',
          phase: 'complete',
          message: 'Answer complete'
        });

        sendEvent({
          type: 'final-result',
          content: fullAnswer,
          sources: sources.slice(0, 6)
        });

        // Give client time to process final event before closing
        await new Promise(resolve => setTimeout(resolve, 100));
        
        sendEvent({
          type: 'done'
        });

        controller.close();
      } catch (error) {
        console.error('Search error:', error);
        sendEvent({
          type: 'error',
          message: error instanceof Error ? error.message : 'Search failed'
        });
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
