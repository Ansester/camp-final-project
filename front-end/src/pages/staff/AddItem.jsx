import React, { useEffect, useState, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData.js';
import { api } from '../../services/api.js';

const AddItem = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    quantity: '1',
    location: '',
    condition: 'Good',
    serialId: '',
    reservationWindow: '24',
    description: '',
    available: true
  });
  const { data, error, refetch } = useApiData('items', {
    initialData: { filters: { categories: [], facilities: [] } }
  });


  const categories = useMemo(
    () => (data?.filters?.categories ?? []).filter((category) => category !== 'All'),
    [data?.filters?.categories]
  );
  const facilities = useMemo(
    () => (data?.filters?.facilities ?? []).filter((facility) => facility !== 'All'),
    [data?.filters?.facilities]
  );


  useEffect(() => {
    if (( !formData.category && categories.length) || (!formData.location && facilities.length)) {
      setFormData(prev => {
        const updates = {};
        if (!prev.category && categories.length) {
          updates.category = categories[0];
        }
        if (!prev.location && facilities.length) {
          updates.location = facilities[0];
        }
        return Object.keys(updates).length ? { ...prev, ...updates } : prev;
      });
    }
  }, [formData.category, formData.location, categories, facilities]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const facilitiesList = data?.facilities || [];
  const selectedFacility = facilitiesList.find(f => f.name === formData.location);

  const handleAddItem = async () => {
    if (saving) return;
    setSaveError(null);
    // Validate required fields
    if (!formData.itemName.trim()) {
      setSaveError('Please enter an item name');
      return;
    }
    if (!formData.location) {
      setSaveError('Please select a location');
      return;
    }
    if (!selectedFacility?._id) {
      setSaveError('Selected facility not found; reload and try again');
      return;
    }
    if (!formData.serialId.trim()) {
      setSaveError('Please enter an asset ID');
      return;
    }
    if (!formData.category) {
      setSaveError('Please select a category');
      return;
    }


    const payload = {
      name: formData.itemName.trim(),
      description: formData.description?.trim() || 'No description provided',
      category: formData.category,
      facility: selectedFacility._id,
      condition: (formData.condition || 'Good').toLowerCase(),
      serialNumber: formData.serialId.trim(),

    };

    try {
      setSaving(true);
      const result = await api.createItem(payload);
      setSaving(false);
      alert('Item created: ' + result.item.name);
      onNavigate('inventory');
    } catch (e) {
      setSaving(false);
      setSaveError(e.message || 'Failed to create item');
    }
  };

  const handleCancel = () => {
    if (window.confirm('Discard changes and return to inventory?')) {
      onNavigate('inventory');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button aria-label="Back to inventory"
            onClick={() => onNavigate('inventory')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Item</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-gray-100 border border-gray-300 text-sm text-gray-700 rounded-lg">
            Unable to load form options.
            <button onClick={refetch} className="ml-2 underline hover:text-gray-800">
              Retry
            </button>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Item details</h2>
          <p className="text-sm text-gray-600 mb-6">Fill in the information for the new item</p>

          {/* Item Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item name *
            </label>
            <input
              type="text"
              value={formData.itemName}
              onChange={(e) => handleInputChange('itemName', e.target.value)}
              placeholder="e.g., DSLR Camera Kit"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Category and Quantity */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {categories.length === 0 && <option value="">Loading…</option>}
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Location and Condition */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <select
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {facilities.length === 0 && <option value="">Loading…</option>}
                {facilities.map((facility) => (
                  <option key={facility} value={facility}>
                    {facility}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition *
              </label>
              <select
                value={formData.condition}
                onChange={(e) => handleInputChange('condition', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Needs Repair">Needs Repair</option>
              </select>
            </div>
          </div>

          {/* Serial/Asset ID and Reservation Window */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asset ID *
              </label>
              <input
                type="text"
                value={formData.serialId}
                onChange={(e) => handleInputChange('serialId', e.target.value)}
                placeholder="e.g., CAM-201"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <p className="text-xs text-gray-500 mt-1">Must be unique</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max reservation (hours) *
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={formData.reservationWindow}
                onChange={(e) => handleInputChange('reservationWindow', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">1-168 hours (max 1 week)</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              placeholder="Add details about the item, included accessories, specifications..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Photo Upload and Available Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item photo
              </label>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Choose File
                </button>
                <span className="text-sm text-gray-500">No file chosen</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Optional: JPG, PNG (max 5MB)</p>
            </div>
            <div className="text-right">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available for borrowing
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.available}
                  onChange={(e) => handleInputChange('available', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-violet-900">
            <strong>Note:</strong> Make sure to double-check the asset ID before adding. All fields marked with * are required.
          </p>
        </div>

        {saveError && (
          <div className="mb-4 p-3 bg-gray-100 border border-gray-300 text-sm text-gray-700 rounded-lg">
            {saveError}
          </div>
        )}
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCancel}
            className="bg-gray-200 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddItem}
            disabled={saving}
            className={`py-4 rounded-lg font-semibold transition-colors ${saving ? 'bg-violet-300 text-white cursor-not-allowed' : 'bg-violet-500 text-white hover:bg-violet-600'}`}
          >
            {saving ? 'Saving…' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItem;
