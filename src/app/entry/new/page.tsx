'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import AMUEntryForm from '@/components/amu/AMUEntryForm';
import { mockClient } from '@/lib/mockClient';
import { AMUEntryFormData } from '@/types';

const NewAMUEntryPage: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: AMUEntryFormData) => {
    setIsSubmitting(true);
    try {
      await mockClient.amu.createAMUEntry(data, 'user-1'); // This should come from auth context
      router.push('/entries');
    } catch (error) {
      console.error('Error creating AMU entry:', error);
      alert('Error creating AMU entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={handleCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Log New AMU Entry</h1>
            <p className="text-gray-600">
              Record antimicrobial usage for any animal in your farm.
            </p>
          </div>
        </div>

        <AMUEntryForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </div>
    </Layout>
  );
};

export default NewAMUEntryPage;
