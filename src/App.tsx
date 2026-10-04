import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppShell } from './layouts/AppShell';
import {
  DashboardPage,
  ShipmentsPage,
  ShipmentDetailPage,
  AlertsPage,
  ProofOfConditionPage,
  DevicesPage,
  SettingsPage,
} from './pages';

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="shipments" element={<ShipmentsPage />} />
            <Route path="consignments" element={<Navigate to="/shipments" replace />} />
            <Route path="shipments/:id" element={<ShipmentDetailPage />} />
            <Route path="consignments/:id" element={<ShipmentDetailPage />} />
            <Route path="fruit-profiles" element={<Navigate to="/settings?tab=profiles" replace />} />
            <Route path="live-map" element={<Navigate to="/dashboard" replace />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="condition-reconstruction" element={<Navigate to="/dashboard" replace />} />
            <Route path="proof-of-condition" element={<ProofOfConditionPage />} />
            <Route path="proof" element={<Navigate to="/proof-of-condition" replace />} />
            <Route path="devices" element={<DevicesPage />} />
            <Route path="reports" element={<Navigate to="/dashboard" replace />} />
            <Route path="users" element={<Navigate to="/dashboard" replace />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
