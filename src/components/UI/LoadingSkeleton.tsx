import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-dark-800 rounded';

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  const style = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex gap-3 p-4 animate-slide-up">
      <Skeleton variant="circular" width={32} height={32} />
      <div className="flex-1 space-y-2">
        <Skeleton width="40%" height={16} />
        <Skeleton width="100%" height={12} />
        <Skeleton width="80%" height={12} />
      </div>
    </div>
  );
}

export function DocumentInfoSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton variant="rectangular" height={80} className="w-full" />
      <div className="space-y-2">
        <Skeleton width="60%" height={14} />
        <Skeleton width="80%" height={14} />
        <Skeleton width="50%" height={14} />
      </div>
    </div>
  );
}

export function QuickActionsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={40} className="w-full" />
      ))}
    </div>
  );
}
