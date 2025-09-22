'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Calendar, AlertTriangle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import AMUEntryForm from '@/components/amu/AMUEntryForm';
import { useApp } from '@/contexts/AppContext';
import { mockClient } from '@/lib/mockClient';
import { Animal, AMUEntry, AMUEntryFormData } from '@/types';

const AnimalAMULogPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { refreshData } = useApp();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [animalAMUEntries, setAnimalAMUEntries] = useState<AMUEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const animalId = params.id as string;

  useEffect(() => {
    const loadAnimal = async () => {
      try {
        const animalData = await mockClient.animal.getAnimal(animalId);
        if (!animalData) {
          router.push('/animals');
          return;
        }
        setAnimal(animalData);
        
        // Load AMU entries for this animal
        const entries = await mockClient.amu.getAMUEntries({ animalId });
        setAnimalAMUEntries(entries);
      } catch (error) {
        console.error('Error loading animal:', error);
        router.push('/animals');
      } finally {
        setLoading(false);
      }
    };

    if (animalId) {
      loadAnimal();
    }
  }, [animalId, router]);

  const handleAddAMUEntry = async (data: AMUEntryFormData) => {
    setIsSubmitting(true);
    try {
      await mockClient.amu.createAMUEntry(data, 'user-1'); // This should come from auth context
      await refreshData();
      
      // Reload animal AMU entries
      const entries = await mockClient.amu.getAMUEntries({ animalId });
      setAnimalAMUEntries(entries);
      
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding AMU entry:', error);
      alert('Error adding AMU entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSpeciesIcon = (species: string) => {
    switch (species) {
      case 'cattle': return '🐄';
      case 'goat': return '🐐';
      case 'sheep': return '🐑';
      case 'poultry': return '🐔';
      case 'pig': return '🐷';
      case 'buffalo': return '🐃';
      default: return '🐾';
    }
  };

  const getStatusColor = (entry: AMUEntry) => {
    if (entry.vetApproved) {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-yellow-100 text-yellow-800';
  };

  const getWithdrawalStatus = (entry: AMUEntry) => {
    const today = new Date();
    const safeDate = new Date(entry.calculatedSafeDate);
    const daysUntilSafe = Math.ceil((safeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilSafe <= 0) {
      return { status: 'safe', color: 'text-green-600', message: 'Safe for sale' };
    } else if (daysUntilSafe <= 3) {
      return { status: 'critical', color: 'text-red-600', message: `${daysUntilSafe} days remaining` };
    } else if (daysUntilSafe <= 7) {
      return { status: 'warning', color: 'text-yellow-600', message: `${daysUntilSafe} days remaining` };
    } else {
      return { status: 'ok', color: 'text-gray-600', message: `${daysUntilSafe} days remaining` };
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading animal details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!animal) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Animal Not Found</h2>
          <p className="text-gray-600 mb-4">The animal you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/animals')}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Back to Animals
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/animals')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{getSpeciesIcon(animal.species)}</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{animal.tag}</h1>
              <p className="text-gray-600">
                {animal.species.charAt(0).toUpperCase() + animal.species.slice(1)} • {animal.breed}
              </p>
            </div>
          </div>
        </div>

        {/* Animal Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Species</h3>
              <p className="text-lg font-semibold text-gray-900 capitalize">{animal.species}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Breed</h3>
              <p className="text-lg font-semibold text-gray-900">{animal.breed}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Gender</h3>
              <p className="text-lg font-semibold text-gray-900 capitalize">{animal.gender}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Date of Birth</h3>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(animal.dob).toLocaleDateString('en-IN')}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Age</h3>
              <p className="text-lg font-semibold text-gray-900">
                {Math.floor((new Date().getTime() - new Date(animal.dob).getTime()) / (1000 * 60 * 60 * 24 * 365))} years
              </p>
            </div>
            {animal.weight && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Weight</h3>
                <p className="text-lg font-semibold text-gray-900">{animal.weight} kg</p>
              </div>
            )}
          </div>
        </div>

        {/* AMU Entries */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">AMU Entries</h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Log AMU Entry
            </button>
          </div>

          {animalAMUEntries.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No AMU Entries</h3>
            <p className="text-gray-600 mb-4">
              This animal doesn&apos;t have any antimicrobial usage records yet.
            </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Log First Entry
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {animalAMUEntries.map((entry) => {
                const withdrawalStatus = getWithdrawalStatus(entry);
                return (
                  <div key={entry.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{entry.drugName}</h3>
                        <p className="text-sm text-gray-600">{entry.drugClass} • {entry.doseMg}mg</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(entry)}`}>
                          {entry.vetApproved ? 'Approved' : 'Pending'}
                        </span>
                        {withdrawalStatus.status === 'critical' && (
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Route</h4>
                        <p className="text-sm text-gray-900 capitalize">{entry.route}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Frequency</h4>
                        <p className="text-sm text-gray-900">{entry.frequency}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Treatment Period</h4>
                        <p className="text-sm text-gray-900">
                          {new Date(entry.startDate).toLocaleDateString('en-IN')} - {new Date(entry.endDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Withdrawal Period</h4>
                        <p className={`text-sm font-medium ${withdrawalStatus.color}`}>
                          {withdrawalStatus.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Safe Date</h4>
                        <p className="text-sm text-gray-900">
                          {new Date(entry.calculatedSafeDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Logged On</h4>
                        <p className="text-sm text-gray-900">
                          {new Date(entry.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {entry.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Notes</h4>
                        <p className="text-sm text-gray-900">{entry.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add AMU Entry Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <AMUEntryForm
                animal={animal}
                onSubmit={handleAddAMUEntry}
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

export default AnimalAMULogPage;
