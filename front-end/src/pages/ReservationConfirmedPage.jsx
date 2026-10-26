import React, { useState, useEffect } from 'react';
import { ChevronLeft, Package, ChevronRight } from 'lucide-react';
import { api } from '../services/api.js';

export default function ReservationConfirmedPage({ onNavigate, reservationData, setSelectedItem }) {
  const [suggestedItems, setSuggestedItems] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Fetch suggested items on mount
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!reservationData?.itemId) return;
      setLoadingSuggestions(true);
      try {
        const data = await api.suggestedItems(reservationData.itemId);
        setSuggestedItems(data.suggestions || []);
      } catch (error) {
        console.error('Failed to load suggestions:', error);
      } finally {
        setLoadingSuggestions(false);
      }
    };
    fetchSuggestions();
  }, [reservationData?.itemId]);

  const handleViewSuggestedItem = (item) => {
    if (setSelectedItem) {
      setSelectedItem({
        id: item.id,
        name: item.name,
        category: item.category,
        facility: item.facility,
        facilityId: item.facilityId,
        description: item.description,
        status: item.status,
        quantity: item.quantity,
        availableQuantity: item.availableQuantity
      });
      onNavigate('itemDetail');
    }
  };

  const [cancelling, setCancelling] = useState(false);
  const handleCancelReservation = async () => {
    if (!reservationData?.id) {
      alert('Missing reservation ID');
      return;
    }
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      setCancelling(true);
      await api.cancelReservation(reservationData.id);
      alert('Reservation cancelled successfully.');
      onNavigate('home');
    } catch (e) {
      alert(e.message || 'Failed to cancel reservation');
    } finally {
      setCancelling(false);
    }
  };

  if (!reservationData) return <button onClick={() => onNavigate('filter')}>Choose an item</button>;

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
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Reservation Confirmed</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Success Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Reservation Confirmed
          </h2>

          <div className="bg-violet-50 border-2 border-violet-200 rounded-xl p-6 mb-6">
            <p className="text-xl font-bold text-gray-900 mb-2">
              Success!
            </p>
            <p className="text-gray-600 mb-4">
              Reservation #{reservationData.number}
            </p>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Item</span>
                <span className="text-gray-900 font-bold">{reservationData.item}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Facility</span>
                <span className="text-gray-900 font-bold">{reservationData.facility}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Pickup</span>
                <span className="text-gray-900 font-bold">
                  {reservationData.date}, {reservationData.time}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mt-4">
              Saved in this demo. No confirmation email is sent.
            </p>
          </div>

        </div>

        {/* Suggested Items Section */}
        {suggestedItems.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-violet-600" />
              You might also need...
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suggestedItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleViewSuggestedItem(item)}
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-violet-50 border border-gray-200 hover:border-violet-300 rounded-lg transition-all text-left"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                    <p className="text-sm text-gray-500">{item.category} • {item.facility}</p>
                    <span className={`text-xs font-medium ${item.status === 'available' ? 'text-green-600' : 'text-gray-500'}`}>
                      {item.status === 'available' ? `${item.availableQuantity} available` : 'Unavailable'}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        )}

        {loadingSuggestions && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-gray-500">
            Loading suggestions...
          </div>
        )}

        {/* Action Buttons */}
        <button
          onClick={() => onNavigate('reservations')}
          className="w-full py-4 bg-gray-300 text-gray-700 font-bold text-lg rounded-xl hover:bg-gray-400 transition-colors shadow-sm"
        >
          My Reservations
        </button>

        <button
          onClick={handleCancelReservation}
          disabled={cancelling}
          className="w-full py-4 bg-gray-200 text-gray-700 font-semibold text-lg rounded-xl hover:bg-gray-300 transition-colors"
        >
          {cancelling ? 'Cancelling…' : 'Cancel Reservation'}
        </button>

        {/* Bottom Spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}
