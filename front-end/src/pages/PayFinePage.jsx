import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useApiData } from '../hooks/useApiData.js';
import { authUtils } from '../utils/auth.js';
import { api } from '../services/api.js';

export default function PayFinePage({ onNavigate, selectedFine, setPaymentResult }) {
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(null);
  const userId = authUtils.getUserId();
  const { data, loading, error, refetch } = useApiData('profile', {
    initialData: { student: { name: '', email: '' } },
    params: { userId }
  });

  const billingDetails = data?.student ?? { name: '', email: '' };

  const handlePayment = async () => {
    setPaying(true);
    setPayError(null);
    try {
      const transactionId = `R-${Math.floor(Math.random() * 90000) + 10000}`;
      const response = await api.payFine(selectedFine.id, {
        paymentMethod: 'demo-campus-cash',
        transactionId
      });

      const result = {
        amount: selectedFine.amount,
        method: 'Demo Campus Cash',
        receipt: response.receiptId || transactionId,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        email: billingDetails.email
      };
      setPaymentResult(result);
      onNavigate('paymentSuccess');
    } catch (e) {
      setPayError(e.message || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (!selectedFine) {
    return <button onClick={() => onNavigate('fines')}>Choose a fine</button>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <button aria-label="Back to fines"
              onClick={() => onNavigate('fines')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pay Fine</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Selected Fine */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Selected fine</h3>
              <p className="text-gray-600 text-sm">
                {selectedFine.type} - {selectedFine.item} • Ref {selectedFine.ref}
              </p>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${selectedFine.amount.toFixed(2)}
            </div>
          </div>

          {/* Payment Method */}
          <div className="mt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Payment method</h3>

            <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
              <span className="text-lg text-gray-700 font-medium">Demo Campus Cash</span>
              <p className="text-sm text-gray-500 mt-1">Uses the fictional balance in this coursework demo. No real payment is processed.</p>
            </div>
          </div>
        </div>

        {/* Billing Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Billing details</h3>

          {error && (
            <div className="mb-3 p-3 bg-gray-100 border border-gray-300 text-sm text-gray-700 rounded-lg">
              Unable to load your billing profile.
              <button onClick={refetch} className="ml-2 underline hover:text-gray-800">
                Retry
              </button>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Name</span>
              <span className="text-gray-900">
                {loading && !billingDetails.name ? 'Loading…' : billingDetails.name}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Email</span>
              <span className="text-gray-900">
                {loading && !billingDetails.email ? 'Loading…' : billingDetails.email}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {payError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {payError}
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={paying}
          className={`w-full py-4 font-bold text-lg rounded-xl transition-colors shadow-sm ${
            paying
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
          }`}
        >
          {paying ? 'Processing...' : `Pay $${selectedFine.amount.toFixed(2)}`}
        </button>

        <button
          onClick={() => onNavigate('fines')}
          className="w-full py-4 bg-gray-200 text-gray-700 font-semibold text-lg rounded-xl hover:bg-gray-300 transition-colors"
        >
          Back to fines
        </button>

        {/* Bottom Spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}
