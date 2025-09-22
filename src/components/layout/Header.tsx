'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, User, LogOut, Settings, HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Animals', href: '/animals' },
    { name: 'AMU Logs', href: '/entries' },
    { name: 'Reports', href: '/reports/export' },
  ];

  const vetNavigation = [
    { name: 'Vet Dashboard', href: '/vet-dashboard' },
    { name: 'Pending Approvals', href: '/vet-dashboard?tab=approvals' },
  ];

  const auditorNavigation = [
    { name: 'Auditor View', href: '/auditor' },
    { name: 'Analytics', href: '/auditor?tab=analytics' },
  ];

  const getNavigationItems = () => {
    if (!user) return [];
    if (user.role === 'vet') return [...navigation, ...vetNavigation];
    if (user.role === 'auditor') return [...navigation, ...auditorNavigation];
    return navigation;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">PS</span>
              </div>
              <span className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900">
                <span className="hidden sm:inline">Pashu Swasthya Suraksha</span>
                <span className="sm:hidden">PSS</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden lg:flex space-x-6 xl:space-x-8">
              {getNavigationItems().map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-green-600 px-2 xl:px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* User Info */}
                <div className="hidden md:flex items-center space-x-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                  </div>
                  <div className="text-xs sm:text-sm">
                    <div className="font-medium text-gray-900 truncate max-w-20 sm:max-w-none">{user?.name}</div>
                    <div className="text-gray-500 capitalize">{user?.role}</div>
                  </div>
                </div>

                {/* Settings & Help */}
                <div className="hidden lg:flex items-center space-x-1">
                  <Link
                    href="/settings"
                    className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                  <Link
                    href="/help"
                    className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors p-1 sm:p-0"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-green-600 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-green-600 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            {isAuthenticated && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1.5 sm:p-2 text-gray-400 hover:text-gray-600"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && isAuthenticated && (
          <div className="lg:hidden border-t border-gray-200 py-3">
            <nav className="space-y-1">
              {getNavigationItems().map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2.5 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <Link
                  href="/settings"
                  className="flex items-center px-3 py-2.5 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
                <Link
                  href="/help"
                  className="flex items-center px-3 py-2.5 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2.5 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
