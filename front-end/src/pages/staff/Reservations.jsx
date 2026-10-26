import React, { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData.js';
import { api } from '../../services/api.js';
import CheckoutSuccess from './CheckoutSuccess';

const Reservations = ({ onNavigate }) => {
  const [viewFilter, setViewFilter] = useState('today');
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);
  const [successBorrowal, setSuccessBorrowal] = useState(null);
  const { data, loading, error, refetch } = useApiData('staffReservations', {
    initialData: { reservations: [] }
  });

  const reservations = useMemo(() => data?.reservations ?? [], [data]);

  const filteredReservations = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (viewFilter === 'today') {
      return reservations.filter(r => {
        if (!r.pickupDate) return false;
        const d = new Date(r.pickupDate);
        return d >= today && d < tomorrow;
      });
    }

    if (viewFilter === 'upcoming') {
      return reservations.filter(r => {
        if (!r.pickupDate) return false;
        const d = new Date(r.pickupDate);
        return d >= tomorrow;
      });
    }

    if (viewFilter === 'past') {
      return reservations.filter(r => {
        if (!r.pickupDate) return false;
        const d = new Date(r.pickupDate);
        return d < today;
      });
    }

    return reservations;
  }, [reservations, viewFilter]);

  const handleFastCheckout = async (reservation) => {
    if (checkoutLoading) return;
    if (!reservation.userId || !reservation.itemId) {
      setCheckoutError('Missing user or item data for this reservation');
      return;
    }
    setCheckoutError(null);
    setCheckoutLoading(reservation.id);
    try {
      const result = await api.staffCheckout({
        userId: reservation.userId,
        itemId: reservation.itemId
      });
      setCheckoutLoading(null);
      setSuccessBorrowal(result?.borrowal || result);
    } catch (e) {
      setCheckoutLoading(null);
      setCheckoutError(e.message || 'Fast checkout failed');
    }
  };

  const handleNoShow = (id) => {
    alert(`Reservation ${id} marked as no-show`);
  };

  if (successBorrowal) {
    return (
      <CheckoutSuccess
        borrowal={successBorrowal}
        backDestination="reservations"
        backLabel="Back to Reservations"
        onNavigate={(dest) => {
          if (dest === 'checkout' || dest === 'reservations') {
            setSuccessBorrowal(null);
            refetch();
          } else {
            onNavigate(dest);
          }
        }}
      />
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
          <h1 className="text-3xl font-bold text-gray-900">Reservations</h1>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setViewFilter('today')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              viewFilter === 'today'
                ? 'bg-violet-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setViewFilter('upcoming')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              viewFilter === 'upcoming'
                ? 'bg-violet-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setViewFilter('past')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              viewFilter === 'past'
                ? 'bg-violet-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Past
          </button>
        </div>

        {/* Checkout Error */}
        {checkoutError && (
          <div className="mb-4 p-3 bg-gray-100 border border-gray-300 text-sm text-gray-700 rounded-lg">
            {checkoutError}
          </div>
        )}

        {/* Reservations List */}
        <div className="space-y-4">
          {error && (
            <div className="p-4 bg-gray-100 border border-gray-300 text-sm text-gray-700 rounded-lg">
              Unable to load reservations.
              <button onClick={refetch} className="ml-2 underline hover:text-gray-800">
                Retry
              </button>
            </div>
          )}
          {loading && reservations.length === 0 ? (
            <p className="text-center text-gray-600">Loading reservations…</p>
          ) : filteredReservations.length === 0 ? (
            <p className="text-center text-gray-600">No reservations for this view.</p>
          ) : (
            filteredReservations.map((reservation) => (
              <div key={reservation.id} className="bg-white rounded-lg shadow-sm p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {reservation.item}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {reservation.student}
                    </p>
                    <p className="text-sm text-gray-500">
                      Pickup: {reservation.pickupDate ? new Date(reservation.pickupDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'} at {reservation.pickupDate ? new Date(reservation.pickupDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : 'TBD'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Location: {reservation.location} - Status: {reservation.status === 'pending' ? 'Pending' : 'Ready'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFastCheckout(reservation)}
                    disabled={checkoutLoading === reservation.id}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      checkoutLoading === reservation.id
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-[#57068C] text-white hover:bg-[#460573]'
                    }`}
                  >
                    {checkoutLoading === reservation.id ? 'Processing…' : 'Fast Checkout'}
                  </button>
                  {reservation.status === 'ready' && (
                    <button
                      onClick={() => handleNoShow(reservation.id)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      No Show
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Back Button */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="w-full mt-6 bg-gray-200 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Reservations;
