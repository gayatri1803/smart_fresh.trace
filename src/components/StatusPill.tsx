import React from 'react';
import type { RiskLevel, ConnectionStatus, ShipmentStatus, LedgerStatus } from '../types';

export type StatusType =
  | RiskLevel
  | ConnectionStatus
  | ShipmentStatus
  | LedgerStatus
  | 'Normal'
  | 'Warning'
  | 'Critical'
  | 'Syncing'
  | 'Anchored'
  | 'Encrypted'
  | 'Offline Queue';

export interface StatusPillProps {
  status: StatusType | string;
  label?: string;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  label,
  size = 'md',
  showDot = true,
  className = '',
  icon,
}) => {
  const normalized = status.trim().toLowerCase();

  // Define calm, tinted styling matching design requirements (no neon, no gradients)
  let colorStyles = {
    bg: 'bg-[#F0EBE1]',
    text: 'text-[#5C564C]',
    border: 'border-[#DDD5C5]',
    dot: 'bg-[#7A7367]',
  };

  if (
    normalized === 'low' ||
    normalized === 'online' ||
    normalized === 'delivered' ||
    normalized === 'anchored' ||
    normalized === 'verified' ||
    normalized === 'normal' ||
    normalized === 'encrypted' ||
    normalized === 'resolved'
  ) {
    // Green accent tint
    colorStyles = {
      bg: 'bg-[#EAF4EF]',
      text: 'text-[#235841]',
      border: 'border-[#BCDBCB]',
      dot: 'bg-[#3F8F6B]',
    };
  } else if (
    normalized === 'medium' ||
    normalized === 'at risk' ||
    normalized === 'warning' ||
    normalized === 'pending' ||
    normalized === 'offline queue' ||
    normalized === 'acknowledged'
  ) {
    // Amber warning tint
    colorStyles = {
      bg: 'bg-[#FAF2E4]',
      text: 'text-[#7D5310]',
      border: 'border-[#ECD29F]',
      dot: 'bg-[#D9A441]',
    };
  } else if (
    normalized === 'high' ||
    normalized === 'critical' ||
    normalized === 'tampered' ||
    normalized === 'open'
  ) {
    // Muted red critical tint
    colorStyles = {
      bg: 'bg-[#F9ECEC]',
      text: 'text-[#7C2725]',
      border: 'border-[#E6B8B7]',
      dot: 'bg-[#B94A48]',
    };
  } else if (
    normalized === 'in transit' ||
    normalized === 'restored' ||
    normalized === 'syncing' ||
    normalized === 'info'
  ) {
    // Slate-teal info tint
    colorStyles = {
      bg: 'bg-[#EBF2F4]',
      text: 'text-[#28505B]',
      border: 'border-[#BFD5DC]',
      dot: 'bg-[#4F7C8A]',
    };
  } else if (normalized === 'offline') {
    // Neutral offline tint
    colorStyles = {
      bg: 'bg-[#EFEAE1]',
      text: 'text-[#625C51]',
      border: 'border-[#D9D1C3]',
      dot: 'bg-[#8F877A]',
    };
  }

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium leading-none tracking-tight',
    md: 'text-xs px-2.5 py-1 font-medium leading-none tracking-normal',
  }[size];

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${colorStyles.bg} ${colorStyles.text} ${colorStyles.border} ${sizeStyles} ${className}`}
    >
      {showDot && (
        <span
          className={`shrink-0 rounded-full ${colorStyles.dot} ${dotSizes} ${
            normalized === 'syncing' ? 'animate-pulse' : ''
          }`}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="tabular-nums">{label || status}</span>
    </span>
  );
};

export default StatusPill;
