import React from 'react';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  headerBorder?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  headerBorder = false,
  padding = 'md',
  className = '',
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  }[padding];

  const hasHeader = Boolean(title || subtitle || action);

  return (
    <div
      className={`bg-bg-card border border-border-card rounded-[16px] transition-shadow duration-200 hover:shadow-soft-hover ${className}`}
      {...props}
    >
      {hasHeader && (
        <div
          className={`flex items-start justify-between gap-4 ${
            headerBorder ? 'border-b border-border-card' : ''
          } ${padding === 'none' ? 'p-5' : paddingClasses} pb-3`}
        >
          <div>
            {title && (
              <h3 className="font-serif text-lg font-semibold text-content leading-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs font-normal text-content-muted mt-1 leading-normal">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={hasHeader ? (padding === 'none' ? '' : `${paddingClasses} pt-2`) : paddingClasses}>
        {children}
      </div>
    </div>
  );
};

export default Card;
