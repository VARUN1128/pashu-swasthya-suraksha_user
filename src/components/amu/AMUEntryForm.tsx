'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, AlertTriangle, Info } from 'lucide-react';
import { AMUEntryFormData, Animal, AMUEntry } from '@/types';
import { validateAMUEntry, calculateWithdrawalPeriod, calculateSafeDate, isCriticalWithdrawalPeriod } from '@/lib/validation';
import { mockClient } from '@/lib/mockClient';

const amuEntrySchema = z.object({
  animalId: z.string().min(1, 'Animal selection is required'),
  drugName: z.string().min(1, 'Drug name is required'),
  drugClass: z.string().min(1, 'Drug class is required'),
  doseMg: z.number().min(0.1, 'Dose must be greater than 0'),
  route: z.enum(['oral', 'injection', 'topical', 'intramammary', 'intravenous']),
  frequency: z.string().min(1, 'Frequency is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof amuEntrySchema>;

interface AMUEntryFormProps {
  animal?: Animal;
  entry?: AMUEntry;
  onSubmit: (data: AMUEntryFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const AMUEntryForm: React.FC<AMUEntryFormProps> = ({
  animal,
  entry,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [drugSuggestions, setDrugSuggestions] = useState<string[]>([]);
  const [drugClassSuggestions, setDrugClassSuggestions] = useState<string[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(animal || null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [validationWarnings, setValidationWarnings] = useState<Record<string, string>>({});
  const [withdrawalInfo, setWithdrawalInfo] = useState<{
    days: number;
    safeDate: string;
    isCritical: boolean;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(amuEntrySchema),
    defaultValues: entry ? {
      animalId: entry.animalId,
      drugName: entry.drugName,
      drugClass: entry.drugClass,
      doseMg: entry.doseMg,
      route: entry.route,
      frequency: entry.frequency,
      startDate: entry.startDate,
      endDate: entry.endDate,
      notes: entry.notes,
    } : undefined,
  });

  const watchedDrugName = watch('drugName');
  const watchedEndDate = watch('endDate');
  const watchedAnimalId = watch('animalId');

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [animalsData, drugClassesData] = await Promise.all([
          mockClient.animal.getAnimals(),
          mockClient.drug.getDrugClasses(),
        ]);
        
        setAnimals(animalsData);
        setDrugClassSuggestions(drugClassesData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Update selected animal when animalId changes
  useEffect(() => {
    if (watchedAnimalId) {
      const animal = animals.find(a => a.id === watchedAnimalId);
      setSelectedAnimal(animal || null);
    }
  }, [watchedAnimalId, animals]);

  // Search drugs when drug name changes
  useEffect(() => {
    if (watchedDrugName && watchedDrugName.length > 2) {
      mockClient.drug.searchDrugs(watchedDrugName).then(setDrugSuggestions);
    } else {
      setDrugSuggestions([]);
    }
  }, [watchedDrugName]);

  // Calculate withdrawal period when drug, animal, or end date changes
  useEffect(() => {
    if (watchedDrugName && selectedAnimal && watchedEndDate) {
      const tissue = selectedAnimal.species === 'poultry' ? 'eggs' : 'milk';
      const withdrawalDays = calculateWithdrawalPeriod(
        watchedDrugName,
        selectedAnimal.species,
        tissue
      );
      const safeDate = calculateSafeDate(watchedEndDate, withdrawalDays);
      const isCritical = isCriticalWithdrawalPeriod(safeDate);

      setWithdrawalInfo({
        days: withdrawalDays,
        safeDate,
        isCritical,
      });
    } else {
      setWithdrawalInfo(null);
    }
  }, [watchedDrugName, selectedAnimal, watchedEndDate]);

  const handleFormSubmit = async (data: FormData) => {
    // Client-side validation
    const validation = validateAMUEntry(data, selectedAnimal?.species);
    setValidationErrors(validation.errors.reduce((acc, err) => {
      acc[err.field] = err.message;
      return acc;
    }, {} as Record<string, string>));
    
    setValidationWarnings(validation.warnings.reduce((acc, warn) => {
      acc[warn.field] = warn.message;
      return acc;
    }, {} as Record<string, string>));

    if (!validation.isValid) {
      return;
    }

    await onSubmit(data);
  };

  const routeOptions = [
    { value: 'oral', label: 'Oral' },
    { value: 'injection', label: 'Injection' },
    { value: 'topical', label: 'Topical' },
    { value: 'intramammary', label: 'Intramammary' },
    { value: 'intravenous', label: 'Intravenous' },
  ];

  const frequencyOptions = [
    'Once daily',
    'Twice daily',
    'Three times daily',
    'Every 12 hours',
    'Every 8 hours',
    'Single dose',
    'As needed',
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {entry ? 'Edit AMU Entry' : 'Log AMU Entry'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Animal Selection */}
        <div>
          <label htmlFor="animalId" className="block text-sm font-medium text-gray-700 mb-2">
            Animal *
          </label>
          <select
            {...register('animalId')}
            id="animalId"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            disabled={!!animal} // Disable if animal is pre-selected
          >
            <option value="">Select an animal</option>
            {animals.map((animal) => (
              <option key={animal.id} value={animal.id}>
                {animal.tag} - {animal.species} ({animal.breed})
              </option>
            ))}
          </select>
          {errors.animalId && (
            <p className="mt-1 text-sm text-red-600">{errors.animalId.message}</p>
          )}
          {validationErrors.animalId && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.animalId}</p>
          )}
        </div>

        {/* Drug Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="drugName" className="block text-sm font-medium text-gray-700 mb-2">
              Drug Name *
            </label>
            <div className="relative">
              <input
                {...register('drugName')}
                type="text"
                id="drugName"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., Penicillin G"
                list="drugSuggestions"
              />
              <datalist id="drugSuggestions">
                {drugSuggestions.map((drug) => (
                  <option key={drug} value={drug} />
                ))}
              </datalist>
            </div>
            {errors.drugName && (
              <p className="mt-1 text-sm text-red-600">{errors.drugName.message}</p>
            )}
            {validationErrors.drugName && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.drugName}</p>
            )}
          </div>

          <div>
            <label htmlFor="drugClass" className="block text-sm font-medium text-gray-700 mb-2">
              Drug Class *
            </label>
            <select
              {...register('drugClass')}
              id="drugClass"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select drug class</option>
              {drugClassSuggestions.map((drugClass) => (
                <option key={drugClass} value={drugClass}>
                  {drugClass}
                </option>
              ))}
            </select>
            {errors.drugClass && (
              <p className="mt-1 text-sm text-red-600">{errors.drugClass.message}</p>
            )}
          </div>
        </div>

        {/* Dose and Route */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="doseMg" className="block text-sm font-medium text-gray-700 mb-2">
              Dose (mg) *
            </label>
            <input
              {...register('doseMg', { valueAsNumber: true })}
              type="number"
              id="doseMg"
              step="0.1"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., 5000"
            />
            {errors.doseMg && (
              <p className="mt-1 text-sm text-red-600">{errors.doseMg.message}</p>
            )}
            {validationErrors.doseMg && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.doseMg}</p>
            )}
            {validationWarnings.doseMg && (
              <p className="mt-1 text-sm text-yellow-600">{validationWarnings.doseMg}</p>
            )}
          </div>

          <div>
            <label htmlFor="route" className="block text-sm font-medium text-gray-700 mb-2">
              Route *
            </label>
            <select
              {...register('route')}
              id="route"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select route</option>
              {routeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.route && (
              <p className="mt-1 text-sm text-red-600">{errors.route.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
              Frequency *
            </label>
            <select
              {...register('frequency')}
              id="frequency"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select frequency</option>
              {frequencyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.frequency && (
              <p className="mt-1 text-sm text-red-600">{errors.frequency.message}</p>
            )}
          </div>
        </div>

        {/* Treatment Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              {...register('startDate')}
              type="date"
              id="startDate"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
            )}
            {validationErrors.startDate && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.startDate}</p>
            )}
            {validationWarnings.startDate && (
              <p className="mt-1 text-sm text-yellow-600">{validationWarnings.startDate}</p>
            )}
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
              {...register('endDate')}
              type="date"
              id="endDate"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
            )}
            {validationErrors.endDate && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.endDate}</p>
            )}
            {validationWarnings.endDate && (
              <p className="mt-1 text-sm text-yellow-600">{validationWarnings.endDate}</p>
            )}
          </div>
        </div>

        {/* Withdrawal Period Information */}
        {withdrawalInfo && (
          <div className={`p-4 rounded-md border ${
            withdrawalInfo.isCritical 
              ? 'bg-red-50 border-red-200' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start">
              {withdrawalInfo.isCritical ? (
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
              )}
              <div>
                <h4 className={`text-sm font-medium ${
                  withdrawalInfo.isCritical ? 'text-red-800' : 'text-blue-800'
                }`}>
                  Withdrawal Period Information
                </h4>
                <p className={`text-sm mt-1 ${
                  withdrawalInfo.isCritical ? 'text-red-700' : 'text-blue-700'
                }`}>
                  Withdrawal period: <strong>{withdrawalInfo.days} days</strong><br />
                  Safe date: <strong>{withdrawalInfo.safeDate}</strong>
                  {withdrawalInfo.isCritical && (
                    <><br /><strong>⚠️ Critical: Do not sell products until this date!</strong></>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            {...register('notes')}
            id="notes"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Additional notes about the treatment..."
          />
        </div>

        {/* Validation warnings */}
        {Object.keys(validationWarnings).length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Warnings:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {Object.entries(validationWarnings).map(([field, message]) => (
                <li key={field}>• {message}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {entry ? 'Updating...' : 'Logging...'}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                {entry ? 'Update Entry' : 'Log AMU Entry'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AMUEntryForm;
