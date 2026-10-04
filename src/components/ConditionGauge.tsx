import React from 'react';

export interface GaugeZone {
  min: number;
  max: number;
  label: string;
  type: 'safe' | 'warning' | 'critical';
}

export interface ConditionGaugeProps {
  title: string;
  currentValue: number;
  unit: string;
  min: number;
  max: number;
  safeMin: number;
  safeMax: number;
  warningMax?: number;
  criticalMax?: number;
  fruitContext?: string;
  className?: string;
}

export const ConditionGauge: React.FC<ConditionGaugeProps> = ({
  title,
  currentValue,
  unit,
  min,
  max,
  safeMin,
  safeMax,
  warningMax,
  criticalMax,
  fruitContext,
  className = '',
}) => {
  // Clamp current value for gauge percentage calculation
  const totalRange = max - min || 1;
  const clampedValue = Math.min(Math.max(currentValue, min), max);
  const pointerPct = Math.round(((clampedValue - min) / totalRange) * 100);

  // Calculate zone percentages
  const safeLeftPct = Math.max(0, Math.min(100, ((safeMin - min) / totalRange) * 100));
  const safeWidthPct = Math.max(0, Math.min(100 - safeLeftPct, ((safeMax - safeMin) / totalRange) * 100));

  // Determine current status state
  let currentZone: 'safe' | 'warning' | 'critical' = 'safe';
  let zoneLabel = 'Optimal Safe Zone';

  if (currentValue < safeMin || currentValue > safeMax) {
    if (warningMax !== undefined && currentValue <= warningMax) {
      currentZone = 'warning';
      zoneLabel = 'Caution: Slight Excursion';
    } else if (criticalMax !== undefined && currentValue > criticalMax) {
      currentZone = 'critical';
      zoneLabel = 'Critical: Severe Breach';
    } else {
      currentZone = 'critical';
      zoneLabel = 'Critical: Excursion Alert';
    }
  }

  const zoneBadgeStyle = {
    safe: 'bg-[#EAF4EF] text-[#235841] border-[#BCDBCB]',
    warning: 'bg-[#FAF2E4] text-[#7D5310] border-[#ECD29F]',
    critical: 'bg-[#F9ECEC] text-[#7C2725] border-[#E6B8B7]',
  }[currentZone];

  const markerColor = {
    safe: 'bg-[#3F8F6B] border-[#275B44]',
    warning: 'bg-[#D9A441] border-[#8F661B]',
    critical: 'bg-[#B94A48] border-[#7C2725]',
  }[currentZone];

  return (
    <div
      className={`bg-bg-card border border-border-card rounded-[16px] p-5 transition-all duration-200 hover:shadow-soft-hover ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-serif text-base font-semibold text-content leading-tight">
            {title}
          </h4>
          {fruitContext && (
            <p className="text-xs text-content-muted mt-0.5">
              Protocol: <span className="font-medium text-content">{fruitContext}</span>
            </p>
          )}
        </div>
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-full border tabular-nums ${zoneBadgeStyle}`}
        >
          {zoneLabel}
        </span>
      </div>

      {/* Main Metric Value & Optimal Spec */}
      <div className="mt-4 flex items-baseline justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-semibold text-content tabular-nums tracking-tight">
            {currentValue.toFixed(1)}
          </span>
          <span className="text-sm font-medium text-content-muted">{unit}</span>
        </div>
        <div className="text-right">
          <span className="text-[11px] uppercase tracking-wider text-content-muted block">
            Target Target Window
          </span>
          <span className="text-xs font-semibold text-content tabular-nums">
            {safeMin} – {safeMax} {unit}
          </span>
        </div>
      </div>

      {/* Precision Track Gauge (Calm, flat, no gradients, no neon) */}
      <div className="mt-4 pt-1">
        <div className="relative w-full h-3 rounded-full bg-[#E8E1D5] overflow-hidden">
          {/* Safe Zone Highlight Band */}
          <div
            className="absolute top-0 bottom-0 bg-[#A6D4BD]"
            style={{
              left: `${safeLeftPct}%`,
              width: `${safeWidthPct}%`,
            }}
            title="Safe Threshold Zone"
          />

          {/* Warning Sub-band if present */}
          {warningMax !== undefined && (
            <div
              className="absolute top-0 bottom-0 bg-[#F2DCB3]"
              style={{
                left: `${safeLeftPct + safeWidthPct}%`,
                width: `${Math.max(0, Math.min(100 - (safeLeftPct + safeWidthPct), ((warningMax - safeMax) / totalRange) * 100))}%`,
              }}
              title="Warning Threshold Zone"
            />
          )}
        </div>

        {/* Needle Marker Indicator */}
        <div className="relative w-full h-4 mt-1">
          <div
            className="absolute -top-3 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
            style={{ left: `${pointerPct}%` }}
          >
            {/* Arrow Pin */}
            <div
              className={`w-3.5 h-3.5 rounded-full border-2 shadow-sm ${markerColor}`}
            />
            <div className="w-0.5 h-2 bg-content" />
          </div>
        </div>

        {/* Range Legend */}
        <div className="flex justify-between items-center text-[11px] text-content-muted tabular-nums mt-0.5">
          <span>{min} {unit}</span>
          <span className="text-accent font-medium">Safe ({safeMin}–{safeMax} {unit})</span>
          <span>{max} {unit}</span>
        </div>
      </div>
    </div>
  );
};

export default ConditionGauge;
