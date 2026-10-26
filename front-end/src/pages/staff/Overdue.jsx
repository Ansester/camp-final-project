import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData.js';

const Overdue = ({ onNavigate }) => {
  const { data, loading, error, refetch } = useApiData('staffOverdue', {
    initialData: { items: [] }
  });

  const overdueItems = data?.items ?? [];

  const handleSendReminder = (id) => {
    alert(`Reminder sent for item ${id}`);
  };

  const handleApplyFine = (item) => {
    // Pass user data to pre-fill the fines page
    onNavigate('fines', {
      prefillStudent: {
        userId: item.userId,
        name: item.student,
        odInfo: item.item,
        days: item.days,
        odId: item.id
      }
    });
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Overdue</h1>
        </div>

        {/* Overdue Items List */}
        <div className="space-y-4">
          {error && (
            <div className="p-4 bg-gray-100 border border-gray-300 text-sm text-gray-700 rounded-lg">
              Unable to load overdue items.
              <button onClick={refetch} className="ml-2 underline hover:text-gray-800">
                Retry
              </button>
            </div>
          )}
          {loading && overdueItems.length === 0 ? (
            <p className="text-center text-gray-600">Loading overdue list…</p>
          ) : overdueItems.length > 0 ? (
            overdueItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm p-5">
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">
                    {item.item} – {item.days} day{item.days > 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Student: {item.student}
                  </p>
                  <p className="text-sm text-gray-600 font-medium mt-1">
                    Due date: {item.dueDate}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSendReminder(item.id)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Send Reminder
                  </button>
                  <button
                    onClick={() => handleApplyFine(item)}
                    className="flex-1 px-4 py-2 bg-violet-500 text-white rounded-lg font-medium hover:bg-violet-600 transition-colors"
                  >
                    Apply Fine
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Overdue Items
              </h3>
              <p className="text-gray-600">
                All items are returned on time!
              </p>
            </div>
          )}
        </div>

        {/* Empty State (if no overdue items) */}
        {/* handled above */}

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

export default Overdue;
