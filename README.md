# AI PDF Chat Assistant

A production-quality AI-powered PDF Question Answering platform built with React, Tailwind CSS, PDF.js, and Google Gemini API.

## Features

### Core Functionality
- **PDF Upload**: Drag-and-drop or file picker with file type and size validation
- **PDF Processing**: Text extraction from PDFs using PDF.js, handles multi-page documents
- **AI Chat Interface**: ChatGPT-style modern interface with auto-scroll and typing indicators
- **Context-Aware Q&A**: Questions answered using only document content with source attribution
- **Conversation History**: Maintains chat history during session with timestamps

### Advanced Features
- **Suggested Questions**: AI-generated questions based on document content
- **Quick Actions**:
  - Summarize Document
  - Key Insights
  - Extract Topics
  - Generate Study Notes
- **Source Referencing**: Page numbers and excerpts cited in responses

### User Experience
- Responsive design (mobile-friendly)
- Modern SaaS-style dark theme
- Smooth animations and transitions
- Loading skeletons and error states
- Keyboard shortcuts (Enter to send)
- **No .env required**: API key stored securely in browser localStorage

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **PDF.js** for PDF processing
- **Google Gemini API** for AI responses
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Google Gemini API key (free from Google AI Studio)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-pdf-chat-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open the app in your browser and click "Settings" to add your Gemini API key

### Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and paste it in the app's Settings modal

**Note**: Your API key is stored locally in your browser's localStorage and never sent to any server except Google's Gemini API.

## Usage

1. **Configure API Key**: Click Settings and add your Gemini API key
2. **Upload a PDF**: Click the upload button or drag and drop a PDF file
3. **Wait for Processing**: The app will extract text from your document
4. **Ask Questions**: Type questions about your document in the chat
5. **Use Quick Actions**: Click buttons to summarize, get insights, extract topics, or generate study notes
6. **View Sources**: AI responses include page number references

## Project Structure

```
src/
├── components/
│   ├── Chat/           # Chat interface components
│   ├── PDF/            # PDF upload components
│   ├── Sidebar/        # Sidebar components
│   └── UI/             # Reusable UI components
├── hooks/              # Custom React hooks
├── services/           # API and processing services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Features in Detail

### PDF Processing
- Handles PDFs up to 50MB
- Extracts text from all pages
- Provides word count and page estimates
- Shows processing progress

### AI Responses
- Uses only document content for answers
- Clearly states when information is not found
- Includes relevant page numbers
- Provides source excerpts

### API Key Management
- Stored securely in browser localStorage
- Never transmitted to third parties
- Easy to update via Settings modal
- No environment configuration required

### Performance
- Efficient text extraction
- Optimized for documents up to 100 pages
- Clean component architecture
- Proper state management

## Build for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Technologies Used

- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Vite** - Build tool
- **PDF.js** - PDF parsing
- **Google Gemini API** - AI responses
- **Lucide React** - Icon library

## License

MIT License

## Resume Description

> Developed an AI-powered PDF Question Answering platform using React, Tailwind CSS, PDF.js, and Google Gemini API. Implemented document ingestion, contextual question answering, source attribution, automated summarization, and intelligent document analysis features in a responsive SaaS-style interface.
