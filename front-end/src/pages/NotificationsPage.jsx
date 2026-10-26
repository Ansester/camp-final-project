import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

export default function NotificationsPage({ onNavigate }) {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [appEnabled, setAppEnabled] = useState(true);
  const [reminderTiming, setReminderTiming] = useState('24hours');

  const handleSave = () => {
    alert('Notification settings saved successfully!');
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Notifications</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Notification Channels */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Notification Channels</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Get updates via email</p>
              </div>
              <button
                onClick={() => setEmailEnabled(!emailEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  emailEnabled ? 'bg-[#57068C]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    emailEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-600">Get updates via text message</p>
              </div>
              <button
                onClick={() => setSmsEnabled(!smsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  smsEnabled ? 'bg-[#57068C]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    smsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">In-App Notifications</p>
                <p className="text-sm text-gray-600">Get updates in the app</p>
              </div>
              <button
                onClick={() => setAppEnabled(!appEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  appEnabled ? 'bg-[#57068C]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    appEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Reminder Timing */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Reminder Timing</h2>
          <p className="text-sm text-gray-600 mb-4">When should we remind you about due items?</p>

          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="reminder"
                value="1hour"
                checked={reminderTiming === '1hour'}
                onChange={(e) => setReminderTiming(e.target.value)}
                className="w-5 h-5 text-blue-500 cursor-pointer"
              />
              <span className="text-gray-900">1 hour before</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="reminder"
                value="24hours"
                checked={reminderTiming === '24hours'}
                onChange={(e) => setReminderTiming(e.target.value)}
                className="w-5 h-5 text-blue-500 cursor-pointer"
              />
              <span className="text-gray-900">24 hours before</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="reminder"
                value="48hours"
                checked={reminderTiming === '48hours'}
                onChange={(e) => setReminderTiming(e.target.value)}
                className="w-5 h-5 text-blue-500 cursor-pointer"
              />
              <span className="text-gray-900">48 hours before</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="reminder"
                value="1week"
                checked={reminderTiming === '1week'}
                onChange={(e) => setReminderTiming(e.target.value)}
                className="w-5 h-5 text-blue-500 cursor-pointer"
              />
              <span className="text-gray-900">1 week before</span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-4 bg-gray-300 text-gray-700 font-bold text-lg rounded-xl hover:bg-gray-400 transition-colors shadow-sm"
        >
          Save Settings
        </button>

        {/* Bottom Spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}
