import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, DataTable, StatusPill, LedgerBadge, FruitBadge } from '../components';
import type { Column } from '../components';
import { useSimulation } from '../context/SimulationContext';
import type { ShipmentItem, JourneyMode } from '../types';
import {
  Cpu,
  Truck,
  Ship,
  Anchor,
  Building2,
  Leaf,
  Package,
} from 'lucide-react';

export const ShipmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { shipments, selectedFruit, setSelectedShipmentId } = useSimulation();

  const filteredData = useMemo(() => {
    if (selectedFruit === 'All fruits') return shipments;
    return shipments.filter((s) => s.fruit.toLowerCase().includes(selectedFruit.toLowerCase()));
  }, [shipments, selectedFruit]);

  const handleRowClick = (item: ShipmentItem) => {
    setSelectedShipmentId(item.id);
    navigate(`/shipments/${item.id}`);
  };

  // Helper for mode icons and badges
  const renderModeBadge = (mode?: JourneyMode) => {
    switch (mode) {
      case 'Ship':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#E8EEF5] text-[#244569] border border-[#BFD1E5]">
            <Ship className="w-3 h-3" strokeWidth={1.5} />
            <span>Maritime Vessel</span>
          </span>
        );
      case 'Port':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#EBF2F4] text-[#28505B] border border-[#BFD5DC]">
            <Anchor className="w-3 h-3" strokeWidth={1.5} />
            <span>Port Terminal</span>
          </span>
        );
      case 'Warehouse':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#F0EBE1] text-[#5C5549] border border-[#D5CBBC]">
            <Building2 className="w-3 h-3" strokeWidth={1.5} />
            <span>Cold Warehouse</span>
          </span>
        );
      case 'Farm':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#EAF4EF] text-[#235841] border border-[#BCDBCB]">
            <Leaf className="w-3 h-3" strokeWidth={1.5} />
            <span>Farm & Packhouse</span>
          </span>
        );
      case 'Truck':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#F5EFE6] text-[#695D4B] border border-[#DCD2C1]">
            <Truck className="w-3 h-3" strokeWidth={1.5} />
            <span>Reefer Truck</span>
          </span>
        );
    }
  };

  const columns: Column<ShipmentItem>[] = [
    {
      header: 'Consignment & Batch',
      accessorKey: 'id',
      sortable: true,
      width: '180px',
      cell: (item) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-accent hover:underline text-xs">
              {item.id}
            </span>
          </div>
          <div className="font-mono text-[10px] text-content-muted truncate max-w-[170px]">
            {item.batchId || `BATCH-${item.fruit.toUpperCase()}-2026`}
          </div>
        </div>
      ),
    },
    {
      header: 'Fruit & Cargo Manifest',
      accessorKey: 'fruit',
      sortable: true,
      cell: (item) => (
        <div className="space-y-0.5 min-w-[150px]">
          <FruitBadge fruit={item.fruit} size="md" />
          <div className="text-[11px] text-content-muted truncate max-w-[200px]">
            {item.cargoDescription || `${item.cratesCount || 500} crates • ${(item.weightKg ? (item.weightKg / 1000).toFixed(1) + ' MT' : 'Palletized')}`}
          </div>
        </div>
      ),
    },
    {
      header: 'Active Leg & Transit Mode',
      sortable: false,
      cell: (item) => {
        const activeLeg = item.journey?.legs.find((l) => l.status === 'Active') || item.journey?.legs[0];
        const mode = activeLeg?.mode || 'Truck';
        const totalLegs = item.journey?.legs.length || 3;
        const currentLegIndex = (item.journey?.currentLegIndex ?? 0) + 1;

        return (
          <div className="space-y-1 min-w-[200px]">
            <div className="flex items-center gap-2">
              {renderModeBadge(mode)}
              <span className="text-[10px] font-mono text-content-muted">
                Leg {currentLegIndex} of {totalLegs}
              </span>
            </div>
            <div className="text-xs font-medium text-content truncate max-w-[220px]">
              {item.currentVehicleLabel || activeLeg?.vehicleLabel || `Reefer ${item.truckId}`}
            </div>
            <div className="text-[11px] text-content-muted truncate">
              {item.origin} → {item.destination}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Attached IoT Node',
      accessorKey: 'nodeId',
      sortable: true,
      cell: (item) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-content">
            <Cpu className="w-3.5 h-3.5 text-accent shrink-0" strokeWidth={1.5} />
            <span className="font-semibold">{item.nodeId}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-content-muted">
            <Package className="w-3 h-3 text-content-subtle" strokeWidth={1.5} />
            <span>Pallet-Mounted Sensor</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Cargo Temp',
      sortable: true,
      cell: (item) => {
        const temp = item.latestReading.temperature;
        return (
          <div className="space-y-0.5">
            <span className="font-semibold tabular-nums text-content text-xs">
              {temp > 0 ? `+${temp.toFixed(1)}` : temp.toFixed(1)}°C
            </span>
            <div className="text-[10px] text-content-muted tabular-nums">
              {item.latestReading.humidity.toFixed(0)}% RH
            </div>
          </div>
        );
      },
    },
    {
      header: 'Consignment Status',
      accessorKey: 'status',
      sortable: true,
      cell: (item) => <StatusPill status={item.status} size="sm" />,
    },
    {
      header: 'Risk',
      accessorKey: 'risk',
      sortable: true,
      cell: (item) => <StatusPill status={item.risk} size="sm" />,
    },
    {
      header: 'Telemetry',
      accessorKey: 'connection',
      sortable: true,
      cell: (item) => <StatusPill status={item.connection} size="sm" />,
    },
    {
      header: 'Custody Proof',
      sortable: false,
      align: 'right',
      cell: (item) => <LedgerBadge proof={item.ledger} detailed={false} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Register Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-content">
            Tracked Consignments
          </h2>
          <p className="text-xs text-content-muted mt-1">
            Cargo-level cold-chain tracking: palletized fruit batches, attached IoT sensor nodes, multi-modal journey legs, and cryptographic custody handovers
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 text-xs text-content-muted bg-[#F0EBE1] px-3 py-2 rounded-xl border border-border-card">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-semibold text-content">{filteredData.length} Batches Tracked</span>
          </div>
        </div>
      </div>

      {/* Main Consignments Table */}
      <Card padding="none">
        <DataTable
          columns={columns}
          data={filteredData}
          searchPlaceholder="Search consignment ID, batch ID, fruit, node, or route..."
          pageSize={8}
          onRowClick={handleRowClick}
        />
      </Card>
    </div>
  );
};

export default ShipmentsPage;
