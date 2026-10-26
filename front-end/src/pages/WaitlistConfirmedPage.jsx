import React from 'react';
import { ChevronLeft } from 'lucide-react';

export default function WaitlistConfirmedPage({ onNavigate, waitlistData }) {
  if (!waitlistData) {
    onNavigate('filter');
    return null;
  }

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
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Waitlist Confirmed</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Success Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Added to Waitlist
          </h2>

          <div className="bg-violet-50 border-2 border-violet-200 rounded-xl p-6 mb-6">
            <p className="text-xl font-bold text-gray-900 mb-2">
              You're on the list!
            </p>
            <p className="text-gray-600 mb-4">
              Your position: <span className="font-bold text-violet-700">#{waitlistData.position}</span>
            </p>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Item</span>
                <span className="text-gray-900 font-bold">{waitlistData.item}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Facility</span>
                <span className="text-gray-900 font-bold">{waitlistData.facility}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 font-medium">Expected Back</span>
                <span className="text-gray-900 font-bold">{waitlistData.expectedBack}</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mt-4">
              Watch in-app notifications for availability updates
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Check the item page and your in-app notifications for availability</li>
              <li>• You'll have 24 hours to reserve the item</li>
              <li>• Check your notifications regularly for updates</li>
            </ul>
          </div>
        </div>

        {/* action button */}
        <button
          onClick={() => onNavigate('home')}
          className="w-full py-4 bg-gray-300 text-gray-700 font-bold text-lg rounded-xl hover:bg-gray-400 transition-colors shadow-sm"
        >
          Back to Home
        </button>

        {/* bottom spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}
