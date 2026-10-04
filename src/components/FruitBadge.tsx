import React from 'react';
import type { FruitType } from '../types';

export interface FruitBadgeProps {
  fruit: FruitType | string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

interface FruitColorStyle {
  bg: string;
  text: string;
  border: string;
  letter: string;
}

const FRUIT_STYLES: Record<string, FruitColorStyle> = {
  'Mango': {
    bg: 'bg-[#F6EBD4]',
    text: 'text-[#8C5E14]',
    border: 'border-[#E8CE96]',
    letter: 'M',
  },
  'Banana': {
    bg: 'bg-[#F8F2D5]',
    text: 'text-[#826912]',
    border: 'border-[#EAD895]',
    letter: 'B',
  },
  'Grapes': {
    bg: 'bg-[#F0EAF5]',
    text: 'text-[#5C3D75]',
    border: 'border-[#D6C4E2]',
    letter: 'G',
  },
  'Apple': {
    bg: 'bg-[#F9E8E8]',
    text: 'text-[#872D2D]',
    border: 'border-[#E7BFBF]',
    letter: 'A',
  },
  'Avocado': {
    bg: 'bg-[#EBF1E8]',
    text: 'text-[#365A2C]',
    border: 'border-[#BFD5BA]',
    letter: 'Av',
  },
  'Citrus': {
    bg: 'bg-[#F8ECE0]',
    text: 'text-[#8C4F1A]',
    border: 'border-[#EBCDB1]',
    letter: 'C',
  },
  'Blueberries': {
    bg: 'bg-[#E8EDF5]',
    text: 'text-[#2D4D75]',
    border: 'border-[#BFCDE0]',
    letter: 'Bl',
  },
  'Strawberries': {
    bg: 'bg-[#F8E8EB]',
    text: 'text-[#872D3D]',
    border: 'border-[#E5BEC5]',
    letter: 'S',
  },
};

export const FruitBadge: React.FC<FruitBadgeProps> = ({
  fruit,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const style = FRUIT_STYLES[fruit] || {
    bg: 'bg-[#EFEAE1]',
    text: 'text-[#5C564C]',
    border: 'border-[#D9D1C3]',
    letter: fruit.charAt(0).toUpperCase(),
  };

  const badgeSizeClasses = {
    sm: 'w-5 h-5 text-[10px]',
    md: 'w-6 h-6 text-[11px]',
    lg: 'w-8 h-8 text-xs',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`inline-flex items-center justify-center font-bold font-mono rounded-md border shrink-0 select-none ${badgeSizeClasses} ${style.bg} ${style.text} ${style.border}`}
        title={fruit}
      >
        {style.letter}
      </span>
      {showLabel && (
        <span className="font-medium text-content text-xs">{fruit}</span>
      )}
    </div>
  );
};

export default FruitBadge;
