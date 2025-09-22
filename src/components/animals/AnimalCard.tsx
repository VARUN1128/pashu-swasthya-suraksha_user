'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Weight, Plus, Eye } from 'lucide-react';
import { Animal } from '@/types';

interface AnimalCardProps {
  animal: Animal;
  onLogAMU?: (animalId: string) => void;
}

const AnimalCard: React.FC<AnimalCardProps> = ({ animal, onLogAMU }) => {
  const getSpeciesIcon = (species: string) => {
    switch (species) {
      case 'cattle':
        return '🐄';
      case 'goat':
        return '🐐';
      case 'sheep':
        return '🐑';
      case 'poultry':
        return '🐔';
      case 'pig':
        return '🐷';
      case 'buffalo':
        return '🐃';
      default:
        return '🐾';
    }
  };

  const getSpeciesColor = (species: string) => {
    switch (species) {
      case 'cattle':
        return 'bg-yellow-100 text-yellow-800';
      case 'goat':
        return 'bg-green-100 text-green-800';
      case 'sheep':
        return 'bg-blue-100 text-blue-800';
      case 'poultry':
        return 'bg-red-100 text-red-800';
      case 'pig':
        return 'bg-pink-100 text-pink-800';
      case 'buffalo':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const ageInMonths = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    
    if (ageInMonths < 12) {
      return `${ageInMonths} months`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      return months > 0 ? `${years}y ${months}m` : `${years} years`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getSpeciesIcon(animal.species)}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{animal.tag}</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSpeciesColor(animal.species)}`}>
              {animal.species.charAt(0).toUpperCase() + animal.species.slice(1)}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link
            href={`/animals/${animal.id}/log`}
            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
            title="View AMU Logs"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{animal.breed}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span>Age: {calculateAge(animal.dob)}</span>
        </div>

        {animal.weight && (
          <div className="flex items-center text-sm text-gray-600">
            <Weight className="w-4 h-4 mr-2" />
            <span>{animal.weight} kg</span>
          </div>
        )}

        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="capitalize">{animal.gender}</span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex space-x-3">
          <button
            onClick={() => onLogAMU?.(animal.id)}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log AMU
          </button>
          <Link
            href={`/animals/${animal.id}/log`}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors text-center"
          >
            View Logs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AnimalCard;
