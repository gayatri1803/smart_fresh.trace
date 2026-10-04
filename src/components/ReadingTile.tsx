import React from 'react';
import StatusPill from './StatusPill';

export interface ReadingTileProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  status?: 'Normal' | 'Warning' | 'Critical';
  thresholdText?: string;
  secondaryValue?: string;
  lastUpdated?: string;
  className?: string;
  alertNote?: string;
}

export const ReadingTile: React.FC<ReadingTileProps> = ({
  label,
  value,
  unit,
  icon,
  status = 'Normal',
  thresholdText,
  secondaryValue,
  lastUpdated,
  className = '',
  alertNote,
}) => {
  const statusBorderMap = {
    Normal: 'border-border-card hover:border-[#BCDBCB]',
    Warning: 'border-[#ECD29F] bg-[#FCF9F2]',
    Critical: 'border-[#E6B8B7] bg-[#FDF7F7]',
  }[status];

  const iconColorMap = {
    Normal: 'text-accent bg-[#EAF4EF]',
    Warning: 'text-warning bg-[#FAF2E4]',
    Critical: 'text-critical bg-[#F9ECEC]',
  }[status];

  return (
    <div
      className={`bg-bg-card border rounded-[16px] p-4 transition-all duration-200 hover:shadow-soft-hover flex flex-col justify-between ${statusBorderMap} ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconColorMap}`}
          >
            {icon}
          </div>
          <span className="text-xs font-semibold text-content truncate uppercase tracking-wider">
            {label}
          </span>
        </div>
        <StatusPill status={status} size="sm" showDot={true} />
      </div>

      {/* Main Metric Value */}
      <div className="my-3">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-2xl font-semibold text-content tabular-nums tracking-tight">
            {value}
          </span>
          {unit && (
            <span className="text-sm font-medium text-content-muted">
              {unit}
            </span>
          )}
          {secondaryValue && (
            <span className="text-xs text-content-subtle ml-1 font-mono">
              ({secondaryValue})
            </span>
          )}
        </div>

        {alertNote && (
          <p className="mt-1 text-xs font-medium text-critical leading-tight">
            {alertNote}
          </p>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-border-card/60 flex items-center justify-between text-[11px] text-content-muted">
        {thresholdText ? (
          <span className="truncate tabular-nums">
            Target: <span className="text-content font-medium">{thresholdText}</span>
          </span>
        ) : (
          <span className="italic">Standard operational range</span>
        )}

        {lastUpdated && (
          <span className="shrink-0 text-content-subtle tabular-nums ml-2">
            {lastUpdated}
          </span>
        )}
      </div>
    </div>
  );
};

export default ReadingTile;
