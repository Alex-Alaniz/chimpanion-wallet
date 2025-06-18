import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        
        // Variants
        {
          'default': 'bg-blue-500 text-white hover:bg-blue-600',
          'outline': 'border border-gray-300 bg-transparent hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800',
          'ghost': 'hover:bg-gray-100 dark:hover:bg-gray-800',
          'destructive': 'bg-red-500 text-white hover:bg-red-600',
        }[variant],
        
        // Sizes
        {
          'sm': 'h-8 px-3 text-sm',
          'md': 'h-10 px-4 text-sm',
          'lg': 'h-12 px-6 text-base',
        }[size],
        
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
} 