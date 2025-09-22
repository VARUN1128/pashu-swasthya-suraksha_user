'use client';

import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import AnimalCard from '@/components/animals/AnimalCard';
import AnimalForm from '@/components/animals/AnimalForm';
import { useApp } from '@/contexts/AppContext';
import { mockClient } from '@/lib/mockClient';
import { AnimalFormData } from '@/types';

const AnimalsPage: React.FC = () => {
  const { animals, loading, refreshData } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddAnimal = async (data: AnimalFormData) => {
    setIsSubmitting(true);
    try {
      // Get the first farm for now (in real app, user would select farm)
      const farms = await mockClient.farm.getFarms('user-1'); // This should come from auth context
      if (farms.length === 0) {
        throw new Error('No farm found. Please create a farm first.');
      }
      
      await mockClient.animal.createAnimal(data, farms[0].id);
      await refreshData();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding animal:', error);
      alert('Error adding animal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogAMU = (animalId: string) => {
    window.location.href = `/animals/${animalId}/log`;
  };

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.breed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecies = !speciesFilter || animal.species === speciesFilter;
    return matchesSearch && matchesSpecies;
  });

  const speciesOptions = [
    { value: '', label: 'All Species' },
    { value: 'cattle', label: 'Cattle' },
    { value: 'goat', label: 'Goat' },
    { value: 'sheep', label: 'Sheep' },
    { value: 'poultry', label: 'Poultry' },
    { value: 'pig', label: 'Pig' },
    { value: 'buffalo', label: 'Buffalo' },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading animals...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Animals</h1>
            <p className="text-gray-600">
              Manage your livestock and track their health records.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 sm:mt-0 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Animal
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by tag or breed..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {speciesOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Animals Grid */}
        {filteredAnimals.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || speciesFilter ? 'No animals found' : 'No animals yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || speciesFilter 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first animal to the system.'
              }
            </p>
            {!searchTerm && !speciesFilter && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Add Your First Animal
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnimals.map((animal) => (
              <AnimalCard
                key={animal.id}
                animal={animal}
                onLogAMU={handleLogAMU}
              />
            ))}
          </div>
        )}

        {/* Add Animal Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <AnimalForm
                onSubmit={handleAddAnimal}
                onCancel={() => setShowAddForm(false)}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AnimalsPage;
