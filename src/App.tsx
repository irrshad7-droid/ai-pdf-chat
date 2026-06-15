import { useState, useCallback, useEffect } from 'react';
import { Menu, FileText, Trash2, Settings, AlertTriangle } from 'lucide-react';
import { ErrorBoundary, Button, SettingsModal } from './components/UI';
import { Sidebar } from './components/Sidebar';
import { ChatPanel } from './components/Chat';
import { PDFUploader } from './components/PDF';
import { usePDFProcessor, useChat, useGeminiKey } from './hooks';
import type { QuickAction } from './types';

function AppContent() {
  // State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeQuickAction, setActiveQuickAction] = useState<QuickAction | null>(null);

  // API Key management
  const { apiKey, saveKey, clearKey, hasKey, isLoaded } = useGeminiKey();

  // PDF Processing
  const {
    document,
    isProcessing,
    progress,
    error: pdfError,
    processPDF,
    clearDocument
  } = usePDFProcessor();

  // Chat - pass apiKey explicitly
  const {
    messages,
    isLoading: chatLoading,
    error: chatError,
    suggestedQuestions,
    sendMessage,
    handleQuickAction,
    clearChat
  } = useChat(hasKey ? apiKey : null, document);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    try {
      await processPDF(file);
      setShowUploader(false);
    } catch {
      // Error handled by usePDFProcessor
    }
  }, [processPDF]);

  // Handle question suggestion click
  const handleQuestionSelect = useCallback((question: string) => {
    if (!hasKey) {
      setShowSettings(true);
      return;
    }
    sendMessage(question);
  }, [hasKey, sendMessage]);

  // Handle quick action with tracking
  const handleQuickActionClick = useCallback(async (action: QuickAction) => {
    if (!hasKey) {
      setShowSettings(true);
      return;
    }

    setActiveQuickAction(action);
    try {
      await handleQuickAction(action);
    } finally {
      setActiveQuickAction(null);
    }
  }, [hasKey, handleQuickAction]);

  // Handle upload new
  const handleUploadNew = useCallback(() => {
    setShowUploader(true);
    setSidebarOpen(false);
  }, []);

  // Handle clear document
  const handleClearDocument = useCallback(() => {
    clearDocument();
    clearChat();
  }, [clearDocument, clearChat]);

  // Show uploader on initial load if no document
  useEffect(() => {
    if (!document && !isProcessing && isLoaded) {
      setShowUploader(true);
    }
  }, [document, isProcessing, isLoaded]);

  // Don't render until key state is loaded
  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-dark-950">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-dark-950 text-dark-100">
      {/* No API Key Warning Banner */}
      {!hasKey && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-2">
          <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Gemini API key not configured.</span>
            <button
              onClick={() => setShowSettings(true)}
              className="underline hover:text-yellow-300 font-medium"
            >
              Add API Key
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        document={document}
        suggestedQuestions={suggestedQuestions}
        onQuestionSelect={handleQuestionSelect}
        onQuickAction={handleQuickActionClick}
        onUploadNew={handleUploadNew}
        onClearDocument={handleClearDocument}
        isProcessing={isProcessing}
        isChatLoading={chatLoading}
        activeQuickAction={activeQuickAction}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <main className={`flex-1 flex flex-col min-w-0 ${!hasKey ? 'pt-10' : ''}`}>
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-dark-800 bg-dark-950">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-dark-400 hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-white hidden sm:block">
                AI PDF Chat
              </h1>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Settings button */}
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Settings className="w-4 h-4" />}
              onClick={() => setShowSettings(true)}
              className="text-dark-400 hover:text-white"
            >
              <span className="hidden sm:inline">Settings</span>
            </Button>

            {/* Status indicator */}
            {document && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-dark-400 hidden md:block truncate max-w-[200px]">
                  {document.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`
                    w-2 h-2 rounded-full
                    ${document.status === 'ready' ? 'bg-green-500' : ''}
                    ${document.status === 'processing' ? 'bg-yellow-500 animate-pulse' : ''}
                    ${document.status === 'error' ? 'bg-red-500' : ''}
                  `} />
                </div>

                {/* Clear chat button */}
                {messages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    onClick={clearChat}
                    disabled={chatLoading || !!activeQuickAction}
                    className="text-dark-400 hover:text-white"
                  >
                    <span className="hidden sm:inline">Clear</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Chat area */}
        <ChatPanel
          messages={messages}
          documentLoaded={!!document && document.status === 'ready'}
          isLoading={chatLoading}
          onSendMessage={sendMessage}
        />

        {/* Error display */}
        {(chatError || pdfError) && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40">
            <div className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {chatError || pdfError}
            </div>
          </div>
        )}
      </main>

      {/* PDF Uploader Modal */}
      <PDFUploader
        show={showUploader}
        onClose={() => {
          if (document) {
            setShowUploader(false);
          }
        }}
        onFileSelect={handleFileSelect}
        isLoading={isProcessing}
        progress={progress}
        error={pdfError}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentKey={apiKey}
        onSaveKey={saveKey}
        onClearKey={clearKey}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
