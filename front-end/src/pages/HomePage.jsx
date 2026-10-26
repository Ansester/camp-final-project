import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Package, Calendar, AlertCircle, ChevronRight, Clock, MapPin, X } from 'lucide-react';
import { useApiData } from '../hooks/useApiData.js';
import { authUtils } from '../utils/auth.js';

export default function HomePage({ onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    if (isMenuOpen) menuRef.current?.showModal();
    else menuRef.current?.close();
  }, [isMenuOpen]);
  const userId = authUtils.getUserId();
  const { data, loading, error, refetch } = useApiData('dashboard', {
    initialData: { stats: [], dueItems: [] },
    params: { userId }
  });

  const stats = data?.stats ?? [];

  const quickLinks = [
    { label: 'Browse Items', icon: Search, action: () => onNavigate('filter') },
    { label: 'My Borrowals', icon: Package, action: () => onNavigate('borrowals') },
    { label: 'My Reservations', icon: Calendar, action: () => onNavigate('reservations') },
  ];

  const menuItems = [
    { label: 'Browse & Search Items', icon: Search, action: () => onNavigate('filter') },
    { label: 'My Borrowals', icon: Package, action: () => onNavigate('borrowals') },
    { label: 'My Reservations', icon: Calendar, action: () => onNavigate('reservations') },
    { label: 'Fines & Payments', icon: AlertCircle, action: () => onNavigate('fines') },
    { label: 'Settings', icon: Package, action: () => onNavigate('profile') },
    { label: 'Help', icon: AlertCircle, action: () => onNavigate('help') },
  ];

  const dueItems = data?.dueItems ?? [];

  const statAccent = useMemo(
    () => ({
      activeBorrowals: 'text-[#57068C]',
      overdueItems: 'text-gray-700'
    }),
    []
  );

  const resolveStatAccent = (statId) => statAccent[statId] ?? 'text-[#57068C]';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#57068C]">C.A.M.P</h1>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Open navigation menu"
            aria-expanded={isMenuOpen}
            aria-controls="student-navigation"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Package className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Side Menu */}
        <dialog
          ref={menuRef}
          id="student-navigation"
          aria-labelledby="student-navigation-title"
          onClose={() => setIsMenuOpen(false)}
          className="fixed inset-y-0 left-auto m-0 h-screen max-h-screen w-80 max-w-[90vw] bg-white shadow-2xl border-l border-gray-200 backdrop:bg-black/30"
        >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 id="student-navigation-title" className="text-2xl font-bold text-gray-900">Menu</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-700" />
                </button>
              </div>

              <div className="space-y-2">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      item.action();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700 font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
        </dialog>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          {loading && stats.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500 text-sm py-6">
              Loading dashboard metrics…
            </div>
          ) : (
            stats.map((stat) => (
              <div
                key={stat.id ?? stat.label}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center"
              >
                <div className={`text-3xl font-bold ${resolveStatAccent(stat.id)} mb-2`}>
                  {stat.id === 'unpaidFines' ? `$${Number(stat.amount || 0).toFixed(2)}` : stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))
          )}
        </div>
        {error && (
          <div className="bg-purple-50 border border-purple-200 text-purple-800 text-sm rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium">We couldn&apos;t load your dashboard data.</p>
              <button
                onClick={refetch}
                className="mt-1 underline hover:text-purple-900"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            {quickLinks.map((link, index) => (
              <button
                key={index}
                onClick={link.action}
                className="flex flex-col items-center p-4 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors border border-violet-100"
              >
                <link.icon className="w-8 h-8 text-[#57068C] mb-2" />
                <span className="text-sm text-gray-700 font-medium text-center">{link.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Due Soon */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Due Soon</h2>
          <div className="space-y-3">
            {loading && dueItems.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-4">
                Loading items…
              </div>
            ) : (
              dueItems.map((item) => (
                <div
                  key={item.id ?? item.name}
                  className="flex items-center justify-between p-4 bg-violet-50 border border-violet-200 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-600 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {item.dueDisplay ?? item.dueDate}
                      </span>
                      <span className="text-sm text-gray-600 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {item.location}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}
