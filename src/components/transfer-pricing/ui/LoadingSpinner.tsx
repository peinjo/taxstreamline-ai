import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-2">
        <div className={`animate-spin rounded-full border-b-2 border-primary ${sizeClasses[size]}`}></div>
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    </div>
  );
}