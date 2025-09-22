// Mock API client for Pashu Swasthya Suraksha
// This simulates backend API calls and will be replaced with Supabase integration

import { User, Farm, Animal, AMUEntry, MRLRule, Alert, AuditLog, AMUEntryFormData, AnimalFormData, FarmFormData, DashboardStats, ExportData } from '@/types';
import { 
  mockUsers, 
  mockFarms, 
  mockAnimals, 
  mockAMUEntries, 
  mockMRLRules, 
  mockAlerts, 
  mockAuditLogs,
  drugDatabase,
  drugClasses 
} from '@/data/mockData';

// Simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage (will be replaced with Supabase)
const users = [...mockUsers];
const farms = [...mockFarms];
const animals = [...mockAnimals];
const amuEntries = [...mockAMUEntries];
const mrlRules = [...mockMRLRules];
const alerts = [...mockAlerts];
const auditLogs = [...mockAuditLogs];

// Helper function to generate IDs
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper function to calculate withdrawal period
const calculateWithdrawalPeriod = (drugName: string, species: string, tissue: string): number => {
  const rule = mrlRules.find(r => 
    r.drugName === drugName && 
    r.species === species && 
    r.tissue === tissue
  );
  return rule?.withdrawalDaysDefault || 21; // Default 21 days if no rule found
};

// Helper function to calculate safe date
const calculateSafeDate = (endDate: string, withdrawalDays: number): string => {
  const end = new Date(endDate);
  const safe = new Date(end.getTime() + (withdrawalDays * 24 * 60 * 60 * 1000));
  return safe.toISOString().split('T')[0];
};

// Authentication API
export const authAPI = {
  async login(contact: string, password: string): Promise<{ user: User; token: string }> {
    console.log('Mock client login called with:', { contact, password });
    console.log('Available users:', users.map(u => ({ id: u.id, name: u.name, contact: u.contact })));
    await delay(800);
    const user = users.find(u => u.contact === contact);
    console.log('Found user:', user);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return { user, token: `mock-token-${user.id}` };
  },

  async signup(userData: Omit<User, 'id' | 'createdAt' | 'verified' | 'email'>): Promise<{ user: User; token: string }> {
    await delay(1000);
    const user: User = {
      ...userData,
      id: generateId('user'),
      email: `${userData.name.toLowerCase().replace(/\s+/g, '.')}@example.com`, // Generate email from name
      createdAt: new Date().toISOString(),
      verified: false,
    };
    users.push(user);
    return { user, token: `mock-token-${user.id}` };
  },

  async getCurrentUser(token: string): Promise<User | null> {
    await delay(300);
    const userId = token.replace('mock-token-', '');
    return users.find(u => u.id === userId) || null;
  },
};

// Farm API
export const farmAPI = {
  async getFarms(userId: string): Promise<Farm[]> {
    await delay(400);
    return farms.filter(f => f.ownerId === userId);
  },

  async getFarm(farmId: string): Promise<Farm | null> {
    await delay(300);
    return farms.find(f => f.id === farmId) || null;
  },

  async createFarm(farmData: FarmFormData, ownerId: string): Promise<Farm> {
    await delay(600);
    const farm: Farm = {
      id: generateId('farm'),
      name: farmData.name,
      location: {
        lat: farmData.lat,
        lng: farmData.lng,
        address: farmData.address,
      },
      animals: [],
      ownerId,
      createdAt: new Date().toISOString(),
    };
    farms.push(farm);
    return farm;
  },

  async updateFarm(farmId: string, farmData: Partial<FarmFormData>): Promise<Farm> {
    await delay(500);
    const farmIndex = farms.findIndex(f => f.id === farmId);
    if (farmIndex === -1) throw new Error('Farm not found');
    
    farms[farmIndex] = {
      ...farms[farmIndex],
      ...farmData,
      location: {
        ...farms[farmIndex].location,
        ...(farmData.lat && farmData.lng && farmData.address ? {
          lat: farmData.lat,
          lng: farmData.lng,
          address: farmData.address,
        } : farms[farmIndex].location),
      },
    };
    return farms[farmIndex];
  },
};

// Animal API
export const animalAPI = {
  async getAnimals(farmId?: string): Promise<Animal[]> {
    await delay(400);
    if (farmId) {
      return animals.filter(a => a.farmId === farmId);
    }
    return animals;
  },

  async getAnimal(animalId: string): Promise<Animal | null> {
    await delay(300);
    return animals.find(a => a.id === animalId) || null;
  },

  async createAnimal(animalData: AnimalFormData, farmId: string): Promise<Animal> {
    await delay(600);
    const animal: Animal = {
      id: generateId('animal'),
      ...animalData,
      farmId,
      createdAt: new Date().toISOString(),
    };
    animals.push(animal);
    
    // Update farm's animals list
    const farm = farms.find(f => f.id === farmId);
    if (farm) {
      farm.animals.push(animal.id);
    }
    
    return animal;
  },

  async updateAnimal(animalId: string, animalData: Partial<AnimalFormData>): Promise<Animal> {
    await delay(500);
    const animalIndex = animals.findIndex(a => a.id === animalId);
    if (animalIndex === -1) throw new Error('Animal not found');
    
    animals[animalIndex] = { ...animals[animalIndex], ...animalData };
    return animals[animalIndex];
  },

  async deleteAnimal(animalId: string): Promise<void> {
    await delay(400);
    const animalIndex = animals.findIndex(a => a.id === animalId);
    if (animalIndex === -1) throw new Error('Animal not found');
    
    animals.splice(animalIndex, 1);
    
    // Remove from farm's animals list
    farms.forEach(farm => {
      const index = farm.animals.indexOf(animalId);
      if (index > -1) {
        farm.animals.splice(index, 1);
      }
    });
  },
};

// AMU Entry API
export const amuAPI = {
  async getAMUEntries(filters?: {
    animalId?: string;
    farmId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AMUEntry[]> {
    await delay(500);
    let filteredEntries = [...amuEntries];
    
    if (filters?.animalId) {
      filteredEntries = filteredEntries.filter(e => e.animalId === filters.animalId);
    }
    if (filters?.farmId) {
      const farmAnimals = animals.filter(a => a.farmId === filters.farmId).map(a => a.id);
      filteredEntries = filteredEntries.filter(e => farmAnimals.includes(e.animalId));
    }
    if (filters?.userId) {
      filteredEntries = filteredEntries.filter(e => e.userId === filters.userId);
    }
    if (filters?.startDate) {
      filteredEntries = filteredEntries.filter(e => e.startDate >= filters.startDate!);
    }
    if (filters?.endDate) {
      filteredEntries = filteredEntries.filter(e => e.endDate <= filters.endDate!);
    }
    
    return filteredEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getAMUEntry(entryId: string): Promise<AMUEntry | null> {
    await delay(300);
    return amuEntries.find(e => e.id === entryId) || null;
  },

  async createAMUEntry(entryData: AMUEntryFormData, userId: string): Promise<AMUEntry> {
    await delay(800);
    
    // Get animal to determine species
    const animal = animals.find(a => a.id === entryData.animalId);
    if (!animal) throw new Error('Animal not found');
    
    // Calculate withdrawal period
    const withdrawalPeriodDays = calculateWithdrawalPeriod(
      entryData.drugName, 
      animal.species, 
      animal.species === 'poultry' ? 'eggs' : 'milk'
    );
    
    const calculatedSafeDate = calculateSafeDate(entryData.endDate, withdrawalPeriodDays);
    
    const entry: AMUEntry = {
      id: generateId('amu'),
      ...entryData,
      userId,
      withdrawalPeriodDays,
      calculatedSafeDate,
      vetApproved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    amuEntries.push(entry);
    
    // Create audit log
    const auditLog: AuditLog = {
      id: generateId('audit'),
      action: 'create',
      entityType: 'amu_entry',
      entityId: entry.id,
      userId,
      changes: { drugName: entry.drugName, doseMg: entry.doseMg },
      timestamp: new Date().toISOString(),
    };
    auditLogs.push(auditLog);
    
    // Create alert if withdrawal period is critical (within 7 days)
    const today = new Date();
    const safeDate = new Date(calculatedSafeDate);
    const daysUntilSafe = Math.ceil((safeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilSafe <= 7) {
      const alert: Alert = {
        id: generateId('alert'),
        type: daysUntilSafe <= 3 ? 'critical' : 'warning',
        title: 'Withdrawal Period Expiring Soon',
        message: `Animal ${animal.tag} has a withdrawal period expiring on ${calculatedSafeDate}. Do not sell ${animal.species === 'poultry' ? 'eggs' : 'milk'} until this date.`,
        animalId: animal.id,
        amuEntryId: entry.id,
        farmId: animal.farmId,
        createdAt: new Date().toISOString(),
        dismissed: false,
      };
      alerts.push(alert);
    }
    
    return entry;
  },

  async updateAMUEntry(entryId: string, entryData: Partial<AMUEntryFormData>): Promise<AMUEntry> {
    await delay(600);
    const entryIndex = amuEntries.findIndex(e => e.id === entryId);
    if (entryIndex === -1) throw new Error('AMU entry not found');
    
    const oldEntry = amuEntries[entryIndex];
    amuEntries[entryIndex] = {
      ...oldEntry,
      ...entryData,
      updatedAt: new Date().toISOString(),
    };
    
    // Create audit log
    const auditLog: AuditLog = {
      id: generateId('audit'),
      action: 'update',
      entityType: 'amu_entry',
      entityId: entryId,
      userId: oldEntry.userId,
      changes: entryData,
      timestamp: new Date().toISOString(),
    };
    auditLogs.push(auditLog);
    
    return amuEntries[entryIndex];
  },

  async approveAMUEntry(entryId: string, vetId: string): Promise<AMUEntry> {
    await delay(500);
    const entryIndex = amuEntries.findIndex(e => e.id === entryId);
    if (entryIndex === -1) throw new Error('AMU entry not found');
    
    amuEntries[entryIndex] = {
      ...amuEntries[entryIndex],
      vetApproved: true,
      vetId,
      updatedAt: new Date().toISOString(),
    };
    
    // Create audit log
    const auditLog: AuditLog = {
      id: generateId('audit'),
      action: 'approve',
      entityType: 'amu_entry',
      entityId: entryId,
      userId: vetId,
      changes: { vetApproved: true, vetId },
      timestamp: new Date().toISOString(),
    };
    auditLogs.push(auditLog);
    
    return amuEntries[entryIndex];
  },
};

// MRL Rules API
export const mrlAPI = {
  async getMRLRules(): Promise<MRLRule[]> {
    await delay(300);
    return mrlRules;
  },

  async getMRLRule(drugName: string, species: string, tissue: string): Promise<MRLRule | null> {
    await delay(200);
    return mrlRules.find(r => 
      r.drugName === drugName && 
      r.species === species && 
      r.tissue === tissue
    ) || null;
  },
};

// Alerts API
export const alertAPI = {
  async getAlerts(userId: string, farmId?: string): Promise<Alert[]> {
    await delay(400);
    let userAlerts = alerts.filter(a => !a.dismissed);
    
    if (farmId) {
      userAlerts = userAlerts.filter(a => a.farmId === farmId);
    }
    
    return userAlerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async dismissAlert(alertId: string): Promise<void> {
    await delay(300);
    const alertIndex = alerts.findIndex(a => a.id === alertId);
    if (alertIndex === -1) throw new Error('Alert not found');
    
    alerts[alertIndex].dismissed = true;
  },
};

// Dashboard API
export const dashboardAPI = {
  async getDashboardStats(userId: string, farmId?: string): Promise<DashboardStats> {
    await delay(600);
    
    let userAnimals = animals;
    let userAMUEntries = amuEntries;
    
    if (farmId) {
      userAnimals = animals.filter(a => a.farmId === farmId);
      const animalIds = userAnimals.map(a => a.id);
      userAMUEntries = amuEntries.filter(e => animalIds.includes(e.animalId));
    }
    
    const totalAnimals = userAnimals.length;
    const totalAMUEntries = userAMUEntries.length;
    
    // Calculate compliance rate (entries with vet approval)
    const approvedEntries = userAMUEntries.filter(e => e.vetApproved).length;
    const complianceRate = totalAMUEntries > 0 ? (approvedEntries / totalAMUEntries) * 100 : 0;
    
    // Count upcoming withdrawals (within 7 days)
    const today = new Date();
    const upcomingWithdrawals = userAMUEntries.filter(e => {
      const safeDate = new Date(e.calculatedSafeDate);
      const daysUntilSafe = Math.ceil((safeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilSafe <= 7 && daysUntilSafe > 0;
    }).length;
    
    // Count critical alerts
    const criticalAlerts = alerts.filter(a => 
      a.type === 'critical' && 
      !a.dismissed && 
      (farmId ? a.farmId === farmId : true)
    ).length;
    
    return {
      totalAnimals,
      totalAMUEntries,
      complianceRate: Math.round(complianceRate),
      upcomingWithdrawals,
      criticalAlerts,
    };
  },
};

// Export API
export const exportAPI = {
  async exportAMUData(filters?: {
    farmId?: string;
    startDate?: string;
    endDate?: string;
    species?: string;
  }): Promise<ExportData[]> {
    await delay(800);
    
    let filteredEntries = [...amuEntries];
    
    if (filters?.farmId) {
      const farmAnimals = animals.filter(a => a.farmId === filters.farmId).map(a => a.id);
      filteredEntries = filteredEntries.filter(e => farmAnimals.includes(e.animalId));
    }
    if (filters?.startDate) {
      filteredEntries = filteredEntries.filter(e => e.startDate >= filters.startDate!);
    }
    if (filters?.endDate) {
      filteredEntries = filteredEntries.filter(e => e.endDate <= filters.endDate!);
    }
    if (filters?.species) {
      const speciesAnimals = animals.filter(a => a.species === filters.species).map(a => a.id);
      filteredEntries = filteredEntries.filter(e => speciesAnimals.includes(e.animalId));
    }
    
    return filteredEntries.map(entry => {
      const animal = animals.find(a => a.id === entry.animalId);
      const farm = farms.find(f => f.id === animal?.farmId);
      const user = users.find(u => u.id === entry.userId);
      
      return {
        entryId: entry.id,
        animalTag: animal?.tag || 'Unknown',
        species: animal?.species || 'Unknown',
        drug: entry.drugName,
        dose: entry.doseMg,
        startDate: entry.startDate,
        endDate: entry.endDate,
        safeDate: entry.calculatedSafeDate,
        loggedBy: user?.name || 'Unknown',
        farm: farm?.name || 'Unknown',
        location: farm?.location.address || 'Unknown',
      };
    });
  },
};

// Drug database API
export const drugAPI = {
  async searchDrugs(query: string): Promise<string[]> {
    await delay(200);
    return drugDatabase.filter(drug => 
      drug.toLowerCase().includes(query.toLowerCase())
    );
  },

  async getDrugClasses(): Promise<string[]> {
    await delay(100);
    return drugClasses;
  },
};

// Main mock client export
export const mockClient = {
  auth: authAPI,
  farm: farmAPI,
  animal: animalAPI,
  amu: amuAPI,
  mrl: mrlAPI,
  alert: alertAPI,
  dashboard: dashboardAPI,
  export: exportAPI,
  drug: drugAPI,
};
