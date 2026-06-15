export interface PDFDocument {
  id: string;
  name: string;
  size: number;
  totalPages: number;
  wordCount: number;
  content: ExtractedPage[];
  status: 'uploading' | 'processing' | 'ready' | 'error';
  error?: string;
  uploadedAt: Date;
}

export interface ExtractedPage {
  pageNumber: number;
  text: string;
  wordCount: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: SourceReference[];
  isTyping?: boolean;
}

export interface SourceReference {
  pageNumber: number;
  excerpt: string;
}

export interface SuggestedQuestion {
  id: string;
  question: string;
  category: 'summary' | 'insights' | 'topics' | 'study' | 'general';
}

export type QuickAction = 'summarize' | 'insights' | 'topics' | 'study';

export interface QuickActionConfig {
  id: QuickAction;
  label: string;
  icon: string;
  prompt: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface AppState {
  document: PDFDocument | null;
  chat: ChatState;
  suggestedQuestions: SuggestedQuestion[];
}
