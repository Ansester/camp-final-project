import React from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function CheckoutSuccess({ onNavigate, borrowal }) {
  const itemName = borrowal?.item?.name || 'Item';
  const facility = borrowal?.item?.facility?.name || 'Facility';
  const due = borrowal?.dueDate
    ? new Date(borrowal.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'N/A';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button aria-label="Back to staff dashboard" onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Check-Out Success</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-[#57068C]" />
            <span className="font-semibold text-[#57068C]">Item checked out successfully</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-700">Item</span>
              <span className="font-medium text-gray-900">{itemName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Facility</span>
              <span className="font-medium text-gray-900">{facility}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Due Date</span>
              <span className="font-medium text-gray-900">{due}</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button onClick={() => onNavigate('checkout')} className="py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300">
              New Checkout
            </button>
            <button onClick={() => onNavigate('inventory')} className="py-3 bg-[#57068C] text-white rounded-lg font-semibold hover:bg-[#460573]">
              Back to Inventory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
