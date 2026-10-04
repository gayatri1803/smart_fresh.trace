import React from 'react';
import Card from './Card';

export interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: {
    text: string;
    trend?: 'up' | 'down' | 'neutral';
    sentiment?: 'positive' | 'warning' | 'negative' | 'neutral';
  };
  subtitle?: string;
  icon?: React.ReactNode;
  iconBg?: 'green' | 'amber' | 'red' | 'teal' | 'neutral';
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  unit,
  delta,
  subtitle,
  icon,
  iconBg = 'neutral',
  className = '',
}) => {
  const iconColorMap = {
    green: 'bg-[#EAF4EF] text-[#3F8F6B] border-[#BCDBCB]',
    amber: 'bg-[#FAF2E4] text-[#D9A441] border-[#ECD29F]',
    red: 'bg-[#F9ECEC] text-[#B94A48] border-[#E6B8B7]',
    teal: 'bg-[#EBF2F4] text-[#4F7C8A] border-[#BFD5DC]',
    neutral: 'bg-[#F0EBE1] text-[#7A7367] border-[#DDD5C5]',
  }[iconBg];

  const deltaSentimentStyles = {
    positive: 'bg-[#EAF4EF] text-[#235841] border-[#BCDBCB]',
    warning: 'bg-[#FAF2E4] text-[#7D5310] border-[#ECD29F]',
    negative: 'bg-[#F9ECEC] text-[#7C2725] border-[#E6B8B7]',
    neutral: 'bg-[#F0EBE1] text-[#5C564C] border-[#DDD5C5]',
  }[delta?.sentiment || 'neutral'];

  return (
    <Card padding="md" className={`flex flex-col justify-between ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-wider text-content-muted">
          {label}
        </span>
        {icon && (
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${iconColorMap}`}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-semibold text-content tabular-nums tracking-tight">
            {value}
          </span>
          {unit && (
            <span className="text-sm font-medium text-content-muted">
              {unit}
            </span>
          )}
        </div>

        {(delta || subtitle) && (
          <div className="mt-2 flex items-center flex-wrap gap-2 text-xs">
            {delta && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium tabular-nums ${deltaSentimentStyles}`}
              >
                {delta.trend === 'up' && <span>↑</span>}
                {delta.trend === 'down' && <span>↓</span>}
                {delta.text}
              </span>
            )}
            {subtitle && (
              <span className="text-content-muted truncate text-xs">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default KpiCard;
