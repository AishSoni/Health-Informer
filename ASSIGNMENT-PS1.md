# Assignment PS1: AI-Based Health News Curator

## 📋 Problem Statement Implementation

**Task**: Summarize and simplify health news articles into a daily feed

**Required Flow**:
1. ✅ **Screen 1**: Load mock news articles
2. ✅ **Screen 2**: AI summarizes each into 2-line TL;DR + 3 key takeaways
3. ✅ **Screen 3**: Display feed with pagination and pull-to-refresh
4. ✅ **Screen 4**: Expand article → AI rewrites in simpler, friendly tone

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 15 (App Router) + React 19
- **Styling**: Tailwind CSS with custom gradients
- **AI Provider**: OpenAI GPT-4o-mini (configurable to use Ollama)
- **State Management**: React Context + sessionStorage
- **Type Safety**: TypeScript throughout

### Project Structure
```
Health Informer/
├── app/
│   ├── page.tsx                          # Landing page
│   ├── layout.tsx                        # Root layout with theme
│   ├── health-news/
│   │   ├── page.tsx                      # Screen 1: Article loading
│   │   ├── summarize/page.tsx            # Screen 2: AI summarization
│   │   ├── feed/page.tsx                 # Screen 3: News feed
│   │   └── article/[id]/page.tsx         # Screen 4: Detail + rewrite
│   └── api/health-news/
│       ├── articles/route.ts             # GET all articles
│       ├── articles/[id]/route.ts        # GET single article
│       ├── summarize/route.ts            # POST summarize article
│       └── rewrite/route.ts              # POST rewrite article
├── lib/
│   ├── unified-llm-client.ts             # LLM abstraction layer
│   └── health-news/types.ts              # TypeScript interfaces
├── context/HealthNewsContext.tsx         # Global state management
├── data/health-news.json                 # 12 mock articles
└── components/ui/                        # Reusable UI components
```

## 🎨 UI/UX Highlights

### Animations
- **Fade-up animations** on all major elements with staggered delays
- **Shimmer loading states** during AI processing
- **Smooth transitions** between screens
- **Hover effects** on cards with scale and shadow
- **Progress bars** with gradient fills

### Responsive Design
- Mobile-first approach
- Grid layouts adapt to screen size (1/2/3 columns)
- Touch-friendly buttons and navigation
- Sticky headers for better navigation

### Theme Support
- **Auto-switching** dark/light theme based on time of day (6 PM - 6 AM = dark)
- Manual toggle available
- Smooth color transitions
- Consistent color palette (emerald/teal gradients)

## 🤖 AI Integration

### Prompt Engineering

#### Summary Prompt (Screen 2)
```
Summarize this health news article for a general audience.

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
```

**Iterations**:
1. **v1**: Simple "summarize this article" → inconsistent format
2. **v2**: Added JSON structure requirement → sometimes added explanatory text
3. **v3**: Strict "ONLY valid JSON" + explicit rules → **best results**

**Temperature**: 0.3 (low for consistency)
**Max Tokens**: 500

#### Rewrite Prompt (Screen 4)
```
Rewrite this health article in simple, friendly language for a general audience with no medical background.

Guidelines:
- Use conversational, engaging tone
- Explain all medical terms in plain English
- Break complex ideas into easy-to-understand paragraphs
- Maintain complete factual accuracy - do not add or change medical information
- Make it interesting and accessible
- Keep the rewrite to 3-4 paragraphs maximum
- Focus on what matters most to readers
```

**Temperature**: 0.7 (higher for creativity)
**Max Tokens**: 1000

**Key Success Factor**: Emphasized "maintain factual accuracy" to prevent hallucination

## 📱 Screen Implementations

### Screen 1: Article Loading (`/health-news`)
**Purpose**: Initial data load with polished loading state

**Features**:
- Fetches 12 articles from mock JSON data
- Skeleton cards with pulse animation
- Automatic navigation to Screen 2 after load
- Error handling with retry button

**Key Code**: 
- Uses `sessionStorage` to persist articles across navigation
- Simulates 1.5s delay for better UX perception

### Screen 2: Summarization (`/health-news/summarize`)
**Purpose**: AI processing with live progress

**Features**:
- Progress bar showing % complete
- Real-time display of current article being processed
- Shows last 3 completed summaries as they finish
- Handles API errors gracefully (continues with other articles)
- Auto-navigates to feed when complete

**Performance**: 
- Processes articles sequentially (not parallel) to avoid rate limits
- 300ms delay between requests
- Total time: ~20-30 seconds for 12 articles

### Screen 3: News Feed (`/health-news/feed`)
**Purpose**: Browse summarized articles

**Features**:
- **Card grid**: 1/2/3 columns responsive layout
- **Pagination**: 6 articles per page
- **Pull-to-refresh**: Reloads articles from sessionStorage
- **Article cards** show:
  - Hero image with overlay
  - Source and date
  - Title (truncated to 2 lines)
  - TL;DR (truncated to 2 lines)
  - First 2 key takeaways
  - Hover effects with scale/shadow

**Navigation**: 
- Click any card → navigate to detail page
- Numbered pagination buttons
- Previous/Next buttons

### Screen 4: Article Detail (`/health-news/article/[id]`)
**Purpose**: Full article with AI simplification

**Features**:
- **Hero image**: Large format with gradient overlay
- **Summary card**: TL;DR + 3 takeaways in colored box
- **Toggle buttons**: Switch between Original and Simplified
- **On-demand rewrite**: Generates simplified version when clicked
- **Regenerate**: Button to get alternative simplified version
- **Back navigation**: Returns to feed

**State Management**:
- Rewritten content cached in sessionStorage
- Persists across page refreshes
- Updates global articles state

## 📊 Mock Data

**File**: `data/health-news.json`

**12 Articles Covering**:
1. Mediterranean Diet & Heart Disease
2. Alzheimer's Drug Breakthrough
3. Exercise & Cancer Risk
4. Sleep Deprivation & Diabetes
5. Mental Health Apps Effectiveness
6. Vitamin D & Autoimmune Disease
7. Green Tea & Cognitive Decline
8. Intermittent Fasting Benefits
9. Vaccination Rates Decline
10. Gut Microbiome & Mental Health
11. Air Pollution & Dementia
12. Multi-Cancer Blood Test

**Each Article Contains**:
- Realistic title from credible source
- Date (November-December 2025)
- High-quality Unsplash image URL
- 400-500 word detailed content with medical accuracy
- Source attribution

## 🔧 Configuration

### Environment Variables
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-key
OPENAI_LLM_MODEL=gpt-4o-mini
```

### Alternative: Local LLM (Ollama)
```env
LLM_PROVIDER=ollama
OLLAMA_API_URL=http://localhost:11434
OLLAMA_LLM_MODEL=llama3.2
```

## ✅ Requirements Checklist

### Core Requirements
- ✅ Load mock RSS/articles (Screen 1)
- ✅ AI summarizes to TL;DR + 3 takeaways (Screen 2)
- ✅ Feed with pagination (Screen 3)
- ✅ Pull-to-refresh functionality (Screen 3)
- ✅ Expand article for full content (Screen 4)
- ✅ AI rewrites in friendly tone (Screen 4)

### AI Usage Guidance
- ✅ Clean, consistent summary formatting (strict JSON schema)
- ✅ Handle regenerate gracefully (rewrite button works multiple times)
- ✅ Handle refresh states (loading indicators, disabled states)

### Polish & UX
- ✅ Smooth animations throughout
- ✅ Responsive design (mobile + desktop)
- ✅ Dark/light theme support
- ✅ Loading states with skeletons
- ✅ Error handling
- ✅ Professional visual design

## 🚀 Deployment

### Local Development
```bash
npm install
cp .env.example .env.local
# Add your OPENAI_API_KEY to .env.local
npm run dev
```

### Production (Vercel)
1. Push code to GitHub
2. Import to Vercel
3. Add `OPENAI_API_KEY` environment variable
4. Deploy

**No Docker, no database required** ✨

## 🎯 Key Achievements

### 1. **Clean Architecture**
- Separation of concerns (UI / API / Types)
- Reusable components
- Type-safe throughout

### 2. **Robust AI Integration**
- Retry logic for failed requests
- JSON parsing with fallbacks
- Temperature tuning for different tasks

### 3. **Production-Ready**
- Error boundaries
- Loading states
- Responsive design
- Accessibility (semantic HTML)

### 4. **Performance**
- sessionStorage for client-side caching
- Image optimization (Next.js Image)
- Efficient re-renders (React best practices)

## 🐛 Known Issues & Improvements

### Known Issues
1. **sessionStorage limitation**: Data lost on browser close (could use localStorage instead)
2. **No backend persistence**: Articles need re-summarization each session
3. **Sequential processing**: Could be faster with parallel API calls (within rate limits)

### Future Improvements
1. **Real RSS feed integration**: Replace mock data with live health news APIs
2. **Backend database**: Store summaries to avoid re-processing
3. **User accounts**: Save favorites, reading history
4. **Share functionality**: Social sharing of articles
5. **Search & filters**: Find articles by topic, date, source
6. **Bookmarking**: Save articles for later
7. **Progressive Web App**: Offline support, push notifications
8. **A/B testing**: Multiple rewrite styles (casual, technical, ELI5)

## 📸 Screenshots

### Screen 1: Loading Articles
![Loading Screen](./screenshots/screen1-loading.png)
*Placeholder - Shows skeleton cards with loading animation*

### Screen 2: AI Summarization
![Summarization Progress](./screenshots/screen2-summarize.png)
*Placeholder - Shows progress bar and completed summaries*

### Screen 3: News Feed
![News Feed](./screenshots/screen3-feed.png)
*Placeholder - Shows card grid with pagination*

### Screen 4: Article Detail
![Article Detail](./screenshots/screen4-detail.png)
*Placeholder - Shows full article with simplified toggle*

## 🎓 Learning Outcomes

### Technical Skills
- Next.js 15 App Router patterns
- React Context for state management
- TypeScript interfaces and type safety
- Tailwind CSS advanced techniques
- API route handlers in Next.js

### AI/LLM Skills
- Prompt engineering for structured output
- Temperature tuning for different tasks
- Error handling with LLM responses
- JSON schema enforcement
- Retry logic implementation

### UX/UI Skills
- Animation timing and choreography
- Loading state design
- Responsive grid layouts
- Color theory (gradients, themes)
- Accessibility considerations

---

## 🙏 Acknowledgments

This project was built on the foundation of **Narada AI** (https://github.com/AishSoni/Narada-AI), a powerful deep research agent. The following components were reused:
- `unified-llm-client.ts` for LLM abstraction
- `langgraph-llm-client.ts` for OpenAI integration
- Theme system and UI components
- Build configuration

All search, knowledge base, and vector database features were removed to create a focused health news curator application.

---

**Health Informer** - Making health news accessible to everyone. 🏥✨
