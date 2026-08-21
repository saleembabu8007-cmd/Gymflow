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
        'w-full bg-white rounded-xl border border-zinc-200/60 overflow-hidden',
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
        'border-b border-zinc-150 bg-zinc-50/70 text-[11px] font-bold uppercase tracking-wider text-zinc-500 select-none',
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
        'transition-colors border-b border-zinc-100/80 last:border-0',
        isHoverable && 'hover:bg-zinc-50/80 group',
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
    right: 'text-right font-mono font-bold text-zinc-950',
  };

  return (
    <Component
      className={cn(
        'py-3.5 px-4',
        alignClasses[align],
        isHeader ? 'py-3 font-bold text-zinc-500' : 'text-zinc-900',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
