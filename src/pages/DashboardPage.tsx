import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, StatusPill, KpiCard, FruitBadge } from '../components';
import { useSimulation } from '../context/SimulationContext';
import {
  Truck,
  Ship,
  Anchor,
  Building2,
  Leaf,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  Radio,
  WifiOff,
  RefreshCw,
  ArrowRight,
  Clock,
  Shield,
} from 'lucide-react';
import type { ShipmentItem, JourneyMode } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    shipments,
    connectionStatus,
    toggleConnectivityLoss,
    selectedFruit,
    ledgerBlocks,
    setSelectedShipmentId,
  } = useSimulation();

  // Filter shipments based on selected fruit filter
  const displayedShipments = useMemo(() => {
    if (selectedFruit === 'All fruits') return shipments;
    return shipments.filter((s) => s.fruit.toLowerCase().includes(selectedFruit.toLowerCase()));
  }, [shipments, selectedFruit]);

  const handleRowClick = (shipment: ShipmentItem) => {
    setSelectedShipmentId(shipment.id);
    navigate(`/shipments/${shipment.id}`);
  };

  // Helper for condition score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-[#235841] bg-[#EAF4EF] border-[#BCDBCB]';
    if (score >= 70) return 'text-[#7D5310] bg-[#FAF2E4] border-[#ECD29F]';
    return 'text-[#7C2725] bg-[#F9ECEC] border-[#E6B8B7]';
  };

  // Helper for mode icons and badges
  const renderModeBadge = (mode?: JourneyMode) => {
    switch (mode) {
      case 'Ship':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#E8EEF5] text-[#244569] border border-[#BFD1E5]">
            <Ship className="w-2.5 h-2.5" strokeWidth={1.5} />
            <span>Ship</span>
          </span>
        );
      case 'Port':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#EBF2F4] text-[#28505B] border border-[#BFD5DC]">
            <Anchor className="w-2.5 h-2.5" strokeWidth={1.5} />
            <span>Port</span>
          </span>
        );
      case 'Warehouse':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#F0EBE1] text-[#5C5549] border border-[#D5CBBC]">
            <Building2 className="w-2.5 h-2.5" strokeWidth={1.5} />
            <span>Warehouse</span>
          </span>
        );
      case 'Farm':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#EAF4EF] text-[#235841] border border-[#BCDBCB]">
            <Leaf className="w-2.5 h-2.5" strokeWidth={1.5} />
            <span>Farm</span>
          </span>
        );
      case 'Truck':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#F5EFE6] text-[#695D4B] border border-[#DCD2C1]">
            <Truck className="w-2.5 h-2.5" strokeWidth={1.5} />
            <span>Truck</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1) Full-Width Connectivity Banner */}
      <div
        className={`w-full rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${
          connectionStatus === 'ONLINE via LTE-M'
            ? 'bg-[#EAF4EF] border-[#BCDBCB] text-[#235841]'
            : connectionStatus === 'OFFLINE - logging on device'
            ? 'bg-[#FAF2E4] border-[#ECD29F] text-[#7D5310]'
            : 'bg-[#EBF2F4] border-[#BFD5DC] text-[#28505B]'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              connectionStatus === 'ONLINE via LTE-M'
                ? 'bg-[#DDF0E5] border-[#BCDBCB]'
                : connectionStatus === 'OFFLINE - logging on device'
                ? 'bg-[#F5E6CC] border-[#ECD29F]'
                : 'bg-[#DFECF0] border-[#BFD5DC]'
            }`}
          >
            {connectionStatus === 'ONLINE via LTE-M' && (
              <Radio className="w-5 h-5 text-[#235841]" strokeWidth={1.5} />
            )}
            {connectionStatus === 'OFFLINE - logging on device' && (
              <WifiOff className="w-5 h-5 text-[#7D5310]" strokeWidth={1.5} />
            )}
            {connectionStatus === 'RESTORED - syncing' && (
              <RefreshCw className="w-5 h-5 text-[#28505B] animate-spin" strokeWidth={1.5} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm sm:text-base leading-tight">
                {connectionStatus === 'ONLINE via LTE-M' &&
                  'ONLINE - Cargo Node streaming live over LTE-M'}
                {connectionStatus === 'OFFLINE - logging on device' &&
                  'OFFLINE - Cargo Node logging securely on board pallet. Data will sync when network returns'}
                {connectionStatus === 'RESTORED - syncing' &&
                  'RESTORED - Syncing on-board ledger records over MQTT...'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'ONLINE via LTE-M'
                    ? 'bg-[#3F8F6B] animate-pulse'
                    : connectionStatus === 'OFFLINE - logging on device'
                    ? 'bg-[#D9A441]'
                    : 'bg-[#4F7C8A] animate-ping'
                }`}
              />
            </div>
            <p className="text-xs opacity-90 mt-0.5">
              {connectionStatus === 'ONLINE via LTE-M'
                ? 'Continuous telemetry from cargo-mounted sensor nodes. 0 records lost.'
                : connectionStatus === 'OFFLINE - logging on device'
                ? 'Hash-chained telemetry is safe in non-volatile cargo node hardware EEPROM.'
                : 'Handshake complete. Offloading cryptographic batch to Arbitrum rollup.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleConnectivityLoss}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 self-start sm:self-auto shrink-0 shadow-sm ${
            connectionStatus === 'ONLINE via LTE-M'
              ? 'bg-[#FAF7F0] hover:bg-[#F2ECE0] text-[#2B2A26] border-[#BCDBCB]'
              : connectionStatus === 'OFFLINE - logging on device'
              ? 'bg-[#D9A441] hover:bg-[#C49132] text-white border-[#B88628]'
              : 'bg-[#4F7C8A] hover:bg-[#3D6370] text-white border-[#3D6370]'
          }`}
        >
          {connectionStatus === 'ONLINE via LTE-M'
            ? 'Simulate connectivity loss'
            : connectionStatus === 'OFFLINE - logging on device'
            ? 'Restore connection'
            : 'Syncing...'}
        </button>
      </div>

      {/* 2) Exactly Four KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="In Transit"
          value="6"
          delta={{ text: "Active multi-modal legs", trend: "neutral", sentiment: "neutral" }}
          icon={<Truck className="w-4 h-4" strokeWidth={1.5} />}
          iconBg="teal"
        />

        <KpiCard
          label="At Risk"
          value="4"
          delta={{ text: "Thermal excursions logged", trend: "neutral", sentiment: "warning" }}
          icon={<AlertTriangle className="w-4 h-4" strokeWidth={1.5} />}
          iconBg="amber"
        />

        <KpiCard
          label="Critical"
          value="2"
          delta={{ text: "Immediate intervention", trend: "up", sentiment: "negative" }}
          icon={<AlertOctagon className="w-4 h-4" strokeWidth={1.5} />}
          iconBg="red"
        />

        <KpiCard
          label="Data Trust"
          value="98%"
          delta={{ text: "0 records lost", trend: "up", sentiment: "positive" }}
          icon={<ShieldCheck className="w-4 h-4" strokeWidth={1.5} />}
          iconBg="green"
        />
      </div>

      {/* 3) Two-Column Layout: Left = Active Consignments Table with 'Current leg' column, Right = Single Ledger Activity Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Active Consignments Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card padding="none">
            <div className="p-4 sm:p-5 border-b border-border-card flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-semibold text-content leading-tight">
                  Active Consignments
                </h3>
                <p className="text-xs text-content-muted mt-0.5">
                  Click any consignment to open detailed condition intelligence & journey radar
                </p>
              </div>
              <span className="text-xs text-content-muted tabular-nums">
                {displayedShipments.length} consignments
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F4ECE0] border-b border-border-card text-content-muted uppercase tracking-wider font-semibold text-[11px]">
                    <th className="py-3 px-4">Consignment & Batch</th>
                    <th className="py-3 px-4">Fruit</th>
                    <th className="py-3 px-4">Current leg</th>
                    <th className="py-3 px-4 text-center">Condition</th>
                    <th className="py-3 px-4 text-center">Risk</th>
                    <th className="py-3 px-4 text-center">Telemetry</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-card/60">
                  {displayedShipments.map((s) => {
                    const activeLeg = s.journey?.legs.find((l) => l.status === 'Active') || s.journey?.legs[0];
                    const mode = activeLeg?.mode || 'Truck';
                    const legOrigin = activeLeg?.startLocation || s.origin;
                    const legDestination = activeLeg?.endLocation || s.destination;

                    return (
                      <tr
                        key={s.id}
                        onClick={() => handleRowClick(s)}
                        className="cursor-pointer transition-colors hover:bg-[#FAF4EB] group"
                      >
                        {/* Consignment ID & Batch */}
                        <td className="py-3.5 px-4 font-mono font-medium text-accent group-hover:underline">
                          <div className="flex items-center gap-1.5">
                            <span>{s.id}</span>
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-accent" strokeWidth={1.5} />
                          </div>
                          <div className="text-[10px] text-content-muted font-mono truncate max-w-[130px]">
                            {s.batchId || `BATCH-${s.fruit.toUpperCase()}`}
                          </div>
                        </td>

                        {/* Fruit Badge */}
                        <td className="py-3.5 px-4">
                          <FruitBadge fruit={s.fruit} size="md" />
                        </td>

                        {/* Current leg (e.g. 'Ship - Mumbai to Dubai') */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              {renderModeBadge(mode)}
                              <span className="font-semibold text-content text-xs">
                                {mode} - {legOrigin} to {legDestination}
                              </span>
                            </div>
                            <div className="text-[11px] text-content-muted truncate max-w-[200px]">
                              {s.currentVehicleLabel || activeLeg?.vehicleLabel || `Reefer ${s.truckId}`}
                            </div>
                          </div>
                        </td>

                        {/* Condition Score /100 */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-semibold tabular-nums ${getScoreColor(
                              s.conditionScore ?? 90
                            )}`}
                          >
                            {s.conditionScore ?? 90}/100
                          </span>
                        </td>

                        {/* Risk Pill */}
                        <td className="py-3.5 px-4 text-center">
                          <StatusPill status={s.risk} size="sm" />
                        </td>

                        {/* Connectivity Pill */}
                        <td className="py-3.5 px-4 text-center">
                          <StatusPill status={s.connection} size="sm" />
                        </td>

                        {/* Status Pill */}
                        <td className="py-3.5 px-4 text-right">
                          <StatusPill status={s.status} size="sm" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column (1/3): Exactly One Ledger Activity Card */}
        <div className="space-y-6">
          <Card
            title={
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent" strokeWidth={1.5} />
                <span>Ledger Activity</span>
              </div>
            }
            subtitle="Latest blocks anchored to Arbitrum Orbit Layer-3"
            headerBorder={true}
            action={
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent bg-[#EAF4EF] px-2 py-0.5 rounded-full border border-[#BCDBCB]">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span>Live Feed</span>
              </span>
            }
          >
            <div className="divide-y divide-border-card/60 -mx-1">
              {ledgerBlocks.map((block) => (
                <div key={block.blockNumber} className="py-3 px-1 flex items-center justify-between text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-content tabular-nums">
                        #{block.blockNumber.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-content-muted">
                        • {block.recordsCount} records
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-content-subtle mt-0.5 truncate max-w-[180px]">
                      Hash: {block.txHash}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-[11px] text-content-muted tabular-nums flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3 text-content-subtle" strokeWidth={1.5} />
                      {block.timestamp}
                    </span>
                    <span className="text-[10px] text-accent font-medium">Anchored</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
