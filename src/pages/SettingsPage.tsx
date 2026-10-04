import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, StatusPill } from '../components';
import { useSimulation } from '../context/SimulationContext';
import type { FruitType, FruitConfig } from '../types';
import {
  Bell,
  HardDrive,
  Save,
  Check,
  CheckCircle2,
  Lock,
  Mail,
  Smartphone,
  Apple,
  Sliders,
  ThermometerSnowflake,
  Droplets,
  Wind,
  Activity,
  Clock,
  X,
  ArrowRight,
  Info,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'profiles' ? 'profiles' : 'infrastructure';

  const { settings, updateSettings, fruitConfigs, updateFruitProfile, shipments } = useSimulation();

  // Local settings state
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaved, setIsSaved] = useState(false);

  // Fruit Profiles Calibration Drawer State
  const [editingFruit, setEditingFruit] = useState<FruitType | null>(null);
  const [formData, setFormData] = useState<Partial<FruitConfig>>({});
  const [savedProfileSuccess, setSavedProfileSuccess] = useState<boolean>(false);

  // Six requested fruits in order
  const displayFruits: FruitType[] = [
    'Mango',
    'Banana',
    'Grapes',
    'Apple',
    'Avocado',
    'Citrus',
  ];

  // Close fruit drawer on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditingFruit(null);
      }
    };
    if (editingFruit) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [editingFruit]);

  const handleToggle = (path: 'notifications' | 'data' | 'units' | 'ledger', key: string, value: any) => {
    setLocalSettings((prev: any) => ({
      ...prev,
      [path]: {
        ...prev[path],
        [key]: value,
      },
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(localSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleOpenFruitDrawer = (fruit: FruitType) => {
    setEditingFruit(fruit);
    setFormData({ ...fruitConfigs[fruit] });
    setSavedProfileSuccess(false);
  };

  const handleCloseFruitDrawer = () => {
    setEditingFruit(null);
    setSavedProfileSuccess(false);
  };

  const handleSaveFruitThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFruit) return;

    updateFruitProfile(editingFruit, formData);
    setSavedProfileSuccess(true);
    setTimeout(() => {
      handleCloseFruitDrawer();
    }, 900);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-card pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-content">
            System Settings & Intelligence Profiles
          </h2>
          <p className="text-xs text-content-muted mt-1">
            Configure automated alarm dispatches, consortium ledger parameters, and cargo biological fruit profiles
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#EFE7D8]/80 border border-border-card rounded-xl shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'infrastructure'
                ? 'bg-primary text-white shadow-sm'
                : 'text-content-muted hover:text-content'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Infrastructure & Ledger</span>
          </button>

          <button
            type="button"
            onClick={() => setSearchParams({ tab: 'profiles' })}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'profiles'
                ? 'bg-primary text-white shadow-sm'
                : 'text-content-muted hover:text-content'
            }`}
          >
            <Apple className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Fruit Profiles</span>
          </button>
        </div>
      </div>

      {/* TAB 1: INFRASTRUCTURE & LEDGER SETTINGS */}
      {activeTab === 'infrastructure' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-[#34785A] text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={1.5} />
                  <span>Saved successfully</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" strokeWidth={1.5} />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>

          {/* Section 1: Notifications */}
          <Card
            title="Alert Notifications & Escalation Pathways"
            subtitle="Manage automated email digests and emergency SMS alerts to dispatchers and cargo surveyors"
            headerBorder={true}
            action={
              <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                <Bell className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Active Alerts Engine</span>
              </div>
            }
          >
            <div className="space-y-6 pt-2">
              {/* Email Notifications */}
              <div>
                <div className="text-xs font-bold text-content uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-content-muted" strokeWidth={1.5} />
                  <span>Email Notifications</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F5EFE6] border border-border-card cursor-pointer hover:border-primary/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={localSettings.notifications.emailExcursion}
                      onChange={(e) => handleToggle('notifications', 'emailExcursion', e.target.checked)}
                      className="mt-0.5 rounded text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="text-xs font-semibold text-content block">Thermal Excursions</span>
                      <span className="text-[11px] text-content-muted leading-tight block mt-0.5">
                        Immediate alert when cargo temperature breaches tolerance limits
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F5EFE6] border border-border-card cursor-pointer hover:border-primary/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={localSettings.notifications.emailTamper}
                      onChange={(e) => handleToggle('notifications', 'emailTamper', e.target.checked)}
                      className="mt-0.5 rounded text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="text-xs font-semibold text-content block">Enclosure Tamper</span>
                      <span className="text-[11px] text-content-muted leading-tight block mt-0.5">
                        Alert when light sensor or magnetic seal detects container opening
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F5EFE6] border border-border-card cursor-pointer hover:border-primary/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={localSettings.notifications.emailDigest}
                      onChange={(e) => handleToggle('notifications', 'emailDigest', e.target.checked)}
                      className="mt-0.5 rounded text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="text-xs font-semibold text-content block">Daily Digest Dossier</span>
                      <span className="text-[11px] text-content-muted leading-tight block mt-0.5">
                        Consolidated 24h summary report sent to logistics team at 06:00 UTC
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* SMS Notifications */}
              <div>
                <div className="text-xs font-bold text-content uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-content-muted" strokeWidth={1.5} />
                  <span>SMS Urgent Alerts</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F5EFE6] border border-border-card cursor-pointer hover:border-primary/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={localSettings.notifications.smsEmergency}
                      onChange={(e) => handleToggle('notifications', 'smsEmergency', e.target.checked)}
                      className="mt-0.5 rounded text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="text-xs font-semibold text-content block">Critical Alarms (P1)</span>
                      <span className="text-[11px] text-content-muted leading-tight block mt-0.5">
                        Instant SMS to on-call duty manager for ethylene spikes and severe shock
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F5EFE6] border border-border-card cursor-pointer hover:border-primary/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={localSettings.notifications.smsDriverWarnings}
                      onChange={(e) => handleToggle('notifications', 'smsDriverWarnings', e.target.checked)}
                      className="mt-0.5 rounded text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="text-xs font-semibold text-content block">Driver Cabin Alerts</span>
                      <span className="text-[11px] text-content-muted leading-tight block mt-0.5">
                        SMS alerts direct to reefer driver phone when compressor fails
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Contact Targets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border-card/60 text-xs">
                <div>
                  <label className="block text-content-muted font-medium mb-1">
                    Emergency Phone Contact
                  </label>
                  <input
                    type="text"
                    value={localSettings.notifications.phoneContact}
                    onChange={(e) => handleToggle('notifications', 'phoneContact', e.target.value)}
                    className="w-full bg-[#F5EFE6] border border-border-card rounded-xl px-3 py-2 font-mono text-content focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-content-muted font-medium mb-1">
                    Compliance Notification Email
                  </label>
                  <input
                    type="email"
                    value={localSettings.notifications.emailContact}
                    onChange={(e) => handleToggle('notifications', 'emailContact', e.target.value)}
                    className="w-full bg-[#F5EFE6] border border-border-card rounded-xl px-3 py-2 font-mono text-content focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Section 2: Data & Telemetry Engine */}
          <Card
            title="IoT Telemetry & Edge Sampling Configuration"
            subtitle="Rugged edge hardware sampling frequency, flash storage buffers, and automatic reconnect sync"
            headerBorder={true}
            action={
              <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                <HardDrive className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>ESP32-S3 Firmware v2.4</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 text-xs">
              <div>
                <label className="block text-content font-semibold mb-1">
                  Edge Sampling Rate
                </label>
                <p className="text-[11px] text-content-muted mb-2 leading-snug">
                  Frequency of sensor reads (SHT31, electrochemical ethylene, IMU accelerometer)
                </p>
                <select
                  value={localSettings.data.samplingIntervalSeconds}
                  onChange={(e) =>
                    handleToggle('data', 'samplingIntervalSeconds', Number(e.target.value))
                  }
                  className="w-full bg-[#F5EFE6] border border-border-card rounded-xl px-3 py-2 text-content font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value={2}>Every 2 seconds (High Frequency Diagnostic Demo)</option>
                  <option value={10}>Every 10 seconds (Express Reefer Transit)</option>
                  <option value={60}>Every 60 seconds (Standard Long-Haul Highway)</option>
                  <option value={300}>Every 5 minutes (Extended Deep-Sea Maritime Voyage)</option>
                </select>
              </div>

              <div>
                <label className="block text-content font-semibold mb-1">
                  On-Board Flash Buffer Allocation
                </label>
                <p className="text-[11px] text-content-muted mb-2 leading-snug">
                  Hardware SPI flash storage reserved for cryptographic hash-chaining while in dead zones
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={16}
                    max={128}
                    step={16}
                    value={localSettings.data.offlineBufferCapacityMb}
                    onChange={(e) =>
                      handleToggle('data', 'offlineBufferCapacityMb', Number(e.target.value))
                    }
                    className="flex-1 accent-primary cursor-pointer"
                  />
                  <span className="font-mono font-bold text-xs bg-[#F5EFE6] px-2.5 py-1 rounded-lg border border-border-card shrink-0">
                    {localSettings.data.offlineBufferCapacityMb} MB (~14 days)
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Section 3: Ledger Configuration */}
          <Card
            title="Permissioned Consortium Ledger & Batch Anchoring"
            subtitle="Decentralized state verification anchoring telemetry Merkle roots to Arbitrum Orbit FoodChain-L3"
            headerBorder={true}
            action={
              <div className="flex items-center gap-1.5 text-xs text-[#235841] font-semibold bg-[#EAF4EF] px-2 py-0.5 rounded-full border border-[#BCDBCB]">
                <Lock className="w-3 h-3 text-primary" strokeWidth={1.5} />
                <span>Arbitrum Orbit (Chain ID 421614)</span>
              </div>
            }
          >
            <div className="space-y-4 pt-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-content font-semibold mb-1">
                    Consortium Ledger Network Name
                  </label>
                  <input
                    type="text"
                    value={localSettings.ledger.networkName}
                    onChange={(e) => handleToggle('ledger', 'networkName', e.target.value)}
                    className="w-full bg-[#F5EFE6] border border-border-card rounded-xl px-3 py-2 font-mono text-content focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-content font-semibold mb-1">
                    Rollup Anchor Cadence (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={localSettings.ledger.anchorIntervalMinutes}
                    onChange={(e) =>
                      handleToggle('ledger', 'anchorIntervalMinutes', Number(e.target.value))
                    }
                    className="w-full bg-[#F5EFE6] border border-border-card rounded-xl px-3 py-2 font-mono text-content focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-content font-semibold mb-1">
                  Rollup JSON-RPC Endpoint URL
                </label>
                <input
                  type="text"
                  value={localSettings.ledger.rollupRpcUrl}
                  onChange={(e) => handleToggle('ledger', 'rollupRpcUrl', e.target.value)}
                  className="w-full bg-[#F5EFE6] border border-border-card rounded-xl px-3 py-2 font-mono text-content focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#EAF4EF] border border-[#BCDBCB] flex items-center justify-between gap-4">
                <div className="text-[11px] text-[#235841]">
                  <span className="font-semibold">Cryptographic Rollup Guarantee:</span> Sensor packets are hashed with Web Crypto SHA-256 on the device, verified off-chain, and Merkle root anchors are immutably signed.
                </div>
                <StatusPill status="Verified" label="Active L3 RPC" size="sm" />
              </div>
            </div>
          </Card>

          {/* Section 4: Display Units */}
          <Card
            title="Display Units & Conventions"
            subtitle="Configure measurement units and calendar date formats used across consignment views"
            headerBorder={true}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 text-xs">
              <div>
                <label className="block text-content font-semibold mb-1">
                  Temperature Scale
                </label>
                <p className="text-[11px] text-content-muted mb-3 leading-snug">
                  Select primary temperature scale for dashboards, tiles, and alerts
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggle('units', 'tempUnit', 'C')}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      localSettings.units.tempUnit === 'C'
                        ? 'bg-primary text-white border-transparent shadow-sm'
                        : 'bg-[#F5EFE6] text-content border-border-card hover:bg-[#EFE9DD]'
                    }`}
                  >
                    <span>Celsius (°C)</span>
                    {localSettings.units.tempUnit === 'C' && <Check className="w-3.5 h-3.5" strokeWidth={1.5} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggle('units', 'tempUnit', 'F')}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      localSettings.units.tempUnit === 'F'
                        ? 'bg-primary text-white border-transparent shadow-sm'
                        : 'bg-[#F5EFE6] text-content border-border-card hover:bg-[#EFE9DD]'
                    }`}
                  >
                    <span>Fahrenheit (°F)</span>
                    {localSettings.units.tempUnit === 'F' && <Check className="w-3.5 h-3.5" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-content font-semibold mb-1">
                  Date & Timestamp Format
                </label>
                <p className="text-[11px] text-content-muted mb-3 leading-snug">
                  Format used on compliance certificates and timeline charts
                </p>
                <select
                  value={localSettings.units.dateFormat}
                  onChange={(e) => handleToggle('units', 'dateFormat', e.target.value)}
                  className="w-full bg-[#F5EFE6] border border-border-card rounded-xl px-3 py-2 font-mono text-content focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="YYYY-MM-DD">ISO 8601 (YYYY-MM-DD) • International Trade Standard</option>
                  <option value="DD/MM/YYYY">European / Indian (DD/MM/YYYY)</option>
                  <option value="MM/DD/YYYY">US Standard (MM/DD/YYYY)</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: FRUIT PROFILES */}
      {activeTab === 'profiles' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-content tracking-tight">
              One Device. Multiple Fruit Profiles. Different Intelligence.
            </h3>
            <p className="text-xs sm:text-sm text-content-muted mt-1 max-w-3xl">
              The rugged on-cargo IoT hardware runs dynamic edge firmware. Select any profile below to inspect or calibrate safe thermal boundaries, ethylene limits, and exposure time rules.
            </p>
          </div>

          {/* 3x2 Grid of Profile Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayFruits.map((fruitKey) => {
              const cfg = fruitConfigs[fruitKey];
              const liveShipments = shipments.filter((s) => s.fruit === fruitKey);

              return (
                <div
                  key={fruitKey}
                  tabIndex={0}
                  role="button"
                  aria-label={`Calibrate intelligence profile for ${cfg.name}`}
                  onClick={() => handleOpenFruitDrawer(fruitKey)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenFruitDrawer(fruitKey);
                    }
                  }}
                  className="bg-bg-card border border-border-card rounded-[16px] p-5 transition-all duration-150 hover:shadow-soft-hover hover:border-primary/40 cursor-pointer flex flex-col justify-between group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div>
                    {/* Header: Large rounded letter badge, Fruit name, Profile label */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-border-card">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl border flex items-center justify-center font-mono font-bold text-lg select-none shadow-xs ${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeBorder}`}
                        >
                          {cfg.letter}
                        </div>

                        <div>
                          <h3 className="font-serif text-lg font-bold text-content group-hover:text-primary transition-colors">
                            {cfg.name}
                          </h3>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-content-muted font-mono uppercase tracking-wider">
                            {cfg.profileCode}
                          </span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary bg-[#EAF4EF] px-2 py-0.5 rounded-full border border-[#BCDBCB]">
                        <Sliders className="w-3 h-3 text-primary" strokeWidth={1.5} />
                        <span>Calibrate</span>
                      </span>
                    </div>

                    {/* Monitored Parameters as Chips */}
                    <div className="mt-3.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-content-muted block mb-1.5">
                        Monitored Edge Channels
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {cfg.monitoredParameters.map((param) => (
                          <span
                            key={param}
                            className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F5EFE6] text-content border border-border-card/70"
                          >
                            {param}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Safe Ranges Display */}
                    <div className="mt-4 space-y-2 text-xs bg-[#FAF5EB] p-3 rounded-xl border border-border-card/60">
                      {/* Temp */}
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-content-muted">
                          <ThermometerSnowflake className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                          <span>Temperature:</span>
                        </span>
                        <span className="font-mono font-semibold text-content tabular-nums">
                          {cfg.idealTempMin > 0 ? `+${cfg.idealTempMin}` : cfg.idealTempMin}°C to{' '}
                          {cfg.idealTempMax > 0 ? `+${cfg.idealTempMax}` : cfg.idealTempMax}°C
                        </span>
                      </div>

                      {/* Humidity */}
                      {cfg.monitoredParameters.includes('Humidity') && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-content-muted">
                            <Droplets className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                            <span>Relative Humidity:</span>
                          </span>
                          <span className="font-mono font-semibold text-content tabular-nums">
                            {cfg.idealHumidityMin}% – {cfg.idealHumidityMax}%
                          </span>
                        </div>
                      )}

                      {/* Ethylene */}
                      {cfg.monitoredParameters.includes('Ethylene') && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-content-muted">
                            <Wind className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                            <span>Max Ethylene (C₂H₄):</span>
                          </span>
                          <span className="font-mono font-semibold text-content tabular-nums">
                            &lt; {cfg.maxEthylenePpm} ppm
                          </span>
                        </div>
                      )}

                      {/* Max Exposure */}
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-content-muted">
                          <Clock className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                          <span>Max Excursion Window:</span>
                        </span>
                        <span className="font-mono font-semibold text-content tabular-nums">
                          {cfg.maxExposureMinutes} mins
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Live Consignment Count */}
                  <div className="mt-4 pt-3 border-t border-border-card flex items-center justify-between text-xs text-content-muted">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Activity className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                      <span>{liveShipments.length} Active Consignments</span>
                    </span>

                    <span className="text-[11px] text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-semibold">
                      <span>Edit Rules</span>
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Slide-over Drawer for Calibrating Profile */}
          {editingFruit && (
            <>
              <div
                className="fixed inset-0 bg-content/20 backdrop-blur-[1px] z-40 transition-opacity"
                onClick={handleCloseFruitDrawer}
                aria-hidden="true"
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="fruit-drawer-title"
                className="fixed inset-y-0 right-0 w-full sm:w-[460px] md:w-[500px] bg-[#FBF7F0] border-l border-border-card shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-150"
              >
                {/* Drawer Header */}
                <div className="p-5 border-b border-border-card bg-[#F5EFE6] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center font-mono font-bold text-base shadow-xs ${fruitConfigs[editingFruit].badgeBg} ${fruitConfigs[editingFruit].badgeText} ${fruitConfigs[editingFruit].badgeBorder}`}
                    >
                      {fruitConfigs[editingFruit].letter}
                    </div>
                    <div>
                      <h3 id="fruit-drawer-title" className="font-serif text-lg font-bold text-content">
                        Calibrate {editingFruit} Intelligence
                      </h3>
                      <p className="text-xs text-content-muted font-mono">
                        {fruitConfigs[editingFruit].profileCode} • Edge Rule Definition
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseFruitDrawer}
                    className="p-1.5 rounded-lg text-content-muted hover:text-content hover:bg-[#EBE2D4] transition-colors"
                    aria-label="Close drawer"
                  >
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>

                {/* Drawer Content */}
                <form onSubmit={handleSaveFruitThresholds} className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#EAF4EF] border border-[#BCDBCB] flex items-start gap-2.5 text-[#235841]">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.5} />
                    <p className="leading-relaxed">
                      Updating thresholds will push new boundary parameters to the on-board cryptographic rulebook for all active {editingFruit} consignments.
                    </p>
                  </div>

                  {/* Temperature Boundaries */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-content text-sm flex items-center gap-1.5">
                      <ThermometerSnowflake className="w-4 h-4 text-primary" strokeWidth={1.5} />
                      <span>Temperature Boundaries (°C)</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-content-muted mb-1 font-medium">Ideal Min Temp</label>
                        <input
                          type="number"
                          step="0.5"
                          value={formData.idealTempMin ?? ''}
                          onChange={(e) => setFormData({ ...formData, idealTempMin: parseFloat(e.target.value) })}
                          className="w-full bg-[#F5EFE6] border border-border-card rounded-xl px-3 py-2 text-content font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-content-muted mb-1 font-medium">Ideal Max Temp</label>
                        <input
                          type="number"
                          step="0.5"
                          value={formData.idealTempMax ?? ''}
                          onChange={(e) => setFormData({ ...formData, idealTempMax: parseFloat(e.target.value) })}
                          className="w-full bg-[#F5EFE6] border border-border-card rounded-xl px-3 py-2 text-content font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Humidity Boundaries */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-content text-sm flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-primary" strokeWidth={1.5} />
                      <span>Relative Humidity Boundaries (%)</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-content-muted mb-1 font-medium">Min RH %</label>
                        <input
                          type="number"
                          value={formData.idealHumidityMin ?? ''}
                          onChange={(e) => setFormData({ ...formData, idealHumidityMin: parseInt(e.target.value, 10) })}
                          className="w-full bg-[#F5EFE6] border border-border-card rounded-xl px-3 py-2 text-content font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-content-muted mb-1 font-medium">Max RH %</label>
                        <input
                          type="number"
                          value={formData.idealHumidityMax ?? ''}
                          onChange={(e) => setFormData({ ...formData, idealHumidityMax: parseInt(e.target.value, 10) })}
                          className="w-full bg-[#F5EFE6] border border-border-card rounded-xl px-3 py-2 text-content font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ethylene Ceiling */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-content text-sm flex items-center gap-1.5">
                      <Wind className="w-4 h-4 text-primary" strokeWidth={1.5} />
                      <span>Ethylene Sensitivity Ceiling (ppm)</span>
                    </h4>
                    <div>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.maxEthylenePpm ?? ''}
                        onChange={(e) => setFormData({ ...formData, maxEthylenePpm: parseFloat(e.target.value) })}
                        className="w-full bg-[#F5EFE6] border border-border-card rounded-xl px-3 py-2 text-content font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Exposure Time Window */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-content text-sm flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-primary" strokeWidth={1.5} />
                      <span>Max Exposure Buffer Outside Bounds (Minutes)</span>
                    </h4>
                    <div>
                      <input
                        type="number"
                        value={formData.maxExposureMinutes ?? ''}
                        onChange={(e) => setFormData({ ...formData, maxExposureMinutes: parseInt(e.target.value, 10) })}
                        className="w-full bg-[#F5EFE6] border border-border-card rounded-xl px-3 py-2 text-content font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Drawer Footer Actions */}
                  <div className="pt-4 border-t border-border-card flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={handleCloseFruitDrawer}
                      className="px-4 py-2 rounded-xl border border-border-card bg-[#EFE9DD] hover:bg-[#E5DDCE] text-content font-medium text-xs transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-primary hover:bg-[#34785A] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      {savedProfileSuccess ? (
                        <>
                          <Check className="w-4 h-4 text-white" strokeWidth={1.5} />
                          <span>Saved to Edge Profile</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" strokeWidth={1.5} />
                          <span>Save & Push Rules</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
