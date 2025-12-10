import React from 'react';
import { cn } from '../lib/utils';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-gold hover:bg-gold-light text-charcoal font-semibold',
      secondary: 'bg-charcoal-light hover:bg-charcoal-lighter text-gold border border-gold/20',
      outline: 'bg-transparent border border-gold text-gold hover:bg-gold hover:text-charcoal',
      danger: 'bg-red-900/50 border border-red-500 text-red-200 hover:bg-red-900',
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border border-charcoal-lighter bg-charcoal-light px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export const Label = ({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gold-dim mb-1 block", className)} {...props}>
        {children}
    </label>
);

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("rounded-lg border border-charcoal-lighter bg-charcoal-light p-6 shadow-sm", className)} {...props}>
    {children}
  </div>
);

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'warning' | 'error';
    children?: React.ReactNode;
    className?: string;
}

export const Badge = ({ children, className, variant = 'default', ...props }: BadgeProps) => {
    const variants = {
        default: 'bg-charcoal-lighter text-gray-300',
        success: 'bg-green-900/30 text-green-400 border border-green-800',
        warning: 'bg-yellow-900/30 text-yellow-400 border border-yellow-800',
        error: 'bg-red-900/30 text-red-400 border border-red-800',
    }
    return (
        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", variants[variant], className)} {...props}>
            {children}
        </span>
    )
}

export const PageHeader = ({ title, subtitle, action }: { title: string, subtitle?: string, action?: React.ReactNode }) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
            <h1 className="text-3xl font-serif text-gold">{title}</h1>
            {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
    </div>
)