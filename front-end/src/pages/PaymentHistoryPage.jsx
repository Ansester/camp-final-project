import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useApiData } from '../hooks/useApiData.js';
import { authUtils } from '../utils/auth.js';

export default function PaymentHistoryPage({ onNavigate }) {
  const userId = authUtils.getUserId();
  const { data, loading, error, refetch } = useApiData('paymentHistory', {
    initialData: { payments: [] },
    params: { userId }
  });

  const paymentHistory = data?.payments ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center items-start sm:space-x-4 space-y-2 sm:space-y-0">
            <button aria-label="Back to fines"
              onClick={() => onNavigate('fines')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Payment History List */}
        {error && (
          <div className="p-4 bg-purple-50 border border-purple-200 text-sm text-purple-800 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Unable to load your payment history.
              <button onClick={refetch} className="ml-2 underline hover:text-purple-900">
                Try again
              </button>
            </span>
          </div>
        )}

        {loading && paymentHistory.length === 0 ? (
          <div className="text-center text-gray-600 py-6">Loading payments…</div>
        ) : (
          <div className="space-y-3">
            {paymentHistory.length === 0 ? (
              <p className="text-center text-gray-600">No payments recorded yet.</p>
            ) : (
              paymentHistory.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{payment.receipt}</h3>
                    <span className="text-xl font-bold text-gray-900">
                      ${payment.amount.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-gray-600">
                    {payment.date} - {payment.method}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => onNavigate('fines')}
          className="w-full py-4 bg-gray-300 text-gray-700 font-bold text-lg rounded-xl hover:bg-gray-400 transition-colors shadow-sm"
        >
          Back to Fines
        </button>

        {/* Bottom Spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}
