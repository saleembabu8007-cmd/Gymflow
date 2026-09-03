import React from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '../../utils/classNames';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'default' | 'subtle' | 'brand' | 'danger';
  external?: boolean;
  children: React.ReactNode;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      href,
      onClick,
      variant = 'default',
      external = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default: 'text-neutral-900 hover:text-neutral-950 underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900',
      subtle: 'text-neutral-500 hover:text-neutral-800 underline underline-offset-4 decoration-neutral-200 hover:decoration-neutral-600',
      brand: 'text-neutral-900 font-semibold hover:underline underline-offset-4 decoration-[var(--color-brand-500)]',
      danger: 'text-[var(--color-danger-600)] hover:text-[var(--color-danger-700)] underline underline-offset-4 decoration-[var(--color-danger-300)]',
    };

    return (
      <a
        ref={ref}
        href={href}
        onClick={onClick}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={cn(
          'inline-flex items-center gap-1 font-medium text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 rounded-[var(--radius-xs)] cursor-pointer select-none',
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <span>{children}</span>
        {external && <ExternalLink className="w-3 h-3 stroke-[2] shrink-0 opacity-70" />}
      </a>
    );
  }
);

Link.displayName = 'Link';
