'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus } from 'lucide-react';
import { AnimalFormData, Animal } from '@/types';
import { validateAnimal } from '@/lib/validation';

const animalSchema = z.object({
  tag: z.string().min(1, 'Animal tag is required'),
  species: z.enum(['cattle', 'goat', 'sheep', 'poultry', 'pig', 'buffalo']),
  breed: z.string().min(1, 'Breed is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female']),
  weight: z.number().min(0).optional(),
});

type FormData = z.infer<typeof animalSchema>;

interface AnimalFormProps {
  animal?: Animal;
  onSubmit: (data: AnimalFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const AnimalForm: React.FC<AnimalFormProps> = ({
  animal,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [validationWarnings, setValidationWarnings] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(animalSchema),
    defaultValues: animal ? {
      tag: animal.tag,
      species: animal.species,
      breed: animal.breed,
      dob: animal.dob,
      gender: animal.gender,
      weight: animal.weight,
    } : undefined,
  });


  const handleFormSubmit = async (data: FormData) => {
    // Client-side validation
    const validation = validateAnimal(data);
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

  const speciesOptions = [
    { value: 'cattle', label: 'Cattle', icon: '🐄' },
    { value: 'goat', label: 'Goat', icon: '🐐' },
    { value: 'sheep', label: 'Sheep', icon: '🐑' },
    { value: 'poultry', label: 'Poultry', icon: '🐔' },
    { value: 'pig', label: 'Pig', icon: '🐷' },
    { value: 'buffalo', label: 'Buffalo', icon: '🐃' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {animal ? 'Edit Animal' : 'Add New Animal'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-2">
              Animal Tag/ID *
            </label>
            <input
              {...register('tag')}
              type="text"
              id="tag"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., GV001, SP002"
            />
            {errors.tag && (
              <p className="mt-1 text-sm text-red-600">{errors.tag.message}</p>
            )}
            {validationErrors.tag && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.tag}</p>
            )}
          </div>

          <div>
            <label htmlFor="species" className="block text-sm font-medium text-gray-700 mb-2">
              Species *
            </label>
            <select
              {...register('species')}
              id="species"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select species</option>
              {speciesOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
            {errors.species && (
              <p className="mt-1 text-sm text-red-600">{errors.species.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-2">
              Breed *
            </label>
            <input
              {...register('breed')}
              type="text"
              id="breed"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., Holstein Friesian, Boer"
            />
            {errors.breed && (
              <p className="mt-1 text-sm text-red-600">{errors.breed.message}</p>
            )}
            {validationErrors.breed && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.breed}</p>
            )}
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
              Gender *
            </label>
            <select
              {...register('gender')}
              id="gender"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth *
            </label>
            <input
              {...register('dob')}
              type="date"
              id="dob"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            {errors.dob && (
              <p className="mt-1 text-sm text-red-600">{errors.dob.message}</p>
            )}
            {validationErrors.dob && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.dob}</p>
            )}
            {validationWarnings.dob && (
              <p className="mt-1 text-sm text-yellow-600">{validationWarnings.dob}</p>
            )}
          </div>

          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
              Weight (kg)
            </label>
            <input
              {...register('weight', { valueAsNumber: true })}
              type="number"
              id="weight"
              step="0.1"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., 450.5"
            />
            {errors.weight && (
              <p className="mt-1 text-sm text-red-600">{errors.weight.message}</p>
            )}
            {validationErrors.weight && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.weight}</p>
            )}
            {validationWarnings.weight && (
              <p className="mt-1 text-sm text-yellow-600">{validationWarnings.weight}</p>
            )}
          </div>
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
                {animal ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                {animal ? 'Update Animal' : 'Add Animal'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnimalForm;
