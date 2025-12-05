import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const dataPath = join(process.cwd(), 'data', 'health-news.json');
    const jsonData = readFileSync(dataPath, 'utf-8');
    const articles = JSON.parse(jsonData);

    const article = articles.find((a: { id: string }) => a.id === params.id);

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found', success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({ article, success: true });
  } catch (error) {
    console.error('Error loading article:', error);
    return NextResponse.json(
      { error: 'Failed to load article', success: false },
      { status: 500 }
    );
  }
}
