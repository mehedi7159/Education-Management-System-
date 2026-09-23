import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { toBengaliNumerals } from '../../utils/format';

export const TableContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('w-full overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]', className)}>
      <table className="w-full text-left text-sm border-collapse">{children}</table>
    </div>
  );
};

export const TableHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return <thead className={cn('bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-wider border-b border-[var(--color-border)]', className)}>{children}</thead>;
};

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, className, ...props }) => {
  return <th className={cn('py-3.5 px-4 font-semibold text-[var(--color-text-main)] whitespace-nowrap', className)} {...props}>{children}</th>;
};

export const TableBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return <tbody className={cn('divide-y divide-[var(--color-border-subtle)] text-[var(--color-text-main)]', className)}>{children}</tbody>;
};

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, className, ...props }) => {
  return (
    <tr className={cn('hover:bg-[var(--color-surface-muted)]/50 transition-colors duration-150', className)} {...props}>
      {children}
    </tr>
  );
};

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className, ...props }) => {
  return <td className={cn('py-3.5 px-4 text-sm align-middle whitespace-nowrap', className)} {...props}>{children}</td>;
};

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  locale?: string;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  locale = 'bn',
}) => {
  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] rounded-b-xl">
      <div>
        {locale === 'bn' ? (
          <span>
            সর্বমোট <strong className="text-[var(--color-text-main)]">{toBengaliNumerals(totalItems)}</strong> টির মধ্যে{' '}
            <strong className="text-[var(--color-text-main)]">{toBengaliNumerals(startIdx)}-{toBengaliNumerals(endIdx)}</strong> টি দেখানো হচ্ছে
          </span>
        ) : (
          <span>
            Showing <strong className="text-[var(--color-text-main)]">{startIdx}-{endIdx}</strong> of{' '}
            <strong className="text-[var(--color-text-main)]">{totalItems}</strong> entries
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-3 py-1 font-semibold text-[var(--color-text-main)] rounded-lg bg-[var(--color-surface-muted)]">
          {locale === 'bn' ? `${toBengaliNumerals(currentPage)} / ${toBengaliNumerals(totalPages || 1)}` : `${currentPage} / ${totalPages || 1}`}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
