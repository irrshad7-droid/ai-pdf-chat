import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        'bg-primary-600 hover:bg-primary-700 text-white shadow-sm focus:ring-primary-500',
      secondary:
        'bg-dark-800 hover:bg-dark-700 text-dark-200 border border-dark-700 focus:ring-dark-500',
      ghost: 'bg-transparent hover:bg-dark-800 text-dark-300 hover:text-white',
      danger:
        'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500'
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base'
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-950',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
