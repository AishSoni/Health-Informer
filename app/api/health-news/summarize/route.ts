import { NextResponse } from 'next/server';
import { LangGraphLLMClient } from '@/lib/langgraph-llm-client';

const SUMMARY_PROMPT = `Summarize this health news article for a general audience.

You must respond with ONLY valid JSON in this exact format:
{
  "tldr": "One punchy sentence summarizing the main finding or news (max 120 characters)",
  "keyTakeaways": [
    "First key insight in plain language",
    "Second key insight in plain language", 
    "Third key insight in plain language"
  ]
}

Rules for TL;DR:
- ONE sentence ONLY (not two)
- Maximum 120 characters
- Start with the most impactful finding
- Use active voice and present tense when possible
- Make it punchy and headline-like
- Example: "Mediterranean diet reduces Alzheimer's risk by 40% in new study"

Rules for Key Takeaways:
- Exactly 3 takeaways
- Each is one clear, short sentence (max 80 characters each)
- Focus on practical implications for readers
- Use simple, jargon-free language
- Avoid medical terminology unless necessary

Important:
- Return ONLY the JSON object, no other text
- Ensure valid JSON syntax
- No markdown code blocks or explanations

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
      
      // Validate TL;DR is concise (1 sentence, max 150 chars to allow some flexibility)
      if (summary.tldr.length > 150) {
        console.warn('TL;DR exceeds recommended length:', summary.tldr.length);
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
