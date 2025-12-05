import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const dataPath = join(process.cwd(), 'data', 'health-news.json');
    const jsonData = readFileSync(dataPath, 'utf-8');
    const articles = JSON.parse(jsonData);

    return NextResponse.json({ articles, success: true });
  } catch (error) {
    console.error('Error loading articles:', error);
    return NextResponse.json(
      { error: 'Failed to load articles', success: false },
      { status: 500 }
    );
  }
}
