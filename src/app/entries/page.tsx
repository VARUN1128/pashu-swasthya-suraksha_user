'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useApp } from '@/contexts/AppContext';
import { mockClient } from '@/lib/mockClient';
import { AMUEntry } from '@/types';

const EntriesPage: React.FC = () => {
  const { amuEntries, animals, loading } = useApp();
  const [filteredEntries, setFilteredEntries] = useState<AMUEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    let filtered = [...amuEntries];

    if (searchTerm) {
      filtered = filtered.filter(entry => {
        const animal = animals.find(a => a.id === entry.animalId);
        return (
          entry.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          animal?.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
          animal?.breed.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (statusFilter) {
      filtered = filtered.filter(entry => {
        if (statusFilter === 'approved') return entry.vetApproved;
        if (statusFilter === 'pending') return !entry.vetApproved;
        return true;
      });
    }

    if (speciesFilter) {
      filtered = filtered.filter(entry => {
        const animal = animals.find(a => a.id === entry.animalId);
        return animal?.species === speciesFilter;
      });
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.startDate);
        return entryDate >= filterDate;
      });
    }

    setFilteredEntries(filtered);
  }, [amuEntries, animals, searchTerm, statusFilter, speciesFilter, dateFilter]);

  const handleExport = async () => {
    try {
      const exportData = await mockClient.export.exportAMUData({
        startDate: dateFilter || undefined,
        species: speciesFilter || undefined,
      });
      
      // Convert to CSV
      const headers = ['Entry ID', 'Animal Tag', 'Species', 'Drug', 'Dose (mg)', 'Start Date', 'End Date', 'Safe Date', 'Logged By', 'Status'];
      const csvContent = [
        headers.join(','),
        ...exportData.map(entry => [
          entry.entryId,
          entry.animalTag,
          entry.species,
          entry.drug,
          entry.dose,
          entry.startDate,
          entry.endDate,
          entry.safeDate,
          entry.loggedBy,
          'Approved' // This would come from the actual data
        ].join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `amu-entries-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
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
      return { status: 'safe', color: 'text-green-600', message: 'Safe' };
    } else if (daysUntilSafe <= 3) {
      return { status: 'critical', color: 'text-red-600', message: `${daysUntilSafe}d` };
    } else if (daysUntilSafe <= 7) {
      return { status: 'warning', color: 'text-yellow-600', message: `${daysUntilSafe}d` };
    } else {
      return { status: 'ok', color: 'text-gray-600', message: `${daysUntilSafe}d` };
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading AMU entries...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">AMU Entries</h1>
            <p className="text-gray-600">
              View and manage all antimicrobial usage entries across your farm.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="mt-4 sm:mt-0 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Species</option>
                <option value="cattle">Cattle</option>
                <option value="goat">Goat</option>
                <option value="sheep">Sheep</option>
                <option value="poultry">Poultry</option>
                <option value="pig">Pig</option>
                <option value="buffalo">Buffalo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Entries Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Animal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Drug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Safe Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEntries.map((entry) => {
                  const animal = animals.find(a => a.id === entry.animalId);
                  const withdrawalStatus = getWithdrawalStatus(entry);
                  
                  return (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {animal?.tag || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500 capitalize">
                            {animal?.species || 'Unknown'} • {animal?.breed || 'Unknown'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {entry.drugName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {entry.drugClass}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.doseMg}mg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          {new Date(entry.startDate).toLocaleDateString('en-IN')}
                        </div>
                        <div className="text-gray-500">
                          to {new Date(entry.endDate).toLocaleDateString('en-IN')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(entry.calculatedSafeDate).toLocaleDateString('en-IN')}
                        </div>
                        <div className={`text-xs ${withdrawalStatus.color}`}>
                          {withdrawalStatus.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(entry)}`}>
                          {entry.vetApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => window.location.href = `/animals/${entry.animalId}/log`}
                          className="text-green-600 hover:text-green-900 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Filter className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No entries found</h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EntriesPage;
