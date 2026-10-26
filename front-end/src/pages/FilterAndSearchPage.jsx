import React, { useMemo, useState } from 'react';
import { ChevronLeft, Search, Filter, X } from 'lucide-react';
import { useApiData } from '../hooks/useApiData.js';

export default function FilterAndSearchPage({ onNavigate, setSelectedItem }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFacility, setSelectedFacility] = useState('All');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { data, loading, error, refetch } = useApiData('items', {
    initialData: {
      items: [],
      filters: { categories: ['All'], facilities: ['All'] }
    }
  });

  const allItems = useMemo(() => data?.items ?? [], [data]);

  // Derive unique option lists from items
  const categories = useMemo(() => {
    const cats = Array.from(new Set(allItems.map(i => i.category).filter(Boolean)));
    return ['All', ...cats.sort()];
  }, [allItems]);

  const facilities = useMemo(() => {
    const names = Array.from(new Set(allItems.map(i => (i.facility && typeof i.facility === 'object' ? i.facility.name : i.facility)).filter(Boolean)));
    return ['All', ...names.sort()];
  }, [allItems]);

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const facilityName = item.facility && typeof item.facility === 'object' ? item.facility.name : item.facility;
      const matchesSearch = !searchTerm || item.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesFacility = selectedFacility === 'All' || facilityName === selectedFacility;
      const availableQty = item.availableQuantity ?? (item.status === 'available' ? (item.quantity ?? 1) : 0);
      const matchesAvailability = !showAvailableOnly || availableQty > 0;
      return matchesSearch && matchesCategory && matchesFacility && matchesAvailability;
    });
  }, [allItems, searchTerm, selectedCategory, selectedFacility, showAvailableOnly]);

  const activeFilters = [selectedCategory, selectedFacility, showAvailableOnly].filter(f => f !== 'All' && f !== false).length;

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedFacility('All');
    setShowAvailableOnly(false);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    onNavigate('itemDetail');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('home')}
              aria-label="Back to dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Browse Items</h1>
          </div>

          {/* Search Bar */}
          <div className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                aria-label="Search equipment"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 ring-[#57068C] focus:border-transparent bg-gray-50"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Filter equipment"
              aria-expanded={showFilters}
              aria-controls="equipment-filters"
              className={`px-4 py-3 rounded-xl border transition-colors flex items-center gap-2 ${
                activeFilters > 0
                  ? 'bg-[#57068C] text-white border-[#57068C]'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              {activeFilters > 0 && <span className="text-sm font-medium">{activeFilters}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div id="equipment-filters" className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              {activeFilters > 0 && (
                <button onClick={clearFilters} className="text-sm text-[#57068C] hover:underline">
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="equipment-category" className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                <select
                  id="equipment-category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#57068C] focus:border-transparent text-sm"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="equipment-location" className="block text-sm font-medium text-gray-600 mb-1">Location</label>
                <select
                  id="equipment-location"
                  value={selectedFacility}
                  onChange={(e) => setSelectedFacility(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#57068C] focus:border-transparent text-sm"
                >
                  {facilities.map(fac => <option key={fac} value={fac}>{fac}</option>)}
                </select>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showAvailableOnly}
                onChange={(e) => setShowAvailableOnly(e.target.checked)}
                className="w-5 h-5 text-[#57068C] rounded focus:ring-[#57068C]"
              />
              <span className="text-sm text-gray-700">Show available items only</span>
            </label>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-4">
        {error && (
          <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-800 flex items-start gap-3">
            <svg className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Unable to load items.{' '}
              <button onClick={refetch} className="underline hover:text-purple-900">Try again</button>
            </span>
          </div>
        )}

        {/* Results Count */}
        <p className="text-sm text-gray-500 mb-3">
          {loading ? 'Loading...' : `${filteredItems.length} item${filteredItems.length !== 1 ? 's' : ''} found`}
        </p>

        {/* Results */}
        {loading && allItems.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
            Loading catalogue…
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No items found</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map(item => {
              const facilityName = item.facility && typeof item.facility === 'object' ? item.facility.name : item.facility;
              const totalQty = item.quantity ?? 1;
              const availableQty = item.availableQuantity ?? (item.status === 'available' ? totalQty : 0);
              return (
                <button
                  type="button"
                  key={item._id || item.id}
                  onClick={() => handleItemClick(item)}
                  className="w-full text-left bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-violet-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm text-gray-500">
                        <span className="bg-gray-100 px-2 py-0.5 rounded">{item.category}</span>
                        <span>{facilityName}</span>
                        {totalQty > 1 && <span>Qty: {availableQty}/{totalQty}</span>}
                      </div>
                    </div>
                    <div
                      className={`ml-3 px-3 py-1.5 rounded-lg font-medium text-sm whitespace-nowrap ${
                        availableQty > 0
                          ? 'bg-violet-100 text-violet-700'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {availableQty > 0 ? 'Available' : 'Unavailable'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Bottom Spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}

// [Task #503] Update: Update student search filter interface
