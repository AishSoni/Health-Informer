# Health Informer

<div align="center">
  <h2>🏥 AI-Powered Health News Curator</h2>
  <p><strong>Health Informer</strong> – Simplifying health news with AI-powered summaries and friendly explanations.</p>
</div>

## 📋 Problem Statement

**AI-Based Health News Curator**

Task: Summarize and simplify health news articles into a daily feed.

**Expected Flow:**
- **Screen 1**: Load mock news articles or RSS dump
- **Screen 2**: AI summarizes each into 2-line TL;DR + 3 key takeaways
- **Screen 3**: Display feed with pagination and pull-to-refresh
- **Screen 4**: Expand article → AI rewrites in simpler, friendly tone

## 🌟 Features

- **📰 Health News Feed**: Curated health news articles from various sources
- **🤖 AI-Powered Summaries**: Each article condensed into TL;DR + 3 key takeaways
- **✨ Simplified Rewrites**: Complex medical articles rewritten in friendly, accessible language
- **📱 Modern UI**: Clean, responsive interface with smooth animations
- **🔄 Pull-to-Refresh**: Intuitive feed refresh functionality
- **📄 Pagination**: Easy navigation through multiple articles
- **🎨 Dark/Light Themes**: Automatic theme switching based on time of day

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or later)
- OpenAI API key (for AI summaries and rewrites)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Edit `.env.local` with your OpenAI API key:
```env
# Required: Get from openai.com
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional: Choose your model (default: gpt-4o-mini)
OPENAI_LLM_MODEL=gpt-4o-mini
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:3000`

## 📱 Application Flow

### Screen 1: Article Loading
Welcome screen that loads health news articles from the mock dataset. Features a clean loading state with skeleton UI.

### Screen 2: Summarization
Progress indicators show AI processing each article. Displays:
- **TL;DR**: 2-sentence summary
- **Key Takeaways**: 3 bullet points highlighting important information

### Screen 3: News Feed
Card-based feed layout with:
- Article thumbnails and titles
- TL;DR summaries
- Key takeaways preview
- Pagination controls
- Pull-to-refresh functionality

### Screen 4: Article Detail
Full article view with:
- Original article content
- Source information
- AI-rewritten version in simple, friendly language
- Regenerate button for alternative rewrites

## 🏗️ Architecture

```
Health Informer
├── Frontend (Next.js 15 + React + Tailwind)
│   ├── app/health-news/          # 4-screen flow
│   ├── components/ui/             # Reusable UI components
│   └── context/                   # State management
├── Backend (Next.js API Routes)
│   ├── /api/health-news/articles # Article fetching
│   ├── /api/health-news/summarize # AI summarization
│   └── /api/health-news/rewrite   # AI rewriting
├── Data Layer
│   └── data/health-news.json      # Mock articles dataset
└── AI Layer
    └── lib/unified-llm-client.ts  # OpenAI integration
```

## 📦 Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI**: React 19 + Tailwind CSS
- **Components**: Radix UI primitives
- **AI**: OpenAI GPT-4o-mini
- **TypeScript**: Full type safety
- **Styling**: Tailwind CSS with custom theme

## 🔧 Configuration

The application uses OpenAI for all AI operations. Configure in `.env.local`:

```env
# LLM Provider (default: openai)
LLM_PROVIDER=openai

# OpenAI Configuration
OPENAI_API_KEY=sk-your-key-here
OPENAI_LLM_MODEL=gpt-4o-mini
```

## 📝 Mock Data

The application includes 12 realistic health news articles covering:
- Medical breakthroughs
- Public health updates
- Nutrition research
- Mental health insights
- Disease prevention
- Treatment innovations

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables: `OPENAI_API_KEY`
4. Deploy!

The app will automatically build and deploy. No Docker or database required.

## 📖 Documentation

See [ASSIGNMENT-PS1.md](./ASSIGNMENT-PS1.md) for:
- Detailed implementation notes
- Screenshots of all 4 screens
- Prompt engineering iterations
- Known issues and improvements

## 🙏 Acknowledgments

Built on the foundation of [Narada AI](https://github.com/AishSoni/Narada-AI) - a powerful deep research agent platform.

---

**Health Informer** – Making health news accessible to everyone. 🏥✨
