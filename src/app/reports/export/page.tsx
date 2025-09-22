'use client';

import React, { useState } from 'react';
import { Download, Calendar, Filter, FileText, BarChart3 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { mockClient } from '@/lib/mockClient';

const ReportsExportPage: React.FC = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    species: '',
    farmId: '',
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportData = await mockClient.export.exportAMUData({
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        species: filters.species || undefined,
        farmId: filters.farmId || undefined,
      });

      if (exportFormat === 'csv') {
        // Convert to CSV
        const headers = [
          'Entry ID',
          'Animal Tag',
          'Species',
          'Drug Name',
          'Drug Class',
          'Dose (mg)',
          'Route',
          'Start Date',
          'End Date',
          'Safe Date',
          'Withdrawal Period (days)',
          'Logged By',
          'Farm Name',
          'Location',
          'Vet Approved',
        ];
        
        const csvContent = [
          headers.join(','),
          ...exportData.map(entry => [
            entry.entryId,
            entry.animalTag,
            entry.species,
            entry.drug,
            '', // Drug class would need to be added to export data
            entry.dose,
            '', // Route would need to be added to export data
            entry.startDate,
            entry.endDate,
            entry.safeDate,
            '', // Withdrawal period would need to be calculated
            entry.loggedBy,
            entry.farm,
            entry.location,
            'Yes', // This would come from actual data
          ].map(field => `"${field}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `amu-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        // PDF export would be implemented here
        alert('PDF export coming soon!');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const speciesOptions = [
    { value: '', label: 'All Species' },
    { value: 'cattle', label: 'Cattle' },
    { value: 'goat', label: 'Goat' },
    { value: 'sheep', label: 'Sheep' },
    { value: 'poultry', label: 'Poultry' },
    { value: 'pig', label: 'Pig' },
    { value: 'buffalo', label: 'Buffalo' },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Export Reports</h1>
          <p className="text-gray-600">
            Generate and download comprehensive reports of your AMU data.
          </p>
        </div>

        {/* Export Options */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="csv"
                    checked={exportFormat === 'csv'}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">CSV (Excel compatible)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="pdf"
                    checked={exportFormat === 'pdf'}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">PDF Report</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500">
                <option value="comprehensive">Comprehensive AMU Report</option>
                <option value="compliance">Compliance Report</option>
                <option value="withdrawal">Withdrawal Period Report</option>
                <option value="drug-usage">Drug Usage Analysis</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Species</label>
              <select
                value={filters.species}
                onChange={(e) => setFilters({ ...filters, species: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {speciesOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Farm</label>
              <select
                value={filters.farmId}
                onChange={(e) => setFilters({ ...filters, farmId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Farms</option>
                <option value="farm-1">Green Valley Dairy Farm</option>
                <option value="farm-2">Sunrise Poultry Farm</option>
              </select>
            </div>
          </div>
        </div>

        {/* Report Preview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Preview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">Total Entries</h3>
                  <p className="text-2xl font-bold text-green-900">12</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Compliance Rate</h3>
                  <p className="text-2xl font-bold text-blue-900">95%</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-yellow-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Date Range</h3>
                  <p className="text-sm font-bold text-yellow-900">
                    {filters.startDate || 'All'} - {filters.endDate || 'Present'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p className="mb-2">This report will include:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>All AMU entries matching your filter criteria</li>
              <li>Animal details and treatment information</li>
              <li>Withdrawal period calculations and safe dates</li>
              <li>Compliance status and veterinarian approvals</li>
              <li>Summary statistics and analytics</li>
            </ul>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-center">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isExporting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Export Report
              </>
            )}
          </button>
        </div>

        {/* Export History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Exports</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">AMU Report - January 2024</p>
                  <p className="text-sm text-gray-500">Exported on Jan 31, 2024 at 2:30 PM</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">CSV • 2.3 MB</span>
                <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                  Download
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Compliance Report - Q4 2023</p>
                  <p className="text-sm text-gray-500">Exported on Dec 31, 2023 at 11:45 PM</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">PDF • 1.8 MB</span>
                <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReportsExportPage;
