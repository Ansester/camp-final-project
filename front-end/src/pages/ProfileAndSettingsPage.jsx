import React, { useEffect, useState } from 'react';
import { ChevronLeft, CreditCard, Bell, Clock, User } from 'lucide-react';
import { useApiData } from '../hooks/useApiData.js';
import { authUtils } from '../utils/auth.js';
import { api } from '../services/api.js';

export default function ProfileAndSettingsPage({ onNavigate }) {
  const [campusCash, setCampusCash] = useState('0.00');
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [reminderDays, setReminderDays] = useState(5);
  const [saving, setSaving] = useState(false);
  const userId = authUtils.getUserId();
  const userName = authUtils.getUserName?.() || 'Student';

  const { data, loading, error, refetch } = useApiData('profile', {
    initialData: { student: null },
    params: { userId }
  });

  useEffect(() => {
    const student = data?.student;
    if (!student) return;

    if (typeof student.campusCashBalance === 'number') {
      setCampusCash(student.campusCashBalance.toFixed(2));
    }

    if (student.notificationPreferences) {
      setEmailNotifications(!!student.notificationPreferences.email);
      setInAppNotifications(student.notificationPreferences.inApp !== false);
      setReminderDays(student.notificationPreferences.reminder?.startDaysBefore ?? 5);
    }
  }, [data]);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    try {
      await api.prefsPut({
        userId,
        email: emailNotifications,
        inApp: inAppNotifications,
        reminder: { startDaysBefore: reminderDays, frequency: 'daily' }
      });
      setSaveSuccess(true);
      setTimeout(() => {
        onNavigate('home');
      }, 1500);
    } catch {
      setSaveError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Success Notification */}
        {saveSuccess && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
            <div className="bg-green-600 text-white px-6 py-4 rounded-full shadow-lg flex items-center gap-3">
              <div className="bg-white rounded-full p-1">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-medium">Settings saved! Redirecting to home...</span>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {saveError && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl p-4 flex items-center gap-3 animate-pulse">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{saveError}</span>
          </div>
        )}

        {error && (
          <div className="bg-purple-50 border border-purple-200 text-purple-800 text-sm rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Unable to load your profile.
              <button onClick={refetch} className="ml-2 underline hover:text-purple-900">
                Try again
              </button>
            </span>
          </div>
        )}

        {/* Profile Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#57068C] rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {loading ? 'Loading…' : data?.student?.name || userName}
              </h2>
              <p className="text-gray-500">{data?.student?.email || 'student@univ.edu'}</p>
            </div>
          </div>
        </div>

        {/* Campus Cash Balance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CreditCard className="w-6 h-6 text-[#57068C]" />
            <h2 className="text-xl font-bold text-gray-900">Demo Campus Cash</h2>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#57068C]">
              {loading && campusCash === '0.00' ? 'Loading…' : `$${campusCash}`}
            </p>
            <p className="text-sm text-gray-500 mt-1">Fictional demo balance</p>
            <p className="text-xs text-gray-400 mt-2">A demo staff account can add fictional credits. No real money is used.</p>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="w-6 h-6 text-[#57068C]" />
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-500">Preference stored only; this demo does not send email.</p>
              </div>
              <button
                role="switch" aria-label="Email preference (stored only)" aria-checked={emailNotifications}
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  emailNotifications ? 'bg-[#57068C]' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">Scheduled in-app alerts</p>
                <p className="text-sm text-gray-500">Due-date reminders; transaction confirmations remain in your records.</p>
              </div>
              <button
                role="switch" aria-label="Scheduled in-app alerts" aria-checked={inAppNotifications}
                onClick={() => setInAppNotifications(!inAppNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  inAppNotifications ? 'bg-[#57068C]' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  inAppNotifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Reminder Timing */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="w-6 h-6 text-[#57068C]" />
            <h2 className="text-xl font-bold text-gray-900">Due Date Reminders</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 1, label: '1 day before' },
              { value: 3, label: '3 days before' },
              { value: 5, label: '5 days before' },
              { value: 7, label: '1 week before' }
            ].map((option) => (
              <button
                key={option.value}
                aria-pressed={reminderDays === option.value}
                onClick={() => setReminderDays(option.value)}
                className={`py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
                  reminderDays === option.value
                    ? 'bg-[#57068C] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving || saveSuccess}
          className={`w-full py-4 font-bold text-lg rounded-xl transition-colors shadow-sm disabled:opacity-50 ${
            saveSuccess ? 'bg-green-500 text-white' : 'bg-[#57068C] text-white hover:bg-[#460573]'
          }`}
        >
          {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Settings'}
        </button>

        {/* Bottom Spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}
