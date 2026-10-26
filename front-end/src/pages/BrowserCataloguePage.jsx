import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useApiData } from '../hooks/useApiData.js';

export default function BrowserCataloguePage({ onNavigate, setSelectedFacility }) {
  const { data, loading, error, refetch } = useApiData('items', {
    initialData: { facilities: [] }
  });

  const facilities = data?.facilities ?? [];

  const handleFacilityClick = (facility) => {
    // Pass the whole facility object for downstream pages needing _id and name
    setSelectedFacility(facility);
    onNavigate('facilityItems');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center items-start sm:space-x-4 space-y-2 sm:space-y-0">
            <button
              onClick={() => onNavigate('home')}
              aria-label="Back to dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Browse Catalogue</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Campus Asset Management Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Campus Asset Management
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-purple-50 border border-purple-200 text-sm text-purple-800 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Unable to load facilities.
                <button
                  onClick={refetch}
                  className="ml-1 underline hover:text-purple-900"
                >
                  Retry
                </button>
              </span>
            </div>
          )}

          <div className="space-y-3">
            {loading && facilities.length === 0 ? (
              <p className="text-center text-gray-500 text-sm">Loading facilities…</p>
            ) : (
              facilities.map((facility) => (
                <button
                  key={facility._id || facility.id || facility.name}
                  onClick={() => handleFacilityClick(facility)}
                  className="w-full py-4 px-6 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:border-violet-300 hover:bg-violet-50 transition-all text-center"
                >
                  {facility.name}
                </button>
              ))
            )}

            {/* Filter & Search Button */}
            <button
              onClick={() => onNavigate('filter')}
              className="w-full py-4 px-6 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:border-violet-300 hover:bg-violet-50 transition-all text-center"
            >
              Filter & Search
            </button>
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}
