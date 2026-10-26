import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { api } from '../services/api.js';

export default function ItemDetailPage({ onNavigate, selectedItem, setWaitlistData }) {
  const [waitlistError, setWaitlistError] = useState('');
  const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false);
  const [currentWaitlistEntry, setCurrentWaitlistEntry] = useState(null);
  const [loadingWaitlist, setLoadingWaitlist] = useState(true);

  // Check if user is already on waitlist for this item
  useEffect(() => {
    const checkWaitlist = async () => {
      if (!selectedItem) return;

      setLoadingWaitlist(true);
      try {
        const itemId = selectedItem._id || selectedItem.id;
        if (!itemId) {
          setLoadingWaitlist(false);
          return;
        }

        const response = await api.getWaitlist();
        const waitlistEntries = response.waitlist || [];

        // Find if current item is in waitlist (normalize both to strings for comparison)
        const itemIdStr = String(itemId);
        const entry = waitlistEntries.find(
          e => String(e.itemId) === itemIdStr
        );

        // If entry exists but status is 'notified', it means item is available
        // Don't show waitlist position in this case - user should reserve instead
        if (entry && entry.status === 'notified') {
          setCurrentWaitlistEntry(null); // Don't show waitlist info, item is available
        } else {
          setCurrentWaitlistEntry(entry || null);
        }
      } catch {
        // If user is not logged in or other error, just don't show waitlist info
        setCurrentWaitlistEntry(null);
      } finally {
        setLoadingWaitlist(false);
      }
    };

    checkWaitlist();
  }, [selectedItem]);

  if (!selectedItem) return <button onClick={() => onNavigate('filter')}>Choose an item</button>;

  const facilityName = selectedItem.facility && typeof selectedItem.facility === 'object'
    ? selectedItem.facility.name
    : selectedItem.facility;

  // Normalize availability status regardless of backend field naming
  const rawStatus = selectedItem.status || selectedItem.availability || '';
  const normalizedStatus = typeof rawStatus === 'string' ? rawStatus.toLowerCase() : '';

  // Check quantity-based availability
  const totalQuantity = selectedItem.quantity ?? 1;
  const availableQuantity = selectedItem.availableQuantity ?? (normalizedStatus === 'available' ? 1 : 0);
  const isAvailable = availableQuantity > 0;

  const handleReserve = () => {
    onNavigate('reserveDateTime');
  };

  const handleJoinWaitlist = async () => {
    setWaitlistError('');
    setIsJoiningWaitlist(true);

    try {
      const itemId = selectedItem._id || selectedItem.id;
      if (!itemId) {
        throw new Error('Item ID not found');
      }

      const response = await api.joinWaitlist({ itemId });

      // Update the current waitlist entry with the new position
      setCurrentWaitlistEntry({
        itemId: itemId.toString(),
        position: response.position,
        item: selectedItem.name
      });

      // Use the position from the backend response
      const waitlist = {
        position: response.position,
        item: selectedItem.name,
        facility: facilityName,
        expectedBack: selectedItem.expectedBack || 'TBD'
      };

      setWaitlistData(waitlist);
      onNavigate('waitlistConfirmed');
    } catch (err) {
      const errMsg = err.message || '';
      if (errMsg.includes('400') && (errMsg.includes('Already on waitlist') || errMsg.includes('already'))) {
        setWaitlistError('You are already on the waitlist for this item.');
      } else if (errMsg.includes('404')) {
        setWaitlistError('Item not found. Please try again.');
      } else if (errMsg.includes('401')) {
        setWaitlistError('Please log in to join the waitlist.');
      } else {
        setWaitlistError('Failed to join waitlist. Please try again.');
      }
    } finally {
      setIsJoiningWaitlist(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <button aria-label="Back to equipment search"
              onClick={() => onNavigate('filter')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Item Detail</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Item Card - Available */}
        {isAvailable && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedItem.name}
                </h2>
                <p className="text-gray-600 mb-4">{selectedItem.description}</p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Availability</p>
                    <p className="text-lg font-bold text-gray-900">
                      {availableQuantity} of {totalQuantity} available
                    </p>
                  </div>
                </div>
              </div>
              <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">
                {facilityName}
              </span>
            </div>

            <button
              onClick={handleReserve}
              className="w-full py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-colors"
            >
              Reserve
            </button>
          </div>
        )}

        {/* Item Card - Unavailable */}
        {!isAvailable && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedItem.name}
                </h2>
                <p className="text-gray-600 mb-4">
                  {totalQuantity > 1
                    ? `All ${totalQuantity} units currently unavailable`
                    : `Status: ${rawStatus || 'Unavailable'}`
                  } • Expected back: {selectedItem.expectedBack || 'TBD'}
                </p>
              </div>
              <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">
                {facilityName}
              </span>
            </div>

            {waitlistError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{waitlistError}</p>
              </div>
            )}

            {loadingWaitlist ? (
              <div className="w-full py-3 bg-gray-100 text-gray-500 font-semibold rounded-lg text-center">
                Checking waitlist...
              </div>
            ) : currentWaitlistEntry ? (
              <div className="w-full py-3 bg-violet-50 border-2 border-violet-200 rounded-lg text-center">
                <p className="text-gray-700 font-semibold mb-1">You're on the waitlist!</p>
                <p className="text-violet-700 font-bold text-lg">Position: #{currentWaitlistEntry.position}</p>
              </div>
            ) : (
              <button
                onClick={handleJoinWaitlist}
                disabled={isJoiningWaitlist}
                className="w-full py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoiningWaitlist ? 'Joining Waitlist...' : 'Join Waitlist'}
              </button>
            )}
          </div>
        )}

        {/* Bottom Spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}
