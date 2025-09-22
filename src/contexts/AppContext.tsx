'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Farm, Animal, AMUEntry, Alert, DashboardStats } from '@/types';
import { mockClient } from '@/lib/mockClient';
import { useAuth } from './AuthContext';

interface AppContextType {
  farms: Farm[];
  animals: Animal[];
  amuEntries: AMUEntry[];
  alerts: Alert[];
  dashboardStats: DashboardStats | null;
  selectedFarmId: string | null;
  loading: boolean;
  refreshData: () => Promise<void>;
  setSelectedFarmId: (farmId: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [amuEntries, setAmuEntries] = useState<AMUEntry[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshData = useCallback(async () => {
    if (!user || !isAuthenticated) return;

    setLoading(true);
    try {
      // Load farms
      const farmsData = await mockClient.farm.getFarms(user.id);
      setFarms(farmsData);
      
      // Set selected farm if not set or if current selection is invalid
      if (!selectedFarmId || !farmsData.find(f => f.id === selectedFarmId)) {
        setSelectedFarmId(farmsData[0]?.id || null);
      }

      // Load animals for selected farm
      if (selectedFarmId) {
        const animalsData = await mockClient.animal.getAnimals(selectedFarmId);
        setAnimals(animalsData);
      }

      // Load AMU entries for selected farm
      if (selectedFarmId) {
        const amuData = await mockClient.amu.getAMUEntries({ farmId: selectedFarmId });
        setAmuEntries(amuData);
      }

      // Load alerts
      const alertsData = await mockClient.alert.getAlerts(user.id, selectedFarmId || undefined);
      setAlerts(alertsData);

      // Load dashboard stats
      const stats = await mockClient.dashboard.getDashboardStats(user.id, selectedFarmId || undefined);
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated, selectedFarmId]);

  // Load data when user changes or selected farm changes
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshData();
    }
  }, [user, isAuthenticated, selectedFarmId, refreshData]);

  // Clear data when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setFarms([]);
      setAnimals([]);
      setAmuEntries([]);
      setAlerts([]);
      setDashboardStats(null);
      setSelectedFarmId(null);
    }
  }, [isAuthenticated]);

  const value: AppContextType = {
    farms,
    animals,
    amuEntries,
    alerts,
    dashboardStats,
    selectedFarmId,
    loading,
    refreshData,
    setSelectedFarmId,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
