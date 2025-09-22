// Core data models for Pashu Swasthya Suraksha

export type UserRole = 'farmer' | 'vet' | 'auditor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  farmId?: string;
  contact: string;
  verified: boolean;
  createdAt: string;
}

export interface Farm {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  animals: string[]; // Animal IDs
  ownerId: string;
  createdAt: string;
}

export interface Animal {
  id: string;
  tag: string;
  species: 'cattle' | 'goat' | 'sheep' | 'poultry' | 'pig' | 'buffalo';
  breed: string;
  dob: string; // Date of birth
  farmId: string;
  gender: 'male' | 'female';
  weight?: number;
  createdAt: string;
}

export interface AMUEntry {
  id: string;
  animalId: string;
  userId: string; // Who logged the entry
  drugName: string;
  drugClass: string;
  doseMg: number;
  route: 'oral' | 'injection' | 'topical' | 'intramammary' | 'intravenous';
  frequency: string; // e.g., "twice daily", "once daily"
  startDate: string;
  endDate: string;
  withdrawalPeriodDays: number;
  calculatedSafeDate: string;
  notes?: string;
  prescriptionImageURL?: string;
  vetApproved: boolean;
  vetId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MRLRule {
  id: string;
  drugName: string;
  species: string;
  tissue: 'milk' | 'meat' | 'eggs';
  maxResidueLimit: number; // in mg/kg
  withdrawalDaysDefault: number;
  minDose: number;
  maxDose: number;
  contraindications?: string[];
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  animalId?: string;
  amuEntryId?: string;
  farmId?: string;
  createdAt: string;
  dismissed: boolean;
}

export interface AuditLog {
  id: string;
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject';
  entityType: 'amu_entry' | 'animal' | 'farm' | 'user';
  entityId: string;
  userId: string;
  changes?: Record<string, unknown>;
  timestamp: string;
}

// Form types
export interface AMUEntryFormData {
  animalId: string;
  drugName: string;
  drugClass: string;
  doseMg: number;
  route: AMUEntry['route'];
  frequency: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface AnimalFormData {
  tag: string;
  species: Animal['species'];
  breed: string;
  dob: string;
  gender: Animal['gender'];
  weight?: number;
}

export interface FarmFormData {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

// Dashboard analytics types
export interface DashboardStats {
  totalAnimals: number;
  totalAMUEntries: number;
  complianceRate: number;
  upcomingWithdrawals: number;
  criticalAlerts: number;
}

export interface ChartData {
  name: string;
  value: number;
  date?: string;
  [key: string]: unknown;
}

// Export types
export interface ExportData {
  entryId: string;
  animalTag: string;
  species: string;
  drug: string;
  dose: number;
  startDate: string;
  endDate: string;
  safeDate: string;
  loggedBy: string;
  farm: string;
  location: string;
}
