# Game Learning

Game Learning is an AI-powered language learning assistant specifically designed to help you learn languages through games, media, and real-world content. It utilizes OCR (Optical Character Recognition) and the Google Gemini API to provide real-time translations, word-level breakdowns, and grammar analysis.

**Live Demo**: [https://game-learning-umber.vercel.app/](https://game-learning-umber.vercel.app/)

## Features

- **Visual Intelligent Reader**: Capture screenshots of your game or screen and get instant OCR results with word-level breakdowns, readings (Furigana/Pinyin), and translations.
- **Smart Grammar Audit**: Automatically detects registered grammar patterns in captured screen regions and provides contextual explanations.
- **Interactive Word Breakdown**: Tokens are color-coded to distinguish between standard vocabulary and functional grammar particles.
- **Flashcard Collection**: Save words directly from visual captures into your personal vocabulary collection with one click.
- **Deck Management**: Organize your flashcards into custom decks (e.g., "RPG Terms", "Casual Dialogue").
- **Study Mode**: Interactive study sessions with shuffled cards, hidable readings, and persistent study state.
- **History Archive**: Review all past scans and create flashcards from previous captures at any time.
- **Privacy-First API Key**: Strictly uses **Session Storage** for your Gemini API key, ensuring it is never saved permanently in the browser and is cleared on tab close.

## Project Structure

```text
src/
├── components/          # React Components
│   ├── ui/              # Reusable base UI components (Button, Panel, etc.)
│   ├── viewport/        # The Core Reader: Screen capture, Text Overlay, and Word Breakdown
│   ├── flashcards/      # Flashcard system: Study mode, Deck management
│   ├── grammar/         # Grammar list, PDF parsing, and pattern matching
│   ├── history/         # Archive of past scans for later study
│   ├── ApiKeyModal.tsx  # Secure API Settings management
│   └── NavSidebar.tsx   # Sidebar navigation and external links
├── hooks/               # Custom hooks for Screen Capture and AI state
├── lib/                 # Tailwind utility helpers
├── services/            # logic for Google Gemini SDK integration
├── types.ts             # Global TypeScript interfaces
├── constants.ts         # Shared constant definitions
├── App.tsx              # Main routing and global state management
└── index.css            # Custom theme variables and Tailwind imports
```

## Getting Started

1. **Obtain API Key**: Get a free API key from [Google AI Studio](https://aistudio.google.com/).
2. **Setup**:
   ```bash
   npm install
   ```
3. **Run Locally**:
   ```bash
   npm run dev
   ```
4. **Configuration**: Open the application, go to **Settings** in the sidebar, and paste your Gemini API key. The key is stored in your session and will clear when you close the tab.

## Tech Stack

- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS (Custom color tokens)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **AI Core**: Google Gemini Pro (Flash 1.5/3.0) via `@google/genai`
- **Deployment**: Static site hosting (compatible with Vercel/Netlify)

## GitHub Repository
[https://github.com/JesseTberg/GameLearning](https://github.com/JesseTberg/GameLearning)
