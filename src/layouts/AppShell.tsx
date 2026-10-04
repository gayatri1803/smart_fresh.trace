import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar, TopBar } from '../components';
import { useSimulation } from '../context/SimulationContext';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Supply Chain Overview',
    subtitle: 'Real-time monitoring and condition intelligence across fresh-fruit consignments.',
  },
  '/dashboard': {
    title: 'Supply Chain Overview',
    subtitle: 'Real-time monitoring and condition intelligence across fresh-fruit consignments.',
  },
  '/shipments': {
    title: 'Export Consignments',
    subtitle: 'Palletized fruit batches, attached IoT device nodes, and multi-leg chain of custody',
  },
  '/consignments': {
    title: 'Export Consignments',
    subtitle: 'Palletized fruit batches, attached IoT device nodes, and multi-leg chain of custody',
  },
  '/alerts': {
    title: 'Excursions & Alerts',
    subtitle: 'Critical temperature breaches, shock violations, and tamper alarms',
  },
  '/proof-of-condition': {
    title: 'Proof-of-Condition (PoC)',
    subtitle: 'Tamper-proof batch certificates anchored to Arbitrum Orbit Layer-3',
  },
  '/proof': {
    title: 'Proof-of-Condition (PoC)',
    subtitle: 'Tamper-proof batch certificates anchored to Arbitrum Orbit Layer-3',
  },
  '/devices': {
    title: 'IoT Cargo Devices',
    subtitle: 'Rugged IP67 sensor nodes attached directly to fruit batches and pallets',
  },
  '/settings': {
    title: 'System & Fruit Settings',
    subtitle: 'System infrastructure, alerting rules, consortium ledger, and biological fruit profiles',
  },
};

export const AppShell: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { activeToast, dismissToast } = useSimulation();

  let pageMeta = PAGE_TITLES[currentPath];
  if (!pageMeta && (currentPath.startsWith('/shipments/') || currentPath.startsWith('/consignments/'))) {
    pageMeta = {
      title: 'Consignment Intelligence & Journey',
      subtitle: 'Real-time cargo condition, multi-modal transit legs, and cryptographic custody handovers',
    };
  }
  if (!pageMeta) {
    pageMeta = {
      title: 'SmartTrace Dashboard',
      subtitle: 'Fresh Fruits • Trusted Journey',
    };
  }

  return (
    <div className="min-h-screen bg-bg-warm text-content flex relative">
      {/* 
        Fixed Sidebar:
        - Width: w-[72px] expanded:w-[260px] (collapsed to icons under 1100px)
        - Deep forest green #1F4D3A
        - Active item #4E9B76
        - Small green leaf-in-circle mark, SMARTTRACE, Fresh Fruits • Trusted Journey
        - Footer with All systems operational green dot and Admin user
      */}
      <Sidebar />

      {/* Main Content Area (Offset by sidebar width: 72px under 1100px, 260px at 1100px+) */}
      <div className="flex-1 ml-[72px] expanded:ml-[260px] min-h-screen flex flex-col transition-all duration-200">
        {/* Sticky TopBar with Title, Fruit Filter, and Global Connection Pill */}
        <TopBar
          title={pageMeta.title}
          subtitle={pageMeta.subtitle}
        />

        {/* Dashboard Content Container (Max width 1400px, 24px gaps) */}
        <main className="flex-1 p-6 expanded:p-8 max-w-dashboard w-full mx-auto flex flex-col justify-between">
          <div className="flex-1">
            <Outlet />
          </div>

          {/* Footer note with Simulated data label */}
          <footer className="mt-12 pt-4 border-t border-border-card/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-content-muted">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-content">SmartTrace</span>
              <span>• Fresh Fruits • Trusted Journey</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span>Simulated data</span>
              <span className="text-content-muted/60">•</span>
              <span>Web Crypto SHA-256</span>
              <span className="text-content-muted/60">•</span>
              <span>Arbitrum Orbit L3</span>
            </div>
          </footer>
        </main>
      </div>

      {/* Small text-only toast for simulation engine alerts (No emojis) */}
      {activeToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-[#1F4D3A] text-[#F3EFE6] px-4 py-3 rounded-xl shadow-xl border border-[#4E9B76]/50 flex items-center gap-3 text-xs max-w-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              activeToast.severity === 'Critical'
                ? 'bg-[#B94A48]'
                : activeToast.severity === 'Warning'
                ? 'bg-[#D9A441]'
                : 'bg-[#4F7C8A]'
            }`}
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate text-[#F3EFE6]">{activeToast.title}</div>
            <div className="text-[11px] text-[#A3C9B8] mt-0.5 truncate">
              Shipment {activeToast.shipmentId} • {activeToast.timestamp}
            </div>
          </div>
          <button
            type="button"
            onClick={dismissToast}
            className="text-[11px] font-mono uppercase text-[#A3C9B8] hover:text-white px-2 py-0.5 rounded border border-[#4E9B76]/40 hover:border-[#4E9B76] transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default AppShell;
