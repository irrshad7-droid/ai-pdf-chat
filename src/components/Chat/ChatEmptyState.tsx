import { BookOpen } from 'lucide-react';

export function ChatEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 bg-gradient-to-br from-primary-500/20 to-primary-700/20 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
        <BookOpen className="w-12 h-12 text-primary-400" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">
        AI PDF Chat Assistant
      </h2>

      <p className="text-dark-400 max-w-md mb-8">
        Upload a PDF document and start asking questions. I'll help you
        understand, summarize, and extract insights from your documents.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
        {[
          { title: 'Ask Questions', desc: 'Get answers from your document' },
          { title: 'Summarize', desc: 'Get key points quickly' },
          { title: 'Extract Insights', desc: 'Find important information' }
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-4 bg-dark-800/50 rounded-xl border border-dark-700"
          >
            <h3 className="font-medium text-white mb-1">{item.title}</h3>
            <p className="text-sm text-dark-400">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
