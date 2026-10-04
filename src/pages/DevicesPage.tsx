import React, { useState, useMemo, useEffect } from 'react';
import { Card, StatusPill, FruitBadge, EmptyState } from '../components';
import { useSimulation } from '../context/SimulationContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Cpu,
  Plus,
  X,
  Battery,
  Sun,
  Flame,
  Radio,
  HardDrive,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DevicesPage: React.FC = () => {
  const { devices, addDevice, shipments } = useSimulation();

  // Selected device for inspection drawer
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>('ST-NODE-0142');

  // Add Device modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeviceId, setNewDeviceId] = useState(`ST-NODE-0${Math.floor(700 + Math.random() * 199)}`);
  const [newAssignedShipment, setNewAssignedShipment] = useState('ST250701');
  const [newHarvesterType, setNewHarvesterType] = useState<'Solar' | 'Thermal'>('Solar');
  const [pairingPin, setPairingPin] = useState('841-294');

  // Escape key closes drawer and modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedDeviceId(null);
        setShowAddModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectedDevice = useMemo(
    () => devices.find((d) => d.id === selectedDeviceId) || devices[0],
    [devices, selectedDeviceId]
  );

  const handlePairDevice = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedFruit = shipments.find((s) => s.id === newAssignedShipment)?.fruit || 'Mango';

    addDevice({
      id: newDeviceId,
      assignedShipmentId: newAssignedShipment,
      fruit: assignedFruit,
      batteryPct: 99,
      harvestingType: newHarvesterType,
      harvestingMw: newHarvesterType === 'Solar' ? 185 : 120,
      signalDbm: -76,
      firmwareVersion: 'v2.4.1-rc3',
      lastSeen: 'Just now',
      enclosureRating: 'IP67',
      sensorHealth: {
        sht31: 'OK',
        ethylene: 'OK',
        imu: 'OK',
        gps: 'OK',
      },
      tamperStatus: 'Sealed',
      storageUsedPct: 4,
      storageBufferDays: 14,
    });

    setShowAddModal(false);
    setSelectedDeviceId(newDeviceId);
    setNewDeviceId(`ST-NODE-0${Math.floor(700 + Math.random() * 199)}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-content">
            IoT Sensor Fleet & Telemetry Nodes
          </h2>
          <p className="text-xs text-content-muted mt-1">
            Rugged IP67 sensor nodes logging temperature, humidity, ethylene, shock, tamper, and real SHA-256 state hashes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-content-muted bg-[#F0EBE1] px-3 py-1.5 rounded-xl border border-border-card">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-semibold text-content">{devices.length} Active Nodes</span>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-[#34785A] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            <span>Add device</span>
          </button>
        </div>
      </div>

      {/* IoT Nodes Table */}
      <Card padding="none" className="overflow-hidden border-border-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#EFE7D8]/60 border-b border-border-card text-content-muted font-medium uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Node ID</th>
                <th className="py-3 px-4">Assigned Consignment</th>
                <th className="py-3 px-4">Battery %</th>
                <th className="py-3 px-4">Energy Harvesting</th>
                <th className="py-3 px-4">LTE-M Signal</th>
                <th className="py-3 px-4">Firmware</th>
                <th className="py-3 px-4">Last Seen</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Sensor Health (SHT/C2H4/IMU/GPS)</th>
                <th className="py-3 px-4">Tamper</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-card/60 font-sans">
              {devices.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8">
                    <EmptyState
                      title="No devices registered"
                      description="No IoT sensor nodes are currently paired. Click Add Device to pair a new node."
                      actionText="Pair First Device"
                      onAction={() => setShowAddModal(true)}
                    />
                  </td>
                </tr>
              ) : devices.map((node) => {
                  const isSelected = selectedDeviceId === node.id;
                  const isBreached = node.tamperStatus === 'Breached';

                  return (
                    <tr
                      key={node.id}
                      tabIndex={0}
                      role="button"
                      aria-label={`Inspect device node ${node.id} attached to cargo consignment ${node.assignedShipmentId}`}
                      onClick={() => setSelectedDeviceId(node.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedDeviceId(node.id);
                        }
                      }}
                      className={`cursor-pointer transition-colors focus-visible:outline-none focus-visible:bg-[#FAF2E4] ${
                        isSelected ? 'bg-[#FAF2E4]/70 hover:bg-[#FAF2E4]' : 'hover:bg-[#F5EFE6]'
                      }`}
                    >
                    {/* Device ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#EAF4EF] text-primary flex items-center justify-center border border-[#BCDBCB] shrink-0">
                          <Cpu className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </span>
                        <span className="font-mono font-bold text-xs text-content hover:text-primary transition-colors">
                          {node.id}
                        </span>
                      </div>
                    </td>

                    {/* Assigned Shipment */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <FruitBadge fruit={node.fruit} size="sm" />
                        <span className="font-mono font-semibold text-content text-xs">
                          {node.assignedShipmentId}
                        </span>
                        <span className="text-[11px] text-content-muted">({node.fruit})</span>
                      </div>
                    </td>

                    {/* Battery % */}
                    <td className="py-3.5 px-4">
                      <div className="w-24 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="font-semibold text-content">{node.batteryPct}%</span>
                          <span className="text-content-muted text-[10px]">LiFePO4</span>
                        </div>
                        <div className="w-full bg-[#E5DDCE] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              node.batteryPct > 70
                                ? 'bg-primary'
                                : node.batteryPct > 40
                                ? 'bg-[#D9A441]'
                                : 'bg-[#B94A48]'
                            }`}
                            style={{ width: `${node.batteryPct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Energy Harvesting */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-xs text-content">
                        {node.harvestingType === 'Solar' ? (
                          <Sun className="w-3.5 h-3.5 text-[#D9A441]" strokeWidth={1.5} />
                        ) : (
                          <Flame className="w-3.5 h-3.5 text-[#B94A48]" strokeWidth={1.5} />
                        )}
                        <span>{node.harvestingType}</span>
                        <span className="font-mono text-[11px] text-primary font-semibold tabular-nums">
                          (+{node.harvestingMw} mW)
                        </span>
                      </div>
                    </td>

                    {/* LTE-M Signal */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-content font-mono">
                        <Radio
                          className={`w-3.5 h-3.5 ${
                            node.signalDbm > -90
                              ? 'text-primary'
                              : node.signalDbm > -105
                              ? 'text-[#D9A441]'
                              : 'text-[#B94A48]'
                          }`}
                          strokeWidth={1.5}
                        />
                        <span className="tabular-nums font-semibold">{node.signalDbm} dBm</span>
                      </div>
                    </td>

                    {/* Firmware */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] bg-[#F0EBE1] px-2 py-0.5 rounded border border-border-card/60 text-content">
                        {node.firmwareVersion}
                      </span>
                    </td>

                    {/* Last Seen */}
                    <td className="py-3.5 px-4 tabular-nums text-content-muted text-[11px]">
                      {node.lastSeen}
                    </td>

                    {/* Enclosure Rating */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAF4EF] text-[#235841] border border-[#BCDBCB]">
                        {node.enclosureRating}
                      </span>
                    </td>

                    {/* Sensor Health (SHT31 / Ethylene / IMU / GPS) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3 text-[11px] font-mono">
                        <span className="flex items-center gap-1" title="Sensirion SHT31 Temp/RH">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              node.sensorHealth.sht31 === 'OK' ? 'bg-primary' : 'bg-[#B94A48]'
                            }`}
                          />
                          <span className="text-[10px] text-content-muted">SHT</span>
                        </span>

                        <span className="flex items-center gap-1" title="Ethylene Gas Microchamber">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              node.sensorHealth.ethylene === 'OK' ? 'bg-primary' : 'bg-[#B94A48]'
                            }`}
                          />
                          <span className="text-[10px] text-content-muted">C2H4</span>
                        </span>

                        <span className="flex items-center gap-1" title="6-Axis Inertial IMU">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              node.sensorHealth.imu === 'OK' ? 'bg-primary' : 'bg-[#B94A48]'
                            }`}
                          />
                          <span className="text-[10px] text-content-muted">IMU</span>
                        </span>

                        <span className="flex items-center gap-1" title="GNSS GPS Receiver">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              node.sensorHealth.gps === 'OK' ? 'bg-primary' : 'bg-[#B94A48]'
                            }`}
                          />
                          <span className="text-[10px] text-content-muted">GPS</span>
                        </span>
                      </div>
                    </td>

                    {/* Tamper Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusPill
                        status={isBreached ? 'Critical' : 'Normal'}
                        label={node.tamperStatus}
                        size="sm"
                      />
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDeviceId(node.id);
                        }}
                        className="px-2.5 py-1 rounded bg-[#EFE9DD] hover:bg-[#E5DDCE] text-content font-medium text-[11px] inline-flex items-center gap-1 transition-colors"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3 h-3 text-content-muted" strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Right Drawer: Device Inspection Drawer */}
      {selectedDevice && (
        <>
          <div
            className="fixed inset-0 bg-content/20 backdrop-blur-[1px] z-40 transition-opacity"
            onClick={() => setSelectedDeviceId(null)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="device-drawer-title"
            className="fixed inset-y-0 right-0 w-full sm:w-[500px] md:w-[540px] bg-[#FBF7F0] border-l border-border-card shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-border-card bg-[#F5EFE6] flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span id="device-drawer-title" className="font-mono text-sm font-bold text-content">{selectedDevice.id}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAF4EF] text-[#235841] border border-[#BCDBCB]">
                  {selectedDevice.enclosureRating} Rugged Node
                </span>
                <StatusPill
                  status={selectedDevice.tamperStatus === 'Breached' ? 'Critical' : 'Normal'}
                  label={selectedDevice.tamperStatus}
                  size="sm"
                />
              </div>

              <div className="text-xs text-content-muted mt-1 flex items-center gap-2">
                <span>Cargo Consignment:</span>
                <Link
                  to={`/shipments/${selectedDevice.assignedShipmentId}`}
                  className="font-mono font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <span>{selectedDevice.assignedShipmentId}</span>
                  <span>({selectedDevice.fruit})</span>
                </Link>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedDeviceId(null)}
              className="p-1.5 rounded-lg text-content-muted hover:text-content hover:bg-[#EBE2D4] transition-colors shrink-0"
              aria-label="Close device drawer"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs font-sans">
            {/* Battery & Energy Harvesting Graph */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-sm text-content flex items-center gap-1.5">
                  <Battery className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  <span>Battery & Energy Harvesting Input</span>
                </h4>
                <span className="font-mono text-[11px] text-content-muted">Past 4 Hours</span>
              </div>

              <div className="h-44 w-full bg-[#F5EFE6] border border-border-card rounded-xl p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={selectedDevice.batteryHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2D9C8" opacity={0.6} />
                    <XAxis dataKey="time" stroke="#7A7367" fontSize={10} tickLine={false} />
                    <YAxis yAxisId="bat" domain={[70, 100]} stroke="#3F8F6B" fontSize={10} tickLine={false} unit="%" />
                    <YAxis yAxisId="hw" orientation="right" domain={[0, 250]} stroke="#D9A441" fontSize={10} tickLine={false} unit="mW" />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        return (
                          <div className="bg-[#FBF7F0] p-2.5 rounded-xl border border-border-card shadow-md text-xs font-mono">
                            <div className="font-bold text-content border-b border-border-card/60 pb-1 mb-1">
                              {label} UTC
                            </div>
                            <div className="text-primary">Battery: {payload[0]?.value}%</div>
                            <div className="text-[#D9A441]">Harvest: {payload[1]?.value} mW</div>
                          </div>
                        );
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} iconType="circle" />
                    <Area
                      yAxisId="bat"
                      type="monotone"
                      dataKey="batteryPct"
                      name="Battery Level (%)"
                      stroke="#3F8F6B"
                      fill="#3F8F6B"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                    <Area
                      yAxisId="hw"
                      type="monotone"
                      dataKey="harvestingMw"
                      name={`${selectedDevice.harvestingType} Input (mW)`}
                      stroke="#D9A441"
                      fill="#D9A441"
                      fillOpacity={0.15}
                      strokeWidth={1.5}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Storage Gauge: "Local encrypted storage 12% used, 3 days of offline buffer" */}
            <div className="p-4 rounded-xl bg-[#F5EFE6] border border-border-card space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-content flex items-center gap-1.5 text-xs">
                  <HardDrive className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  <span>On-Board Encrypted SPI NOR Flash</span>
                </span>
                <span className="font-mono text-[11px] font-semibold text-primary">
                  {selectedDevice.storageUsedPct}% Used
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#E5DDCE] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${selectedDevice.storageUsedPct}%` }}
                />
              </div>

              {/* Formatted Text Note */}
              <div className="flex items-center justify-between text-xs text-content pt-1">
                <span className="font-semibold text-[#1F4D3A]">
                  Local encrypted storage {selectedDevice.storageUsedPct}% used, {selectedDevice.storageBufferDays} days of offline buffer
                </span>
                <span className="text-[11px] font-mono text-content-muted">64 MB Capacity</span>
              </div>
              <p className="text-[11px] text-content-muted leading-relaxed">
                Hardware AES-256-XTS flash encryption ensures physical chip teardowns cannot leak telemetry records or cryptographic key pairs.
              </p>
            </div>

            </div>
          </div>
        </>
      )}

      {/* Add Device Pairing Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pair-modal-title"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-[#FAF7F0] border border-border-card rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border-card pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary" strokeWidth={1.5} />
                <h3 id="pair-modal-title" className="font-serif font-bold text-base text-content">
                  Plug-and-Play Device Pairing
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-content-muted hover:text-content hover:bg-[#EBE2D4]"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <form onSubmit={handlePairDevice} className="space-y-4 text-xs">
              <div>
                <label className="block text-content-muted font-medium mb-1">
                  Device Node Serial ID
                </label>
                <input
                  type="text"
                  required
                  value={newDeviceId}
                  onChange={(e) => setNewDeviceId(e.target.value)}
                  className="w-full bg-[#F5EFE6] border border-border-card rounded-xl px-3 py-2 font-mono text-content focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-content-muted font-medium mb-1">
                  Attach to Cargo Consignment
                </label>
                <select
                  value={newAssignedShipment}
                  onChange={(e) => setNewAssignedShipment(e.target.value)}
                  className="w-full bg-[#F5EFE6] border border-border-card rounded-xl px-3 py-2 text-content font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {shipments.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id} - {s.fruit} ({s.origin} to {s.destination})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-content-muted font-medium mb-1">
                    Energy Harvester
                  </label>
                  <select
                    value={newHarvesterType}
                    onChange={(e) => setNewHarvesterType(e.target.value as 'Solar' | 'Thermal')}
                    className="w-full bg-[#F5EFE6] border border-border-card rounded-xl px-3 py-2 text-content font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Solar">Solar Photovoltaic</option>
                    <option value="Thermal">Thermoelectric (Seebeck)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-content-muted font-medium mb-1">
                    Pairing PIN
                  </label>
                  <input
                    type="text"
                    value={pairingPin}
                    onChange={(e) => setPairingPin(e.target.value)}
                    className="w-full bg-[#F5EFE6] border border-border-card rounded-xl px-3 py-2 font-mono text-content focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#EAF4EF] border border-[#BCDBCB] text-[11px] text-[#235841]">
                <span className="font-semibold">Zero-Touch Provisioning:</span> The node will fetch elliptic curve keys and start publishing 20s interval packets over MQTT immediately.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-border-card bg-[#EFE9DD] hover:bg-[#E5DDCE] text-content font-medium text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-[#34785A] text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  Pair Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevicesPage;
