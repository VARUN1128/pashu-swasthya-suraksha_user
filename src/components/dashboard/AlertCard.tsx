'use client';

import React from 'react';
import { AlertTriangle, Info, AlertCircle, X } from 'lucide-react';
import { Alert as AlertType } from '@/types';

interface AlertCardProps {
  alert: AlertType;
  onDismiss: (alertId: string) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onDismiss }) => {
  const getAlertIcon = () => {
    switch (alert.type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAlertStyles = () => {
    switch (alert.type) {
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getTitleStyles = () => {
    switch (alert.type) {
      case 'critical':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  const getMessageStyles = () => {
    switch (alert.type) {
      case 'critical':
        return 'text-red-700';
      case 'warning':
        return 'text-yellow-700';
      case 'info':
        return 'text-blue-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getAlertStyles()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getAlertIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-medium ${getTitleStyles()}`}>
              {alert.title}
            </h4>
            <p className={`text-sm mt-1 ${getMessageStyles()}`}>
              {alert.message}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {new Date(alert.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
        <button
          onClick={() => onDismiss(alert.id)}
          className="flex-shrink-0 ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AlertCard;
