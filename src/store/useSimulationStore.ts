import { create } from 'zustand';
import type {
  ShipmentItem,
  GlobalConnectionStatus,
  FilterFruit,
  SensorReading,
  FruitType,
  FruitConfig,
  DeviceItem,
  ReportItem,
  UserItem,
  SettingsState,
} from '../types';
import { FRUIT_CONFIGS } from '../data/fruits';
import type {
  LedgerBlockEntry,
  AlertItem,
  AlertToast,
  AlertStatus,
  TelemetryPoint,
} from '../context/SimulationContext';

// Helper function to compute real SHA-256 using the browser Web Crypto API
export async function computeSha256(data: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '0x' + hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback if running outside secure browser context
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = (hash << 5) - hash + data.charCodeAt(i);
      hash |= 0;
    }
    return `0x${Math.abs(hash).toString(16).padStart(16, '0')}`;
  }
}

// Initial 6 Consignments (Cargo batches with attached IoT devices)
const INITIAL_SHIPMENTS: ShipmentItem[] = [
  {
    id: 'ST250701',
    batchId: 'BATCH-MANGO-2026-N04',
    cargoDescription: 'Palletized Export Grade Alphonso Mangoes (GI Certified)',
    fruit: 'Mango',
    origin: 'Nashik',
    destination: 'Dubai',
    carrier: 'Arabian Sea Reefer Line',
    truckId: 'MH-15-EF-2018',
    currentVehicleLabel: 'Vessel Maersk Mc-Kinney Møller (Voyage 2604W)',
    nodeId: 'ST-NODE-0142',
    departureTime: '2026-09-29 08:30',
    eta: '2026-10-02 18:00',
    distanceCoveredKm: 780,
    totalDistanceKm: 1950,
    status: 'In Transit',
    risk: 'Low',
    connection: 'Online',
    conditionScore: 95,
    conditionReason: 'Operating within optimal respiration thresholds',
    cratesCount: 650,
    weightKg: 3250,
    journey: {
      currentLegIndex: 3,
      legs: [
        {
          id: 'LEG-250701-01',
          order: 1,
          mode: 'Farm',
          vehicleLabel: 'Nashik Orchard Pre-Cooling Chamber #4',
          startLocation: 'Nashik Agro Cluster',
          endLocation: 'Packhouse Cold Dock',
          startTime: '2026-09-29 06:00',
          endTime: '2026-09-29 08:30',
          status: 'Done',
          handoverAfter: {
            id: 'HO-250701-01',
            time: '2026-09-29 08:30 UTC',
            location: 'Nashik Packhouse Gate 1',
            ledgerHash: '0x8f2a419e2bb69018c1d54238e9a2b0c4',
            fromParty: 'Sahyadri Farmer Producer Co.',
            toParty: 'ColdEx Reefer Logistics',
            notes: 'Palletized & sealed. Probe temp logged at 12.4°C.',
          },
        },
        {
          id: 'LEG-250701-02',
          order: 2,
          mode: 'Truck',
          vehicleLabel: 'Reefer Truck MH-15-EF-2018',
          startLocation: 'Nashik Packhouse',
          endLocation: 'JNPT Port Terminal',
          startTime: '2026-09-29 08:35',
          endTime: '2026-09-29 17:45',
          status: 'Done',
          handoverAfter: {
            id: 'HO-250701-02',
            time: '2026-09-29 17:45 UTC',
            location: 'JNPT Nhava Sheva Reefer Gate 3',
            ledgerHash: '0x913b82ac74df102a94bc72105e481029',
            fromParty: 'ColdEx Reefer Logistics',
            toParty: 'DP World Nhava Sheva Terminal',
            notes: 'Gate-in verified. Enclosure seal intact.',
          },
        },
        {
          id: 'LEG-250701-03',
          order: 3,
          mode: 'Port',
          vehicleLabel: 'JNPT Reefer Holding Yard Bay 4',
          startLocation: 'JNPT Inward Berth',
          endLocation: 'Container Quay 2',
          startTime: '2026-09-29 18:00',
          endTime: '2026-09-30 02:15',
          status: 'Done',
          handoverAfter: {
            id: 'HO-250701-03',
            time: '2026-09-30 02:15 UTC',
            location: 'Berth Quay Crane 07',
            ledgerHash: '0xa24d91be63cf881027b409214d890123',
            fromParty: 'DP World Nhava Sheva',
            toParty: 'Maersk Line Maritime Master',
            notes: 'Loaded into reefer slot 04B. Continuous 440V auxiliary power engaged.',
          },
        },
        {
          id: 'LEG-250701-04',
          order: 4,
          mode: 'Ship',
          vehicleLabel: 'Vessel Maersk Mc-Kinney Møller (Voyage 2604W)',
          startLocation: 'JNPT Mumbai',
          endLocation: 'Jebel Ali Port',
          startTime: '2026-09-30 04:00',
          endTime: '2026-10-02 06:00',
          status: 'Active',
          handoverAfter: {
            id: 'HO-250701-04',
            time: '2026-10-02 06:00 UTC (Estimated)',
            location: 'Jebel Ali Container Terminal 1',
            ledgerHash: '0x8f3c719e2ab69018c1d54238e9a2b0c4',
            fromParty: 'Maersk Line Maritime Master',
            toParty: 'Al Naboodah Cold Logistics',
            notes: 'Custody scheduled for discharge to UAE port customs.',
          },
        },
        {
          id: 'LEG-250701-05',
          order: 5,
          mode: 'Port',
          vehicleLabel: 'Jebel Ali Cold Buffer Berth & Customs Quarantine',
          startLocation: 'Jebel Ali Quay',
          endLocation: 'Customs Inspection Yard',
          startTime: '2026-10-02 06:30',
          endTime: '2026-10-02 12:00',
          status: 'Upcoming',
          handoverAfter: {
            id: 'HO-250701-05',
            time: '2026-10-02 12:00 UTC (Estimated)',
            location: 'Jebel Ali Customs Gate 4',
            ledgerHash: '0xpending_anchor_leg5',
            fromParty: 'Dubai Customs Phytosanitary Division',
            toParty: 'Gulf Reefer Express',
            notes: 'Post-clearance transfer to final mile carrier.',
          },
        },
        {
          id: 'LEG-250701-06',
          order: 6,
          mode: 'Truck',
          vehicleLabel: 'Dubai Reefer Fleet DXB-4412',
          startLocation: 'Jebel Ali Port',
          endLocation: 'Al Aweer Central Fruit Market, Dubai',
          startTime: '2026-10-02 12:30',
          endTime: '2026-10-02 18:00',
          status: 'Upcoming',
        },
      ],
    },
    currentLeg: {
      id: 'LEG-250701-04',
      order: 4,
      mode: 'Ship',
      vehicleLabel: 'Vessel Maersk Mc-Kinney Møller (Voyage 2604W)',
      startLocation: 'JNPT Mumbai',
      endLocation: 'Jebel Ali Port',
      startTime: '2026-09-30 04:00',
      status: 'Active',
    },
    latestReading: {
      timestamp: 'Just now',
      temperature: 12.8,
      humidity: 87.5,
      ethylene: 0.32,
      vibration: 0.22,
      latitude: 19.9975,
      longitude: 73.7898,
      speedKmH: 64,
      tamperDetected: false,
      batteryPct: 94,
      batteryVoltage: 4.14,
      batteryHarvestingMw: 180,
      signalDbm: -78,
      hashChainIndex: 842,
      currentHash: '0x8f3c719e2ab69018c1d54238e9a2b0c41d72390f',
      previousHash: '0x7e2b608d1fa58907b2c34918e9a0b1c21d89481a',
      chainStatus: 'Anchored on ledger',
      blockNumber: 1489240,
      isSynced: true,
    },
    ledger: {
      blockNumber: 1489240,
      txHash: '0x8f3c719e2ab69018c1d54238e9a2b0c41d72390f',
      merkleRoot: '0xaa412e8091bc23',
      timestamp: '4 mins ago',
      network: 'Arbitrum Orbit / FoodChain-L3',
      status: 'Verified',
      offlineBlocksChained: 0,
      verifiedIntegrity: true,
    },
  },
  {
    id: 'ST250702',
    batchId: 'BATCH-BANANA-2026-V12',
    cargoDescription: 'Cavendish Bananas (Pre-Climacteric Export Pallets)',
    fruit: 'Banana',
    origin: 'Varanasi',
    destination: 'Delhi',
    carrier: 'Ganga Express Coldways',
    truckId: 'UP-65-BC-8812',
    currentVehicleLabel: 'Reefer Truck UP-65-BC-8812',
    nodeId: 'ST-NODE-0089',
    departureTime: '2026-09-29 14:00',
    eta: '2026-10-01 10:00',
    distanceCoveredKm: 520,
    totalDistanceKm: 810,
    status: 'In Transit',
    risk: 'Low',
    connection: 'Online',
    conditionScore: 92,
    conditionReason: 'Pre-climacteric green stage preserved with active scrubbers',
    cratesCount: 720,
    weightKg: 4320,
    journey: {
      currentLegIndex: 1,
      legs: [
        {
          id: 'LEG-250702-01',
          order: 1,
          mode: 'Farm',
          vehicleLabel: 'Varanasi Ripening Control & Packhouse',
          startLocation: 'Varanasi Agro Hub',
          endLocation: 'Pre-Cooling Chamber 2',
          startTime: '2026-09-29 11:00',
          endTime: '2026-09-29 14:00',
          status: 'Done',
          handoverAfter: {
            id: 'HO-250702-01',
            time: '2026-09-29 14:00 UTC',
            location: 'Varanasi Dispatch Gate',
            ledgerHash: '0x7e2b608d1fa58907b2c34918e9a0b1c2',
            fromParty: 'Kashi Fruit Grower Collective',
            toParty: 'Ganga Express Coldways',
            notes: 'Loaded at 13.5°C. Nitrogen flushing completed.',
          },
        },
        {
          id: 'LEG-250702-02',
          order: 2,
          mode: 'Truck',
          vehicleLabel: 'Reefer Truck UP-65-BC-8812',
          startLocation: 'Varanasi Dispatch',
          endLocation: 'Delhi Azadpur Terminal',
          startTime: '2026-09-29 14:15',
          endTime: '2026-10-01 10:00',
          status: 'Active',
          handoverAfter: {
            id: 'HO-250702-02',
            time: '2026-10-01 10:00 UTC (Estimated)',
            location: 'Azadpur Gate 4 Inward Cold Dock',
            ledgerHash: '0x77c1b892a0184421b9201847c1029384',
            fromParty: 'Ganga Express Coldways',
            toParty: 'Delhi Central Cold Storage Corp',
            notes: 'Inbound transfer scheduled to commercial cold vaults.',
          },
        },
        {
          id: 'LEG-250702-03',
          order: 3,
          mode: 'Warehouse',
          vehicleLabel: 'Delhi Central Cold Storage Facility Bay 8',
          startLocation: 'Azadpur Inward Dock',
          endLocation: 'Commercial Vault 8',
          startTime: '2026-10-01 10:30',
          endTime: '2026-10-01 18:00',
          status: 'Upcoming',
        },
      ],
    },
    currentLeg: {
      id: 'LEG-250702-02',
      order: 2,
      mode: 'Truck',
      vehicleLabel: 'Reefer Truck UP-65-BC-8812',
      startLocation: 'Varanasi Dispatch',
      endLocation: 'Delhi Azadpur Terminal',
      startTime: '2026-09-29 14:15',
      status: 'Active',
    },
    latestReading: {
      timestamp: 'Just now',
      temperature: 13.5,
      humidity: 91.2,
      ethylene: 0.62,
      vibration: 0.24,
      latitude: 25.3176,
      longitude: 82.9739,
      speedKmH: 58,
      tamperDetected: false,
      batteryPct: 88,
      batteryVoltage: 4.05,
      batteryHarvestingMw: 140,
      signalDbm: -82,
      hashChainIndex: 614,
      currentHash: '0x77c1b892a0184421b9201847c10293847291048b',
      previousHash: '0x66b0a7819f073310a8190736b09182736180937a',
      chainStatus: 'Anchored on ledger',
      blockNumber: 1489241,
      isSynced: true,
    },
    ledger: {
      blockNumber: 1489241,
      txHash: '0x77c1b892a0184421b9201847c10293847291048b',
      merkleRoot: '0xbb192837461920',
      timestamp: 'Just now',
      network: 'Arbitrum Orbit / FoodChain-L3',
      status: 'Verified',
      offlineBlocksChained: 0,
      verifiedIntegrity: true,
    },
  },
  {
    id: 'ST250703',
    batchId: 'BATCH-GRAPES-2026-S08',
    cargoDescription: 'Thomson Seedless Export Table Grapes (SO2 Generator Sheets Attached)',
    fruit: 'Grapes',
    origin: 'Nashik',
    destination: 'Rotterdam',
    carrier: 'Evergreen Reefer Logistics',
    truckId: 'MH-15-GH-4491',
    currentVehicleLabel: 'Vessel CMA CGM Palais Royal',
    nodeId: 'ST-NODE-0205',
    departureTime: '2026-09-30 02:00',
    eta: '2026-10-18 12:00',
    distanceCoveredKm: 180,
    totalDistanceKm: 7400,
    status: 'In Transit',
    risk: 'Medium',
    connection: 'Offline',
    conditionScore: 86,
    conditionReason: 'Cargo logging on board flash in maritime transit. Secure buffer engaged.',
    cratesCount: 840,
    weightKg: 4200,
    journey: {
      currentLegIndex: 3,
      legs: [
        {
          id: 'LEG-250703-01',
          order: 1,
          mode: 'Farm',
          vehicleLabel: 'Sangli Table Grape Packhouse',
          startLocation: 'Sangli Vineyard Cluster',
          endLocation: 'Pre-Cooling Tunnel',
          startTime: '2026-09-28 10:00',
          endTime: '2026-09-28 14:00',
          status: 'Done',
          handoverAfter: {
            id: 'HO-250703-01',
            time: '2026-09-28 14:00 UTC',
            location: 'Sangli Packhouse Dock',
            ledgerHash: '0x6d1a507c0e9478160918237ba5148301',
            fromParty: 'Maharashtra Grape Exporters',
            toParty: 'Western Cold Carrier',
            notes: 'Pre-cooled to 0.5°C. Pallet box seals verified.',
          },
        },
        {
          id: 'LEG-250703-02',
          order: 2,
          mode: 'Truck',
          vehicleLabel: 'Reefer Truck MH-15-GH-4491',
          startLocation: 'Sangli Packhouse',
          endLocation: 'Mumbai JNPT Port',
          startTime: '2026-09-28 14:30',
          endTime: '2026-09-28 23:00',
          status: 'Done',
          handoverAfter: {
            id: 'HO-250703-02',
            time: '2026-09-28 23:00 UTC',
            location: 'JNPT Terminal 1 Gate',
            ledgerHash: '0x5c094f6b0d836705180937ab807126a9',
            fromParty: 'Western Cold Carrier',
            toParty: 'JNPT Container Stacking Yard',
            notes: 'Transferred to port plug-in socket 18A.',
          },
        },
        {
          id: 'LEG-250703-03',
          order: 3,
          mode: 'Port',
          vehicleLabel: 'JNPT Port Reefer Yard Bay 12',
          startLocation: 'JNPT Terminal 1',
          endLocation: 'Berth Quay 3',
          startTime: '2026-09-28 23:30',
          endTime: '2026-09-29 06:00',
          status: 'Done',
          handoverAfter: {
            id: 'HO-250703-03',
            time: '2026-09-29 06:00 UTC',
            location: 'Berth Crane 02',
            ledgerHash: '0x4b983e5a0c72569427b409214d890123',
            fromParty: 'JNPT Container Stacking Yard',
            toParty: 'CMA CGM Maritime Master',
            notes: 'Lifted to ship bay 08. Cryptographic batch receipt issued.',
          },
        },
        {
          id: 'LEG-250703-04',
          order: 4,
          mode: 'Ship',
          vehicleLabel: 'Vessel CMA CGM Palais Royal',
          startLocation: 'Mumbai JNPT',
          endLocation: 'Port of Rotterdam',
          startTime: '2026-09-29 08:00',
          endTime: '2026-10-16 12:00',
          status: 'Active',
          handoverAfter: {
            id: 'HO-250703-04',
            time: '2026-10-16 12:00 UTC (Estimated)',
            location: 'Rotterdam Maasvlakte Terminal',
            ledgerHash: '0x8192a018bc492817291048bc918237ba',
            fromParty: 'CMA CGM Maritime Master',
            toParty: 'EuroFruit Cold Logistics',
            notes: 'European customs discharge inspection.',
          },
        },
        {
          id: 'LEG-250703-05',
          order: 5,
          mode: 'Port',
          vehicleLabel: 'Rotterdam Maasvlakte Cold Hub',
          startLocation: 'Quay 12',
          endLocation: 'EU Customs Phytosanitary Station',
          startTime: '2026-10-16 13:00',
          endTime: '2026-10-17 10:00',
          status: 'Upcoming',
          handoverAfter: {
            id: 'HO-250703-05',
            time: '2026-10-17 10:00 UTC (Estimated)',
            location: 'EU Phytosanitary Bay 4',
            ledgerHash: '0xpending_anchor_rotterdam',
            fromParty: 'Netherlands Food Safety Authority',
            toParty: 'EuroReefer Haulage',
            notes: 'Clearance released for distribution.',
          },
        },
        {
          id: 'LEG-250703-06',
          order: 6,
          mode: 'Truck',
          vehicleLabel: 'EuroReefer Truck NL-88-RT-91',
          startLocation: 'Rotterdam Port',
          endLocation: 'Barendrecht Distribution Center',
          startTime: '2026-10-17 11:00',
          endTime: '2026-10-17 16:00',
          status: 'Upcoming',
        },
      ],
    },
    currentLeg: {
      id: 'LEG-250703-04',
      order: 4,
      mode: 'Ship',
      vehicleLabel: 'Vessel CMA CGM Palais Royal',
      startLocation: 'Mumbai JNPT',
      endLocation: 'Port of Rotterdam',
      startTime: '2026-09-29 08:00',
      status: 'Active',
    },
    latestReading: {
      timestamp: 'Just now',
      temperature: -0.4,
      humidity: 91.5,
      ethylene: 0.12,
      vibration: 0.22,
      latitude: 19.7022,
      longitude: 73.5412,
      speedKmH: 52,
      tamperDetected: false,
      batteryPct: 91,
      batteryVoltage: 4.10,
      batteryHarvestingMw: 110,
      signalDbm: -108,
      hashChainIndex: 304,
      currentHash: '0x8192a018bc492817291048bc918237ba5148301c',
      previousHash: '0x70819f07ab381706180937ab807126a94037290b',
      chainStatus: 'Stored on device',
      isSynced: false,
    },
    ledger: {
      blockNumber: 1489236,
      txHash: '0x8192a018bc492817291048bc918237ba5148301c',
      merkleRoot: '0xcc291837461920',
      timestamp: '28 mins ago',
      network: 'Arbitrum Orbit / FoodChain-L3',
      status: 'Verified',
      offlineBlocksChained: 24,
      verifiedIntegrity: true,
    },
  },
  {
    id: 'ST250704',
    batchId: 'BATCH-APPLE-2026-H03',
    cargoDescription: 'Royal Delicious Apples (Controlled Atmosphere Protocol)',
    fruit: 'Apple',
    origin: 'Shimla',
    destination: 'Mumbai',
    carrier: 'Himalayan Cold Corridors',
    truckId: 'HP-01-AA-9012',
    currentVehicleLabel: 'Reefer Truck HP-01-AA-9012',
    nodeId: 'ST-NODE-0331',
    departureTime: '2026-09-29 05:00',
    eta: '2026-10-01 22:00',
    distanceCoveredKm: 1120,
    totalDistanceKm: 1780,
    status: 'In Transit',
    risk: 'Low',
    connection: 'Online',
    conditionScore: 96,
    conditionReason: 'Sub-3°C crispness protocol maintained with zero shock anomalies',
    cratesCount: 920,
    weightKg: 7360,
    journey: {
      currentLegIndex: 1,
      legs: [
        {
          id: 'LEG-250704-01',
          order: 1,
          mode: 'Farm',
          vehicleLabel: 'Shimla Orchard Controlled Atmosphere Cellar',
          startLocation: 'Kotgarh Highland Orchard',
          endLocation: 'Pre-Cooling Cellar',
          startTime: '2026-09-29 02:00',
          endTime: '2026-09-29 05:00',
          status: 'Done',
          handoverAfter: {
            id: 'HO-250704-01',
            time: '2026-09-29 05:00 UTC',
            location: 'Kotgarh Dispatch Terminal',
            ledgerHash: '0x3a872d490b61458319204857b2c34918',
            fromParty: 'Himachal Highland Orchards',
            toParty: 'Himalayan Cold Corridors',
            notes: 'Pre-cooling verified at 1.0°C. Heavy-duty crate strapping applied.',
          },
        },
        {
          id: 'LEG-250704-02',
          order: 2,
          mode: 'Truck',
          vehicleLabel: 'Reefer Truck HP-01-AA-9012',
          startLocation: 'Shimla Highland Gate',
          endLocation: 'Vashi APMC Cold Hub',
          startTime: '2026-09-29 05:15',
          endTime: '2026-10-01 22:00',
          status: 'Active',
          handoverAfter: {
            id: 'HO-250704-02',
            time: '2026-10-01 22:00 UTC (Estimated)',
            location: 'Vashi APMC Gate 2 Receiving Dock',
            ledgerHash: '0x99c2ea8804fba31952f4c918237ba514',
            fromParty: 'Himalayan Cold Corridors',
            toParty: 'Mumbai Fresh Cargo Ltd',
            notes: 'Arrival handover scheduled for cold vault transfer.',
          },
        },
        {
          id: 'LEG-250704-03',
          order: 3,
          mode: 'Warehouse',
          vehicleLabel: 'Vashi APMC Cold Storage Cell 04',
          startLocation: 'Vashi Receiving Dock',
          endLocation: 'Cold Vault 04',
          startTime: '2026-10-01 22:30',
          endTime: '2026-10-02 12:00',
          status: 'Upcoming',
        },
      ],
    },
    currentLeg: {
      id: 'LEG-250704-02',
      order: 2,
      mode: 'Truck',
      vehicleLabel: 'Reefer Truck HP-01-AA-9012',
      startLocation: 'Shimla Highland Gate',
      endLocation: 'Vashi APMC Cold Hub',
      startTime: '2026-09-29 05:15',
      status: 'Active',
    },
    latestReading: {
      timestamp: 'Just now',
      temperature: 1.2,
      humidity: 93.8,
      ethylene: 0.45,
      vibration: 0.18,
      latitude: 28.7041,
      longitude: 77.1025,
      speedKmH: 78,
      tamperDetected: false,
      batteryPct: 96,
      batteryVoltage: 4.18,
      batteryHarvestingMw: 210,
      signalDbm: -74,
      hashChainIndex: 920,
      currentHash: '0x99c2ea8804fba31952f4c918237ba5148301cf78',
      previousHash: '0x88b1d97703ea920841e3b807126a94037290be67',
      chainStatus: 'Anchored on ledger',
      blockNumber: 1489242,
      isSynced: true,
    },
    ledger: {
      blockNumber: 1489242,
      txHash: '0x99c2ea8804fba31952f4c918237ba5148301cf78',
      merkleRoot: '0xee102938472819',
      timestamp: '2 mins ago',
      network: 'Arbitrum Orbit / FoodChain-L3',
      status: 'Verified',
      offlineBlocksChained: 0,
      verifiedIntegrity: true,
    },
  },
  {
    id: 'ST250705',
    batchId: 'BATCH-AVOCADO-2026-K01',
    cargoDescription: 'Hass Avocados (Export Grade A, Shock-Damped)',
    fruit: 'Avocado',
    origin: 'Bengaluru',
    destination: 'Doha',
    carrier: 'Southern Ocean Freight',
    truckId: 'KA-04-TR-7721',
    currentVehicleLabel: 'Reefer Truck KA-04-TR-7721',
    nodeId: 'ST-NODE-0418',
    departureTime: '2026-09-28 11:00',
    eta: '2026-10-03 16:00',
    distanceCoveredKm: 640,
    totalDistanceKm: 2850,
    status: 'Critical',
    risk: 'High',
    connection: 'Online',
    conditionScore: 56,
    conditionReason: 'Reefer compressor cycling failure logged; internal temperature elevated (+10.4°C)',
    cratesCount: 500,
    weightKg: 5000,
    journey: {
      currentLegIndex: 1,
      legs: [
        {
          id: 'LEG-250705-01',
          order: 1,
          mode: 'Farm',
          vehicleLabel: 'Coorg Estate Packing Shed',
          startLocation: 'Madikeri Plantation',
          endLocation: 'Cold Staging Room',
          startTime: '2026-09-28 08:00',
          endTime: '2026-09-28 11:00',
          status: 'Done',
          handoverAfter: {
            id: 'HO-250705-01',
            time: '2026-09-28 11:00 UTC',
            location: 'Madikeri Dispatch Platform',
            ledgerHash: '0x29761c380a5034720918237ba5148301',
            fromParty: 'Coorg Organic Agro',
            toParty: 'Southern Ocean Freight',
            notes: 'Pallet temperature logged at 6.0°C. Nitrogen purge confirmed.',
          },
        },
        {
          id: 'LEG-250705-02',
          order: 2,
          mode: 'Truck',
          vehicleLabel: 'Reefer Truck KA-04-TR-7721',
          startLocation: 'Bengaluru Logistics Corridor',
          endLocation: 'Cochin Port Terminal',
          startTime: '2026-09-28 11:15',
          endTime: '2026-09-30 18:00',
          status: 'Active',
          handoverAfter: {
            id: 'HO-250705-02',
            time: '2026-09-30 18:00 UTC (Estimated)',
            location: 'Vallarpadam Reefer Terminal',
            ledgerHash: '0x44201839ab10284719284bc109284728',
            fromParty: 'Southern Ocean Freight',
            toParty: 'DP World Cochin',
            notes: 'Emergency technician dispatch alert dispatched for compressor servicing.',
          },
        },
        {
          id: 'LEG-250705-03',
          order: 3,
          mode: 'Port',
          vehicleLabel: 'Cochin Vallarpadam Stacking Berth',
          startLocation: 'Cochin Yard',
          endLocation: 'Quay 1',
          startTime: '2026-09-30 18:30',
          endTime: '2026-10-01 04:00',
          status: 'Upcoming',
          handoverAfter: {
            id: 'HO-250705-03',
            time: '2026-10-01 04:00 UTC (Estimated)',
            location: 'Quay Crane 04',
            ledgerHash: '0xpending_anchor_cochin',
            fromParty: 'DP World Cochin',
            toParty: 'Q-Line Maritime Master',
            notes: 'Transfer to vessel refrigerated hold.',
          },
        },
        {
          id: 'LEG-250705-04',
          order: 4,
          mode: 'Ship',
          vehicleLabel: 'Vessel Al Mirqab (Voyage 09)',
          startLocation: 'Cochin Port',
          endLocation: 'Hamad Port, Doha',
          startTime: '2026-10-01 06:00',
          endTime: '2026-10-03 10:00',
          status: 'Upcoming',
          handoverAfter: {
            id: 'HO-250705-04',
            time: '2026-10-03 10:00 UTC (Estimated)',
            location: 'Hamad Port Berth 2',
            ledgerHash: '0xpending_anchor_doha',
            fromParty: 'Q-Line Maritime Master',
            toParty: 'Qatar Cold Distribution',
            notes: 'Port discharge & inspection.',
          },
        },
        {
          id: 'LEG-250705-05',
          order: 5,
          mode: 'Port',
          vehicleLabel: 'Hamad Port Refrigerated Buffer',
          startLocation: 'Hamad Berth 2',
          endLocation: 'Quarantine Yard',
          startTime: '2026-10-03 10:30',
          endTime: '2026-10-03 13:00',
          status: 'Upcoming',
          handoverAfter: {
            id: 'HO-250705-05',
            time: '2026-10-03 13:00 UTC (Estimated)',
            location: 'Hamad Customs Gate',
            ledgerHash: '0xpending_anchor_hamad',
            fromParty: 'Qatar Food Quarantine',
            toParty: 'Gulf Cold Express',
            notes: 'Final delivery release.',
          },
        },
        {
          id: 'LEG-250705-06',
          order: 6,
          mode: 'Truck',
          vehicleLabel: 'Doha Reefer Truck QA-11-209',
          startLocation: 'Hamad Port',
          endLocation: 'Central Food Market Doha',
          startTime: '2026-10-03 13:30',
          endTime: '2026-10-03 16:00',
          status: 'Upcoming',
        },
      ],
    },
    currentLeg: {
      id: 'LEG-250705-02',
      order: 2,
      mode: 'Truck',
      vehicleLabel: 'Reefer Truck KA-04-TR-7721',
      startLocation: 'Bengaluru Logistics Corridor',
      endLocation: 'Cochin Port Terminal',
      startTime: '2026-09-28 11:15',
      status: 'Active',
    },
    latestReading: {
      timestamp: 'Just now',
      temperature: 10.4,
      humidity: 81.2,
      ethylene: 1.85,
      vibration: 0.38,
      latitude: 12.9716,
      longitude: 77.5946,
      speedKmH: 62,
      tamperDetected: false,
      batteryPct: 74,
      batteryVoltage: 3.88,
      batteryHarvestingMw: 140,
      signalDbm: -84,
      hashChainIndex: 412,
      currentHash: '0x44201839ab10284719284bc10928472819204857',
      previousHash: '0x331907289a09173608173ab09817361708193746',
      chainStatus: 'Anchored on ledger',
      blockNumber: 1489239,
      isSynced: true,
    },
    ledger: {
      blockNumber: 1489239,
      txHash: '0x44201839ab10284719284bc10928472819204857',
      merkleRoot: '0xff192837461920',
      timestamp: '8 mins ago',
      network: 'Arbitrum Orbit / FoodChain-L3',
      status: 'Verified',
      offlineBlocksChained: 0,
      verifiedIntegrity: true,
    },
  },
  {
    id: 'ST250706',
    batchId: 'BATCH-CITRUS-2026-N02',
    cargoDescription: 'Nagpur Mandarins (Cold Quarantine Protocol Protocol B3)',
    fruit: 'Citrus',
    origin: 'Nagpur',
    destination: 'Singapore',
    carrier: 'Eastern Gateway Reefers',
    truckId: 'MH-31-CB-5510',
    currentVehicleLabel: 'Reefer Truck MH-31-CB-5510',
    nodeId: 'ST-NODE-0524',
    departureTime: '2026-09-29 18:30',
    eta: '2026-10-08 14:00',
    distanceCoveredKm: 980,
    totalDistanceKm: 4200,
    status: 'In Transit',
    risk: 'Low',
    connection: 'Online',
    conditionScore: 93,
    conditionReason: 'Cold treatment protocol (1.5°C) maintained for Mediterranean fruit fly quarantine',
    cratesCount: 880,
    weightKg: 6160,
    journey: {
      currentLegIndex: 1,
      legs: [
        {
          id: 'LEG-250706-01',
          order: 1,
          mode: 'Farm',
          vehicleLabel: 'Nagpur Mandarin Packhouse Tunnel',
          startLocation: 'Nagpur Citrus Belt',
          endLocation: 'Grading & Cooling Tunnel',
          startTime: '2026-09-29 14:00',
          endTime: '2026-09-29 18:30',
          status: 'Done',
          handoverAfter: {
            id: 'HO-250706-01',
            time: '2026-09-29 18:30 UTC',
            location: 'Nagpur Packhouse 1',
            ledgerHash: '0xf643e905072d014f19204857b2c34918',
            fromParty: 'Vidarbha Citrus Cooperative',
            toParty: 'Eastern Gateway Reefers',
            notes: 'Pre-treated at 5.5°C. Electronic phytosanitary seal applied.',
          },
        },
        {
          id: 'LEG-250706-02',
          order: 2,
          mode: 'Truck',
          vehicleLabel: 'Reefer Truck MH-31-CB-5510',
          startLocation: 'Nagpur',
          endLocation: 'Mumbai JNPT Port',
          startTime: '2026-09-29 18:45',
          endTime: '2026-10-01 02:00',
          status: 'Active',
          handoverAfter: {
            id: 'HO-250706-02',
            time: '2026-10-01 02:00 UTC (Estimated)',
            location: 'JNPT Reefer Gate 2',
            ledgerHash: '0x66f910482019ab73819028cb91028472',
            fromParty: 'Eastern Gateway Reefers',
            toParty: 'Hapag-Lloyd Maritime Master',
            notes: 'Container crane loading scheduled for export voyage.',
          },
        },
        {
          id: 'LEG-250706-03',
          order: 3,
          mode: 'Port',
          vehicleLabel: 'JNPT Container Berth Quay 4',
          startLocation: 'Inward Gate',
          endLocation: 'Vessel Deck 3',
          startTime: '2026-10-01 02:30',
          endTime: '2026-10-01 10:00',
          status: 'Upcoming',
          handoverAfter: {
            id: 'HO-250706-03',
            time: '2026-10-01 10:00 UTC (Estimated)',
            location: 'Quay Crane 01',
            ledgerHash: '0xpending_anchor_citrus_jnpt',
            fromParty: 'JNPT Terminal Operators',
            toParty: 'Ocean Network Express',
            notes: 'Boarding container hold.',
          },
        },
        {
          id: 'LEG-250706-04',
          order: 4,
          mode: 'Ship',
          vehicleLabel: 'Vessel Hapag-Lloyd Al Jmeliyah',
          startLocation: 'JNPT Mumbai',
          endLocation: 'PSA Singapore Port',
          startTime: '2026-10-01 12:00',
          endTime: '2026-10-07 18:00',
          status: 'Upcoming',
          handoverAfter: {
            id: 'HO-250706-04',
            time: '2026-10-07 18:00 UTC (Estimated)',
            location: 'PSA Pasir Panjang Terminal',
            ledgerHash: '0xpending_anchor_singapore',
            fromParty: 'Ocean Network Express',
            toParty: 'SingaFresh Cold Logistics',
            notes: 'Discharge to Singapore cold logistics.',
          },
        },
        {
          id: 'LEG-250706-05',
          order: 5,
          mode: 'Port',
          vehicleLabel: 'PSA Cold Buffer Berth',
          startLocation: 'PSA Pasir Panjang',
          endLocation: 'AVA Cold Storage',
          startTime: '2026-10-07 18:30',
          endTime: '2026-10-08 08:00',
          status: 'Upcoming',
          handoverAfter: {
            id: 'HO-250706-05',
            time: '2026-10-08 08:00 UTC (Estimated)',
            location: 'AVA Quarantine Bay',
            ledgerHash: '0xpending_anchor_psa',
            fromParty: 'Singapore Food Agency',
            toParty: 'Singapore Island Reefer',
            notes: 'Quarantine clearance approved.',
          },
        },
        {
          id: 'LEG-250706-06',
          order: 6,
          mode: 'Truck',
          vehicleLabel: 'PSA Reefer Van SG-881-A',
          startLocation: 'PSA Port',
          endLocation: 'Pasir Panjang Wholesale Centre, Singapore',
          startTime: '2026-10-08 08:30',
          endTime: '2026-10-08 14:00',
          status: 'Upcoming',
        },
      ],
    },
    currentLeg: {
      id: 'LEG-250706-02',
      order: 2,
      mode: 'Truck',
      vehicleLabel: 'Reefer Truck MH-31-CB-5510',
      startLocation: 'Nagpur',
      endLocation: 'Mumbai JNPT Port',
      startTime: '2026-09-29 18:45',
      status: 'Active',
    },
    latestReading: {
      timestamp: 'Just now',
      temperature: 5.8,
      humidity: 89.0,
      ethylene: 0.09,
      vibration: 0.28,
      latitude: 21.1458,
      longitude: 79.0882,
      speedKmH: 70,
      tamperDetected: false,
      batteryPct: 89,
      batteryVoltage: 4.08,
      batteryHarvestingMw: 195,
      signalDbm: -76,
      hashChainIndex: 780,
      currentHash: '0x66f910482019ab73819028cb9102847291048b2a',
      previousHash: '0x55e8093719089a62708917ba8091736180937a19',
      chainStatus: 'Syncing over MQTT',
      isSynced: true,
    },
    ledger: {
      blockNumber: 1489241,
      txHash: '0x66f910482019ab73819028cb9102847291048b2a',
      merkleRoot: '0xdd4910283b9102',
      timestamp: 'Just now',
      network: 'Arbitrum Orbit / FoodChain-L3',
      status: 'Verified',
      offlineBlocksChained: 38,
      verifiedIntegrity: true,
    },
  },
];

// Initial IoT Nodes
const INITIAL_DEVICES: DeviceItem[] = [
  {
    id: 'ST-NODE-0142',
    assignedShipmentId: 'ST250701',
    fruit: 'Mango',
    batteryPct: 94,
    harvestingType: 'Solar',
    harvestingMw: 180,
    signalDbm: -78,
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
    storageUsedPct: 12,
    storageBufferDays: 14,
    batteryHistory: [
      { time: '10:00', batteryPct: 92, harvestingMw: 120 },
      { time: '11:00', batteryPct: 93, harvestingMw: 160 },
      { time: '12:00', batteryPct: 94, harvestingMw: 195 },
      { time: '13:00', batteryPct: 94, harvestingMw: 180 },
    ],
  },
  {
    id: 'ST-NODE-0089',
    assignedShipmentId: 'ST250702',
    fruit: 'Banana',
    batteryPct: 88,
    harvestingType: 'Solar',
    harvestingMw: 140,
    signalDbm: -82,
    firmwareVersion: 'v2.4.1',
    lastSeen: 'Just now',
    enclosureRating: 'IP67',
    sensorHealth: {
      sht31: 'OK',
      ethylene: 'OK',
      imu: 'OK',
      gps: 'OK',
    },
    tamperStatus: 'Sealed',
    storageUsedPct: 18,
    storageBufferDays: 12,
    batteryHistory: [
      { time: '10:00', batteryPct: 86, harvestingMw: 110 },
      { time: '11:00', batteryPct: 87, harvestingMw: 135 },
      { time: '12:00', batteryPct: 88, harvestingMw: 150 },
      { time: '13:00', batteryPct: 88, harvestingMw: 140 },
    ],
  },
  {
    id: 'ST-NODE-0205',
    assignedShipmentId: 'ST250703',
    fruit: 'Grapes',
    batteryPct: 91,
    harvestingType: 'Thermal',
    harvestingMw: 110,
    signalDbm: -108,
    firmwareVersion: 'v2.4.0',
    lastSeen: '2m ago',
    enclosureRating: 'IP67',
    sensorHealth: {
      sht31: 'OK',
      ethylene: 'OK',
      imu: 'OK',
      gps: 'OK',
    },
    tamperStatus: 'Breached',
    storageUsedPct: 42,
    storageBufferDays: 8,
    batteryHistory: [
      { time: '10:00', batteryPct: 93, harvestingMw: 95 },
      { time: '11:00', batteryPct: 92, harvestingMw: 105 },
      { time: '12:00', batteryPct: 91, harvestingMw: 115 },
      { time: '13:00', batteryPct: 91, harvestingMw: 110 },
    ],
  },
  {
    id: 'ST-NODE-0331',
    assignedShipmentId: 'ST250704',
    fruit: 'Apple',
    batteryPct: 96,
    harvestingType: 'Solar',
    harvestingMw: 210,
    signalDbm: -74,
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
    storageUsedPct: 8,
    storageBufferDays: 16,
    batteryHistory: [
      { time: '10:00', batteryPct: 94, harvestingMw: 180 },
      { time: '11:00', batteryPct: 95, harvestingMw: 200 },
      { time: '12:00', batteryPct: 96, harvestingMw: 220 },
      { time: '13:00', batteryPct: 96, harvestingMw: 210 },
    ],
  },
  {
    id: 'ST-NODE-0418',
    assignedShipmentId: 'ST250705',
    fruit: 'Avocado',
    batteryPct: 74,
    harvestingType: 'Thermal',
    harvestingMw: 140,
    signalDbm: -84,
    firmwareVersion: 'v2.3.9',
    lastSeen: 'Just now',
    enclosureRating: 'IP67',
    sensorHealth: {
      sht31: 'OK',
      ethylene: 'Fault',
      imu: 'OK',
      gps: 'OK',
    },
    tamperStatus: 'Sealed',
    storageUsedPct: 24,
    storageBufferDays: 10,
    batteryHistory: [
      { time: '10:00', batteryPct: 78, harvestingMw: 130 },
      { time: '11:00', batteryPct: 76, harvestingMw: 135 },
      { time: '12:00', batteryPct: 75, harvestingMw: 145 },
      { time: '13:00', batteryPct: 74, harvestingMw: 140 },
    ],
  },
  {
    id: 'ST-NODE-0524',
    assignedShipmentId: 'ST250706',
    fruit: 'Citrus',
    batteryPct: 89,
    harvestingType: 'Solar',
    harvestingMw: 195,
    signalDbm: -76,
    firmwareVersion: 'v2.4.1',
    lastSeen: 'Just now',
    enclosureRating: 'IP67',
    sensorHealth: {
      sht31: 'OK',
      ethylene: 'OK',
      imu: 'OK',
      gps: 'OK',
    },
    tamperStatus: 'Sealed',
    storageUsedPct: 15,
    storageBufferDays: 13,
    batteryHistory: [
      { time: '10:00', batteryPct: 87, harvestingMw: 170 },
      { time: '11:00', batteryPct: 88, harvestingMw: 190 },
      { time: '12:00', batteryPct: 89, harvestingMw: 205 },
      { time: '13:00', batteryPct: 89, harvestingMw: 195 },
    ],
  },
];

// Initial Reports List
const INITIAL_REPORTS: ReportItem[] = [
  {
    id: 'REP-2026-081',
    title: 'Shipment Compliance Report',
    type: 'Shipment Compliance Report',
    date: '2026-09-30',
    shipmentId: 'ST250701',
    fruit: 'Mango',
    fileSize: '1.4 MB',
    status: 'Ready',
  },
  {
    id: 'REP-2026-080',
    title: 'Cold-Chain Excursion Report',
    type: 'Cold-Chain Excursion Report',
    date: '2026-09-30',
    shipmentId: 'ST250705',
    fruit: 'Avocado',
    fileSize: '2.8 MB',
    status: 'Ready',
  },
  {
    id: 'REP-2026-079',
    title: 'Export Audit Pack',
    type: 'Export Audit Pack',
    date: '2026-09-29',
    shipmentId: 'ST250703',
    fruit: 'Grapes',
    fileSize: '3.6 MB',
    status: 'Ready',
  },
  {
    id: 'REP-2026-078',
    title: 'Phytosanitary Stability Dossier',
    type: 'Phytosanitary Stability Dossier',
    date: '2026-09-28',
    shipmentId: 'ST250704',
    fruit: 'Apple',
    fileSize: '1.9 MB',
    status: 'Archived',
  },
];

// Initial Users List
const INITIAL_USERS: UserItem[] = [
  {
    id: 'USR-01',
    name: 'Vikram Patel',
    email: 'vikram.patel@nashik-agriexport.com',
    role: 'Admin',
    status: 'Active',
    lastActive: 'Just now',
  },
  {
    id: 'USR-02',
    name: 'Sarah Jenkins',
    email: 's.jenkins@arabiansea-reefer.ae',
    role: 'Logistics Manager',
    status: 'Active',
    lastActive: '14m ago',
  },
  {
    id: 'USR-03',
    name: 'Dr. Rajesh Sharma',
    email: 'rsharma@national-phytosanitary.gov.in',
    role: 'Auditor',
    status: 'Active',
    lastActive: '2h ago',
  },
  {
    id: 'USR-04',
    name: 'Ramesh Kumar',
    email: 'ramesh.k@ganga-express.in',
    role: 'Driver',
    status: 'Active',
    lastActive: 'Just now',
  },
  {
    id: 'USR-05',
    name: 'David Chen',
    email: 'd.chen@globalport-inspect.sg',
    role: 'Auditor',
    status: 'Invited',
    lastActive: 'Never',
  },
];

// Initial Settings State
const INITIAL_SETTINGS: SettingsState = {
  notifications: {
    emailExcursion: true,
    emailTamper: true,
    emailDigest: true,
    smsEmergency: true,
    smsDriverWarnings: true,
    phoneContact: '+91 98200 44912',
    emailContact: 'operations@smarttrace.io',
  },
  data: {
    samplingIntervalSeconds: 20,
    offlineBufferCapacityMb: 64,
    autoFlushOnReconnect: true,
  },
  ledger: {
    networkName: 'Permissioned consortium ledger',
    anchorIntervalMinutes: 15,
    rollupRpcUrl: 'https://arbitrum-orbit.smarttrace.io/rpc',
    settlementContract: '0x71C809228941BC2847102948192847291048b2a1',
    batchSizeLimit: 142,
  },
  units: {
    tempUnit: 'C',
    dateFormat: 'YYYY-MM-DD',
  },
};

interface SimulationStoreState {
  shipments: ShipmentItem[];
  selectedShipmentId: string;
  connectionStatus: GlobalConnectionStatus;
  selectedFruit: FilterFruit;
  fruitConfigs: Record<FruitType, FruitConfig>;
  tamperLog: SensorReading[];
  ledgerBlocks: LedgerBlockEntry[];
  alerts: AlertItem[];
  recentAlerts: AlertItem[];
  activeToast: AlertToast | null;
  telemetryHistory: TelemetryPoint[];
  truckProgressPct: number;
  highlightTile: boolean;

  // New modules
  devices: DeviceItem[];
  reports: ReportItem[];
  users: UserItem[];
  settings: SettingsState;

  // Actions
  setSelectedShipmentId: (id: string) => void;
  setSelectedFruit: (fruit: FilterFruit) => void;
  toggleConnectivityLoss: () => void;
  restoreConnectivity: () => void;
  cycleConnectionState: () => void;
  updateFruitProfile: (fruit: FruitType, updated: Partial<FruitConfig>) => void;
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  dismissToast: () => void;
  triggerSimulatedAlert: () => void;

  // Device actions
  addDevice: (device: Partial<DeviceItem>) => void;

  // Report actions
  generateReport: (report: Partial<ReportItem>) => void;

  // User actions
  inviteUser: (user: Partial<UserItem>) => void;

  // Settings action
  updateSettings: (partial: Partial<SettingsState>) => void;

  // Internal tick
  tickSimulation: () => void;
}

export const useSimulationStore = create<SimulationStoreState>((set, get) => ({
  shipments: INITIAL_SHIPMENTS,
  selectedShipmentId: 'ST250701',
  connectionStatus: 'ONLINE via LTE-M',
  selectedFruit: 'All fruits',
  fruitConfigs: FRUIT_CONFIGS,
  tamperLog: [],
  ledgerBlocks: [
    { blockNumber: 1489242, timestamp: '1m ago', recordsCount: 18, txHash: '0x99c2ea8804fba31952f4c918237ba5148301cf78' },
    { blockNumber: 1489241, timestamp: '3m ago', recordsCount: 38, txHash: '0x66f910482019ab73819028cb9102847291048b2a' },
    { blockNumber: 1489240, timestamp: '7m ago', recordsCount: 24, txHash: '0x8f3c719e2ab69018c1d54238e9a2b0c41d72390f' },
    { blockNumber: 1489239, timestamp: '12m ago', recordsCount: 16, txHash: '0x44201839ab10284719284bc10928472819204857' },
    { blockNumber: 1489238, timestamp: '19m ago', recordsCount: 30, txHash: '0x12a8928374619204829104829104829104829104' },
  ],
  alerts: [
    {
      id: 'ALT-501',
      shipmentId: 'ST250705',
      fruit: 'Avocado',
      severity: 'Critical',
      title: 'Temperature above 10 C for 12 min',
      timestamp: '12m ago',
      date: '2026-09-30',
      location: 'Bengaluru Logistics Corridor (NH-44)',
      parameter: 'Temperature',
      measuredValue: '10.4 °C',
      limitValue: '7.0 °C max (12 min limit)',
      status: 'Open',
      recordHash: '0x44201839ab102847',
      blockNumber: 1489239,
      timeline: [
        { time: '13:30', label: 'Threshold Excursion', description: 'Internal container temperature breached 7.0°C upper limit.' },
        { time: '13:36', label: 'Persistence Trigger', description: 'Thermal excursion exceeded 6-minute hysteresis buffer.' },
        { time: '13:42', label: 'Critical Alert Raised', description: 'Excursion sustained at 10.4°C for 12 consecutive minutes. Reefer alarm engaged.' },
      ],
      readingsWindow: [
        { time: '13:28', temp: 6.9, humidity: 84.1, ethylene: 1.62, vibration: 0.24, hash: '0x321908ab42c98110' },
        { time: '13:32', temp: 7.8, humidity: 83.5, ethylene: 1.70, vibration: 0.28, hash: '0x389104bc55d09221' },
        { time: '13:36', temp: 8.9, humidity: 82.8, ethylene: 1.75, vibration: 0.31, hash: '0x401295cd66e10332' },
        { time: '13:40', temp: 9.9, humidity: 81.9, ethylene: 1.81, vibration: 0.35, hash: '0x429184de77f21443' },
        { time: '13:42', temp: 10.4, humidity: 81.2, ethylene: 1.85, vibration: 0.38, hash: '0x44201839ab102847' },
      ],
    },
    {
      id: 'ALT-502',
      shipmentId: 'ST250702',
      fruit: 'Banana',
      severity: 'Warning',
      title: 'Ethylene spike 2.4 ppm',
      timestamp: '24m ago',
      date: '2026-09-30',
      location: 'Varanasi Express Link Km 140',
      parameter: 'Ethylene',
      measuredValue: '2.40 ppm',
      limitValue: '1.50 ppm max safe ceiling',
      status: 'Open',
      recordHash: '0x77c1b892a0184421',
      blockNumber: 1489241,
      timeline: [
        { time: '13:10', label: 'Baseline Respiration', description: 'Ethylene steady at 0.60 ppm within safe green stage limits.' },
        { time: '13:20', label: 'Rate of Rise Detected', description: 'Electrochemical sensor detected rapid +0.8 ppm/10min ramp.' },
        { time: '13:30', label: 'Warning Dispatched', description: 'Ethylene concentration reached 2.40 ppm. Auto-vent scrubber cycle initiated.' },
      ],
      readingsWindow: [
        { time: '13:10', temp: 13.2, humidity: 88.0, ethylene: 0.62, vibration: 0.18, hash: '0x71a00821b0193310' },
        { time: '13:18', temp: 13.3, humidity: 87.8, ethylene: 1.25, vibration: 0.20, hash: '0x73b11932c1204421' },
        { time: '13:24', temp: 13.4, humidity: 87.5, ethylene: 1.95, vibration: 0.22, hash: '0x75c22043d2315532' },
        { time: '13:30', temp: 13.5, humidity: 87.3, ethylene: 2.40, vibration: 0.21, hash: '0x77c1b892a0184421' },
      ],
    },
    {
      id: 'ALT-503',
      shipmentId: 'ST250703',
      fruit: 'Grapes',
      severity: 'Critical',
      title: 'Box opened - tamper detected',
      timestamp: '48m ago',
      date: '2026-09-30',
      location: 'Western Ghats Rest Area B4',
      parameter: 'Tamper',
      measuredValue: 'Breached (185 Lux)',
      limitValue: 'Sealed enclosure (< 5 Lux)',
      status: 'Open',
      recordHash: '0x9a30281bfe491102',
      blockNumber: 1489238,
      timeline: [
        { time: '12:55', label: 'Vehicle Halted', description: 'GPS accelerometer registered stationary halt at unscheduled roadside bay.' },
        { time: '13:02', label: 'Photocell Light Breached', description: 'Light level abruptly spiked from 0 Lux to 185 Lux inside secured reefer crate.' },
        { time: '13:03', label: 'Tamper Flag Anchored', description: 'Hardware tamper pin triggered; encrypted signature generated and saved.' },
      ],
      readingsWindow: [
        { time: '12:50', temp: -0.4, humidity: 91.2, ethylene: 0.12, vibration: 0.14, hash: '0x9710180aed380091' },
        { time: '12:58', temp: -0.3, humidity: 90.9, ethylene: 0.14, vibration: 0.05, hash: '0x9820291bee491100' },
        { time: '13:02', temp: 1.8, humidity: 86.4, ethylene: 0.18, vibration: 0.42, hash: '0x9a30281bfe491102' },
        { time: '13:06', temp: 1.4, humidity: 87.1, ethylene: 0.19, vibration: 0.15, hash: '0x9b40392c0f5a2213' },
      ],
    },
    {
      id: 'ALT-504',
      shipmentId: 'ST250704',
      fruit: 'Apple',
      severity: 'Critical',
      title: 'Shock event 4.1 g',
      timestamp: '1h 15m ago',
      date: '2026-09-30',
      location: 'NH-44 Toll Bypass Bridge Exp',
      parameter: 'Shock',
      measuredValue: '4.10 g (Z-Axis)',
      limitValue: '1.40 g max safe impact',
      status: 'Acknowledged',
      recordHash: '0x33401928bc710294',
      blockNumber: 1489237,
      timeline: [
        { time: '12:38', label: 'Smooth Transit', description: 'RMS 3-axis vibration under 0.20 g at 78 km/h.' },
        { time: '12:41', label: 'Pothole / Curb Impact', description: 'Triaxial MEMS accelerometer registered peak vertical shock of 4.10 g.' },
        { time: '12:43', label: 'Bruising Calculation', description: 'Damage assessment algorithm flagged high risk of internal flesh bruising.' },
      ],
      readingsWindow: [
        { time: '12:35', temp: 1.1, humidity: 93.9, ethylene: 0.42, vibration: 0.18, hash: '0x31201716ab509182' },
        { time: '12:39', temp: 1.2, humidity: 93.8, ethylene: 0.44, vibration: 0.22, hash: '0x32301827bc609283' },
        { time: '12:41', temp: 1.2, humidity: 93.8, ethylene: 0.45, vibration: 4.10, hash: '0x33401928bc710294' },
        { time: '12:45', temp: 1.2, humidity: 93.7, ethylene: 0.46, vibration: 0.25, hash: '0x34502039cd820305' },
      ],
    },
    {
      id: 'ALT-505',
      shipmentId: 'ST250703',
      fruit: 'Grapes',
      severity: 'Warning',
      title: 'Connection lost - logging on device',
      timestamp: '2h ago',
      date: '2026-09-30',
      location: 'Igatpuri Mountain Pass Sector 2',
      parameter: 'Connectivity',
      measuredValue: 'No LTE-M carrier link',
      limitValue: 'Active GSM link',
      status: 'Acknowledged',
      recordHash: '0x8192a018bc492817',
      blockNumber: 1489236,
      timeline: [
        { time: '11:45', label: 'Cellular Handshake Timeout', description: 'Node lost cellular tower registration in dead zone.' },
        { time: '11:46', label: 'Offline Mode Engaged', description: 'Rugged node switched to on-board SPI NOR flash hash-chaining buffer.' },
        { time: '11:47', label: 'Zero Data Loss Mode', description: 'Sensor sampling continued uninterrupted at 30-second intervals.' },
      ],
      readingsWindow: [
        { time: '11:40', temp: -0.6, humidity: 91.5, ethylene: 0.11, vibration: 0.21, hash: '0x80819f07ab381706' },
        { time: '11:45', temp: -0.5, humidity: 91.4, ethylene: 0.11, vibration: 0.24, hash: '0x8192a018bc492817' },
        { time: '11:50', temp: -0.5, humidity: 91.3, ethylene: 0.12, vibration: 0.20, hash: '0x82a3b129cd503928' },
      ],
    },
    {
      id: 'ALT-506',
      shipmentId: 'ST250706',
      fruit: 'Citrus',
      severity: 'Warning',
      title: 'Connection restored - 142 records syncing',
      timestamp: '3h ago',
      date: '2026-09-30',
      location: 'Mumbai Port Terminal 1 Gate',
      parameter: 'Offline Sync',
      measuredValue: '142 buffered records',
      limitValue: '0 records (Synced)',
      status: 'Resolved',
      recordHash: '0x66f910482019ab73',
      blockNumber: 1489241,
      timeline: [
        { time: '10:30', label: 'LTE-M Signal Acquired', description: 'Node successfully reconnected to LTE-M carrier network (-76 dBm).' },
        { time: '10:31', label: 'MQTT Burst Sync Initiated', description: 'Buffered 142 SHA-256 sensor records transmitted in batch payloads.' },
        { time: '10:32', label: 'Ledger Settlement', description: 'Batch anchored into Arbitrum Orbit L3 block #1489241. Unbroken chain verified.' },
      ],
      readingsWindow: [
        { time: '10:25', temp: 5.6, humidity: 89.2, ethylene: 0.08, vibration: 0.22, hash: '0x64e7082618078951' },
        { time: '10:28', temp: 5.7, humidity: 89.1, ethylene: 0.08, vibration: 0.25, hash: '0x65f8093719189a62' },
        { time: '10:31', temp: 5.8, humidity: 89.0, ethylene: 0.09, vibration: 0.28, hash: '0x66f910482019ab73' },
        { time: '10:34', temp: 5.7, humidity: 89.1, ethylene: 0.08, vibration: 0.24, hash: '0x670a2159312a0b84' },
      ],
    },
    {
      id: 'ALT-507',
      shipmentId: 'ST250701',
      fruit: 'Mango',
      severity: 'Warning',
      title: 'Custody Handover: Gate-in at JNPT Reefer Terminal',
      timestamp: '1h ago',
      date: '2026-09-30',
      location: 'JNPT Nhava Sheva Reefer Gate 3',
      parameter: 'Handover',
      measuredValue: 'Ledger Hash 0x913b82ac...',
      limitValue: 'ColdEx Logistics → DP World Terminal',
      status: 'Acknowledged',
      recordHash: '0x913b82ac74df102a94bc72105e481029',
      blockNumber: 1489240,
      timeline: [
        { time: '17:40', label: 'Terminal Arrival', description: 'Reefer truck MH-15-EF-2018 arrived at JNPT Nhava Sheva holding gate.' },
        { time: '17:45', label: 'Custody Handover Signed', description: 'Physical seal confirmed. Cryptographic handover signed between ColdEx and DP World.' },
        { time: '17:46', label: 'Ledger Settlement', description: 'Handover receipt anchored in Arbitrum L3 block #1489240.' },
      ],
      readingsWindow: [
        { time: '17:35', temp: 12.3, humidity: 87.1, ethylene: 0.28, vibration: 0.20, hash: '0x902a719b63ce0918' },
        { time: '17:45', temp: 12.4, humidity: 87.0, ethylene: 0.29, vibration: 0.18, hash: '0x913b82ac74df102a' },
      ],
    },
    {
      id: 'ALT-508',
      shipmentId: 'ST250701',
      fruit: 'Mango',
      severity: 'Warning',
      title: 'Custody Handover: Loaded to Vessel Maersk Mc-Kinney Møller',
      timestamp: '4h ago',
      date: '2026-09-30',
      location: 'JNPT Berth Quay Crane 07',
      parameter: 'Handover',
      measuredValue: 'Ledger Hash 0xa24d91be...',
      limitValue: 'DP World → Maersk Line Maritime Master',
      status: 'Acknowledged',
      recordHash: '0xa24d91be63cf881027b409214d890123',
      blockNumber: 1489239,
      timeline: [
        { time: '02:00', label: 'Container Crane Lift', description: 'Palletized reefer lifted to vessel cell bay 04B.' },
        { time: '02:15', label: 'Power Coupling & Handover', description: 'Auxiliary 440V reefer power engaged. Master signed custody ledger hash.' },
      ],
      readingsWindow: [
        { time: '02:10', temp: 12.5, humidity: 87.2, ethylene: 0.30, vibration: 0.45, hash: '0xa13c80ad52be7709' },
        { time: '02:15', temp: 12.5, humidity: 87.3, ethylene: 0.30, vibration: 0.12, hash: '0xa24d91be63cf8810' },
      ],
    },
    {
      id: 'ALT-509',
      shipmentId: 'ST250701',
      fruit: 'Mango',
      severity: 'Warning',
      title: 'Sea leg offline - Device logging to on-board flash',
      timestamp: '35m ago',
      date: '2026-09-30',
      location: 'Arabian Sea Maritime Corridor (180 NM offshore)',
      parameter: 'Offline Event',
      measuredValue: 'Maritime dead zone (0 dBm)',
      limitValue: 'LTE-M out of range • Local EEPROM storage active',
      status: 'Open',
      recordHash: '0x8f3c719e2ab69018',
      blockNumber: 1489242,
      timeline: [
        { time: '04:30', label: 'Vessel Departed Territorial Waters', description: 'Cellular signals degraded past 12 nautical miles.' },
        { time: '04:35', label: 'Offline Storage Engaged', description: 'Pallet node switched to local SPI flash memory. Continuous hash-chaining active.' },
      ],
      readingsWindow: [
        { time: '04:30', temp: 12.6, humidity: 87.4, ethylene: 0.31, vibration: 0.16, hash: '0x8e2b608d1fa58907' },
        { time: '04:35', temp: 12.7, humidity: 87.5, ethylene: 0.31, vibration: 0.17, hash: '0x8f3c719e2ab69018' },
      ],
    },
    {
      id: 'ALT-510',
      shipmentId: 'ST250701',
      fruit: 'Mango',
      severity: 'Warning',
      title: 'Port arrival sync scheduled at Jebel Ali Port',
      timestamp: '10m ago',
      date: '2026-09-30',
      location: 'Jebel Ali Approach Channel',
      parameter: 'Offline Sync',
      measuredValue: '184 records queued',
      limitValue: 'Automatic MQTT burst on cellular reconnect',
      status: 'Open',
      recordHash: '0x99c2ea8804fba319',
      blockNumber: 1489242,
      timeline: [
        { time: '13:30', label: 'Coastal Beacon Ping', description: 'Initial carrier handshake detected near UAE waters.' },
        { time: '13:45', label: 'Sync Pipeline Armed', description: 'On-board records validated and queued for batch offload to Arbitrum L3.' },
      ],
      readingsWindow: [
        { time: '13:40', temp: 12.7, humidity: 87.5, ethylene: 0.32, vibration: 0.20, hash: '0x98b1d97703ea9208' },
        { time: '13:45', temp: 12.7, humidity: 87.6, ethylene: 0.32, vibration: 0.19, hash: '0x99c2ea8804fba319' },
      ],
    },
  ],
  recentAlerts: [],
  activeToast: null,
  telemetryHistory: [
    { time: '12:00', temp: 12.4, humidity: 87.0, ethylene: 0.28, vibration: 0.18 },
    { time: '12:15', temp: 12.5, humidity: 87.2, ethylene: 0.29, vibration: 0.20 },
    { time: '12:30', temp: 12.7, humidity: 87.4, ethylene: 0.30, vibration: 0.22 },
    { time: '12:45', temp: 12.6, humidity: 87.3, ethylene: 0.31, vibration: 0.19 },
    { time: '13:00', temp: 12.8, humidity: 87.6, ethylene: 0.32, vibration: 0.24 },
    { time: '13:15', temp: 12.7, humidity: 87.5, ethylene: 0.32, vibration: 0.21 },
    { time: '13:30', temp: 12.9, humidity: 87.8, ethylene: 0.33, vibration: 0.25 },
    { time: '13:45', temp: 12.8, humidity: 87.5, ethylene: 0.32, vibration: 0.22 },
  ],
  truckProgressPct: 44,
  highlightTile: false,

  devices: INITIAL_DEVICES,
  reports: INITIAL_REPORTS,
  users: INITIAL_USERS,
  settings: INITIAL_SETTINGS,

  setSelectedShipmentId: (id) => set({ selectedShipmentId: id }),
  setSelectedFruit: (fruit) => set({ selectedFruit: fruit }),

  toggleConnectivityLoss: () => {
    const { connectionStatus, selectedShipmentId, shipments } = get();
    const active = shipments.find((s) => s.id === selectedShipmentId) || shipments[0];

    if (connectionStatus === 'ONLINE via LTE-M') {
      const alertId = `ALT-${Date.now().toString().slice(-3)}`;
      const newAlert: AlertItem = {
        id: alertId,
        shipmentId: selectedShipmentId,
        fruit: active.fruit,
        severity: 'Warning',
        title: 'Connection lost - logging on device',
        timestamp: 'Just now',
        date: new Date().toISOString().split('T')[0],
        location: 'Cellular dead-zone segment',
        parameter: 'Connectivity',
        measuredValue: 'No LTE-M carrier link',
        limitValue: 'Active GSM link',
        status: 'Open',
        recordHash: '0x8192a018bc492817',
        blockNumber: 1489240,
        timeline: [
          { time: 'Just now', label: 'Network Timeout', description: 'Cellular ping dropped; switched to SPI flash buffer.' },
        ],
        readingsWindow: [],
      };

      set((state) => ({
        connectionStatus: 'OFFLINE - logging on device',
        alerts: [newAlert, ...state.alerts],
        activeToast: {
          id: alertId,
          title: 'Connection lost - logging on device',
          shipmentId: selectedShipmentId,
          severity: 'Warning',
          timestamp: 'Just now',
        },
      }));
    } else {
      get().restoreConnectivity();
    }
  },

  restoreConnectivity: () => {
    set({ connectionStatus: 'RESTORED - syncing' });

    setTimeout(async () => {
      const newBlockNumber = 1489243;
      const batchMerkle = await computeSha256(`batch-${Date.now()}`);

      set((state) => {
        const restoredAlert: AlertItem = {
          id: `ALT-${Date.now().toString().slice(-3)}`,
          shipmentId: state.selectedShipmentId,
          fruit: state.shipments.find((s) => s.id === state.selectedShipmentId)?.fruit || 'Mango',
          severity: 'Info',
          title: 'Connection restored - 142 records syncing',
          timestamp: 'Just now',
          date: new Date().toISOString().split('T')[0],
          location: 'Gateway reconnected',
          parameter: 'Connectivity',
          measuredValue: '142 buffered records',
          limitValue: '0 records (Synced)',
          status: 'Resolved',
          recordHash: batchMerkle.slice(0, 18),
          blockNumber: newBlockNumber,
          timeline: [
            { time: 'Just now', label: 'Handshake Settled', description: 'Buffered 142 SHA-256 records transmitted and verified.' },
          ],
          readingsWindow: [],
        };

        return {
          connectionStatus: 'ONLINE via LTE-M',
          ledgerBlocks: [
            {
              blockNumber: newBlockNumber,
              timestamp: 'Just now',
              recordsCount: 142,
              txHash: batchMerkle,
            },
            ...state.ledgerBlocks.slice(0, 4),
          ],
          alerts: [restoredAlert, ...state.alerts],
          activeToast: {
            id: restoredAlert.id,
            title: 'Connection restored - 142 records syncing',
            shipmentId: state.selectedShipmentId,
            severity: 'Info',
            timestamp: 'Just now',
          },
        };
      });
    }, 1800);
  },

  cycleConnectionState: () => get().toggleConnectivityLoss(),

  updateFruitProfile: (fruit, updated) => {
    set((state) => {
      const newConfigs = {
        ...state.fruitConfigs,
        [fruit]: {
          ...state.fruitConfigs[fruit],
          ...updated,
        },
      };

      const updatedShipments = state.shipments.map((s) => {
        if (s.fruit !== fruit) return s;
        const cfg = newConfigs[fruit];
        const temp = s.latestReading.temperature;
        const ethylene = s.latestReading.ethylene;

        let risk = s.risk;
        let status = s.status;
        let score = s.conditionScore ?? 92;

        if (temp > cfg.idealTempMax + 2.0 || temp < cfg.idealTempMin - 2.0) {
          risk = 'High';
          status = 'Critical';
          score = Math.max(45, Math.min(65, score));
        } else if (temp > cfg.idealTempMax || temp < cfg.idealTempMin || ethylene > cfg.maxEthylenePpm) {
          risk = 'Medium';
          status = 'At Risk';
          score = Math.min(78, score);
        } else {
          risk = 'Low';
          status = 'In Transit';
          score = Math.max(90, score);
        }

        return {
          ...s,
          risk,
          status,
          conditionScore: score,
        };
      });

      return {
        fruitConfigs: newConfigs,
        shipments: updatedShipments,
      };
    });
  },

  acknowledgeAlert: (id) => {
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, status: 'Acknowledged' as AlertStatus } : a)),
    }));
  },

  resolveAlert: (id) => {
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, status: 'Resolved' as AlertStatus } : a)),
    }));
  },

  dismissToast: () => set({ activeToast: null }),

  triggerSimulatedAlert: () => {
    const { selectedShipmentId, shipments, fruitConfigs } = get();
    const active = shipments.find((s) => s.id === selectedShipmentId) || shipments[0];
    const newId = `ALT-${Math.floor(600 + Math.random() * 399)}`;
    const tempExcursion = Math.round((active.latestReading.temperature + 1.2) * 10) / 10;

    const newAlert: AlertItem = {
      id: newId,
      shipmentId: active.id,
      fruit: active.fruit,
      severity: 'Warning',
      title: `Microclimate temperature drift (+${tempExcursion}°C)`,
      timestamp: 'Just now',
      date: new Date().toISOString().split('T')[0],
      location: `${active.origin} - ${active.destination} Transit Corridor`,
      parameter: 'Temperature',
      measuredValue: `${tempExcursion} °C`,
      limitValue: `${fruitConfigs[active.fruit as FruitType]?.idealTempMax ?? 13.0} °C max`,
      status: 'Open',
      recordHash: `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`,
      blockNumber: 1489242,
      timeline: [
        { time: 'Just now', label: 'Telemetry Delta', description: 'Thermal sensor noted gradual climb above nominal threshold.' },
      ],
      readingsWindow: [
        { time: 'Just now', temp: tempExcursion, humidity: active.latestReading.humidity, ethylene: active.latestReading.ethylene, vibration: active.latestReading.vibration, hash: '0x...' },
      ],
    };

    set((state) => ({
      alerts: [newAlert, ...state.alerts],
      activeToast: {
        id: newId,
        title: newAlert.title,
        shipmentId: newAlert.shipmentId,
        severity: newAlert.severity,
        timestamp: 'Just now',
      },
    }));
  },

  addDevice: (device) => {
    const newDevice: DeviceItem = {
      id: device.id || `ST-NODE-0${Math.floor(600 + Math.random() * 200)}`,
      assignedShipmentId: device.assignedShipmentId || 'ST250701',
      fruit: device.fruit || 'Mango',
      batteryPct: device.batteryPct || 98,
      harvestingType: device.harvestingType || 'Solar',
      harvestingMw: device.harvestingMw || 160,
      signalDbm: device.signalDbm || -76,
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
      batteryHistory: [
        { time: '12:00', batteryPct: 96, harvestingMw: 140 },
        { time: '13:00', batteryPct: 98, harvestingMw: 160 },
      ],
      ...device,
    };

    set((state) => ({
      devices: [newDevice, ...state.devices],
      activeToast: {
        id: `DEV-${Date.now().toString().slice(-3)}`,
        title: `IoT Node ${newDevice.id} paired successfully`,
        shipmentId: newDevice.assignedShipmentId,
        severity: 'Info',
        timestamp: 'Just now',
      },
    }));
  },

  generateReport: (report) => {
    const newReport: ReportItem = {
      id: `REP-2026-${Math.floor(100 + Math.random() * 899)}`,
      title: report.title || 'Shipment Compliance Report',
      type: report.type || 'Shipment Compliance Report',
      date: new Date().toISOString().split('T')[0],
      shipmentId: report.shipmentId || 'ST250701',
      fruit: report.fruit || 'Mango',
      fileSize: '2.1 MB',
      status: 'Ready',
      ...report,
    };

    set((state) => ({
      reports: [newReport, ...state.reports],
      activeToast: {
        id: newReport.id,
        title: `${newReport.title} generated`,
        shipmentId: newReport.shipmentId,
        severity: 'Info',
        timestamp: 'Just now',
      },
    }));
  },

  inviteUser: (user) => {
    const newUser: UserItem = {
      id: `USR-0${Math.floor(10 + Math.random() * 89)}`,
      name: user.name || 'New Member',
      email: user.email || 'user@smarttrace.io',
      role: user.role || 'Logistics Manager',
      status: 'Invited',
      lastActive: 'Never',
      ...user,
    };

    set((state) => ({
      users: [...state.users, newUser],
      activeToast: {
        id: newUser.id,
        title: `Invitation dispatched to ${newUser.email}`,
        shipmentId: newUser.role,
        severity: 'Info',
        timestamp: 'Just now',
      },
    }));
  },

  updateSettings: (partial) => {
    set((state) => ({
      settings: {
        ...state.settings,
        ...partial,
      },
      activeToast: {
        id: `SET-${Date.now().toString().slice(-3)}`,
        title: 'System configuration updated',
        shipmentId: 'Central Engine',
        severity: 'Info',
        timestamp: 'Just now',
      },
    }));
  },

  // 2-second simulation tick for all shipments
  tickSimulation: async () => {
    const { shipments, connectionStatus, fruitConfigs, truckProgressPct } = get();

    set({ highlightTile: true });
    setTimeout(() => set({ highlightTile: false }), 450);

    const nextProgress = truckProgressPct >= 98 ? 15 : truckProgressPct + 0.15;

    // Process all shipments asynchronously with real Web Crypto SHA-256
    const updatedShipments = await Promise.all(
      shipments.map(async (s) => {
        const cfg = fruitConfigs[s.fruit as FruitType] || FRUIT_CONFIGS.Mango;

        // 1. Subtle random walk within tolerances
        const tempDelta = (Math.random() - 0.5) * 0.12;
        const humidityDelta = (Math.random() - 0.5) * 0.25;
        const ethyleneDelta = Math.random() > 0.95 ? 0.08 : (Math.random() - 0.5) * 0.01;
        const vibrationDelta = Math.random() > 0.97 ? 0.8 : (Math.random() - 0.5) * 0.05;

        let newTemp = Math.round((s.latestReading.temperature + tempDelta) * 10) / 10;
        let newHumidity = Math.round((s.latestReading.humidity + humidityDelta) * 10) / 10;
        let newEthylene = Math.max(0.01, Math.round((s.latestReading.ethylene + ethyleneDelta) * 100) / 100);
        let newVibration = Math.max(0.05, Math.round((s.latestReading.vibration + vibrationDelta) * 100) / 100);

        // Keep avocado elevated for demonstration
        if (s.id === 'ST250705') {
          newTemp = Math.max(9.8, newTemp);
        }

        // Check active leg: sea legs go offline in simulation and sync when the cargo reaches port
        const activeLeg = s.journey?.legs.find((l) => l.status === 'Active') || s.currentLeg;
        const isSeaLeg = activeLeg?.mode === 'Ship';
        const isDeadZone = s.id === 'ST250703' && nextProgress >= 35 && nextProgress <= 58;
        const isGlobalOffline = connectionStatus === 'OFFLINE - logging on device';
        const isRestored = connectionStatus === 'RESTORED - syncing';

        // Sea legs are offline out at sea, then sync when cargo reaches port terminal
        const isShipmentOffline = isGlobalOffline || (isSeaLeg && nextProgress < 85) || isDeadZone;
        const isPortSyncing = (isSeaLeg && nextProgress >= 85 && nextProgress <= 92) || isRestored;

        let chainStatus: SensorReading['chainStatus'] = 'Anchored on ledger';
        if (isShipmentOffline) {
          chainStatus = 'Stored on device';
        } else if (isPortSyncing) {
          chainStatus = 'Syncing over MQTT';
        }

        // REAL Web Crypto SHA-256 computation: hash(previousHash + payload)
        const payloadString = `${s.latestReading.currentHash}:${newTemp}:${newHumidity}:${newEthylene}:${newVibration}:${Date.now()}`;
        const realHash = await computeSha256(payloadString);

        // Compute condition score
        let score = s.conditionScore ?? 92;
        if (newTemp > cfg.idealTempMax || newTemp < cfg.idealTempMin) {
          score = Math.max(48, score - 0.1);
        } else {
          score = Math.min(98, score + 0.05);
        }

        const newReading: SensorReading = {
          ...s.latestReading,
          timestamp: 'Just now',
          temperature: newTemp,
          humidity: newHumidity,
          ethylene: newEthylene,
          vibration: newVibration,
          batteryHarvestingMw: Math.round(150 + (Math.random() - 0.5) * 40),
          chainStatus,
          currentHash: realHash,
          previousHash: s.latestReading.currentHash,
          hashChainIndex: s.latestReading.hashChainIndex + 1,
          isSynced: !isShipmentOffline,
        };

        return {
          ...s,
          connection: isShipmentOffline ? ('Offline' as const) : ('Online' as const),
          conditionScore: Math.round(score),
          latestReading: newReading,
        };
      })
    );

    // Sync device battery levels
    const updatedDevices = get().devices.map((d) => {
      const matchingShipment = updatedShipments.find((s) => s.id === d.assignedShipmentId);
      if (!matchingShipment) return d;
      return {
        ...d,
        batteryPct: matchingShipment.latestReading.batteryPct,
        harvestingMw: matchingShipment.latestReading.batteryHarvestingMw || d.harvestingMw,
        signalDbm: matchingShipment.latestReading.signalDbm || d.signalDbm,
        lastSeen: 'Just now',
      };
    });

    set({
      shipments: updatedShipments,
      devices: updatedDevices,
      truckProgressPct: nextProgress,
    });
  },
}));

// Run simulation interval every 2 seconds
if (typeof window !== 'undefined') {
  setInterval(() => {
    useSimulationStore.getState().tickSimulation();
  }, 2000);
}
