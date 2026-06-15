import { FileUp, FileText } from 'lucide-react';

export function NoDocumentState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="relative">
        <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center">
          <FileUp className="w-10 h-10 text-dark-400" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
          <FileText className="w-4 h-4 text-white" />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-white mt-6 mb-2">
        No Document Uploaded
      </h2>

      <p className="text-dark-400 max-w-sm">
        Upload a PDF document using the button on the left or by dragging and
        dropping a file anywhere on this page.
      </p>
    </div>
  );
}
