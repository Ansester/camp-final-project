import React, { useMemo, useState, useEffect } from 'react';
import { ChevronLeft, Clock, MapPin, List } from 'lucide-react';
import { useApiData } from '../hooks/useApiData.js';
import { authUtils } from '../utils/auth.js';
import { api } from '../services/api.js';

export default function MyBorrowalsPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('current');
  const userId = authUtils.getUserId();
  const [waitlistItems, setWaitlistItems] = useState([]);
  const [loadingWaitlist, setLoadingWaitlist] = useState(true);
  const [waitlistError, setWaitlistError] = useState(null);

  const { data, loading, error, refetch } = useApiData('borrowals', {
    initialData: { current: [], history: [] },
    params: { userId }
  });

  const currentBorrowals = data?.current ?? [];
  const historyBorrowals = data?.history ?? [];

  // Fetch waitlist items
  useEffect(() => {
    const fetchWaitlist = async () => {
      setLoadingWaitlist(true);
      setWaitlistError(null);
      try {
        const response = await api.getWaitlist();
        setWaitlistItems(response.waitlist || []);
      } catch (err) {
        setWaitlistError(err.message || 'Failed to load waitlist');
        setWaitlistItems([]);
      } finally {
        setLoadingWaitlist(false);
      }
    };

    fetchWaitlist();
  }, []);

  const hasData = useMemo(() => ({
    current: currentBorrowals.length > 0,
    history: historyBorrowals.length > 0,
    waitlisted: waitlistItems.length > 0
  }), [currentBorrowals.length, historyBorrowals.length, waitlistItems.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <button aria-label="Back to dashboard"
              onClick={() => onNavigate('home')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">My Borrowals</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 flex space-x-2">
          <button
            onClick={() => setActiveTab('current')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'current'
                ? 'bg-[#57068C] text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Current
          </button>
          <button
            onClick={() => setActiveTab('waitlisted')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'waitlisted'
                ? 'bg-[#57068C] text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Waitlisted
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-[#57068C] text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            History
          </button>
        </div>

        {error && (
          <div className="bg-purple-50 border border-purple-200 text-purple-800 text-sm rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Unable to load borrowals.
              <button onClick={refetch} className="ml-2 underline hover:text-purple-900">
                Try again
              </button>
            </span>
          </div>
        )}

        {/* Current Borrowals */}
        {activeTab === 'current' && (
          <div className="space-y-3">
            {loading && !hasData.current ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center text-gray-600">
                Loading current borrowals…
              </div>
            ) : !hasData.current ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center text-gray-600">
                You have no active borrowals.
              </div>
            ) : (
              currentBorrowals.map(item => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-600 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Due: {item.dueDate}
                        </span>
                        <span className="text-sm text-gray-600 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {item.location}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-lg text-sm font-medium">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Upcoming Borrowals */}
        {/* {activeTab === 'upcoming' && (
          <div className="space-y-3">
            {upcomingBorrowals.map(item => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-600 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Pickup: {item.pickupDate}
                      </span>
                      <span className="text-sm text-gray-600 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {item.location}
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                    {item.status}
                  </span>
                </div>
                <button className="w-full py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium">
                  Cancel Reservation
                </button>
              </div>
            ))}
          </div>
        )} */}

        {/* Waitlisted Items */}
        {activeTab === 'waitlisted' && (
          <div className="space-y-3">
            {waitlistError && (
              <div className="bg-purple-50 border border-purple-200 text-purple-800 text-sm rounded-xl p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  {waitlistError}
                </span>
              </div>
            )}
            {loadingWaitlist && !hasData.waitlisted ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center text-gray-600">
                Loading waitlisted items…
              </div>
            ) : !hasData.waitlisted ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center text-gray-600">
                You have no items on the waitlist.
              </div>
            ) : (
              waitlistItems.map(item => (
                <div key={item.id} className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 ${
                  item.status === 'notified' ? 'border-violet-300 bg-violet-50' : ''
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{item.item}</h3>
                      <div className="flex items-center space-x-4 mt-2">
                        {item.status === 'notified' ? (
                          <span className="text-sm text-violet-700 font-semibold flex items-center">
                            <List className="w-4 h-4 mr-1" />
                            Item is now available! Reserve it within 24 hours.
                          </span>
                        ) : (
                          <span className="text-sm text-gray-600 flex items-center">
                            <List className="w-4 h-4 mr-1" />
                            Waitlist Position: <span className="font-bold text-violet-700 ml-1">#{item.position}</span>
                          </span>
                        )}
                        <span className="text-sm text-gray-600 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {item.facility}
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      item.status === 'notified'
                        ? 'bg-violet-200 text-violet-800'
                        : 'bg-violet-100 text-violet-700'
                    }`}>
                      {item.status === 'notified' ? 'Available' : 'Waiting'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* History */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {loading && !hasData.history ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center text-gray-600">
                Loading history…
              </div>
            ) : !hasData.history ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-center text-gray-600">
                No prior borrowals recorded yet.
              </div>
            ) : (
              historyBorrowals.map(item => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-600 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Returned: {item.returnDate}
                        </span>
                        <span className="text-sm text-gray-600 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {item.location}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Bottom Spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}
