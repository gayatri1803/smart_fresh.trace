import React from 'react';
import { SimulationProvider, useSimulation } from './SimulationContext';
export { SimulationProvider, useSimulation };

// Re-export useApp as an alias to useSimulation for unified reactive state
export const useApp = () => {
  return useSimulation();
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <SimulationProvider>{children}</SimulationProvider>;
};
