import React from 'react';
import { FRUIT_FILTER_OPTIONS } from '../data/fruits';
import { useApp } from '../context/AppContext';
import { Filter, RefreshCw } from 'lucide-react';

export interface TopBarProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  className = '',
}) => {
  const { selectedFruit, setSelectedFruit, connectionStatus, toggleConnectivityLoss } = useApp();

  // Connection pill styling matching exact requested states:
  // (ONLINE via LTE-M / OFFLINE - logging on device / RESTORED - syncing)
  const connectionStyles = {
    'ONLINE via LTE-M': {
      bg: 'bg-[#EAF4EF]',
      text: 'text-[#235841]',
      border: 'border-[#BCDBCB]',
      dot: 'bg-[#3F8F6B]',
      label: 'ONLINE via LTE-M',
      icon: null,
    },
    'OFFLINE - logging on device': {
      bg: 'bg-[#FAF2E4]',
      text: 'text-[#7D5310]',
      border: 'border-[#ECD29F]',
      dot: 'bg-[#D9A441]',
      label: 'OFFLINE - logging on device',
      icon: null,
    },
    'RESTORED - syncing': {
      bg: 'bg-[#EBF2F4]',
      text: 'text-[#28505B]',
      border: 'border-[#BFD5DC]',
      dot: 'bg-[#4F7C8A]',
      label: 'RESTORED - syncing',
      icon: <RefreshCw className="w-3 h-3 animate-spin text-[#4F7C8A]" strokeWidth={1.5} />,
    },
  }[connectionStatus];

  return (
    <header
      className={`h-20 bg-bg-warm/90 backdrop-blur-md border-b border-border-card sticky top-0 z-20 px-6 expanded:px-8 flex items-center justify-between gap-4 transition-all duration-200 ${className}`}
    >
      {/* Left: Page Title in "Source Serif 4" */}
      <div className="min-w-0">
        <h1 className="font-serif text-2xl sm:text-[26px] font-semibold text-content tracking-tight truncate leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-content-muted mt-0.5 truncate font-normal">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Controls: Fruit Filter Dropdown & Global Connection Pill */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Fruit Filter Dropdown */}
        <div className="relative flex items-center">
          <label htmlFor="fruit-filter" className="sr-only">
            Filter by Fruit
          </label>
          <div className="relative flex items-center">
            <Filter className="w-3.5 h-3.5 text-content-muted absolute left-3 pointer-events-none" />
            <select
              id="fruit-filter"
              value={selectedFruit}
              onChange={(e) => setSelectedFruit(e.target.value as typeof selectedFruit)}
              className="appearance-none bg-bg-card border border-border-card rounded-xl pl-8 pr-8 py-2 text-xs font-medium text-content hover:border-[#3F8F6B] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors cursor-pointer shadow-sm"
              title="Filter fleet telemetry by fruit variety"
            >
              {FRUIT_FILTER_OPTIONS.map((fruit) => (
                <option key={fruit} value={fruit}>
                  {fruit}
                </option>
              ))}
            </select>
            <div className="absolute right-2.5 pointer-events-none text-content-muted text-[10px]">
              ▼
            </div>
          </div>
        </div>

        {/* Global Connection Pill:
            (ONLINE via LTE-M / OFFLINE - logging on device / RESTORED - syncing)
            Clickable to cycle for simulation testing
        */}
        <button
          type="button"
          onClick={toggleConnectivityLoss}
          title={`Click to simulate connectivity loss or restoration. Current: ${connectionStatus}`}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 select-none hover:shadow-sm ${connectionStyles.bg} ${connectionStyles.text} ${connectionStyles.border}`}
        >
          {connectionStyles.icon ? (
            connectionStyles.icon
          ) : (
            <span
              className={`shrink-0 rounded-full w-2 h-2 ${connectionStyles.dot} ${
                connectionStatus === 'ONLINE via LTE-M' ? 'animate-pulse' : ''
              }`}
              aria-hidden="true"
            />
          )}
          <span className="tabular-nums tracking-tight font-medium">
            {connectionStyles.label}
          </span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
