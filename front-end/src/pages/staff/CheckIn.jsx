import React, { useState, useMemo } from 'react';
import { ArrowLeft, Package, X, Check, AlertCircle, Search, User } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData.js';
import { api } from '../../services/api.js';

const CheckIn = ({ onNavigate, selectedItem: prefillData }) => {
  const [itemSearch, setItemSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedBorrowal, setSelectedBorrowal] = useState(null);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [condition, setCondition] = useState('good');
  const [notes, setNotes] = useState('');
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinError, setCheckinError] = useState(null);
  const [checkinSuccess, setCheckinSuccess] = useState(false);

  // Active borrowals for the selected item
  const [itemBorrowals, setItemBorrowals] = useState([]);
  const [borrowalsLoading, setBorrowalsLoading] = useState(false);

  const { data, loading, error, refetch } = useApiData('staffInventory', {
    initialData: { items: [] }
  });

  const inventoryItems = useMemo(() => data?.items ?? [], [data?.items]);

  // Handle prefill data
  React.useEffect(() => {
    if (prefillData && inventoryItems.length > 0 && !selectedItem) {
      // If prefillData has an itemId (e.g. from Overdue page)
      const targetId = String(prefillData.itemId || prefillData.id || '');
      if (targetId) {
        const match = inventoryItems.find(i => String(i.id) === targetId);
        if (match) {
          handleSelectItem(match);
        }
      }
    }
  }, [prefillData, inventoryItems, selectedItem]);

  // Get overdue items for quick access
  const { data: overdueData } = useApiData('staffOverdue', {
    initialData: { items: [] }
  });
  const overdueItems = overdueData?.items ?? [];

  // Live filter items - show checked out items first
  const filteredItems = useMemo(() => {
    const checkedOutItems = inventoryItems.filter(i =>
      i.status === 'checked-out' || i.availableQuantity < i.quantity
    );

    if (!itemSearch.trim()) return checkedOutItems.slice(0, 8);

    const query = itemSearch.toLowerCase();
    return inventoryItems.filter(i =>
      i.name.toLowerCase().includes(query) ||
      i.assetId?.toLowerCase().includes(query) ||
      i.category?.toLowerCase().includes(query) ||
      i.location?.toLowerCase().includes(query)
    ).slice(0, 10);
  }, [inventoryItems, itemSearch]);

  const handleSelectItem = async (item) => {
    setSelectedItem({
      id: item.id,
      name: item.name,
      assetId: item.assetId,
      category: item.category,
      location: item.location,
      quantity: item.quantity,
      availableQuantity: item.availableQuantity,
      status: item.status
    });
    setItemSearch('');
    setShowItemDropdown(false);
    setSelectedBorrowal(null);

    // Fetch active borrowals for this item
    setBorrowalsLoading(true);
    try {
      const res = await api.staffActiveBorrowals(item.id);
      setItemBorrowals(res.borrowals || []);
      // If only one borrowal, auto-select it
      if (res.borrowals?.length === 1) {
        setSelectedBorrowal(res.borrowals[0]);
      }
    } catch (err) {
      console.error('Failed to load item borrowals:', err);
      setItemBorrowals([]);
    } finally {
      setBorrowalsLoading(false);
    }
  };

  const handleCompleteCheckIn = async () => {
    if (checkinLoading || !selectedItem || !selectedBorrowal) return;
    setCheckinError(null);
    setCheckinLoading(true);

    const payload = {
      borrowalId: selectedBorrowal.id || selectedBorrowal.borrowalId,
      itemId: selectedItem.id,
      userId: selectedBorrowal.student?.id,
      condition: condition,
      notes: notes
    };

    try {
      await api.staffCheckin(payload);
      setCheckinLoading(false);
      setCheckinSuccess(true);
    } catch (e) {
      setCheckinLoading(false);
      const errorMsg = e.message || 'Failed to check in item';
      setCheckinError(errorMsg.includes('::') ? errorMsg.split('::')[1].trim() : errorMsg);
    }
  };

  const handleNewCheckin = () => {
    setCheckinSuccess(false);
    setSelectedItem(null);
    setSelectedBorrowal(null);
    setItemBorrowals([]);
    setItemSearch('');
    setCondition('good');
    setNotes('');
    refetch();
  };

  // Success screen
  if (checkinSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-violet-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check-In Complete!</h2>
          <p className="text-gray-600 mb-6">
            <strong>{selectedItem?.name}</strong> has been checked in successfully.
          </p>
          {condition === 'damaged' && (
            <div className="mb-6 p-3 bg-gray-100 border border-gray-300 rounded-lg text-left">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> Item marked as damaged. Consider applying a fine.
              </p>
            </div>
          )}
          <div className="space-y-3">
            <button
              onClick={handleNewCheckin}
              className="w-full py-3 bg-violet-500 text-white rounded-lg font-semibold hover:bg-violet-600 transition-colors"
            >
              Check In Another Item
            </button>
            {condition === 'damaged' && (
              <button
                onClick={() => onNavigate('fines')}
                className="w-full py-3 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition-colors"
              >
                Apply Fine
              </button>
            )}
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Back to Dashboard
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
          <button aria-label="Back to staff dashboard"
            onClick={() => onNavigate('dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Check-In</h1>
        </div>

        {/* Overdue Items Quick Access */}
        {overdueItems.length > 0 && !selectedItem && (
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">
              Overdue Items ({overdueItems.length})
            </h3>
            <div className="space-y-2">
              {overdueItems.slice(0, 3).map((item, index) => (
                <button
                  key={item.itemId || item.id || `overdue-${index}`}
                  onClick={() => {
                    const invItem = inventoryItems.find(i => i.id === item.itemId);
                    if (invItem) handleSelectItem(invItem);
                  }}
                  className="w-full text-left p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{item.item || item.itemName}</div>
                  <div className="text-sm text-gray-600">
                    {item.days || item.daysOverdue} days overdue • Borrower: {item.student || item.borrowerName}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Find Item */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedItem ? 'bg-violet-700' : 'bg-violet-500'} text-white font-bold`}>
              {selectedItem ? <Check className="w-5 h-5" /> : '1'}
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Find Item</h2>
          </div>

          {!selectedItem ? (
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, asset ID, or scan barcode..."
                  value={itemSearch}
                  onChange={(e) => {
                    setItemSearch(e.target.value);
                    setShowItemDropdown(true);
                  }}
                  onFocus={() => setShowItemDropdown(true)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Item Dropdown */}
              {showItemDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                  {loading && inventoryItems.length === 0 ? (
                    <p className="p-3 text-gray-500 text-sm">Loading inventory...</p>
                  ) : error ? (
                    <div className="p-3 text-gray-600 text-sm">
                      Error loading inventory. <button onClick={refetch} className="underline">Retry</button>
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <p className="p-3 text-gray-500 text-sm">No items found</p>
                  ) : (
                    <>
                      {!itemSearch && <p className="px-3 py-2 text-xs text-gray-500 bg-gray-50">Showing checked-out items</p>}
                      {filteredItems.map((item) => {
                        const isCheckedOut = item.availableQuantity < item.quantity;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSelectItem(item)}
                            className="w-full text-left p-3 hover:bg-violet-50 border-b border-gray-100 last:border-0 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-gray-900">{item.name}</div>
                                <div className="text-sm text-gray-600">
                                  {item.assetId} • {item.category} • {item.location}
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                isCheckedOut ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {item.quantity - item.availableQuantity} out
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-violet-50 border border-violet-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center text-white">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{selectedItem.name}</div>
                  <div className="text-sm text-gray-600">
                    {selectedItem.assetId} • {selectedItem.category} • {selectedItem.location}
                  </div>
                  <div className="text-sm text-violet-600 font-medium">
                    {selectedItem.quantity - selectedItem.availableQuantity} currently checked out
                  </div>
                </div>
              </div>
              <button aria-label="Clear selected item"
                onClick={() => {
                  setSelectedItem(null);
                  setSelectedBorrowal(null);
                  setItemBorrowals([]);
                }}
                className="p-2 hover:bg-violet-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Select Borrower (only if item has multiple borrowals) */}
        {selectedItem && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedBorrowal ? 'bg-violet-700' : 'bg-violet-500'} text-white font-bold`}>
                {selectedBorrowal ? <Check className="w-5 h-5" /> : '2'}
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Select Borrower</h2>
            </div>

            {borrowalsLoading ? (
              <p className="text-sm text-gray-500">Loading borrowers...</p>
            ) : itemBorrowals.length === 0 ? (
              <p className="text-sm text-gray-500">No active borrowals found for this item.</p>
            ) : selectedBorrowal ? (
              <div className="flex items-center justify-between p-4 bg-violet-50 border border-violet-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedBorrowal.student?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{selectedBorrowal.student?.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-600">{selectedBorrowal.student?.netId} • {selectedBorrowal.student?.email}</div>
                    <div className={`text-sm ${new Date(selectedBorrowal.dueDate) < new Date() ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                      Due: {new Date(selectedBorrowal.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {new Date(selectedBorrowal.dueDate) < new Date() && ' (OVERDUE)'}
                    </div>
                  </div>
                </div>
                {itemBorrowals.length > 1 && (
                  <button aria-label="Clear selected borrowal"
                    onClick={() => setSelectedBorrowal(null)}
                    className="p-2 hover:bg-violet-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-3">Select the student who is returning this item:</p>
                {itemBorrowals.map((b) => (
                  <button
                    key={b.id || b.borrowalId}
                    onClick={() => setSelectedBorrowal(b)}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-violet-50 rounded-lg border border-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {b.student?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{b.student?.name || 'Unknown Student'}</div>
                        <div className="text-sm text-gray-600">{b.student?.netId}</div>
                      </div>
                      <div className={`text-sm ${new Date(b.dueDate) < new Date() ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                        {new Date(b.dueDate) < new Date() ? 'OVERDUE' : `Due: ${new Date(b.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Condition Assessment */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedBorrowal ? 'bg-violet-500' : 'bg-gray-300'} text-white font-bold`}>
              3
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Condition Assessment</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { value: 'good', label: 'Good', icon: 'OK', color: 'violet' },
              { value: 'fair', label: 'Fair', icon: '○', color: 'violet' },
              { value: 'damaged', label: 'Damaged', icon: '!', color: 'gray' },
              { value: 'needs-repair', label: 'Needs Repair', icon: '⛏', color: 'gray' }
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => selectedBorrowal && setCondition(opt.value)}
                disabled={!selectedBorrowal}
                className={`p-4 rounded-lg border-2 transition-all ${
                  condition === opt.value
                    ? opt.color === 'violet' ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-500 bg-gray-100'
                    : 'border-gray-200 hover:border-gray-300'
                } ${!selectedBorrowal ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-2xl mb-1">{opt.icon}</div>
                <div className="font-medium text-gray-900">{opt.label}</div>
              </button>
            ))}
          </div>

          {(condition === 'damaged' || condition === 'needs-repair') && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Damage Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe the damage or repair needed..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Status Update Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-gray-500" />
            <h3 className="font-medium text-gray-900">Status Update</h3>
          </div>
          <p className="text-sm text-gray-600">
            {condition === 'good' || condition === 'fair'
              ? 'Item will be marked as Available and returned to inventory.'
              : 'Item will be marked for Maintenance and removed from available inventory.'}
          </p>
        </div>

        {/* Error Message */}
        {checkinError && (
          <div className="mb-4 p-4 bg-gray-100 border border-gray-300 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-gray-700" />
            <span className="text-gray-700">{checkinError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleCompleteCheckIn}
            disabled={!selectedItem || !selectedBorrowal || checkinLoading}
            className={`w-full py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
              selectedItem && selectedBorrowal && !checkinLoading
                ? 'bg-violet-500 text-white hover:bg-violet-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {checkinLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Complete Check-In
              </>
            )}
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full bg-gray-200 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Click outside to close dropdown */}
        {showItemDropdown && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setShowItemDropdown(false)}
          />
        )}
      </div>
    </div>
  );
};

export default CheckIn;
