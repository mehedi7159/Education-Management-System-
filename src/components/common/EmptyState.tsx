import React from 'react';
import { BookOpen, Search, Inbox } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  iconType?: 'book' | 'search' | 'inbox';
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  iconType = 'book',
  className,
}) => {
  const Icon = {
    book: BookOpen,
    search: Search,
    inbox: Inbox,
  }[iconType];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-10 text-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/50',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-light)] border border-[var(--color-primary-border)] flex items-center justify-center text-[var(--color-primary)] mb-4 shadow-xs">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-base font-bold text-[var(--color-text-main)] mb-1">{title}</h4>
      {description && (
        <p className="text-xs text-[var(--color-text-muted)] max-w-sm mb-5 leading-relaxed">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <Button size="sm" variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
