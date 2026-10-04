import React, { createContext, useContext } from 'react';
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
import { useSimulationStore } from '../store/useSimulationStore';

export interface LedgerBlockEntry {
  blockNumber: number;
  timestamp: string;
  recordsCount: number;
  txHash: string;
}

export type AlertSeverity = 'Critical' | 'Warning' | 'Info';
export type AlertStatus = 'Open' | 'Acknowledged' | 'Resolved';

export interface AlertTimelineEvent {
  time: string;
  label: string;
  description: string;
}

export interface AlertReadingSnapshot {
  time: string;
  temp: number;
  humidity: number;
  ethylene: number;
  vibration: number;
  hash: string;
}

export interface AlertItem {
  id: string;
  shipmentId: string;
  fruit: string;
  severity: AlertSeverity;
  title: string;
  timestamp: string;
  date: string;
  location: string;
  parameter: 'Temperature' | 'Ethylene' | 'Tamper' | 'Shock' | 'Connectivity' | 'System' | 'Handover' | 'Offline Event' | 'Offline Sync';
  measuredValue: string;
  limitValue: string;
  status: AlertStatus;
  recordHash: string;
  blockNumber?: number;
  timeline: AlertTimelineEvent[];
  readingsWindow: AlertReadingSnapshot[];
}

export interface AlertToast {
  id: string;
  title: string;
  shipmentId: string;
  severity: AlertSeverity;
  timestamp: string;
}

export interface TelemetryPoint {
  time: string;
  temp: number;
  humidity: number;
  ethylene: number;
  vibration: number;
}

export interface SimulationContextType {
  shipments: ShipmentItem[];
  selectedShipmentId: string;
  setSelectedShipmentId: (id: string) => void;
  activeShipment: ShipmentItem;
  connectionStatus: GlobalConnectionStatus;
  toggleConnectivityLoss: () => void;
  restoreConnectivity: () => void;
  cycleConnectionState: () => void;
  selectedFruit: FilterFruit;
  setSelectedFruit: (fruit: FilterFruit) => void;
  fruitConfigs: Record<FruitType, FruitConfig>;
  updateFruitProfile: (fruit: FruitType, updated: Partial<FruitConfig>) => void;
  tamperLog: SensorReading[];
  ledgerBlocks: LedgerBlockEntry[];
  alerts: AlertItem[];
  recentAlerts: AlertItem[];
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  activeToast: AlertToast | null;
  dismissToast: () => void;
  triggerSimulatedAlert: () => void;
  telemetryHistory: TelemetryPoint[];
  truckProgressPct: number;
  highlightTile: boolean;

  // New features
  devices: DeviceItem[];
  reports: ReportItem[];
  users: UserItem[];
  settings: SettingsState;
  addDevice: (device: Partial<DeviceItem>) => void;
  generateReport: (report: Partial<ReportItem>) => void;
  inviteUser: (user: Partial<UserItem>) => void;
  updateSettings: (partial: Partial<SettingsState>) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useSimulationStore();
  const activeShipment =
    store.shipments.find((s) => s.id === store.selectedShipmentId) || store.shipments[0];

  const value: SimulationContextType = {
    ...store,
    activeShipment,
    recentAlerts: store.alerts.slice(0, 4),
  };

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    // If used outside provider, directly read from Zustand store
    const store = useSimulationStore();
    const activeShipment =
      store.shipments.find((s) => s.id === store.selectedShipmentId) || store.shipments[0];
    return {
      ...store,
      activeShipment,
      recentAlerts: store.alerts.slice(0, 4),
    };
  }
  return context;
};
