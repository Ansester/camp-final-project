import React, { useMemo } from 'react';
import { ChevronLeft, Package } from 'lucide-react';
import { useApiData } from '../hooks/useApiData.js';

export default function FacilityItemsPage({ onNavigate, selectedFacility, setSelectedItem }) {
  const { data, loading, error, refetch } = useApiData('items', {
    initialData: { items: [] }
  });

  // Normalize selected facility data
  const facilityId = typeof selectedFacility === 'string'
    ? null // when just a name string we can't match by id, items won't filter
    : selectedFacility?._id;
  const facilityName = typeof selectedFacility === 'string'
    ? selectedFacility
    : selectedFacility?.name || 'Facility';

  const allItems = useMemo(() => data?.items ?? [], [data]);

  const facilityItems = useMemo(() => {
    if (!facilityId) return [];
    return allItems.filter(item => {
      const itemFacilityId = item.facility?._id || item.facility; // populated or raw id
      return itemFacilityId === facilityId;
    });
  }, [allItems, facilityId]);

  if (!selectedFacility) {
    onNavigate('catalogue');
    return null;
  }

  const handleItemClick = (item) => {
    setSelectedItem(item);
    onNavigate('itemDetail');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center items-start sm:space-x-4 space-y-2 sm:space-y-0">
            <button aria-label="Back to catalogue"
              onClick={() => onNavigate('catalogue')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{facilityName}</h1>
              <p className="text-gray-600 mt-1">{facilityItems.length} items available</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {error && (
          <div className="bg-purple-50 border border-purple-200 text-purple-800 text-sm rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Unable to load items right now.
              <button onClick={refetch} className="ml-2 underline hover:text-purple-900">
                Retry
              </button>
            </span>
          </div>
        )}

        {loading && allItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-600">
            Loading items…
          </div>
        ) : !loading && facilityItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600 font-medium">No items found at this facility</p>
          </div>
        ) : (
          <div className="space-y-3">
            {facilityItems.map(item => (
              <div
                key={item._id || item.id}
                onClick={() => handleItemClick(item)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-600">
                        <span className="font-medium">Category:</span> {item.category}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                      item.status === 'available'
                        ? 'bg-violet-100 text-violet-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {item.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}
