import React, { useState } from 'react';
import { ChevronLeft, CreditCard, History, AlertCircle } from 'lucide-react';
import { useApiData } from '../hooks/useApiData.js';
import { authUtils } from '../utils/auth.js';

export default function FinesPage({ onNavigate, setSelectedFine }) {
  const [activeTab, setActiveTab] = useState('fines');
  const userId = authUtils.getUserId();

  const { data: finesData, loading: finesLoading, error: finesError, refetch: refetchFines } = useApiData('fines', {
    initialData: { fines: [] },
    params: { userId }
  });

  const { data: paymentsData, loading: paymentsLoading, error: paymentsError, refetch: refetchPayments } = useApiData('paymentHistory', {
    initialData: { payments: [] },
    params: { userId }
  });

  const fines = finesData?.fines ?? [];
  const payments = paymentsData?.payments ?? [];

  const unpaidFines = fines.filter(f => f.status === 'Unpaid' || f.status === 'pending');
  const paidFines = fines.filter(f => f.status === 'Paid' || f.status === 'paid');

  const totalUnpaid = unpaidFines.reduce((sum, f) => sum + (f.amount || 0), 0);

  const handlePayFine = (fine) => {
    setSelectedFine(fine);
    onNavigate('payFine');
  };

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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Fines & Payments</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Card */}
        {totalUnpaid > 0 && (
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-[#57068C]" />
                <div>
                  <p className="font-semibold text-[#57068C]">Outstanding Balance</p>
                  <p className="text-sm text-violet-600">{unpaidFines.length} unpaid fine(s)</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-[#57068C]">${totalUnpaid.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 flex space-x-2">
          <button
            onClick={() => setActiveTab('fines')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'fines'
                ? 'bg-[#57068C] text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Current Fines
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'history'
                ? 'bg-[#57068C] text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <History className="w-4 h-4" />
            Payment History
          </button>
        </div>

        {/* Current Fines Tab */}
        {activeTab === 'fines' && (
          <div className="space-y-4">
            {finesError && (
              <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700">
                Unable to load fines.
                <button onClick={refetchFines} className="ml-2 underline hover:text-gray-800">
                  Try again
                </button>
              </div>
            )}

            {finesLoading && fines.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-600">
                Loading fines…
              </div>
            ) : unpaidFines.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <CreditCard className="w-12 h-12 text-[#57068C] mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No outstanding fines!</p>
                <p className="text-sm text-gray-500 mt-1">You're all caught up.</p>
              </div>
            ) : (
              unpaidFines.map((fine) => (
                <div
                  key={fine.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {fine.type || fine.reason} {fine.item && `- ${fine.item}`}
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">
                        {fine.dueDate && `Due: ${fine.dueDate}`}
                        {fine.assessed && `Assessed: ${fine.assessed}`}
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-[#57068C]">
                      ${(fine.amount || 0).toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={() => handlePayFine(fine)}
                    className="w-full py-3 bg-[#57068C] text-white font-semibold rounded-lg hover:bg-[#460573] transition-colors"
                  >
                    Pay Now
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Payment History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {paymentsError && (
              <div className="p-4 bg-gray-100 border border-gray-300 text-sm text-gray-700 rounded-lg">
                Unable to load payment history.
                <button onClick={refetchPayments} className="ml-2 underline hover:text-gray-800">
                  Try again
                </button>
              </div>
            )}

            {paymentsLoading && payments.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-600">
                Loading payment history…
              </div>
            ) : payments.length === 0 && paidFines.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No payment history yet.</p>
              </div>
            ) : (
              <>
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-900">{payment.receipt}</h3>
                      <span className="text-lg font-bold text-[#57068C]">
                        ${(payment.amount || 0).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm">
                      {payment.date} • {payment.method}
                    </p>
                  </div>
                ))}
                {paidFines.map((fine) => (
                  <div
                    key={fine.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {fine.receipt || `Fine - ${fine.type || fine.reason}`}
                      </h3>
                      <span className="text-lg font-bold text-[#57068C]">
                        ${(fine.amount || 0).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm">
                      {fine.paid || fine.paidAt || 'Paid'} • Completed
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Bottom Spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}
