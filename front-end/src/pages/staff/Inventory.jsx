import React, { useMemo, useState } from 'react';
import { Search, ArrowLeft, Filter, Package, Plus, ChevronDown } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData.js';

const STATUS_CONFIG = {
  available: { label: 'Available', color: 'bg-violet-100 text-violet-700' },
  reserved: { label: 'Reserved', color: 'bg-purple-100 text-purple-700' },
  'checked-out': { label: 'Checked Out', color: 'bg-gray-200 text-gray-700' },
  maintenance: { label: 'Maintenance', color: 'bg-gray-300 text-gray-800' }
};

const Inventory = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');

  const { data, loading, error, refetch } = useApiData('staffInventory', {
    initialData: { items: [] }
  });

  const items = useMemo(() => data?.items ?? [], [data]);

  // Extract unique categories and locations for filter dropdowns
  const categories = useMemo(() => {
    const cats = [...new Set(items.map(i => i.category).filter(Boolean))];
    return cats.sort();
  }, [items]);

  const locations = useMemo(() => {
    const locs = [...new Set(items.map(i => i.location).filter(Boolean))];
    return locs.sort();
  }, [items]);

  // Filter and sort logic
  const filteredItems = useMemo(() => {
    let result = items;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.assetId?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.location?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'has-available') {
        result = result.filter(item => item.availableQuantity > 0);
      } else if (statusFilter === 'none-available') {
        result = result.filter(item => item.availableQuantity === 0);
      } else {
        result = result.filter(item => item.status === statusFilter);
      }
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(item => item.category === categoryFilter);
    }

    // Location filter
    if (locationFilter !== 'all') {
      result = result.filter(item => item.location === locationFilter);
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'availability':
          return b.availableQuantity - a.availableQuantity;
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        case 'location':
          return (a.location || '').localeCompare(b.location || '');
        default:
          return 0;
      }
    });

    return result;
  }, [items, searchQuery, statusFilter, categoryFilter, locationFilter, sortBy]);

  // Stats
  const stats = useMemo(() => ({
    total: items.length,
    available: items.filter(i => i.availableQuantity > 0).length,
    checkedOut: items.filter(i => i.availableQuantity < i.quantity).length,
    maintenance: items.filter(i => i.status === 'maintenance').length
  }), [items]);

  const clearFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setLocationFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters = statusFilter !== 'all' || categoryFilter !== 'all' || locationFilter !== 'all';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button aria-label="Back to staff dashboard"
              onClick={() => onNavigate('dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
            <button
              onClick={() => onNavigate('additem')}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Item
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search items by name, ID, category, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Filter Toggle & Quick Stats */}
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                showFilters || hasActiveFilters ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-violet-500" />
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <div className="flex gap-3 text-sm">
              <span className="text-gray-500">{stats.total} items</span>
              <span className="text-violet-600">{stats.available} available</span>
              {stats.maintenance > 0 && (
                <span className="text-gray-600">{stats.maintenance} maintenance</span>
              )}
            </div>
          </div>

          {/* Collapsible Filters */}
          {showFilters && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="has-available">Has Available</option>
                    <option value="none-available">None Available</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="all">All Locations</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="name">Name</option>
                    <option value="availability">Availability</option>
                    <option value="category">Category</option>
                    <option value="location">Location</option>
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-3 text-sm text-violet-600 hover:text-violet-800"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Items List */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        {error && (
          <div className="mb-4 p-3 bg-gray-100 border border-gray-300 text-sm text-gray-700 rounded-lg">
            Unable to load inventory.
            <button onClick={refetch} className="ml-2 underline hover:text-gray-800">
              Retry
            </button>
          </div>
        )}

        {loading && items.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500">Loading inventory...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {hasActiveFilters || searchQuery ? 'No items match your filters' : 'No items in inventory'}
            </p>
            {(hasActiveFilters || searchQuery) && (
              <button
                onClick={clearFilters}
                className="mt-2 text-violet-600 hover:text-violet-800"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const checkedOutCount = item.quantity - item.availableQuantity;
              const statusConfig = item.availableQuantity > 0
                ? STATUS_CONFIG.available
                : item.status === 'maintenance'
                ? STATUS_CONFIG.maintenance
                : STATUS_CONFIG['checked-out'];

              return (
                <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        {item.assetId} • {item.category}
                      </p>
                      <p className="text-sm text-gray-500">{item.location}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                        {item.availableQuantity}/{item.quantity} avail
                      </span>
                      {checkedOutCount > 0 && (
                        <span className="text-xs text-gray-500">
                          {checkedOutCount} checked out
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => item.availableQuantity > 0 && onNavigate('checkout', { itemId: item.id, item })}
                      disabled={item.availableQuantity <= 0}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                        item.availableQuantity > 0
                          ? 'bg-violet-500 text-white hover:bg-violet-600'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Check Out
                    </button>
                    {checkedOutCount > 0 && (
                      <button
                        onClick={() => onNavigate('checkin', { itemId: item.id, item })}
                        className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors text-sm"
                      >
                        Check In
                      </button>
                    )}
                    <button
                      onClick={() => onNavigate('edititem', item)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;

// [Task #501] Update: Refactor staff inventory list
