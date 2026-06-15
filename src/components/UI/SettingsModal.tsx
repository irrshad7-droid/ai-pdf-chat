import { useState } from 'react';
import { X, Key, ExternalLink, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import Button from './Button';
import { cn } from '../../utils/cn';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey: string;
  onSaveKey: (key: string) => void;
  onClearKey: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  currentKey,
  onSaveKey,
  onClearKey
}: SettingsModalProps) {
  const [inputKey, setInputKey] = useState(currentKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveKey(inputKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    setInputKey('');
    onClearKey();
  };

  const hasChanges = inputKey !== currentKey;
  const isValidKey = inputKey.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className={cn(
          'w-full max-w-md',
          'bg-dark-900 border border-dark-700 rounded-xl',
          'animate-slide-up'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-800">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-dark-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* API Key Section */}
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={e => setInputKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className={cn(
                  'w-full px-4 py-3 pr-12',
                  'bg-dark-800 border border-dark-700 rounded-lg',
                  'text-white placeholder-dark-500',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  'transition-all duration-200',
                  'font-mono text-sm'
                )}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
              >
                {showKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-2 mt-2">
              {inputKey.trim() ? (
                saved ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">Key saved!</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-dark-400">
                      {hasChanges ? 'Key configured (unsaved)' : 'Key configured'}
                    </span>
                  </>
                )
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-dark-400">No key configured</span>
                </>
              )}
            </div>
          </div>

          {/* Help text */}
          <div className="p-3 bg-dark-800/50 rounded-lg border border-dark-700">
            <p className="text-sm text-dark-400">
              Get your free Gemini API key from{' '}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 inline-flex items-center gap-1"
              >
                Google AI Studio
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-dark-800">
          <Button
            variant="ghost"
            onClick={handleClear}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            Clear Key
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!isValidKey}
            >
              {saved ? 'Saved!' : 'Save Key'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
