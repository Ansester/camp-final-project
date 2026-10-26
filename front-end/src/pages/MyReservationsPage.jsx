import React, { useState } from 'react';
import { ChevronLeft, Calendar, Clock, MapPin, X } from 'lucide-react';
import { useApiData } from '../hooks/useApiData.js';
import { api } from '../services/api.js';

export default function MyReservationsPage({ onNavigate }) {
  const [cancelling, setCancelling] = useState(null);

  const { data, loading, error, refetch } = useApiData('reservations', {
    initialData: { reservations: [] }
  });

  const reservations = data?.reservations ?? [];

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;

    setCancelling(id);
    try {
      await api.cancelReservation(id);
      refetch();
    } catch (err) {
      alert('Failed to cancel reservation: ' + err.message);
    } finally {
      setCancelling(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-violet-100 text-violet-700';
      case 'pending':
        return 'bg-purple-100 text-purple-700';
      case 'ready':
        return 'bg-violet-200 text-violet-800';
      case 'picked-up':
        return 'bg-gray-100 text-gray-700';
      case 'cancelled':
        return 'bg-gray-200 text-gray-600';
      case 'expired':
        return 'bg-gray-300 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return 'TBD';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const activeReservations = reservations.filter(r =>
    ['pending', 'confirmed', 'ready'].includes(r.status)
  );

  const pastReservations = reservations.filter(r =>
    ['picked-up', 'cancelled', 'expired'].includes(r.status)
  );

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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">My Reservations</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {loading && reservations.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Loading reservations...</p>
        ) : error ? (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-purple-800 text-sm">Failed to load reservations</p>
              <button
                onClick={refetch}
                className="text-purple-600 text-sm underline hover:text-purple-800 mt-1"
              >
                Try again
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Active Reservations */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Active Reservations ({activeReservations.length})
              </h2>

              {activeReservations.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No active reservations</p>
                  <button
                    onClick={() => onNavigate('filter')}
                    className="mt-4 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition"
                  >
                    Browse Items
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeReservations.map((reservation) => (
                    <div
                      key={reservation.id || reservation._id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {reservation.item?.name || reservation.itemName || 'Unknown Item'}
                          </h3>
                          <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                            {reservation.status?.charAt(0).toUpperCase() + reservation.status?.slice(1)}
                          </span>
                        </div>
                        {reservation.quantity && reservation.quantity > 1 && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                            Qty: {reservation.quantity}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Pickup: {formatDate(reservation.pickupDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Time: {formatTime(reservation.pickupDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{reservation.facility?.name || reservation.facilityName || 'Location TBD'}</span>
                        </div>
                      </div>

                      {['pending', 'confirmed'].includes(reservation.status) && (
                        <button aria-label="Cancel reservation"
                          onClick={() => handleCancel(reservation.id || reservation._id)}
                          disabled={cancelling === (reservation.id || reservation._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          {cancelling === (reservation.id || reservation._id) ? 'Cancelling...' : 'Cancel Reservation'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Reservations */}
            {pastReservations.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Past Reservations ({pastReservations.length})
                </h2>
                <div className="space-y-4">
                  {pastReservations.map((reservation) => (
                    <div
                      key={reservation.id || reservation._id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 opacity-75"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {reservation.item?.name || reservation.itemName || 'Unknown Item'}
                          </h3>
                          <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                            {reservation.status?.charAt(0).toUpperCase() + reservation.status?.slice(1)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(reservation.pickupDate)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
