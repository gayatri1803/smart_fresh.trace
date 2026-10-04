import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, StatusPill, FruitBadge } from '../components';
import { useSimulation } from '../context/SimulationContext';
import { FRUIT_CONFIGS } from '../data/fruits';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
} from 'react-leaflet';
import L from 'leaflet';
import {
  ArrowLeft,
  Truck,
  ThermometerSnowflake,
  Droplets,
  Wind,
  Activity,
  Zap,
  Radio,
  ShieldCheck,
  Sun,
  Leaf,
  Anchor,
  Ship,
  Building2,
  Shield,
  Check,
} from 'lucide-react';
import type { FruitType, JourneyMode } from '../types';

// Custom cargo pallet beacon icon for Leaflet map
const createCargoMarkerIcon = (mode: string) => {
  return L.divIcon({
    className: 'custom-cargo-pin',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
        <span style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: #3F8F6B; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="width: 28px; height: 28px; border-radius: 8px; background: #1F4D3A; border: 2px solid #FFFFFF; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold;">
          ${mode === 'Ship' ? 'S' : 'C'}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

const stopMarkerIcon = L.divIcon({
  className: 'custom-stop-pin',
  html: `
    <div style="width: 14px; height: 14px; border-radius: 50%; background: #FAF7F0; border: 3px solid #1F4D3A; box-shadow: 0 2px 4px rgba(0,0,0,0.15);"></div>
  `,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export const ShipmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { shipments } = useSimulation();

  // Find target consignment by ID or default to first
  const shipment = shipments.find((s) => s.id === id) || shipments[0];
  const fruitConfig = FRUIT_CONFIGS[shipment.fruit as FruitType] || FRUIT_CONFIGS['Mango'];
  const reading = shipment.latestReading;

  // Extract journey legs
  const journey = shipment.journey || {
    currentLegIndex: 0,
    legs: [
      {
        id: `LEG-${shipment.id}-01`,
        order: 1,
        mode: 'Farm' as JourneyMode,
        vehicleLabel: 'Orchard Pre-Cooling Chamber',
        startLocation: shipment.origin,
        endLocation: 'Packhouse Cold Dock',
        startTime: '2026-09-29 06:00',
        endTime: '2026-09-29 08:30',
        status: 'Done' as const,
        handoverAfter: {
          id: 'HO-01',
          time: '2026-09-29 08:30 UTC',
          location: 'Packhouse Gate',
          ledgerHash: '0x8f2a419e2bb69018c1d54238e9a2b0c4',
          fromParty: 'Farm Producer',
          toParty: 'Cold Reefer Logistics',
          notes: 'Sealed & verified on ledger.',
        },
      },
      {
        id: `LEG-${shipment.id}-02`,
        order: 2,
        mode: 'Truck' as JourneyMode,
        vehicleLabel: `Reefer Truck ${shipment.truckId}`,
        startLocation: shipment.origin,
        endLocation: shipment.destination,
        startTime: shipment.departureTime,
        endTime: shipment.eta,
        status: 'Active' as const,
      },
    ],
  };

  const activeLeg = journey.legs.find((l) => l.status === 'Active') || journey.legs[0];

  // Section 3: Leg selector state (default to active leg)
  const [selectedLegId, setSelectedLegId] = useState<string>(activeLeg.id);

  const selectedLeg = useMemo(() => {
    return journey.legs.find((l) => l.id === selectedLegId) || activeLeg;
  }, [journey.legs, selectedLegId, activeLeg]);

  // Mode badge helper
  const renderModeIcon = (mode: JourneyMode) => {
    switch (mode) {
      case 'Ship':
        return <Ship className="w-4 h-4 shrink-0" strokeWidth={1.5} />;
      case 'Port':
        return <Anchor className="w-4 h-4 shrink-0" strokeWidth={1.5} />;
      case 'Warehouse':
        return <Building2 className="w-4 h-4 shrink-0" strokeWidth={1.5} />;
      case 'Farm':
        return <Leaf className="w-4 h-4 shrink-0" strokeWidth={1.5} />;
      case 'Truck':
      default:
        return <Truck className="w-4 h-4 shrink-0" strokeWidth={1.5} />;
    }
  };

  // Map route coordinates for each leg
  const mapData = useMemo(() => {
    // Specific coordinates for Nashik to Dubai route
    if (shipment.destination.toLowerCase().includes('dubai') || shipment.id === 'ST250701') {
      const pNashik: [number, number] = [19.9975, 73.7898];
      const pJNPT: [number, number] = [18.9496, 72.9512];
      const pSeaMid: [number, number] = [21.5, 64.5];
      const pJebelAli: [number, number] = [25.0068, 55.0617];
      const pAlAweer: [number, number] = [25.1764, 55.3644];

      const legsWithCoords = [
        { id: '1', mode: 'Farm', coords: [pNashik, [19.9800, 73.8000]], isSea: false, name: 'Farm & Packhouse' },
        { id: '2', mode: 'Truck', coords: [[19.9800, 73.8000], pJNPT], isSea: false, name: 'Road to JNPT Port' },
        { id: '3', mode: 'Port', coords: [pJNPT, [18.9550, 72.9450]], isSea: false, name: 'JNPT Holding Terminal' },
        { id: '4', mode: 'Ship', coords: [pJNPT, pSeaMid, pJebelAli], isSea: true, name: 'Maritime Arabian Sea' },
        { id: '5', mode: 'Port', coords: [pJebelAli, [25.0150, 55.0700]], isSea: false, name: 'Jebel Ali Port Terminal' },
        { id: '6', mode: 'Truck', coords: [pJebelAli, pAlAweer], isSea: false, name: 'Road to Dubai Central' },
      ];

      // Active cargo position along active leg
      const cargoPos: [number, number] = activeLeg.mode === 'Ship' ? pSeaMid : pJNPT;

      return {
        center: [22.0, 65.0] as [number, number],
        zoom: 5,
        legs: legsWithCoords,
        stops: [
          { name: 'Nashik Agro Hub', coords: pNashik },
          { name: 'JNPT Mumbai Port', coords: pJNPT },
          { name: 'Jebel Ali UAE Port', coords: pJebelAli },
          { name: 'Al Aweer Market Dubai', coords: pAlAweer },
        ],
        cargoPos,
      };
    }

    // Default road route (e.g. Nashik to Delhi)
    const pOrigin: [number, number] = [19.9975, 73.7898];
    const pMid: [number, number] = [23.5, 75.8];
    const pDest: [number, number] = [28.7159, 77.1789];

    return {
      center: [24.0, 76.0] as [number, number],
      zoom: 6,
      legs: [
        { id: '1', mode: 'Farm', coords: [pOrigin, [20.1, 74.0]], isSea: false, name: 'Orchard Packhouse' },
        { id: '2', mode: 'Truck', coords: [[20.1, 74.0], pMid, pDest], isSea: false, name: 'National Reefer Highway' },
        { id: '3', mode: 'Warehouse', coords: [pDest, [28.73, 77.19]], isSea: false, name: 'Central Cold Storage' },
      ],
      stops: [
        { name: shipment.origin, coords: pOrigin },
        { name: 'Indore Gateway', coords: pMid },
        { name: shipment.destination, coords: pDest },
      ],
      cargoPos: pMid,
    };
  }, [shipment, activeLeg]);

  // Section 4: Tamper-Proof Log Records
  const tamperProofRecords = useMemo(() => {
    return [
      {
        hashIndex: 842,
        timestamp: '13:45:00 UTC',
        legLabel: `${activeLeg.order}: ${activeLeg.mode}`,
        temp: reading.temperature,
        humidity: reading.humidity,
        ethylene: reading.ethylene,
        vibration: reading.vibration,
        chainStatus: reading.chainStatus || 'Anchored on ledger',
        recordHash: reading.currentHash || '0x8f3c719e2ab69018',
        blockNumber: 1489242,
      },
      {
        hashIndex: 841,
        timestamp: '13:43:00 UTC',
        legLabel: `${activeLeg.order}: ${activeLeg.mode}`,
        temp: +(reading.temperature - 0.1).toFixed(1),
        humidity: +(reading.humidity - 0.2).toFixed(1),
        ethylene: +(reading.ethylene - 0.01).toFixed(2),
        vibration: 0.22,
        chainStatus: 'Anchored on ledger' as const,
        recordHash: '0x7e2b608d1fa58907',
        blockNumber: 1489241,
      },
      {
        hashIndex: 840,
        timestamp: '13:41:00 UTC',
        legLabel: `${activeLeg.order}: ${activeLeg.mode}`,
        temp: +(reading.temperature + 0.1).toFixed(1),
        humidity: +(reading.humidity + 0.3).toFixed(1),
        ethylene: +(reading.ethylene).toFixed(2),
        vibration: 0.19,
        chainStatus: 'Anchored on ledger' as const,
        recordHash: '0x6d1a5f7c00918210',
        blockNumber: 1489240,
      },
      {
        hashIndex: 839,
        timestamp: '13:39:00 UTC',
        legLabel: activeLeg.order > 1 ? `${activeLeg.order - 1}: Truck` : `${activeLeg.order}: ${activeLeg.mode}`,
        temp: +(reading.temperature - 0.2).toFixed(1),
        humidity: +(reading.humidity - 0.1).toFixed(1),
        ethylene: +(reading.ethylene - 0.02).toFixed(2),
        vibration: 0.25,
        chainStatus: 'Anchored on ledger' as const,
        recordHash: '0x5c094e6b99182711',
        blockNumber: 1489239,
      },
      {
        hashIndex: 838,
        timestamp: '13:37:00 UTC',
        legLabel: activeLeg.order > 1 ? `${activeLeg.order - 1}: Truck` : `${activeLeg.order}: ${activeLeg.mode}`,
        temp: +(reading.temperature).toFixed(1),
        humidity: +(reading.humidity).toFixed(1),
        ethylene: 0.28,
        vibration: 0.21,
        chainStatus: 'Anchored on ledger' as const,
        recordHash: '0x4b983d5a88071600',
        blockNumber: 1489238,
      },
    ];
  }, [reading, activeLeg]);

  // Color helper for chain status badge
  const renderChainStatusBadge = (status: string) => {
    switch (status) {
      case 'Stored on device':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FAF2E4] text-[#7D5310] border border-[#ECD29F]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D9A441]" />
            <span>Stored on device</span>
          </span>
        );
      case 'Syncing over MQTT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EBF2F4] text-[#28505B] border border-[#BFD5DC]">
            <Radio className="w-3 h-3 text-info animate-pulse" strokeWidth={1.5} />
            <span>Syncing over MQTT</span>
          </span>
        );
      case 'Anchored on ledger':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF4EF] text-[#235841] border border-[#BCDBCB]">
            <ShieldCheck className="w-3 h-3 text-primary" strokeWidth={1.5} />
            <span>Anchored on ledger</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/shipments"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-muted hover:text-content transition-colors group mb-2"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.5} />
            <span>Back to Consignments</span>
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <FruitBadge fruit={shipment.fruit} size="md" />
            <h1 className="font-serif text-2xl font-bold text-content leading-tight">
              Consignment {shipment.id}
            </h1>
            <span className="font-mono text-xs font-bold text-[#7D5310] bg-[#FAF2E4] px-2.5 py-1 rounded-lg border border-[#ECD29F]">
              {shipment.batchId || `BATCH-${shipment.fruit.toUpperCase()}-2026`}
            </span>
            <span className="text-xs text-content-muted font-medium">
              {shipment.origin} → {shipment.destination}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <StatusPill status={shipment.status} size="sm" />
          <StatusPill status={shipment.connection} size="sm" />
          <span className="text-xs font-mono text-content-muted bg-[#F0EBE1] px-2.5 py-1 rounded-lg border border-border-card">
            Pallet Node: {shipment.nodeId}
          </span>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: Horizontal Journey Tracker
          Ordered legs with mode icons, Done / Active / Upcoming states, and
          inter-leg handover markers with "Recorded on ledger".
         ========================================================================= */}
      <Card
        title="Consignment Journey Tracker"
        subtitle={`Multi-modal transit legs & chain-of-custody handovers • Active: Leg ${activeLeg.order} (${activeLeg.mode})`}
        headerBorder={true}
      >
        <div className="overflow-x-auto pb-2 pt-1 custom-scrollbar">
          <div className="flex items-stretch min-w-[760px] gap-2">
            {journey.legs.map((leg, index) => {
              const isDone = leg.status === 'Done';
              const isActive = leg.status === 'Active';

              return (
                <React.Fragment key={leg.id}>
                  {/* Leg Card */}
                  <div
                    className={`flex-1 min-w-[170px] max-w-[240px] rounded-xl p-3.5 border transition-all flex flex-col justify-between ${
                      isActive
                        ? 'bg-[#FAF2E4] border-[#ECD29F] shadow-sm ring-2 ring-[#7D5310]/20'
                        : isDone
                        ? 'bg-[#EAF4EF] border-[#BCDBCB]'
                        : 'bg-[#F5EFE6] border-border-card/60 opacity-75'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            isActive
                              ? 'bg-[#FAF7F0] text-[#7D5310] border border-[#ECD29F]'
                              : isDone
                              ? 'bg-[#DDF0E5] text-[#235841] border border-[#BCDBCB]'
                              : 'bg-[#EAE2D4] text-content-muted'
                          }`}
                        >
                          {renderModeIcon(leg.mode)}
                          <span>{leg.mode}</span>
                        </span>

                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            isActive
                              ? 'bg-[#D9A441] text-white'
                              : isDone
                              ? 'bg-[#3F8F6B] text-white'
                              : 'bg-[#D5CBBC] text-content-muted'
                          }`}
                        >
                          {leg.status}
                        </span>
                      </div>

                      <div className="font-serif font-bold text-xs text-content leading-snug line-clamp-1">
                        {leg.vehicleLabel}
                      </div>

                      <div className="text-[11px] text-content-muted mt-1 font-medium">
                        {leg.startLocation} → {leg.endLocation}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-border-card/40 flex items-center justify-between text-[10px] font-mono text-content-muted">
                      <span>{leg.startTime.split(' ')[1] || leg.startTime}</span>
                      <span>→</span>
                      <span>{leg.endTime ? (leg.endTime.split(' ')[1] || leg.endTime) : 'Scheduled'}</span>
                    </div>
                  </div>

                  {/* Inter-leg Handover Marker (Recorded on ledger) */}
                  {index < journey.legs.length - 1 && (
                    <div className="flex flex-col items-center justify-center px-1 shrink-0">
                      <div className="w-0.5 h-3 bg-border-card" />
                      <div
                        className="px-2 py-1 rounded-lg bg-[#FAF7F0] border border-[#ECD29F] shadow-2xs flex flex-col items-center text-center my-1"
                        title={
                          leg.handoverAfter
                            ? `Handover at ${leg.handoverAfter.location}: ${leg.handoverAfter.fromParty} → ${leg.handoverAfter.toParty} (Hash: ${leg.handoverAfter.ledgerHash})`
                            : 'Custody Handover recorded on ledger'
                        }
                      >
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-[#7D5310]">
                          <ShieldCheck className="w-3 h-3 text-[#3F8F6B]" strokeWidth={2} />
                          <span>Recorded on ledger</span>
                        </div>
                        <span className="font-mono text-[9px] text-content-muted mt-0.5">
                          {leg.handoverAfter ? leg.handoverAfter.time.split(' ')[1] || 'UTC' : 'Signed'}
                        </span>
                      </div>
                      <div className="w-0.5 h-3 bg-border-card" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </Card>

      {/* =========================================================================
          SECTION 2: One Map
          Road legs as solid lines, sea legs as dashed lines, and cargo marker
          on the active leg.
         ========================================================================= */}
      <Card
        title="Multi-Modal Route Radar"
        subtitle="Solid lines represent terrestrial road legs • Dashed lines represent maritime sea legs • Cargo beacon on active leg"
        headerBorder={true}
        action={
          <div className="flex items-center gap-3 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-1 bg-[#1F4D3A] rounded-full" />
              <span className="text-content-muted">Road Leg</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-b-2 border-dashed border-[#244569]" />
              <span className="text-content-muted">Sea Leg</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-primary">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Active Cargo</span>
            </div>
          </div>
        }
      >
        <div className="h-[380px] w-full rounded-xl overflow-hidden border border-border-card relative z-0">
          <MapContainer
            center={mapData.center}
            zoom={mapData.zoom}
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Polyline Route Segments */}
            {mapData.legs.map((leg) => (
              <Polyline
                key={leg.id}
                positions={leg.coords as [number, number][]}
                pathOptions={{
                  color: leg.isSea ? '#244569' : '#1F4D3A',
                  weight: 4,
                  opacity: 0.85,
                  dashArray: leg.isSea ? '8, 8' : undefined,
                }}
              />
            ))}

            {/* Transit Stop Markers */}
            {mapData.stops.map((stop, idx) => (
              <Marker key={idx} position={stop.coords} icon={stopMarkerIcon}>
                <Popup>
                  <div className="font-sans text-xs">
                    <div className="font-bold text-content">{stop.name}</div>
                    <div className="text-[10px] text-content-muted mt-0.5">Transit Station / Quay Hub</div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Live Cargo Marker on Active Leg */}
            <Marker
              position={mapData.cargoPos}
              icon={createCargoMarkerIcon(activeLeg.mode)}
            >
              <Popup>
                <div className="font-sans text-xs space-y-1">
                  <div className="font-bold text-primary flex items-center gap-1">
                    <span>Consignment {shipment.id}</span>
                    <span>({shipment.fruit})</span>
                  </div>
                  <div className="font-semibold text-content">
                    Active Leg: {activeLeg.mode} ({activeLeg.vehicleLabel})
                  </div>
                  <div className="text-content-muted font-mono text-[10px]">
                    Cargo Temp: {reading.temperature > 0 ? `+${reading.temperature.toFixed(1)}` : reading.temperature.toFixed(1)}°C • {reading.humidity.toFixed(0)}% RH
                  </div>
                  <div className="text-[10px] text-content-muted">
                    Pallet Sensor: {shipment.nodeId}
                  </div>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </Card>

      {/* =========================================================================
          SECTION 3: Live Readings + Condition Score + Leg Selector
          Live readings (Temperature, Humidity, Ethylene, Vibration, Battery with
          solar/thermal harvesting) plus Condition Score, with a leg selector.
         ========================================================================= */}
      <Card
        title="Live Cargo Telemetry & Condition Intelligence"
        subtitle="Rugged pallet sensor node telemetry with real-time biological condition scoring"
        headerBorder={true}
        action={
          /* Leg Selector */
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-content-muted">Inspect Leg:</span>
            <select
              aria-label="Select journey leg to inspect readings"
              value={selectedLegId}
              onChange={(e) => setSelectedLegId(e.target.value)}
              className="bg-[#FAF7F0] border border-border-card rounded-xl px-3 py-1.5 text-xs font-semibold text-content focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-2xs"
            >
              {journey.legs.map((leg) => (
                <option key={leg.id} value={leg.id}>
                  Leg {leg.order}: {leg.mode} ({leg.status})
                </option>
              ))}
            </select>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          {/* Leg banner reminder if inspecting non-active leg */}
          {selectedLeg.id !== activeLeg.id && (
            <div className="p-2.5 rounded-xl bg-[#FAF2E4] border border-[#ECD29F] text-xs text-[#7D5310] flex items-center justify-between">
              <span>
                Viewing historical telemetry snapshot for <strong>Leg {selectedLeg.order}: {selectedLeg.mode} ({selectedLeg.vehicleLabel})</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedLegId(activeLeg.id)}
                className="underline font-semibold hover:text-[#5E3E0C]"
              >
                Switch to Live Active Leg
              </button>
            </div>
          )}

          {/* 6 Metric Cards: Temp, Humidity, Ethylene, Vibration, Battery+Harvesting, Condition Score */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* 1. Temperature */}
            <div className="p-4 rounded-xl bg-[#F5EFE6] border border-border-card flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-content-muted">
                <span className="font-medium">Temperature</span>
                <ThermometerSnowflake className="w-4 h-4 text-primary" strokeWidth={1.5} />
              </div>
              <div className="my-2">
                <div className="text-2xl font-bold font-mono text-content">
                  {reading.temperature > 0 ? `+${reading.temperature.toFixed(1)}` : reading.temperature.toFixed(1)}°C
                </div>
                <div className="text-[11px] text-content-muted font-mono mt-0.5">
                  Safe: {fruitConfig.idealTempMin}°C – {fruitConfig.idealTempMax}°C
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#235841]">
                <Check className="w-3 h-3 text-[#3F8F6B]" strokeWidth={2} />
                <span>Thermal Safe</span>
              </span>
            </div>

            {/* 2. Humidity */}
            <div className="p-4 rounded-xl bg-[#F5EFE6] border border-border-card flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-content-muted">
                <span className="font-medium">Humidity</span>
                <Droplets className="w-4 h-4 text-info" strokeWidth={1.5} />
              </div>
              <div className="my-2">
                <div className="text-2xl font-bold font-mono text-content">
                  {reading.humidity.toFixed(1)}%
                </div>
                <div className="text-[11px] text-content-muted font-mono mt-0.5">
                  Target: {fruitConfig.idealHumidityMin}% – {fruitConfig.idealHumidityMax}% RH
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#235841]">
                <Check className="w-3 h-3 text-[#3F8F6B]" strokeWidth={2} />
                <span>Moisture Stable</span>
              </span>
            </div>

            {/* 3. Ethylene */}
            <div className="p-4 rounded-xl bg-[#F5EFE6] border border-border-card flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-content-muted">
                <span className="font-medium">Ethylene (C2H4)</span>
                <Wind className="w-4 h-4 text-warning" strokeWidth={1.5} />
              </div>
              <div className="my-2">
                <div className="text-2xl font-bold font-mono text-content">
                  {reading.ethylene.toFixed(2)} <span className="text-xs font-normal">ppm</span>
                </div>
                <div className="text-[11px] text-content-muted font-mono mt-0.5">
                  Max Limit: {fruitConfig.maxEthylenePpm.toFixed(2)} ppm
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#235841]">
                <Check className="w-3 h-3 text-[#3F8F6B]" strokeWidth={2} />
                <span>Zero Ripening Spike</span>
              </span>
            </div>

            {/* 4. Vibration */}
            <div className="p-4 rounded-xl bg-[#F5EFE6] border border-border-card flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-content-muted">
                <span className="font-medium">Vibration / Shock</span>
                <Activity className="w-4 h-4 text-content-muted" strokeWidth={1.5} />
              </div>
              <div className="my-2">
                <div className="text-2xl font-bold font-mono text-content">
                  {reading.vibration.toFixed(2)} <span className="text-xs font-normal">g</span>
                </div>
                <div className="text-[11px] text-content-muted font-mono mt-0.5">
                  Safe RMS: &lt; {fruitConfig.maxVibrationG.toFixed(1)} g
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#235841]">
                <Check className="w-3 h-3 text-[#3F8F6B]" strokeWidth={2} />
                <span>Smooth Transit</span>
              </span>
            </div>

            {/* 5. Battery with Solar/Thermal Harvesting */}
            <div className="p-4 rounded-xl bg-[#F5EFE6] border border-border-card flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-content-muted">
                <span className="font-medium">Battery & Input</span>
                <Zap className="w-4 h-4 text-[#D9A441]" strokeWidth={1.5} />
              </div>
              <div className="my-2">
                <div className="text-2xl font-bold font-mono text-content">
                  {reading.batteryPct}%
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#7D5310] font-mono mt-0.5">
                  <Sun className="w-3 h-3 text-[#D9A441]" strokeWidth={1.5} />
                  <span>+{reading.batteryHarvestingMw || 185} mW Solar/Thermal</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#235841]">
                <span>Self-Powered Node</span>
              </span>
            </div>

            {/* 6. Condition Score */}
            <div className="p-4 rounded-xl bg-[#EAF4EF] border border-[#BCDBCB] flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-[#235841]">
                <span className="font-semibold">Condition Score</span>
                <ShieldCheck className="w-4 h-4 text-[#235841]" strokeWidth={1.5} />
              </div>
              <div className="my-2">
                <div className="text-2xl font-bold font-mono text-[#1F4D3A]">
                  {shipment.conditionScore ?? 95}/100
                </div>
                <div className="text-[11px] text-[#235841] mt-0.5 truncate">
                  Biological index optimal
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#235841]">
                <span>Grade A Export Ready</span>
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* =========================================================================
          SECTION 4: Tamper-Proof Log Table
          Columns: Record Hash / Index, Timestamp, Leg, Temp, Humidity, Ethylene,
          Vibration, Chain Status (Stored on device, Syncing over MQTT,
          Anchored on ledger).
         ========================================================================= */}
      <Card
        title="Tamper-Proof Audit Log"
        subtitle="Cryptographically chained SHA-256 telemetry records anchored across transit legs"
        headerBorder={true}
        action={
          <div className="flex items-center gap-2 font-mono text-xs text-content-muted">
            <Shield className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
            <span>Immutable Hash-Chain</span>
          </div>
        }
      >
        <div className="overflow-x-auto pt-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#EFE7D8]/60 border-b border-border-card text-content-muted font-medium uppercase text-[10px] tracking-wider font-mono">
                <th className="py-2.5 px-3">Seq #</th>
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Leg</th>
                <th className="py-2.5 px-3">Temp</th>
                <th className="py-2.5 px-3">Humidity</th>
                <th className="py-2.5 px-3">Ethylene</th>
                <th className="py-2.5 px-3">Vibration</th>
                <th className="py-2.5 px-3">Chain Status</th>
                <th className="py-2.5 px-3 text-right">Record Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-card/60 font-mono text-xs">
              {tamperProofRecords.map((rec) => (
                <tr key={rec.hashIndex} className="hover:bg-[#F5EFE6] transition-colors">
                  {/* Sequence Index */}
                  <td className="py-3 px-3 font-bold text-primary">
                    #{rec.hashIndex}
                  </td>

                  {/* Timestamp */}
                  <td className="py-3 px-3 text-content tabular-nums">
                    {rec.timestamp}
                  </td>

                  {/* Leg Column */}
                  <td className="py-3 px-3 font-sans font-semibold text-content">
                    <span className="bg-[#FAF7F0] px-2 py-0.5 rounded border border-border-card text-[11px]">
                      {rec.legLabel}
                    </span>
                  </td>

                  {/* Temperature */}
                  <td className="py-3 px-3 font-semibold text-content tabular-nums">
                    {rec.temp > 0 ? `+${rec.temp.toFixed(1)}` : rec.temp.toFixed(1)}°C
                  </td>

                  {/* Humidity */}
                  <td className="py-3 px-3 text-content tabular-nums">
                    {rec.humidity.toFixed(1)}%
                  </td>

                  {/* Ethylene */}
                  <td className="py-3 px-3 text-content tabular-nums">
                    {rec.ethylene.toFixed(2)} ppm
                  </td>

                  {/* Vibration */}
                  <td className="py-3 px-3 text-content tabular-nums">
                    {rec.vibration.toFixed(2)} g
                  </td>

                  {/* Chain Status (Stored on device, Syncing over MQTT, Anchored on ledger) */}
                  <td className="py-3 px-3 font-sans">
                    {renderChainStatusBadge(rec.chainStatus)}
                  </td>

                  {/* Record Hash */}
                  <td className="py-3 px-3 text-right text-content-muted text-[11px] font-mono truncate max-w-[140px]">
                    <span className="hover:text-primary transition-colors cursor-pointer" title={rec.recordHash}>
                      {rec.recordHash.slice(0, 10)}...{rec.recordHash.slice(-4)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ShipmentDetailPage;
