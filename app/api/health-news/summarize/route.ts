import { NextResponse } from 'next/server';
import { LangGraphLLMClient } from '@/lib/langgraph-llm-client';

const SUMMARY_PROMPT = `Summarize this health news article for a general audience.

You must respond with ONLY valid JSON in this exact format:
{
  "tldr": "A 2-sentence summary (max 280 characters total)",
  "keyTakeaways": [
    "First key takeaway (one short sentence)",
    "Second key takeaway (one short sentence)",
    "Third key takeaway (one short sentence)"
  ]
}

Rules:
- TL;DR must be exactly 2 sentences, maximum 280 characters total
- Provide exactly 3 key takeaways
- Each takeaway should be one concise sentence
- Use clear, jargon-free language
- Focus on practical implications for readers
- Do not add any explanatory text outside the JSON
- Ensure the JSON is properly formatted

Article Title: {title}

Article Content:
{content}`;

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

    const prompt = SUMMARY_PROMPT.replace('{title}', title).replace('{content}', content);

    const result = await llmClient.invoke([{
      role: 'user',
      content: prompt,
    }]);

    const response = result.content;

    // Parse the JSON response
    let summary;
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        summary = JSON.parse(jsonMatch[0]);
      } else {
        summary = JSON.parse(response);
      }

      // Validate the structure
      if (!summary.tldr || !Array.isArray(summary.keyTakeaways) || summary.keyTakeaways.length !== 3) {
        throw new Error('Invalid summary structure');
      }
    } catch {
      console.error('Failed to parse LLM response:', response);
      return NextResponse.json(
        { error: 'Failed to parse AI response', success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      articleId,
      summary,
      success: true,
    });
  } catch (error) {
    console.error('Error summarizing article:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to summarize article';
    return NextResponse.json(
      { error: errorMessage, success: false },
      { status: 500 }
    );
  }
}
