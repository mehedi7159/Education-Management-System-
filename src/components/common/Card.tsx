import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, hoverEffect = false, className, ...props }) => {
  return (
    <div
      className={cn(
        'bg-[var(--card-bg,var(--color-surface))] border-[length:var(--card-border-width,1px)] border-[var(--color-border)] rounded-[var(--radius-2xl)] p-5 shadow-[var(--card-shadow,var(--shadow-xs))] transition-all duration-200',
        hoverEffect && 'hover:shadow-md hover:border-[var(--color-primary-border)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return (
    <div className={cn('flex items-center justify-between gap-3 pb-3 mb-3 border-b border-[var(--color-border-subtle)]', className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className, ...props }) => {
  return (
    <h3 className={cn('text-base font-bold text-[var(--color-text-main)] tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className, ...props }) => {
  return (
    <p className={cn('text-xs text-[var(--color-text-muted)] mt-0.5', className)} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return (
    <div className={cn('w-full', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return (
    <div className={cn('flex items-center justify-between pt-3 mt-3 border-t border-[var(--color-border-subtle)] text-xs text-[var(--color-text-muted)]', className)} {...props}>
      {children}
    </div>
  );
};
