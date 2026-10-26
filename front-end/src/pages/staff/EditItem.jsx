import React, { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData.js';
import { api } from '../../services/api.js';

const EditItem = ({ onNavigate, itemData }) => {
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

  // Track the original item ID for API calls
  const itemId = itemData?._id || itemData?.id;

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

  // Pre-fill form with item data when available
  useEffect(() => {
    if (itemData) {
      // Determine if item is available (not in maintenance/retired status)
      const isAvailable = itemData.status !== 'maintenance' && itemData.status !== 'retired';

      setFormData({
        itemName: itemData.name || '',
        category: itemData.category || '',
        quantity: itemData.quantity?.toString() || '1',
        location: itemData.location || itemData.facility?.name || itemData.facilityName || '',
        condition: itemData.condition ? itemData.condition.charAt(0).toUpperCase() + itemData.condition.slice(1) : 'Good',
        serialId: itemData.assetId || itemData.serialNumber || '',
        reservationWindow: '24',
        description: itemData.description || '',
        available: isAvailable
      });
    }
  }, [itemData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleSaveItem = async () => {
    if (saving) return;
    setSaveError(null);

    if (!formData.itemName.trim()) {
      setSaveError('Please enter an item name');
      return;
    }
    if (!formData.location) {
      setSaveError('Please select a location');
      return;
    }
    if (!formData.serialId.trim()) {
      setSaveError('Please enter an asset ID');
      return;
    }
    if (!itemId) {
      setSaveError('Cannot update: Item ID not found');
      return;
    }

    setSaving(true);

    try {
      const qty = parseInt(formData.quantity, 10) || 1;

      // When toggling availability OFF:
      // - Set status to 'maintenance'
      // - Set quantityAvailable to 0 (all units unavailable)
      // When toggling availability ON:
      // - Set status to 'available'
      // - Set quantityAvailable to match quantity (all units available)
      const payload = {
        name: formData.itemName.trim(),
        category: formData.category,
        quantity: qty,
        description: formData.description.trim() || 'No description provided',
        condition: formData.condition.toLowerCase().replace(' ', '-'),
        assetId: formData.serialId.trim(),
        status: formData.available ? 'available' : 'maintenance',
        quantityAvailable: formData.available ? qty : 0
      };

      await api.updateItem(itemId, payload);

      alert('Item updated successfully!');
      onNavigate('inventory');
    } catch (err) {
      console.error('Failed to update item:', err);
      setSaveError(err.message || 'Failed to update item. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Discard changes and return to inventory?')) {
      onNavigate('inventory');
    }
  };

  if (!itemData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button aria-label="Back to inventory" onClick={() => onNavigate('inventory')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Edit Item</h1>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600">No item selected. Please select an item from inventory to edit.</p>
            <button onClick={() => onNavigate('inventory')} className="mt-4 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors">
              Go to Inventory
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Edit Item</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 text-sm text-purple-800 rounded-lg">
            Unable to load form options.
            <button onClick={refetch} className="ml-2 underline hover:text-purple-900">Retry</button>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Item details</h2>
          <p className="text-sm text-gray-600 mb-6">Update the information for this item</p>

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
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
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

          {/* Serial/Asset ID */}
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
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max reservation (hours)
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={formData.reservationWindow}
                onChange={(e) => handleInputChange('reservationWindow', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
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
              placeholder="Add details about the item..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Available Toggle */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Available for borrowing
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.available
                    ? `All ${formData.quantity} unit(s) will be available for checkout`
                    : `All ${formData.quantity} unit(s) will be marked unavailable`
                  }
                </p>
              </div>
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

            {/* Warning when making unavailable */}
            {!formData.available && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Item will be unavailable</p>
                  <p className="text-amber-700 mt-1">All {formData.quantity} unit(s) will be set to maintenance mode and cannot be borrowed until re-enabled.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {saveError && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 text-sm text-purple-800 rounded-lg">
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
            onClick={handleSaveItem}
            disabled={saving}
            className={`py-4 rounded-lg font-semibold transition-colors ${saving ? 'bg-violet-300 text-white cursor-not-allowed' : 'bg-violet-500 text-white hover:bg-violet-600'}`}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditItem;
