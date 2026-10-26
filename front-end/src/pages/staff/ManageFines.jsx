import React, { useEffect, useMemo, useState } from 'react';
import { Search, ArrowLeft, DollarSign, CreditCard } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData.js';
import { api } from '../../services/api.js';

const ManageFines = ({ onNavigate, prefillData }) => {
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [fineReason, setFineReason] = useState('late-return');
  const [fineAmount, setFineAmount] = useState('');
  const [fineNotes, setFineNotes] = useState('');
  const [fundsAmount, setFundsAmount] = useState('');
  const paymentMethod = 'demo-credit';
  const [lookupError, setLookupError] = useState(null);
  const [activeTab, setActiveTab] = useState('fines'); // 'fines' or 'funds'
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const { data, loading, error, refetch } = useApiData('students', {
    initialData: { students: [] }
  });

  const students = useMemo(() => data?.students ?? [], [data?.students]);

  // Handle prefill data from overdue page
  useEffect(() => {
    // Skip if no prefill data or if we already have a selected student from prefill
    if (!prefillData) return;

    console.log('ManageFines prefillData:', prefillData);

    const loadPrefillUser = async () => {
      // If we have userId, fetch directly from API (most reliable)
      if (prefillData.userId) {
        try {
          console.log('Fetching user profile for:', prefillData.userId);
          const profileRes = await api.profile(prefillData.userId);
          console.log('Profile response:', profileRes);

          const studentProfile = profileRes.student;

          // Also try to get fines
          let studentFines = [];
          try {
            const finesRes = await api.fines(prefillData.userId);
            studentFines = finesRes.fines || [];
          } catch (e) {
            console.log('Could not fetch fines:', e);
          }

          const constructedStudent = {
            id: prefillData.userId,
            name: studentProfile.name,
            netId: studentProfile.netId,
            email: studentProfile.email,
            campusCashBalance: studentProfile.campusCashBalance || 0,
            activeFines: studentFines.filter(f => f.status === 'Unpaid' || f.status === 'unpaid').map(f => ({
              id: f.id,
              reason: f.type || f.reason,
              amount: f.amount,
              status: 'unpaid'
            }))
          };

          console.log('Setting selected student:', constructedStudent);
          setSelectedStudent(constructedStudent);
          setStudentSearch(studentProfile.name);
          setFineNotes(`Overdue: ${prefillData.odInfo} - ${prefillData.days} day(s) late`);
          setFineAmount((prefillData.days * 5).toString());

        } catch (err) {
          console.error("Failed to load prefill user", err);

          // Fallback: try to find in students list
          if (students.length > 0) {
            const match = students.find(s =>
              s.id === prefillData.userId ||
              s.name?.toLowerCase().includes(prefillData.name?.toLowerCase())
            );
            if (match) {
              setSelectedStudent(match);
              setStudentSearch(match.name);
              setFineNotes(`Overdue: ${prefillData.odInfo} - ${prefillData.days} day(s) late`);
              setFineAmount((prefillData.days * 5).toString());
            }
          }
        }
      }
    };

    loadPrefillUser();
  }, [prefillData, students]);

  const handleStudentSearch = () => {
    if (!studentSearch.trim()) {
      setLookupError('Enter a NetID or name to search.');
      setSelectedStudent(null);
      return;
    }

    const query = studentSearch.trim().toLowerCase();
    const match = students.find(
      (student) =>
        student.netId.toLowerCase() === query ||
        student.name.toLowerCase().includes(query)
    );

    if (!match) {
      setSelectedStudent(null);
      setLookupError('No matching student found.');
      return;
    }

    setLookupError(null);
    setSelectedStudent(match);
  };

  const handleSaveApply = async () => {
    if (!selectedStudent || !fineAmount) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      await api.createFine({
        userId: selectedStudent.id,
        reason: fineReason,
        amount: parseFloat(fineAmount),
        description: fineNotes || undefined
      });
      setActionMessage({ type: 'success', text: `Fine of $${fineAmount} applied successfully.` });
      setFineAmount('');
      setFineNotes('');
    } catch (e) {
      setActionMessage({ type: 'error', text: e.message || 'Failed to apply fine.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddFunds = async () => {
    if (!fundsAmount || !selectedStudent) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      await api.addFunds({
        userId: selectedStudent.id,
        amount: parseFloat(fundsAmount),
        method: paymentMethod
      });
      setActionMessage({ type: 'success', text: `Added $${fundsAmount} to ${selectedStudent.name}'s Demo Campus Cash balance.` });
      setFundsAmount('');
      refetch(); // Refresh student data to show updated balance
    } catch (e) {
      setActionMessage({ type: 'error', text: e.message || 'Failed to add funds.' });
    } finally {
      setActionLoading(false);
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Manage Students</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('fines')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'fines'
                ? 'bg-violet-500 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Fines
          </button>
          <button
            onClick={() => setActiveTab('funds')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'funds'
                ? 'bg-violet-500 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Add Funds
          </button>
        </div>

        {/* Prefill Banner */}
        {prefillData && selectedStudent && (
          <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-violet-800">
              Applying fine for overdue item: {prefillData.odInfo}
            </p>
            <p className="text-xs text-violet-600 mt-1">
              {prefillData.days} day(s) overdue - Suggested fine: ${prefillData.days * 5}
            </p>
          </div>
        )}

        {/* Action Message */}
        {actionMessage && (
          <div className={`p-4 rounded-lg mb-6 ${
            actionMessage.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {actionMessage.text}
          </div>
        )}

        {/* Find Student Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Find student</h2>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by NetID or Name"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <button
              onClick={handleStudentSearch}
              className="px-6 py-3 bg-violet-500 text-white rounded-lg font-medium hover:bg-violet-600 transition-colors"
            >
              Search
            </button>
          </div>
          {lookupError && (
            <p className="mt-3 text-sm text-gray-700">{lookupError}</p>
          )}
          {error && (
            <div className="mt-3 p-3 bg-purple-50 border border-purple-200 text-sm text-purple-800 rounded-lg">
              Unable to load student records.
              <button onClick={refetch} className="ml-2 underline hover:text-purple-900">
                Retry
              </button>
            </div>
          )}
          {loading && students.length === 0 && (
            <p className="mt-3 text-sm text-gray-600">Loading student directory…</p>
          )}

          {/* Selected Student Info */}
          {selectedStudent && (
            <div className="mt-4 p-4 bg-violet-50 rounded-lg border border-violet-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{selectedStudent.name}</p>
                  <p className="text-sm text-gray-600">{selectedStudent.netId} • {selectedStudent.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Demo Campus Cash Balance</p>
                  <p className="text-lg font-bold text-[#57068C]">
                    ${(selectedStudent.campusCashBalance || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fines Tab Content */}
        {activeTab === 'fines' && (
          <>
            {/* Student Fines Section */}
            {selectedStudent && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Active fines - {selectedStudent.name}
                </h2>
                <div className="space-y-3">
                  {selectedStudent.activeFines?.length ? (
                    <>
                      {selectedStudent.activeFines.map((fine) => (
                        <div
                          key={fine.id}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">{fine.reason}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              ${fine.amount.toFixed(2)} {fine.status}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              fine.status === 'unpaid'
                                ? 'bg-violet-100 text-violet-700'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {fine.status === 'unpaid' ? 'Unpaid' : 'Paid'}
                          </span>
                        </div>
                      ))}
                      <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                        <p className="text-sm font-semibold text-gray-900">Total unpaid fines:</p>
                        <p className="text-lg font-bold text-[#57068C]">
                          ${selectedStudent.activeFines
                            .filter(f => f.status === 'unpaid')
                            .reduce((sum, f) => sum + f.amount, 0)
                            .toFixed(2)}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600">No outstanding fines for this student.</p>
                  )}
                </div>
              </div>
            )}

            {/* Apply Fine Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Apply fine</h2>

              {/* Reason */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <select
                  value={fineReason}
                  onChange={(e) => setFineReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="late-return">Late Return</option>
                  <option value="damage">Damage</option>
                  <option value="loss">Lost Item</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Amount */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600">
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={fineAmount}
                    onChange={(e) => setFineAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Overdue item details"
                  value={fineNotes}
                  onChange={(e) => setFineNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <p className="text-sm text-gray-600">Students settle their own fines using a fictional demo balance. This application does not accept cash or card payments.</p>
            </div>

            {/* Action Button for Fines */}
            <button
              onClick={handleSaveApply}
              disabled={!fineAmount || !selectedStudent || actionLoading}
              className={`w-full py-4 rounded-lg font-semibold transition-colors ${
                fineAmount && selectedStudent && !actionLoading
                  ? 'bg-violet-500 text-white hover:bg-violet-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {actionLoading ? 'Processing...' : 'Apply Fine'}
            </button>
          </>
        )}

        {/* Add Funds Tab Content */}
        {activeTab === 'funds' && (
          <>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Demo Campus Cash</h2>
              <p className="text-sm text-gray-600 mb-4">
                Add funds to a student's Demo Campus Cash balance for equipment deposits and fines.
              </p>

              {/* Amount */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Add
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600">
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={fundsAmount}
                    onChange={(e) => setFundsAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex gap-2 mb-4">
                {[10, 25, 50, 100].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setFundsAmount(amount.toString())}
                    className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              <p className="text-sm text-gray-600">Demo credits only. No cash, card or check is collected.</p>
            </div>

            {/* Action Button for Funds */}
            <button
              onClick={handleAddFunds}
              disabled={!fundsAmount || !selectedStudent || actionLoading}
              className={`w-full py-4 rounded-lg font-semibold transition-colors ${
                fundsAmount && selectedStudent && !actionLoading
                  ? 'bg-[#57068C] text-white hover:bg-[#460573]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {actionLoading ? 'Processing...' : 'Add Funds to Account'}
            </button>
          </>
        )}

        {/* Back Button */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="w-full mt-4 bg-gray-200 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ManageFines;
