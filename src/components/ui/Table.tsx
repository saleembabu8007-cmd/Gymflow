import React from 'react';
import { cn } from '../../utils/classNames';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
  containerClassName?: string;
}

export const Table: React.FC<TableProps> = ({ children, className, containerClassName, ...props }) => {
  return (
    <div
      className={cn(
        'w-full bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden',
        containerClassName
      )}
    >
      <table className={cn('w-full text-left border-collapse text-xs', className)} {...props}>
        {children}
      </table>
    </div>
  );
};

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className, ...props }) => {
  return (
    <thead
      className={cn(
        'border-b border-neutral-100 bg-neutral-50/50 text-[11px] font-bold uppercase tracking-wider text-neutral-400 select-none',
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
};

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  isHoverable?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({
  children,
  className,
  isHoverable = true,
  ...props
}) => {
  return (
    <tr
      className={cn(
        'transition-colors border-b border-neutral-100 last:border-0',
        isHoverable && 'hover:bg-neutral-50/70 group',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
};

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  isHeader?: boolean;
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  className,
  align = 'left',
  isHeader = false,
  ...props
}) => {
  const Component = isHeader ? 'th' : 'td';
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right font-mono',
  };

  return (
    <Component
      className={cn(
        'py-3 px-4',
        alignClasses[align],
        isHeader ? 'py-3 font-bold' : 'text-neutral-900',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
