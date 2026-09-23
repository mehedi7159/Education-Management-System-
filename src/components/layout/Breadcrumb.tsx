import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbItem } from '../../types';

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (href: string) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, onNavigate }) => {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] mb-3 select-none" aria-label="Breadcrumb">
      <button
        onClick={() => onNavigate?.('dashboard')}
        className="flex items-center gap-1 hover:text-[var(--color-primary)] transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
      </button>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-subtle)] shrink-0" />
            {isLast ? (
              <span className="font-semibold text-[var(--color-text-main)] truncate max-w-[200px]">
                {item.label}
              </span>
            ) : (
              <button
                onClick={() => item.href && onNavigate?.(item.href)}
                className="hover:text-[var(--color-primary)] transition-colors truncate max-w-[150px]"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
