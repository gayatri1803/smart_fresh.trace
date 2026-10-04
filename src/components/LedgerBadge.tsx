import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, ExternalLink, Link2 } from 'lucide-react';
import type { LedgerProof } from '../types';

export interface LedgerBadgeProps {
  proof: LedgerProof;
  detailed?: boolean;
  className?: string;
}

export const LedgerBadge: React.FC<LedgerBadgeProps> = ({
  proof,
  detailed = false,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const copyTx = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(proof.txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const truncatedHash = `${proof.txHash.substring(0, 6)}...${proof.txHash.substring(
    proof.txHash.length - 4
  )}`;

  if (!detailed) {
    return (
      <div
        className={`inline-flex items-center gap-2 bg-[#FAF5EB] border border-[#E2D9C8] rounded-full px-3 py-1 text-xs text-content transition-colors duration-150 hover:border-[#3F8F6B] ${className}`}
        title={`Decentralized Ledger Block #${proof.blockNumber} • ${proof.network}`}
      >
        <span className="flex items-center gap-1 text-accent font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Ledger Anchored</span>
        </span>
        <span className="text-border-card">|</span>
        <span className="font-mono text-[11px] text-content-muted tabular-nums">
          Block #{proof.blockNumber}
        </span>
        <button
          onClick={copyTx}
          type="button"
          className="text-content-muted hover:text-content p-0.5 rounded transition-colors"
          title="Copy TX Hash"
        >
          {copied ? <Check className="w-3 h-3 text-accent" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    );
  }

  return (
    <div
      className={`bg-bg-card border border-border-card rounded-[16px] p-4 transition-all duration-200 hover:shadow-soft-hover ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#EAF4EF] text-accent flex items-center justify-center border border-[#BCDBCB]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-content">
                Cryptographic Ledger Anchor
              </h4>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#EAF4EF] text-[#235841] border border-[#BCDBCB]">
                Verified
              </span>
            </div>
            <p className="text-[11px] text-content-muted mt-0.5">
              Network: <span className="font-medium text-content">{proof.network}</span>
            </p>
          </div>
        </div>

        <button
          onClick={copyTx}
          type="button"
          className="inline-flex items-center gap-1 text-xs text-content-muted hover:text-content bg-[#F3ECE1] px-2 py-1 rounded-md transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-accent" />
              <span className="text-[11px] text-accent font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px]">Copy Hash</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="bg-[#F5EFE6] rounded-lg p-2.5 border border-[#E8DEC9]">
          <span className="text-[11px] text-content-muted uppercase tracking-wider block">
            Transaction Hash
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="font-mono text-xs font-medium text-content tabular-nums truncate">
              {truncatedHash}
            </span>
            <ExternalLink className="w-3 h-3 text-content-muted ml-1 shrink-0" />
          </div>
        </div>

        <div className="bg-[#F5EFE6] rounded-lg p-2.5 border border-[#E8DEC9]">
          <span className="text-[11px] text-content-muted uppercase tracking-wider block">
            Block Index
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="font-mono text-xs font-medium text-content tabular-nums">
              #{proof.blockNumber.toLocaleString()}
            </span>
            <span className="text-[10px] text-content-muted font-normal">
              {proof.offlineBlocksChained} offline hashed
            </span>
          </div>
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-border-card/60 flex items-center justify-between text-[11px] text-content-muted">
        <span className="flex items-center gap-1">
          <Link2 className="w-3 h-3 text-accent" />
          <span>Device Hash-Chain: Complete</span>
        </span>
        <span className="tabular-nums text-content-subtle">
          Anchored {proof.timestamp}
        </span>
      </div>
    </div>
  );
};

export default LedgerBadge;
