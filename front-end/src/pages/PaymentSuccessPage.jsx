import React from 'react';
import { ChevronLeft } from 'lucide-react';

export default function PaymentSuccessPage({ onNavigate, paymentResult }) {
  if (!paymentResult) {
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Demo payment recorded</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Success Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Demo payment recordedful
          </h2>

          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-lg font-bold text-gray-900">Amount</span>
              <span className="text-lg font-bold text-gray-900">${paymentResult.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Method</span>
              <span className="text-gray-900">{paymentResult.method}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Receipt</span>
              <span className="text-gray-900">{paymentResult.receipt}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Date</span>
              <span className="text-gray-900">{paymentResult.date}</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 text-center mt-4">
            Recorded in this local demo. No real payment or email was sent.
          </p>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Next steps</h3>

          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Return to Fines to confirm status</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>View payment history</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Contact support if needed</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <button
          onClick={() => onNavigate('fines')}
          className="w-full py-4 bg-gray-300 text-gray-700 font-bold text-lg rounded-xl hover:bg-gray-400 transition-colors shadow-sm"
        >
          Back to Fines
        </button>

        <button
          onClick={() => onNavigate('paymentHistory')}
          className="w-full py-4 bg-gray-200 text-gray-700 font-semibold text-lg rounded-xl hover:bg-gray-300 transition-colors"
        >
          View History
        </button>

        {/* Bottom Spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}
