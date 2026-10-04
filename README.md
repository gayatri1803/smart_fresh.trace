# SmartTrace — Fresh Fruits • Trusted Journey

> **Cold-Chain Traceability & Proof-of-Condition (PoC) Platform for Fresh Fruit Exporters**

SmartTrace is a desktop-first cold-chain monitoring and decentralized audit dashboard designed for small and medium fresh fruit exporters. It tracks palletized fruit batches with rugged IoT sensor nodes attached directly to the cargo, recording temperature, humidity, ethylene (C2H4), 3-axis vibration/shock, GPS, and tamper status across multi-modal global transit journeys.

---

## Key Features

- **Cargo-First Consignment Model**: Tracks each individual fruit batch and its attached pallet IoT node, rather than just the carrying vehicle.
- **Multi-Modal Transit Legs**: Seamlessly monitors journeys across ordered legs:
  - `Farm` (Orchard pre-cooling & packhouse)
  - `Truck` (Reefer highway transport)
  - `Port` (Holding bays, customs quarantine & quay cranes)
  - `Ship` (Maritime container vessels with dead-zone offline logging)
  - `Warehouse` (Central cold storage distribution)
- **Cryptographic Chain-of-Custody**:
  - Web Crypto SHA-256 rolling hash-chain on the device.
  - Inter-leg **Custody Handover Events** recording transfer time, gate/quay location, parties, and signed ledger hashes.
  - Immutably anchored to Arbitrum Orbit Layer-3 (FoodChain-L3).
- **Maritime Sea Leg Offline Simulation**:
  - Automatically enters offline mode (`Stored on device`) while in deep-sea cellular dead zones.
  - Automatically bursts telemetry over MQTT (`Syncing over MQTT` &rarr; `Anchored on ledger`) upon reaching port approach.
- **Interactive Route Radar**:
  - Leaflet map rendering terrestrial road legs as solid lines and maritime sea legs as dashed lines.
  - Live pulsating cargo beacon tracking the consignment on its active leg.
- **Biological Fruit Intelligence**:
  - Custom profiles for **Mango**, **Banana**, **Grapes**, **Apple**, **Avocado**, and **Citrus**.
  - Dynamic Condition Score (0–100) reflecting respiration stability and cumulative thermal stress.
- **Excursions & Audit Alerts**:
  - Real-time threshold breaches, shock spikes, tamper flags, handovers, and offline events with an inspection drawer.
- **Verifiable Export Certificate**:
  - Official Certificate of Condition Integrity printable modal for phytosanitary and customs clearance.

---

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS (Curated Warm Beige `#F5EFE6` & Deep Forest Green `#1F4D3A` palette)
- **State Management**: Zustand
- **Mapping**: Leaflet + React-Leaflet (OpenStreetMap)
- **Data Visualization**: Recharts
- **Icons**: Lucide React (Strictly 0 emojis)
- **Cryptography**: Web Crypto API (SHA-256 rolling chain)

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/gayatri1803/smart-trace.git
cd smart-trace

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Production Build

```bash
# Typecheck and build bundle
npm run build

# Preview production build
npm run preview
```

---

## Architecture & Data Flow

```text
[ Rugged Cargo Pallet Node ]
      │ (Sensirion SHT31, NDIR Ethylene, 3-Axis IMU, Light Tamper)
      ▼
[ Web Crypto SHA-256 Hash Chain ]
      │
      ├── (In Cellular Range) ──> [ MQTT Telemetry Stream ] ──> [ Arbitrum L3 Rollup ]
      └── (Deep-Sea / Dead Zone) ──> [ 64MB SPI NOR Flash ] ──> [ Burst Sync on Port Arrival ]
```

---

## License

MIT License. Designed and engineered for fresh-produce small exporters.
