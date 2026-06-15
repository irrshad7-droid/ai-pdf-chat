export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function validatePDFFile(file: File): { valid: boolean; error?: string } {
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_TYPES = ['application/pdf'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Please upload a PDF file' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size must be less than 50MB' };
  }

  return { valid: true };
}

export function extractRelevantPages(
  query: string,
  pages: { pageNumber: number; text: string }[],
  maxPages: number = 5
): { pageNumber: number; text: string }[] {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const pageScores = pages.map(page => {
    const pageText = page.text.toLowerCase();
    let score = 0;
    queryWords.forEach(word => {
      const matches = pageText.split(word).length - 1;
      score += matches;
    });
    return { ...page, score };
  });

  return pageScores
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxPages)
    .map(({ score, ...page }) => page);
}

export function chunkTextForContext(
  text: string,
  maxTokens: number = 30000
): string {
  // Roughly 4 characters per token, leave buffer for prompt
  const maxChars = maxTokens * 4 * 0.8;
  if (text.length <= maxChars) return text;

  // Return truncated text with note
  return text.substring(0, maxChars) + '\n\n[Document content truncated due to length...]';
}
