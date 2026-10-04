import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  Bell,
  ShieldCheck,
  Cpu,
  Settings,
  Leaf,
  UserCheck,
} from 'lucide-react';

export interface NavItemConfig {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export const MAIN_NAV_ITEMS: NavItemConfig[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-4 h-4 shrink-0" strokeWidth={1.5} />,
  },
  {
    path: '/shipments',
    label: 'Consignments',
    icon: <Truck className="w-4 h-4 shrink-0" strokeWidth={1.5} />,
  },
  {
    path: '/alerts',
    label: 'Alerts',
    icon: <Bell className="w-4 h-4 shrink-0" strokeWidth={1.5} />,
    badge: '1',
  },
  {
    path: '/proof-of-condition',
    label: 'Proof',
    icon: <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={1.5} />,
  },
  {
    path: '/devices',
    label: 'Devices',
    icon: <Cpu className="w-4 h-4 shrink-0" strokeWidth={1.5} />,
  },
];

export const BOTTOM_NAV_ITEM: NavItemConfig = {
  path: '/settings',
  label: 'Settings',
  icon: <Settings className="w-4 h-4 shrink-0" strokeWidth={1.5} />,
};

export const SIDEBAR_ITEMS: NavItemConfig[] = [...MAIN_NAV_ITEMS, BOTTOM_NAV_ITEM];

export interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 select-none bg-[#1F4D3A] text-[#F3EFE6] flex flex-col justify-between transition-all duration-200 border-r border-[#2C624C] shadow-sm w-[72px] expanded:w-[260px] ${className}`}
    >
      {/* Top Section: Logo & Nav items */}
      <div className="flex flex-col min-h-0 flex-1">
        {/* Logo block: small green leaf-in-circle mark, 'SMARTTRACE', subtitle 'Fresh Fruits • Trusted Journey' */}
        <div className="p-4 expanded:p-5 border-b border-[#2C624C] flex items-center justify-center expanded:justify-start gap-3">
          {/* Small green leaf-in-circle mark */}
          <div
            className="w-10 h-10 rounded-full bg-[#3F8F6B] border border-[#52AD84] flex items-center justify-center shrink-0 shadow-inner"
            title="SmartTrace — Fresh Fruits • Trusted Journey"
          >
            <Leaf className="w-5 h-5 text-[#F3EFE6]" />
          </div>

          {/* Logo Text (hidden under 1100px) */}
          <div className="hidden expanded:block min-w-0">
            <h2 className="font-serif text-lg font-bold tracking-wider text-[#F3EFE6] leading-none uppercase">
              SMARTTRACE
            </h2>
            <p className="text-[11px] text-[#A5C2B4] font-normal tracking-tight mt-1 truncate">
              Fresh Fruits • Trusted Journey
            </p>
          </div>
        </div>

        {/* Navigation Menu (Scrollable if needed on short screens) */}
        <nav className="p-2 expanded:p-3 space-y-1 overflow-y-auto flex-1 custom-sidebar-scroll">
          {MAIN_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={item.label}
              className={({ isActive }) =>
                `w-full flex items-center justify-center expanded:justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-[#4E9B76] text-[#FFFFFF] shadow-sm'
                    : 'text-[#F3EFE6]/80 hover:bg-[#28624A] hover:text-[#FFFFFF]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <span
                      className={`shrink-0 transition-colors ${
                        isActive ? 'text-[#FFFFFF]' : 'text-[#A5C2B4] group-hover:text-[#FFFFFF]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="hidden expanded:inline-block truncate">
                      {item.label}
                    </span>
                  </div>

                  {item.badge && (
                    <span
                      className={`hidden expanded:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold tabular-nums shrink-0 ${
                        isActive
                          ? 'bg-[#1F4D3A] text-[#F3EFE6]'
                          : 'bg-[#2D664F] text-[#E0EFE8]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Compact badge dot under 1100px */}
                  {item.badge && (
                    <span
                      className="expanded:hidden absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D9A441]"
                      title={`${item.label}: ${item.badge}`}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Item: Settings */}
        <div className="p-2 expanded:p-3 border-t border-[#2C624C]/60">
          <NavLink
            to={BOTTOM_NAV_ITEM.path}
            title={BOTTOM_NAV_ITEM.label}
            className={({ isActive }) =>
              `w-full flex items-center justify-center expanded:justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group relative ${
                isActive
                  ? 'bg-[#4E9B76] text-[#FFFFFF] shadow-sm'
                  : 'text-[#F3EFE6]/80 hover:bg-[#28624A] hover:text-[#FFFFFF]'
              }`
            }
          >
            {({ isActive }) => (
              <div className="flex items-center gap-3">
                <span
                  className={`shrink-0 transition-colors ${
                    isActive ? 'text-[#FFFFFF]' : 'text-[#A5C2B4] group-hover:text-[#FFFFFF]'
                  }`}
                >
                  {BOTTOM_NAV_ITEM.icon}
                </span>
                <span className="hidden expanded:inline-block truncate">
                  {BOTTOM_NAV_ITEM.label}
                </span>
              </div>
            )}
          </NavLink>
        </div>
      </div>

      {/* Footer of Sidebar:
          - "System Status: All systems operational" with a green dot
          - "Admin, Exporter / Logistics Manager"
      */}
      <div className="p-3 expanded:p-4 border-t border-[#2C624C] bg-[#1A4232] shrink-0">
        {/* Under 1100px (Icon Mode) */}
        <div className="flex flex-col items-center gap-2 expanded:hidden" title="System Status: All systems operational • Admin, Exporter / Logistics Manager">
          <div className="relative flex items-center justify-center" title="All systems operational">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4E9B76] animate-pulse" />
          </div>
          <div className="w-7 h-7 rounded-full bg-[#28624A] border border-[#3C7B60] flex items-center justify-center text-[#F3EFE6] text-xs">
            <UserCheck className="w-3.5 h-3.5 text-[#A5C2B4]" />
          </div>
          <span className="text-[8px] font-mono text-[#A5C2B4] tracking-wider" title="Simulated data">SIM</span>
        </div>

        {/* 1100px and up (Full View) */}
        <div className="hidden expanded:flex flex-col space-y-2.5">
          {/* System Status */}
          <div className="flex items-center gap-2 text-[11px] text-[#A5C2B4]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4E9B76] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4E9B76]" />
            </span>
            <span className="truncate">
              System Status: <span className="text-[#E0EFE8] font-medium">All systems operational</span>
            </span>
          </div>

          {/* User Block */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#285743]">
            <div className="w-7 h-7 rounded-full bg-[#28624A] border border-[#3C7B60] flex items-center justify-center text-[#F3EFE6] text-xs shrink-0">
              <UserCheck className="w-3.5 h-3.5 text-[#A5C2B4]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#F3EFE6] truncate leading-tight">
                Admin
              </p>
              <p className="text-[10px] text-[#A5C2B4] truncate leading-tight mt-0.5">
                Exporter / Logistics Manager
              </p>
            </div>
          </div>

          {/* Simulated Data Label */}
          <div className="pt-2 border-t border-[#285743] flex items-center justify-between text-[10px] text-[#A5C2B4]">
            <span className="flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4E9B76] animate-pulse" />
              <span>Simulated data</span>
            </span>
            <span className="text-[9px] text-[#7BA693] font-mono">2s ticks</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
