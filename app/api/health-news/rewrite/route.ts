import { NextResponse } from 'next/server';
import { LangGraphLLMClient } from '@/lib/langgraph-llm-client';

const REWRITE_PROMPT = `Rewrite this health article in simple, friendly language for a general audience with no medical background.

Guidelines:
- Use conversational, engaging tone
- Explain all medical terms in plain English
- Break complex ideas into easy-to-understand paragraphs
- Maintain complete factual accuracy - do not add or change medical information
- Make it interesting and accessible
- Keep the rewrite to 3-4 paragraphs maximum
- Focus on what matters most to readers

Original Article Title: {title}

Original Content:
{content}

Write the simplified version now:`;

export async function POST(request: Request) {
  try {
    const { articleId, title, content } = await request.json();

    if (!articleId || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields', success: false },
        { status: 400 }
      );
    }

    const llmClient = new LangGraphLLMClient();

    const prompt = REWRITE_PROMPT.replace('{title}', title).replace('{content}', content);

    const result = await llmClient.invoke([{
      role: 'user',
      content: prompt,
    }]);

    const rewrittenContent = result.content.trim();

    return NextResponse.json({
      articleId,
      rewrittenContent: rewrittenContent.trim(),
      success: true,
    });
  } catch (error) {
    console.error('Error rewriting article:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to rewrite article';
    return NextResponse.json(
      { error: errorMessage, success: false },
      { status: 500 }
    );
  }
}
