// Validation engine for Pashu Swasthya Suraksha
// Client-side validation rules and withdrawal period calculator

import { AMUEntryFormData, AnimalFormData, FarmFormData } from '@/types';
import { mockMRLRules } from '@/data/mockData';

export interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// Withdrawal period calculator
export const calculateWithdrawalPeriod = (
  drugName: string, 
  species: string, 
  tissue: 'milk' | 'meat' | 'eggs'
): number => {
  const rule = mockMRLRules.find(r => 
    r.drugName === drugName && 
    r.species === species && 
    r.tissue === tissue
  );
  return rule?.withdrawalDaysDefault || 21; // Default 21 days if no rule found
};

// Calculate safe date from end date and withdrawal period
export const calculateSafeDate = (endDate: string, withdrawalDays: number): string => {
  const end = new Date(endDate);
  const safe = new Date(end.getTime() + (withdrawalDays * 24 * 60 * 60 * 1000));
  return safe.toISOString().split('T')[0];
};

// Check if safe date is within critical period (7 days)
export const isCriticalWithdrawalPeriod = (safeDate: string, daysThreshold: number = 7): boolean => {
  const today = new Date();
  const safe = new Date(safeDate);
  const daysUntilSafe = Math.ceil((safe.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntilSafe <= daysThreshold && daysUntilSafe > 0;
};

// AMU Entry validation
export const validateAMUEntry = (data: AMUEntryFormData, animalSpecies?: string): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Required field validation
  if (!data.animalId) {
    errors.push({
      field: 'animalId',
      message: 'Animal selection is required',
      type: 'error',
    });
  }

  if (!data.drugName?.trim()) {
    errors.push({
      field: 'drugName',
      message: 'Drug name is required',
      type: 'error',
    });
  }

  if (!data.doseMg || data.doseMg <= 0) {
    errors.push({
      field: 'doseMg',
      message: 'Dose must be greater than 0',
      type: 'error',
    });
  }

  if (!data.route) {
    errors.push({
      field: 'route',
      message: 'Administration route is required',
      type: 'error',
    });
  }

  if (!data.frequency?.trim()) {
    errors.push({
      field: 'frequency',
      message: 'Frequency is required',
      type: 'error',
    });
  }

  if (!data.startDate) {
    errors.push({
      field: 'startDate',
      message: 'Start date is required',
      type: 'error',
    });
  }

  if (!data.endDate) {
    errors.push({
      field: 'endDate',
      message: 'End date is required',
      type: 'error',
    });
  }

  // Date validation
  if (data.startDate && data.endDate) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    if (endDate < startDate) {
      errors.push({
        field: 'endDate',
        message: 'End date must be after start date',
        type: 'error',
      });
    }

    // Check if treatment is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate > today) {
      warnings.push({
        field: 'startDate',
        message: 'Treatment start date is in the future',
        type: 'warning',
      });
    }
  }

  // Dose validation
  if (data.drugName && data.doseMg && animalSpecies) {
    const rule = mockMRLRules.find(r => 
      r.drugName === data.drugName && 
      r.species === animalSpecies
    );

    if (rule) {
      if (data.doseMg < rule.minDose) {
        warnings.push({
          field: 'doseMg',
          message: `Dose is below recommended minimum (${rule.minDose}mg)`,
          type: 'warning',
        });
      }

      if (data.doseMg > rule.maxDose) {
        errors.push({
          field: 'doseMg',
          message: `Dose exceeds maximum safe limit (${rule.maxDose}mg)`,
          type: 'error',
        });
      }
    }
  }

  // Withdrawal period calculation and validation
  if (data.drugName && data.endDate && animalSpecies) {
    const tissue = animalSpecies === 'poultry' ? 'eggs' : 'milk';
    const withdrawalDays = calculateWithdrawalPeriod(data.drugName, animalSpecies, tissue);
    const safeDate = calculateSafeDate(data.endDate, withdrawalDays);
    
    if (isCriticalWithdrawalPeriod(safeDate, 7)) {
      const today = new Date();
      const safe = new Date(safeDate);
      const daysUntilSafe = Math.ceil((safe.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      warnings.push({
        field: 'endDate',
        message: `Withdrawal period expires in ${daysUntilSafe} days (${safeDate}). Consider delaying treatment if product sale is imminent.`,
        type: 'warning',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Animal validation
export const validateAnimal = (data: AnimalFormData): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!data.tag?.trim()) {
    errors.push({
      field: 'tag',
      message: 'Animal tag/ID is required',
      type: 'error',
    });
  }

  if (!data.species) {
    errors.push({
      field: 'species',
      message: 'Species selection is required',
      type: 'error',
    });
  }

  if (!data.breed?.trim()) {
    errors.push({
      field: 'breed',
      message: 'Breed is required',
      type: 'error',
    });
  }

  if (!data.dob) {
    errors.push({
      field: 'dob',
      message: 'Date of birth is required',
      type: 'error',
    });
  }

  if (!data.gender) {
    errors.push({
      field: 'gender',
      message: 'Gender selection is required',
      type: 'error',
    });
  }

  // Date of birth validation
  if (data.dob) {
    const dob = new Date(data.dob);
    const today = new Date();
    
    if (dob > today) {
      errors.push({
        field: 'dob',
        message: 'Date of birth cannot be in the future',
        type: 'error',
      });
    }

    // Check if animal is too old (more than 20 years)
    const ageInYears = (today.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365);
    if (ageInYears > 20) {
      warnings.push({
        field: 'dob',
        message: 'Animal age seems unusually high. Please verify the date of birth.',
        type: 'warning',
      });
    }
  }

  // Weight validation
  if (data.weight !== undefined && data.weight !== null) {
    if (data.weight <= 0) {
      errors.push({
        field: 'weight',
        message: 'Weight must be greater than 0',
        type: 'error',
      });
    }

    // Species-specific weight validation
    if (data.species && data.weight) {
      const weightLimits: Record<string, { min: number; max: number }> = {
        cattle: { min: 50, max: 1000 },
        buffalo: { min: 100, max: 1200 },
        goat: { min: 5, max: 100 },
        sheep: { min: 5, max: 150 },
        pig: { min: 10, max: 300 },
        poultry: { min: 0.5, max: 10 },
      };

      const limits = weightLimits[data.species];
      if (limits) {
        if (data.weight < limits.min) {
          warnings.push({
            field: 'weight',
            message: `Weight seems low for ${data.species}. Please verify.`,
            type: 'warning',
          });
        }
        if (data.weight > limits.max) {
          warnings.push({
            field: 'weight',
            message: `Weight seems high for ${data.species}. Please verify.`,
            type: 'warning',
          });
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Farm validation
export const validateFarm = (data: FarmFormData): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!data.name?.trim()) {
    errors.push({
      field: 'name',
      message: 'Farm name is required',
      type: 'error',
    });
  }

  if (!data.address?.trim()) {
    errors.push({
      field: 'address',
      message: 'Farm address is required',
      type: 'error',
    });
  }

  // Latitude validation
  if (data.lat < -90 || data.lat > 90) {
    errors.push({
      field: 'lat',
      message: 'Latitude must be between -90 and 90',
      type: 'error',
    });
  }

  // Longitude validation
  if (data.lng < -180 || data.lng > 180) {
    errors.push({
      field: 'lng',
      message: 'Longitude must be between -180 and 180',
      type: 'error',
    });
  }

  // Check if coordinates are in India (rough bounds)
  if (data.lat < 6.5 || data.lat > 37.1 || data.lng < 68.1 || data.lng > 97.4) {
    warnings.push({
      field: 'lat',
      message: 'Coordinates appear to be outside India. Please verify the location.',
      type: 'warning',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Generic validation helpers
export const validateRequired = (value: unknown, fieldName: string): ValidationError | null => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
      type: 'error',
    };
  }
  return null;
};

export const validateContact = (contact: string): ValidationError | null => {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
  if (!phoneRegex.test(contact)) {
    return {
      field: 'contact',
      message: 'Please enter a valid phone number',
      type: 'error',
    };
  }
  return null;
};

export const validatePhone = (phone: string): ValidationError | null => {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
  if (!phoneRegex.test(phone)) {
    return {
      field: 'phone',
      message: 'Please enter a valid phone number',
      type: 'error',
    };
  }
  return null;
};

// Format validation errors for display
export const formatValidationErrors = (errors: ValidationError[]): Record<string, string> => {
  return errors.reduce((acc, error) => {
    acc[error.field] = error.message;
    return acc;
  }, {} as Record<string, string>);
};
