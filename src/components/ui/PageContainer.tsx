import React from 'react';
import { PageHeader, PageHeaderProps } from './PageHeader';
import { cn } from '../../utils/classNames';

export interface PageContainerProps extends Omit<PageHeaderProps, 'className'> {
  children: React.ReactNode;
  containerClassName?: string;
  headerClassName?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '6xl' | '7xl' | 'full';
  showBack?: boolean;
}

const maxWidthMap = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  badge,
  actions,
  onBack,
  children,
  containerClassName,
  headerClassName,
  maxWidth = '7xl',
}) => {
  return (
    <div className={cn('w-full mx-auto space-y-6', maxWidthMap[maxWidth], containerClassName)}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        badge={badge}
        actions={actions}
        onBack={onBack}
        className={headerClassName}
      />
      <div className="w-full">{children}</div>
    </div>
  );
};
