'use client';

import React from 'react';
import { HelpCircle, BookOpen, Phone, Mail, MessageCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';

const HelpPage: React.FC = () => {
  const faqs = [
    {
      question: 'What is the withdrawal period?',
      answer: 'The withdrawal period is the time that must pass after the last administration of an antimicrobial before the animal\'s products (milk, meat, eggs) can be safely consumed. This ensures that drug residues are below safe levels.',
    },
    {
      question: 'How is the withdrawal period calculated?',
      answer: 'Withdrawal periods are calculated based on the drug used, animal species, and product type (milk, meat, eggs). The system uses the MRL (Maximum Residue Limit) database to determine the appropriate withdrawal period for each treatment.',
    },
    {
      question: 'What should I do if I get a critical alert?',
      answer: 'Critical alerts indicate that the withdrawal period is expiring soon (within 3 days). You should not sell any products from that animal until the safe date has passed. Consider delaying treatment if product sale is imminent.',
    },
    {
      question: 'How do I add a new animal?',
      answer: 'Go to the Animals page and click "Add Animal". Fill in the required information including tag, species, breed, date of birth, and gender. You can also add optional information like weight.',
    },
    {
      question: 'Can I edit an AMU entry after logging it?',
      answer: 'Yes, you can edit AMU entries that are still pending veterinarian approval. Once approved, entries become read-only to maintain audit trail integrity.',
    },
    {
      question: 'How do I export my data?',
      answer: 'You can export your AMU data in CSV format from the Entries page. Use the filters to select the data you want to export, then click the "Export CSV" button.',
    },
  ];

  const contactMethods = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Phone Support',
      description: 'Call us for immediate assistance',
      contact: '+91-9876543210',
      available: 'Mon-Fri, 9 AM - 6 PM IST',
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Support',
      description: 'Send us an email and we\'ll respond within 24 hours',
      contact: 'support@pashuswasthya.com',
      available: '24/7',
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      contact: 'Available on dashboard',
      available: 'Mon-Fri, 9 AM - 6 PM IST',
    },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Help & Support</h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions and get the support you need.
          </p>
        </div>

        {/* Quick Start Guide */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpen className="w-6 h-6 mr-2 text-green-600" />
            Quick Start Guide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-green-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Set Up Your Farm</h3>
              <p className="text-sm text-gray-600">
                Add your farm details and location information in the settings.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Add Your Animals</h3>
              <p className="text-sm text-gray-600">
                Register each animal with detailed information including species and breed.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Log AMU Entries</h3>
              <p className="text-sm text-gray-600">
                Record antimicrobial usage with automatic withdrawal period calculations.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Contact Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => (
              <div key={index} className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-green-600 mb-3 flex justify-center">
                  {method.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{method.description}</p>
                <p className="text-sm font-medium text-gray-900 mb-1">{method.contact}</p>
                <p className="text-xs text-gray-500">{method.available}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="bg-green-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Documentation</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• User Manual (PDF)</li>
                <li>• Video Tutorials</li>
                <li>• Best Practices Guide</li>
                <li>• MRL Database Reference</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Training</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Online Training Sessions</li>
                <li>• Farm Visit Support</li>
                <li>• Group Training Workshops</li>
                <li>• Certification Programs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HelpPage;
