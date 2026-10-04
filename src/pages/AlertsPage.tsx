import React, { useState, useMemo, useEffect } from 'react';
import { Card, StatusPill, FruitBadge, EmptyState } from '../components';
import { useSimulation } from '../context/SimulationContext';
import {
  X,
  Clock,
  MapPin,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AlertsPage: React.FC = () => {
  const { alerts, acknowledgeAlert, resolveAlert } = useSimulation();

  // ONLY 3 filter chips as requested: All, Critical, Warning
  const [severityFilter, setSeverityFilter] = useState<'All' | 'Critical' | 'Warning'>('All');

  // Selected alert for inspection drawer
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>('ALT-501');
  const [copiedHash, setCopiedHash] = useState(false);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedAlertId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Active alert being inspected
  const selectedAlert = useMemo(
    () => alerts.find((a) => a.id === selectedAlertId) || null,
    [alerts, selectedAlertId]
  );

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (severityFilter === 'All') return true;
      return alert.severity === severityFilter;
    });
  }, [alerts, severityFilter]);

  // Counts for filter chips
  const totalCount = alerts.length;
  const criticalCount = alerts.filter((a) => a.severity === 'Critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'Warning').length;

  const handleCopyHash = (hash: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-content">
            Consignment Alerts & Audit Events
          </h2>
          <p className="text-xs text-content-muted mt-1">
            Threshold breaches, shock spikes, tamper flags, multi-modal handovers, and maritime offline events
          </p>
        </div>

        {/* Filter Chips: All, Critical, Warning */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSeverityFilter('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              severityFilter === 'All'
                ? 'bg-[#1F4D3A] text-white border-[#1F4D3A] shadow-xs'
                : 'bg-[#FAF7F0] text-content-muted hover:text-content border-border-card'
            }`}
          >
            All ({totalCount})
          </button>

          <button
            type="button"
            onClick={() => setSeverityFilter('Critical')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              severityFilter === 'Critical'
                ? 'bg-[#B94A48] text-white border-[#B94A48] shadow-xs'
                : 'bg-[#FAF7F0] text-content-muted hover:text-content border-border-card'
            }`}
          >
            Critical ({criticalCount})
          </button>

          <button
            type="button"
            onClick={() => setSeverityFilter('Warning')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              severityFilter === 'Warning'
                ? 'bg-[#D9A441] text-white border-[#D9A441] shadow-xs'
                : 'bg-[#FAF7F0] text-content-muted hover:text-content border-border-card'
            }`}
          >
            Warning ({warningCount})
          </button>
        </div>
      </div>

      {/* Simplified Alerts List */}
      <Card padding="none" className="overflow-hidden border-border-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#EFE7D8]/60 border-b border-border-card text-content-muted font-medium uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 w-8">Sev</th>
                <th className="py-3 px-4">Event Title</th>
                <th className="py-3 px-4">Consignment</th>
                <th className="py-3 px-4">Fruit</th>
                <th className="py-3 px-4">Parameter</th>
                <th className="py-3 px-4">Measured vs Limit</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-card/60">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8">
                    <EmptyState
                      title="No alerts found"
                      description="No alerts match the selected severity chip."
                      actionText="Show All Alerts"
                      onAction={() => setSeverityFilter('All')}
                    />
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => {
                  const isSelected = selectedAlertId === alert.id;
                  const sevDotColor =
                    alert.severity === 'Critical'
                      ? 'bg-[#B94A48]'
                      : 'bg-[#D9A441]';

                  return (
                    <tr
                      key={alert.id}
                      tabIndex={0}
                      role="button"
                      aria-label={`Inspect event: ${alert.title}`}
                      onClick={() => setSelectedAlertId(alert.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedAlertId(alert.id);
                        }
                      }}
                      className={`cursor-pointer transition-colors focus-visible:outline-none focus-visible:bg-[#FAF2E4] ${
                        isSelected ? 'bg-[#FAF2E4]/80 hover:bg-[#FAF2E4]' : 'hover:bg-[#F5EFE6]'
                      }`}
                    >
                      {/* Severity Dot */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${sevDotColor}`} />
                      </td>

                      {/* Event Title */}
                      <td className="py-3.5 px-4 font-semibold text-content text-xs">
                        <div className="flex items-center gap-1.5">
                          <span>{alert.title}</span>
                        </div>
                        <div className="text-[11px] text-content-muted font-normal flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-content-subtle" strokeWidth={1.5} />
                          <span className="truncate max-w-[240px]">{alert.location}</span>
                        </div>
                      </td>

                      {/* Consignment */}
                      <td className="py-3.5 px-4 font-mono font-medium text-xs text-primary">
                        {alert.shipmentId}
                      </td>

                      {/* Fruit */}
                      <td className="py-3.5 px-4">
                        <FruitBadge fruit={alert.fruit} size="sm" />
                      </td>

                      {/* Parameter */}
                      <td className="py-3.5 px-4 text-content-muted font-medium">
                        <span className="bg-[#FAF7F0] px-2 py-0.5 rounded border border-border-card text-[11px]">
                          {alert.parameter}
                        </span>
                      </td>

                      {/* Measured vs Limit */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-medium text-xs text-content">
                          <span className={alert.severity === 'Critical' ? 'text-[#B94A48] font-bold' : 'text-[#7D5310] font-semibold'}>
                            {alert.measuredValue}
                          </span>
                          <span className="text-content-muted mx-1">/</span>
                          <span className="text-content-muted text-[11px]">{alert.limitValue}</span>
                        </div>
                      </td>

                      {/* Time */}
                      <td className="py-3.5 px-4 tabular-nums text-content-muted font-mono text-xs whitespace-nowrap">
                        {alert.timestamp}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusPill status={alert.status} size="sm" />
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAlertId(alert.id);
                          }}
                          className="px-2.5 py-1 rounded bg-[#EFE9DD] hover:bg-[#E5DDCE] text-content font-medium text-[11px] inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3 text-content-muted" strokeWidth={1.5} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Slide-Over Detail Drawer */}
      {selectedAlert && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Inspection drawer for alert: ${selectedAlert.title}`}
          className="fixed inset-y-0 right-0 w-full sm:w-[460px] md:w-[500px] bg-[#FBF7F0] border-l border-border-card shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
        >
          {/* Drawer Header */}
          <div className="p-5 border-b border-border-card bg-[#F5EFE6] flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <StatusPill status={selectedAlert.severity} size="sm" />
                <StatusPill status={selectedAlert.status} size="sm" />
                <span className="font-mono text-xs text-content-muted">#{selectedAlert.id}</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-content mt-1.5 leading-snug">
                {selectedAlert.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedAlertId(null)}
              className="p-1.5 rounded-lg text-content-muted hover:text-content hover:bg-[#EBE2D4] transition-colors shrink-0"
              aria-label="Close inspection drawer"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F5EFE6] border border-border-card">
              <div>
                <span className="text-[11px] text-content-muted">Consignment</span>
                <div className="font-mono font-semibold text-content mt-0.5 flex items-center gap-1.5">
                  <span>{selectedAlert.shipmentId}</span>
                  <Link
                    to={`/shipments/${selectedAlert.shipmentId}`}
                    className="text-primary hover:underline text-[11px] flex items-center"
                    title="View cargo consignment details"
                  >
                    <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
                  </Link>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-content-muted">Fruit Consignment</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <FruitBadge fruit={selectedAlert.fruit} size="sm" />
                  <span className="font-medium text-content">{selectedAlert.fruit}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-content-muted">Parameter</span>
                <div className="font-medium text-content mt-0.5">{selectedAlert.parameter}</div>
              </div>

              <div>
                <span className="text-[11px] text-content-muted">Reported Time</span>
                <div className="font-mono text-content mt-0.5">{selectedAlert.timestamp}</div>
              </div>

              <div className="col-span-2 pt-2 border-t border-border-card/60">
                <span className="text-[11px] text-content-muted">Measured vs Tolerance Limit</span>
                <div className="mt-1 flex items-center justify-between font-mono bg-[#FAF2E4] px-3 py-1.5 rounded-lg border border-[#ECD29F]">
                  <span className="font-bold text-[#7D5310]">{selectedAlert.measuredValue}</span>
                  <span className="text-content-muted text-[11px]">Threshold: {selectedAlert.limitValue}</span>
                </div>
              </div>
            </div>

            {/* Acknowledge & Resolve Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => acknowledgeAlert(selectedAlert.id)}
                disabled={selectedAlert.status !== 'Open'}
                className="flex-1 py-2 px-3 rounded-xl border border-border-card text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-[#FAF7F0] hover:bg-[#F2ECE0] text-content"
              >
                Acknowledge Alert
              </button>
              <button
                type="button"
                onClick={() => resolveAlert(selectedAlert.id)}
                disabled={selectedAlert.status === 'Resolved'}
                className="flex-1 py-2 px-3 rounded-xl bg-primary hover:bg-[#347859] text-white text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              >
                Resolve Alert
              </button>
            </div>

            {/* Timeline of the Event */}
            <div className="space-y-2">
              <h4 className="font-serif font-bold text-xs text-content flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-content-muted" strokeWidth={1.5} />
                <span>Incident Chronology</span>
              </h4>
              <div className="p-3 rounded-xl bg-[#F5EFE6] border border-border-card space-y-3 font-sans">
                {selectedAlert.timeline.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 relative">
                    <span className="font-mono text-[10px] text-content-muted shrink-0 w-10 mt-0.5">
                      {step.time}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-content text-[11px]">{step.label}</div>
                      <div className="text-content-muted text-[11px] leading-snug mt-0.5">
                        {step.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cryptographic Ledger Anchor Info */}
            <div className="space-y-2">
              <h4 className="font-serif font-bold text-xs text-content flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                <span>Cryptographic Chain-of-Custody</span>
              </h4>
              <div className="p-3 rounded-xl bg-[#F5EFE6] border border-border-card space-y-2 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-content-muted">Rollup Block:</span>
                  <span className="font-semibold text-content">#{selectedAlert.blockNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-content-muted">Proof Status:</span>
                  <span className="text-primary font-semibold">Anchored on Arbitrum L3</span>
                </div>
                <div className="pt-2 border-t border-border-card/60">
                  <span className="text-content-muted block mb-1">State Hash:</span>
                  <div className="flex items-center justify-between bg-[#FAF7F0] p-1.5 rounded border border-border-card text-[10px]">
                    <span className="text-content truncate">{selectedAlert.recordHash}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyHash(selectedAlert.recordHash)}
                      className="ml-2 text-primary hover:text-[#235841] font-sans font-semibold shrink-0"
                    >
                      {copiedHash ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
