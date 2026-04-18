# LingoCompanion

LingoCompanion is an AI-powered language learning assistant that helps you learn from real-world content through OCR (Optical Character Recognition), real-time grammar analysis, and a structured flashcard system.

## Features

- **OCR Intelligent Reader**: Capture screenshots of text (Japanese/Chinese/etc.) and get instant word-level breakdowns, readings (Furigana/Pinyin), and translations.
- **Grammar Analysis**: Automatically detects grammar patterns in captured text and provides explanations.
- **Flashcard Collection**: Save words directly from scans into your collection.
- **Deck Management**: Organize your flashcards into custom decks (e.g., "Manga Vocabulary", "Business Terms").
- **Study Mode**: Interactive study sessions with shuffled cards, hidable readings, and contextual reminders.
- **History Archive**: Review all past scans and create flashcards from them anytime.

## Project Structure

```text
src/
├── components/          # React Components
│   ├── ui/              # Reusable base UI components (Button, Card, Grid, etc.)
│   ├── viewport/        # Reader view: Canvas, OCR, Quick Flashcard Prep
│   ├── flashcards/      # Flashcard collection, Deck management, Study mode
│   ├── grammar/         # Grammar list and pattern matching
│   ├── history/         # Past scan archive
│   └── NavSidebar.tsx   # Main application navigation
├── hooks/               # Custom React hooks (useScreenCapture, etc.)
├── lib/                 # Utilities (Tailwind merge helpers)
├── services/            # API integration (Gemini AI service)
├── types.ts             # TypeScript interfaces and types
├── App.tsx              # Main application logic and state management
└── main.tsx             # Entry point
```

## Setup

1. **API Key**: This application requires a Google Gemini API Key.
2. **Environment**: Create a `.env` file based on `.env.example` or enter your key in the application settings.
3. **Run**:
   ```bash
   npm install
   npm run dev
   ```

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion (motion/react)
- **Icons**: Lucide React
- **AI**: Google Gemini Pro Vision (for OCR and translation)
