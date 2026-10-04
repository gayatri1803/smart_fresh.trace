export type FruitType = 
  | 'Mango'
  | 'Banana'
  | 'Grapes'
  | 'Apple'
  | 'Avocado'
  | 'Citrus'
  | 'Blueberries'
  | 'Strawberries';

export type FilterFruit =
  | 'All fruits'
  | 'Mango'
  | 'Banana'
  | 'Grapes'
  | 'Apple'
  | 'Avocado'
  | 'Citrus';

export type GlobalConnectionStatus =
  | 'ONLINE via LTE-M'
  | 'OFFLINE - logging on device'
  | 'RESTORED - syncing';

export type MonitoredParameter =
  | 'Temperature'
  | 'Humidity'
  | 'Ethylene'
  | 'Vibration'
  | 'Exposure Time';

export interface FruitConfig {
  name: FruitType;
  letter: string;
  profileCode: string; // e.g. "Profile A"
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  idealTempMin: number; // °C
  idealTempMax: number; // °C
  idealHumidityMin: number; // %
  idealHumidityMax: number; // %
  maxEthylenePpm: number; // ppm threshold
  maxVibrationG: number; // g-force shock tolerance
  maxExposureMinutes: number; // Max exposure minutes outside range
  monitoredParameters: MonitoredParameter[];
}

export type RiskLevel = 'Low' | 'Medium' | 'High';

export type ConnectionStatus = 'Online' | 'Offline' | 'Restored' | 'Syncing';

export type ShipmentStatus = 'In Transit' | 'At Risk' | 'Critical' | 'Delivered';

export type LedgerStatus = 'Anchored' | 'Pending' | 'Verified' | 'Tampered';

export interface SensorReading {
  timestamp: string;
  temperature: number; // °C
  humidity: number; // % RH
  ethylene: number; // ppm
  vibration: number; // g
  latitude: number;
  longitude: number;
  speedKmH: number;
  tamperDetected: boolean;
  batteryPct: number; // 0-100
  batteryVoltage: number; // V
  batteryHarvestingMw?: number; // mW solar/kinetic
  signalDbm?: number; // dBm LTE-M
  hashChainIndex: number;
  currentHash: string;
  previousHash: string;
  chainStatus?: 'Stored on device' | 'Syncing over MQTT' | 'Anchored on ledger';
  blockNumber?: number;
  isSynced: boolean;
}

export interface LedgerProof {
  blockNumber: number;
  txHash: string;
  merkleRoot: string;
  timestamp: string;
  network: string; // e.g., 'Arbitrum Orbit / FoodChain-L3'
  status: LedgerStatus;
  offlineBlocksChained: number;
  verifiedIntegrity: boolean;
}

export type JourneyMode = 'Farm' | 'Truck' | 'Warehouse' | 'Port' | 'Ship';
export type LegStatus = 'Done' | 'Active' | 'Upcoming';

export interface HandoverEvent {
  id: string; // e.g., "HO-250701-01"
  time: string; // e.g., "2026-09-29 17:45 UTC"
  location: string; // e.g., "JNPT Nhava Sheva Reefer Gate 3"
  ledgerHash: string; // e.g., "0x913b82ac74df102a94bc"
  fromParty: string; // e.g., "ColdEx Reefer Logistics"
  toParty: string; // e.g., "DP World Nhava Sheva Container Terminal"
  notes?: string;
}

export interface JourneyLeg {
  id: string; // e.g., "LEG-01"
  order: number; // 1, 2, 3...
  mode: JourneyMode;
  vehicleLabel: string; // e.g., "Farm Gate Pre-Cooling Chamber #4", "Reefer Truck MH-15-EF-2018", "Vessel Maersk Mc-Kinney Møller"
  startLocation: string; // e.g., "Nashik Agro Cluster"
  endLocation: string; // e.g., "JNPT Terminal 3"
  startTime: string; // e.g., "2026-09-29 08:30"
  endTime?: string; // e.g., "2026-09-29 17:45"
  status: LegStatus;
  handoverAfter?: HandoverEvent; // Custody transfer event occurring after this leg completes
}

export interface ConsignmentJourney {
  currentLegIndex: number;
  legs: JourneyLeg[];
}

export interface ShipmentItem {
  id: string; // Consignment ID, e.g. "ST250701"
  batchId?: string; // Fruit cargo batch, e.g. "BATCH-MANGO-2026-N04"
  cargoDescription?: string; // e.g. "Palletized Export Grade Alphonso Mangoes"
  fruit: FruitType;
  origin: string; // e.g., "Nashik"
  destination: string; // e.g., "Dubai"
  carrier: string;
  truckId: string; // Active vehicle identifier (e.g. MH-15-EF-2018)
  currentVehicleLabel?: string; // Current carrying vehicle/facility (e.g. "Vessel Maersk Mc-Kinney Møller")
  nodeId: string; // IoT device attached directly to this cargo batch
  departureTime: string;
  eta: string;
  journey?: ConsignmentJourney; // Ordered cargo journey legs & handovers
  currentLeg?: JourneyLeg; // Currently active leg
  distanceCoveredKm?: number;
  totalDistanceKm?: number;
  status: ShipmentStatus;
  risk: RiskLevel;
  connection: ConnectionStatus;
  conditionScore?: number; // 0-100
  conditionReason?: string;
  latestReading: SensorReading;
  ledger: LedgerProof;
  cratesCount: number;
  weightKg: number;
}

export type ConsignmentItem = ShipmentItem;

export interface DeviceItem {
  id: string; // e.g. "ST-NODE-0142"
  assignedShipmentId: string;
  fruit: FruitType;
  batteryPct: number;
  harvestingType: 'Solar' | 'Thermal';
  harvestingMw: number;
  signalDbm: number;
  firmwareVersion: string;
  lastSeen: string;
  enclosureRating: 'IP67';
  sensorHealth: {
    sht31: 'OK' | 'Fault';
    ethylene: 'OK' | 'Fault';
    imu: 'OK' | 'Fault';
    gps: 'OK' | 'Fault';
  };
  tamperStatus: 'Sealed' | 'Breached';
  storageUsedPct: number;
  storageBufferDays: number;
  batteryHistory: { time: string; batteryPct: number; harvestingMw: number }[];
}

export interface ReportItem {
  id: string;
  title: string;
  type: 'Shipment Compliance Report' | 'Cold-Chain Excursion Report' | 'Export Audit Pack' | 'Phytosanitary Stability Dossier';
  date: string;
  shipmentId: string;
  fruit: FruitType | string;
  fileSize: string;
  status: 'Ready' | 'Archived';
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Logistics Manager' | 'Auditor' | 'Driver';
  status: 'Active' | 'Invited' | 'Offline';
  lastActive: string;
}

export interface SettingsState {
  notifications: {
    emailExcursion: boolean;
    emailTamper: boolean;
    emailDigest: boolean;
    smsEmergency: boolean;
    smsDriverWarnings: boolean;
    phoneContact: string;
    emailContact: string;
  };
  data: {
    samplingIntervalSeconds: number;
    offlineBufferCapacityMb: number;
    autoFlushOnReconnect: boolean;
  };
  ledger: {
    networkName: string; // "Permissioned consortium ledger"
    anchorIntervalMinutes: number;
    rollupRpcUrl: string;
    settlementContract: string;
    batchSizeLimit: number;
  };
  units: {
    tempUnit: 'C' | 'F';
    dateFormat: string;
  };
}
