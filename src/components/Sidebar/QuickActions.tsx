import { Sparkles, Target, ListTree, GraduationCap, Loader2, type LucideIcon } from 'lucide-react';
import type { QuickAction } from '../../types';
import { cn } from '../../utils/cn';

interface QuickActionData {
  id: QuickAction;
  label: string;
  icon: LucideIcon;
  color: string;
}

const QUICK_ACTIONS: QuickActionData[] = [
  { id: 'summarize', label: 'Summarize', icon: Sparkles, color: 'text-amber-400 bg-amber-400/10' },
  { id: 'insights', label: 'Key Insights', icon: Target, color: 'text-emerald-400 bg-emerald-400/10' },
  { id: 'topics', label: 'Topics', icon: ListTree, color: 'text-violet-400 bg-violet-400/10' },
  { id: 'study', label: 'Study Notes', icon: GraduationCap, color: 'text-blue-400 bg-blue-400/10' }
];

interface QuickActionsProps {
  onAction: (action: QuickAction) => void;
  disabled?: boolean;
  activeAction?: QuickAction | null;
}

export function QuickActions({ onAction, disabled, activeAction }: QuickActionsProps) {
  return (
    <div className="space-y-3 animate-slide-in-left" style={{ animationDelay: '100ms' }}>
      <h4 className="text-xs font-medium text-dark-400 uppercase tracking-wider">
        Quick Actions
      </h4>

      <div className="grid grid-cols-1 gap-2">
        {QUICK_ACTIONS.map(action => {
          const Icon = action.icon;
          const isActive = activeAction === action.id;
          const isDisabled = disabled || (!!activeAction && !isActive);

          return (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              disabled={isDisabled}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg transition-all duration-200',
                'text-left',
                isActive
                  ? 'bg-primary-600/20 border-2 border-primary-500'
                  : 'bg-dark-800 hover:bg-dark-700 border border-dark-700',
                isDisabled && !isActive && 'opacity-50 cursor-not-allowed hover:bg-dark-800'
              )}
            >
              <div className={cn('p-2 rounded-md', isActive ? 'bg-primary-500/20 text-primary-400' : action.color)}>
                {isActive ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span className={cn(
                'text-sm transition-colors',
                isActive ? 'text-primary-400 font-medium' : 'text-dark-200 group-hover:text-white'
              )}>
                {action.label}
                {isActive && <span className="text-xs ml-2 text-dark-400">Processing...</span>}
              </span>
            </button>
          );
        })}
      </div>

      {disabled && !activeAction && (
        <p className="text-xs text-dark-500 text-center pt-1">
          Wait for current request to complete
        </p>
      )}
    </div>
  );
}
