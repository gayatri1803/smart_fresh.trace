import React, { useState, useMemo, useEffect } from 'react';
import { Card, StatusPill, FruitBadge } from '../components';
import { useSimulation } from '../context/SimulationContext';
import {
  ShieldCheck,
  ShieldAlert,
  Printer,
  X,
  FileCheck2,
  Layers,
  Radio,
  Copy,
  Check,
} from 'lucide-react';

interface LedgerBlockDetail {
  blockNumber: number;
  timestamp: string;
  recordsCount: number;
  merkleRoot: string;
  txHash: string;
  status: 'Confirmed';
}

export const ProofOfConditionPage: React.FC = () => {
  const { shipments, selectedShipmentId, setSelectedShipmentId, ledgerBlocks } = useSimulation();

  // Active consignment
  const activeShipment = shipments.find((s) => s.id === selectedShipmentId) || shipments[0];

  // Tamper demo toggle: "Simulate data manipulation"
  const [simulateManipulation, setSimulateManipulation] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Compliance Certificate modal state
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Close certificate modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCertificateModal(false);
      }
    };
    if (showCertificateModal) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [showCertificateModal]);

  // Detailed Ledger Blocks
  const detailedBlocks: LedgerBlockDetail[] = useMemo(() => {
    return ledgerBlocks.map((b, idx) => ({
      blockNumber: b.blockNumber,
      timestamp:
        idx === 0
          ? '2026-09-30 13:42:04 UTC'
          : idx === 1
          ? '2026-09-30 13:36:12 UTC'
          : idx === 2
          ? '2026-09-30 13:28:40 UTC'
          : '2026-09-30 13:14:18 UTC',
      recordsCount: b.recordsCount,
      merkleRoot: `0x${b.txHash.replace('0x', '').slice(0, 10)}...`,
      txHash: b.txHash.length > 20 ? b.txHash : `0x${b.txHash.replace('0x', '')}918237ba5148301cf78`,
      status: 'Confirmed',
    }));
  }, [ledgerBlocks]);

  // Extract custody chain of handovers from active consignment journey
  const custodyHandovers = useMemo(() => {
    if (!activeShipment.journey?.legs) return [];
    return activeShipment.journey.legs
      .filter((l) => l.handoverAfter)
      .map((l) => ({
        legOrder: l.order,
        legMode: l.mode,
        vehicle: l.vehicleLabel,
        handover: l.handoverAfter!,
      }));
  }, [activeShipment]);

  const handleCopy = (hash: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1) The Verified Card (with Status, Consignment Selector, Download Button & Tamper Demo Toggle) */}
      <Card
        padding="lg"
        className={`border-2 transition-all duration-300 ${
          simulateManipulation
            ? 'bg-[#F9ECEC] border-[#B94A48]/50 shadow-md'
            : 'bg-[#F5EFE6] border-[#3F8F6B]/40 shadow-sm'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Status Icon & Title */}
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                simulateManipulation
                  ? 'bg-[#FBEBEB] text-[#B94A48] border-[#E6B8B7]'
                  : 'bg-[#EAF4EF] text-[#235841] border-[#BCDBCB]'
              }`}
            >
              {simulateManipulation ? (
                <ShieldAlert className="w-8 h-8 text-[#B94A48]" strokeWidth={1.5} />
              ) : (
                <ShieldCheck className="w-8 h-8 text-[#235841]" strokeWidth={1.5} />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`font-serif text-2xl font-bold tracking-tight ${
                    simulateManipulation ? 'text-[#B94A48]' : 'text-[#1F4D3A]'
                  }`}
                >
                  {simulateManipulation
                    ? 'Warning: Data Tampering Detected'
                    : 'Log Verified - No tampering detected'}
                </span>
                <StatusPill
                  status={simulateManipulation ? 'Critical' : 'Verified'}
                  label={simulateManipulation ? 'Hash Mismatch' : 'Arbitrum L3 Anchored'}
                  size="sm"
                />
              </div>

              <p className="text-xs text-content-muted mt-1.5 max-w-2xl leading-relaxed">
                {simulateManipulation
                  ? 'Cryptographic integrity failure: on-board rolling hash sequence diverges from the Merkle root anchored on Arbitrum Orbit FoodChain-L3. One or more records were modified outside authorization.'
                  : 'All sensor packets for this consignment are hash-chained on the pallet node, stored in hardware EEPROM, and periodically anchored to Arbitrum Orbit Layer-3 with SHA-256 Merkle roots.'}
              </p>
            </div>
          </div>

          {/* Consignment Selector & Download Certificate Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Consignment selector */}
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-content-muted uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <FruitBadge fruit={activeShipment.fruit} size="sm" />
                <span>Select Consignment</span>
              </span>
              <select
                aria-label="Select consignment for proof of condition verification"
                value={selectedShipmentId}
                onChange={(e) => setSelectedShipmentId(e.target.value)}
                className="bg-[#FBF7F0] border border-border-card rounded-xl px-3 py-2 text-xs text-content font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-2xs"
              >
                {shipments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} - {s.fruit} ({s.origin} to {s.destination})
                  </option>
                ))}
              </select>
            </div>

            {/* Download Compliance Certificate Button */}
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-content-muted uppercase tracking-wider mb-1 opacity-0">
                Action
              </span>
              <button
                type="button"
                onClick={() => setShowCertificateModal(true)}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-[#34785A] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition-all"
              >
                <FileCheck2 className="w-4 h-4" strokeWidth={1.5} />
                <span>Download Certificate</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tamper Demo Toggle */}
        <div className="mt-5 pt-4 border-t border-border-card/60 flex items-center justify-between gap-4 flex-wrap bg-[#FAF5EB] p-3 rounded-xl">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-[#D9A441]" strokeWidth={1.5} />
            <div>
              <span className="text-xs font-bold text-content">Tamper Demo Mode:</span>
              <span className="text-xs text-content-muted ml-1.5">
                Simulate an unauthorized local record modification to test on-chain verification
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-content-muted font-mono">
              {simulateManipulation ? 'Tamper Active' : 'Real Hash-Chain'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={simulateManipulation}
              onClick={() => setSimulateManipulation(!simulateManipulation)}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors focus:outline-none shrink-0 ${
                simulateManipulation ? 'bg-[#B94A48]' : 'bg-[#D9D1C3]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  simulateManipulation ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* 2) Balanced Two-Column Grid: Left = Ledger Blocks List, Right = Custody Chain of Handovers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (6 cols): Ledger Blocks List */}
        <div className="lg:col-span-6 space-y-4">
          <Card
            title="Ledger Blocks"
            subtitle="Immutable batch anchors committed to Arbitrum Orbit / FoodChain-L3"
            headerBorder={true}
            action={
              <div className="flex items-center gap-1.5 text-xs text-content-muted">
                <Layers className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                <span className="font-mono">FoodChain-L3</span>
              </div>
            }
          >
            <div className="overflow-x-auto pt-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#EFE7D8]/60 border-b border-border-card text-content-muted font-medium uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Block #</th>
                    <th className="py-2.5 px-3">Timestamp (UTC)</th>
                    <th className="py-2.5 px-3">Records</th>
                    <th className="py-2.5 px-3">Merkle Root</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-card/60 font-mono">
                  {detailedBlocks.map((blk) => (
                    <tr key={blk.blockNumber} className="hover:bg-[#F5EFE6] transition-colors">
                      <td className="py-3 px-3 font-semibold text-primary">
                        #{blk.blockNumber}
                      </td>
                      <td className="py-3 px-3 text-content-muted tabular-nums font-sans text-[11px]">
                        {blk.timestamp.split(' ')[1]} UTC
                      </td>
                      <td className="py-3 px-3 text-content tabular-nums">
                        {blk.recordsCount}
                      </td>
                      <td className="py-3 px-3 text-content-muted text-[11px]">
                        <span className="bg-[#F0EBE1] px-1.5 py-0.5 rounded border border-border-card/60">
                          {blk.merkleRoot}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-sans">
                        <StatusPill status="Verified" label="Confirmed" size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-border-card/60 flex items-center justify-between text-[11px] text-content-muted">
              <span>Avg Confirmation: 1.2s</span>
              <span className="font-mono">Zero Gas Fees to Exporter</span>
            </div>
          </Card>
        </div>

        {/* Right Column (6 cols): Custody Chain of Handovers */}
        <div className="lg:col-span-6 space-y-4">
          <Card
            title="Custody Chain of Handovers"
            subtitle={`Ordered inter-leg handovers & ledger hashes for Consignment ${activeShipment.id}`}
            headerBorder={true}
            action={
              <span className="text-[11px] font-mono text-content-muted">
                {custodyHandovers.length} Handovers Anchored
              </span>
            }
          >
            <div className="space-y-3 pt-1">
              {custodyHandovers.length === 0 ? (
                <div className="p-4 text-center text-xs text-content-muted">
                  No custody handovers recorded for this consignment yet.
                </div>
              ) : (
                custodyHandovers.map(({ legOrder, legMode, vehicle, handover }) => (
                  <div
                    key={handover.id}
                    className="p-3.5 rounded-xl bg-[#F5EFE6] border border-border-card/80 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FAF2E4] text-[#7D5310] border border-[#ECD29F]">
                          Leg {legOrder} Handover ({legMode} • {vehicle})
                        </span>
                        <span className="font-semibold text-content">{handover.fromParty}</span>
                        <span className="text-content-muted">→</span>
                        <span className="font-semibold text-primary">{handover.toParty}</span>
                      </div>
                      <span className="text-[11px] text-content-muted font-mono">{handover.time}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-[11px] text-content-muted">
                      <span className="truncate">Node: {handover.location}</span>
                      <span className="italic truncate max-w-[200px]">{handover.notes}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-card/60">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] truncate min-w-0">
                        <span className="text-content-muted shrink-0">Ledger Hash:</span>
                        <span className="font-semibold text-accent truncate">{handover.ledgerHash}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(handover.ledgerHash)}
                        className="px-2.5 py-1 rounded bg-[#FAF7F0] hover:bg-[#F2ECE0] text-content border border-border-card text-[10px] font-semibold transition-colors shrink-0 flex items-center gap-1"
                      >
                        {copiedHash === handover.ledgerHash ? (
                          <>
                            <Check className="w-3 h-3 text-primary" strokeWidth={2} />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-content-muted" strokeWidth={1.5} />
                            <span>Copy Hash</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Compliance Certificate Modal */}
      {showCertificateModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cert-modal-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-[#FAF7F0] border border-border-card rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 border-b border-border-card bg-[#F5EFE6] flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-primary" strokeWidth={1.5} />
                <h3 id="cert-modal-title" className="font-serif font-bold text-base text-content">
                  Export Compliance Certificate
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl bg-primary hover:bg-[#34785A] text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCertificateModal(false)}
                  className="p-1.5 rounded-lg text-content-muted hover:text-content hover:bg-[#EAE0D2] transition-colors"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Printable Certificate Document Body */}
            <div className="p-8 space-y-6 text-content font-sans bg-white print:p-0 print:m-0" id="compliance-certificate">
              {/* Certificate Header */}
              <div className="border-b-2 border-[#1F4D3A] pb-4 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#1F4D3A] flex items-center justify-center text-white font-bold text-xs">
                      ST
                    </div>
                    <span className="font-bold text-sm tracking-wider text-[#1F4D3A]">SMARTTRACE COLD-CHAIN</span>
                  </div>
                  <h1 className="font-serif text-2xl font-bold text-content mt-2">
                    Certificate of Condition Integrity
                  </h1>
                  <p className="text-xs text-content-muted mt-0.5">
                    Decentralized Proof-of-Condition (PoC) Phytosanitary & Custody Audit Trail
                  </p>
                </div>

                <div className="text-right font-mono text-xs">
                  <div className="font-bold text-primary">CERTIFIED IMMUTABLE</div>
                  <div className="text-content-muted text-[11px] mt-0.5">ID: CERT-{activeShipment.id}-2026</div>
                  <div className="text-content-muted text-[11px]">Issued: 2026-09-30 UTC</div>
                </div>
              </div>

              {/* Consignment Details Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#FBF7F0] border border-[#E2D9C8] text-xs">
                <div>
                  <span className="text-[10px] text-content-muted uppercase">Consignment ID</span>
                  <div className="font-mono font-bold text-content mt-0.5">{activeShipment.id}</div>
                </div>
                <div>
                  <span className="text-[10px] text-content-muted uppercase">Fruit Type</span>
                  <div className="font-semibold text-content mt-0.5">{activeShipment.fruit}</div>
                </div>
                <div>
                  <span className="text-[10px] text-content-muted uppercase">Origin Terminal</span>
                  <div className="font-semibold text-content mt-0.5">{activeShipment.origin}</div>
                </div>
                <div>
                  <span className="text-[10px] text-content-muted uppercase">Port Destination</span>
                  <div className="font-semibold text-content mt-0.5">{activeShipment.destination}</div>
                </div>
                <div>
                  <span className="text-[10px] text-content-muted uppercase">Carrier / Vessel</span>
                  <div className="font-medium text-content mt-0.5 truncate">{activeShipment.carrier}</div>
                </div>
                <div>
                  <span className="text-[10px] text-content-muted uppercase">Active Vehicle / Leg</span>
                  <div className="font-mono text-content mt-0.5">{activeShipment.currentVehicleLabel || activeShipment.truckId}</div>
                </div>
                <div>
                  <span className="text-[10px] text-content-muted uppercase">Attached Pallet Node</span>
                  <div className="font-mono text-content mt-0.5">{activeShipment.nodeId}</div>
                </div>
                <div>
                  <span className="text-[10px] text-content-muted uppercase">Cargo Volume</span>
                  <div className="font-medium text-content mt-0.5">{activeShipment.cratesCount} Crates ({activeShipment.weightKg} kg)</div>
                </div>
              </div>

              {/* Biological Stability Summary */}
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-sm text-content">
                  Transit Condition & Biological Stability Assessment
                </h3>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-[#BCDBCB] bg-[#EAF4EF]">
                    <div className="text-[10px] text-[#235841] uppercase font-semibold">Thermal Compliance</div>
                    <div className="font-mono font-bold text-base text-[#1F4D3A] mt-0.5">99.8% Safe Hours</div>
                    <div className="text-[10px] text-content-muted mt-1">Mean Temp: {activeShipment.latestReading.temperature.toFixed(1)}°C</div>
                  </div>

                  <div className="p-3 rounded-lg border border-[#BCDBCB] bg-[#EAF4EF]">
                    <div className="text-[10px] text-[#235841] uppercase font-semibold">Ethylene Respiration</div>
                    <div className="font-mono font-bold text-base text-[#1F4D3A] mt-0.5">{activeShipment.latestReading.ethylene.toFixed(2)} ppm</div>
                    <div className="text-[10px] text-content-muted mt-1">Zero premature ripening detected</div>
                  </div>

                  <div className="p-3 rounded-lg border border-[#BCDBCB] bg-[#EAF4EF]">
                    <div className="text-[10px] text-[#235841] uppercase font-semibold">Tamper & Seal State</div>
                    <div className="font-mono font-bold text-base text-[#1F4D3A] mt-0.5">0 Breaches</div>
                    <div className="text-[10px] text-content-muted mt-1">Enclosure remained dark and sealed</div>
                  </div>
                </div>
              </div>

              {/* Cryptographic Ledger Anchors */}
              <div className="p-4 rounded-xl border border-border-card bg-[#FBF7F0] space-y-2 text-xs">
                <div className="font-semibold text-content flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  <span>Cryptographic Anchoring Ledger Data</span>
                </div>

                <div className="space-y-1 font-mono text-[11px] text-content-muted">
                  <div>Rollup Network: Arbitrum Orbit Layer-3 (FoodChain-L3, Chain ID 421614)</div>
                  <div>Anchored Block: #{detailedBlocks[0]?.blockNumber || 1489242}</div>
                  <div className="truncate">Merkle Root: 0xaa412e8091bc2399281746b10294719284729104</div>
                  <div className="truncate">State Hash: {activeShipment.latestReading.currentHash || '0x8f3c719e2ab69018'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProofOfConditionPage;
