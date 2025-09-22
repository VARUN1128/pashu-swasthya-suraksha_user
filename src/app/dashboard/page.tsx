'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, AlertTriangle, Users, Activity, TrendingUp } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import StatsCard from '@/components/dashboard/StatsCard';
import AlertCard from '@/components/dashboard/AlertCard';
import ChartCard from '@/components/dashboard/ChartCard';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { animals, amuEntries, alerts, dashboardStats, loading, refreshData } = useApp();
  const router = useRouter();

  // Chart data
  const amuOverTimeData = [
    { month: 'Jan', entries: 12 },
    { month: 'Feb', entries: 19 },
    { month: 'Mar', entries: 15 },
    { month: 'Apr', entries: 22 },
    { month: 'May', entries: 18 },
    { month: 'Jun', entries: 25 },
  ];

  const drugClassData = [
    { name: 'Beta-lactam', value: 35, color: '#10B981' },
    { name: 'Tetracycline', value: 25, color: '#3B82F6' },
    { name: 'Sulfonamide', value: 20, color: '#F59E0B' },
    { name: 'Anthelmintic', value: 15, color: '#EF4444' },
    { name: 'Other', value: 5, color: '#8B5CF6' },
  ];

  const complianceData = [
    { month: 'Jan', compliance: 85 },
    { month: 'Feb', compliance: 90 },
    { month: 'Mar', compliance: 88 },
    { month: 'Apr', compliance: 92 },
    { month: 'May', compliance: 89 },
    { month: 'Jun', compliance: 95 },
  ];

  const handleLogAMU = (animalId: string) => {
    router.push(`/animals/${animalId}/log`);
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      // In a real app, this would call the API
      console.log('Dismissing alert:', alertId);
      await refreshData();
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600">
              Here&apos;s what&apos;s happening with your farm today.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={() => router.push('/animals')}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Animal
            </button>
            <button
              onClick={() => router.push('/entry/new')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Log AMU
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Animals"
            value={dashboardStats?.totalAnimals || 0}
            icon={Users}
            color="blue"
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="AMU Entries"
            value={dashboardStats?.totalAMUEntries || 0}
            icon={Activity}
            color="green"
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Compliance Rate"
            value={`${dashboardStats?.complianceRate || 0}%`}
            icon={TrendingUp}
            color="purple"
            trend={{ value: 5, isPositive: true }}
          />
          <StatsCard
            title="Critical Alerts"
            value={dashboardStats?.criticalAlerts || 0}
            icon={AlertTriangle}
            color="red"
          />
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h2>
            <div className="space-y-4">
              {alerts.slice(0, 3).map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onDismiss={handleDismissAlert}
                />
              ))}
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="AMU Entries Over Time" icon={Activity}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={amuOverTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="entries" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Drug Class Distribution" icon={Activity}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={drugClassData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {drugClassData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Compliance Chart */}
        <ChartCard title="Compliance Rate Over Time" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={complianceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="compliance" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Recent Animals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Animals</h2>
            <button
              onClick={() => router.push('/animals')}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              View all
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {animals.slice(0, 6).map((animal) => (
              <div key={animal.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{animal.tag}</h3>
                  <span className="text-sm text-gray-500 capitalize">{animal.species}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{animal.breed}</p>
                <button
                  onClick={() => handleLogAMU(animal.id)}
                  className="w-full bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Log AMU
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent AMU Entries */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent AMU Entries</h2>
            <button
              onClick={() => router.push('/entries')}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              View all
            </button>
          </div>
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
                      Safe Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {amuEntries.slice(0, 5).map((entry) => {
                    const animal = animals.find(a => a.id === entry.animalId);
                    return (
                      <tr key={entry.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {animal?.tag || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.drugName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(entry.calculatedSafeDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            entry.vetApproved 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {entry.vetApproved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
