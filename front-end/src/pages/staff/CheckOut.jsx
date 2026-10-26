import React, { useState, useMemo, useEffect } from 'react';
import { Search, ArrowLeft, User, Package, X, Check, AlertCircle } from 'lucide-react';
import CheckoutSuccess from './CheckoutSuccess';
import { useApiData } from '../../hooks/useApiData.js';
import { api } from '../../services/api.js';

const CheckOut = ({ onNavigate, selectedItem: prefillData }) => {
  const [studentSearch, setStudentSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [successBorrowal, setSuccessBorrowal] = useState(null);
  const [studentBorrowals, setStudentBorrowals] = useState({ active: [], history: [] });
  const [borrowalsLoading, setBorrowalsLoading] = useState(false);

  const {
    data: studentsPayload,
    loading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents
  } = useApiData('students', { initialData: { students: [] } });

  const {
    data: inventoryPayload,
    loading: inventoryLoading,
    error: inventoryError,
    refetch: refetchInventory
  } = useApiData('staffInventory', { initialData: { items: [] } });

  const students = useMemo(() => studentsPayload?.students ?? [], [studentsPayload?.students]);
  const inventoryItems = useMemo(() => inventoryPayload?.items ?? [], [inventoryPayload?.items]);

  // Handle prefill data
  useEffect(() => {
    if (prefillData) {
      // Prefill Student
      if (!selectedStudent && students.length > 0) {
        const targetStudentId = String(prefillData.studentId || prefillData.userId || '');
        if (targetStudentId) {
          const match = students.find(s => String(s.id) === targetStudentId);
          if (match) handleSelectStudent(match);
        }
      }

      // Prefill Item
      if (!selectedItem && inventoryItems.length > 0) {
        const targetItemId = String(prefillData.itemId || prefillData.id || '');
        if (targetItemId) {
          const match = inventoryItems.find(i => String(i.id) === targetItemId);
          if (match && match.availableQuantity > 0) handleSelectItem(match);
        }
      }
    }
  }, [prefillData, students, inventoryItems, selectedStudent, selectedItem]);

  // Live filter students as user types
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students.slice(0, 20);
    const query = studentSearch.toLowerCase();
    return students.filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.netId.toLowerCase().includes(query) ||
      s.email?.toLowerCase().includes(query)
    ).slice(0, 20);
  }, [students, studentSearch]);

  // Live filter items as user types
  const filteredItems = useMemo(() => {
    const availableItems = inventoryItems.filter(i => i.availableQuantity > 0);
    if (!itemSearch.trim()) return availableItems.slice(0, 20);
    const query = itemSearch.toLowerCase();
    return availableItems.filter(i =>
      i.name.toLowerCase().includes(query) ||
      i.assetId?.toLowerCase().includes(query) ||
      i.category?.toLowerCase().includes(query) ||
      i.location?.toLowerCase().includes(query)
    ).slice(0, 20);
  }, [inventoryItems, itemSearch]);

  const handleSelectStudent = async (student) => {
    setSelectedStudent({
      id: student.id,
      name: student.name,
      netId: student.netId,
      email: student.email,
      fines: student.activeFines?.length || 0,
      finesTotal: student.activeFines?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0
    });
    setStudentSearch('');
    setShowStudentDropdown(false);

    // Fetch student's borrowals
    setBorrowalsLoading(true);
    try {
      const res = await api.staffStudentBorrowals(student.id);
      setStudentBorrowals({
        active: res.active || [],
        history: res.history || []
      });
    } catch (err) {
      console.error('Failed to load student borrowals:', err);
      setStudentBorrowals({ active: [], history: [] });
    } finally {
      setBorrowalsLoading(false);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem({
      id: item.id,
      name: item.name,
      assetId: item.assetId,
      category: item.category,
      location: item.location,
      quantity: item.quantity,
      availableQuantity: item.availableQuantity,
      status: item.status
    });
    setItemSearch('');
    setShowItemDropdown(false);
  };

  const handleConfirmCheckout = async () => {
    if (checkoutLoading || !selectedStudent || !selectedItem) return;
    setCheckoutError(null);
    setCheckoutLoading(true);

    const payload = {
      userId: selectedStudent.id,
      itemId: selectedItem.id
    };

    try {
      const result = await api.staffCheckout(payload);
      setCheckoutLoading(false);
      setSuccessBorrowal(result?.borrowal || result);
    } catch (e) {
      setCheckoutLoading(false);
      const errorMsg = e.message || 'Failed to check out item';
      setCheckoutError(errorMsg.includes('::') ? errorMsg.split('::')[1].trim() : errorMsg);
    }
  };

  const handleNewCheckout = () => {
    setSuccessBorrowal(null);
    setSelectedStudent(null);
    setSelectedItem(null);
    setStudentSearch('');
    setItemSearch('');
    setStudentBorrowals({ active: [], history: [] });
  };

  if (successBorrowal) {
    return (
      <CheckoutSuccess
        borrowal={successBorrowal}
        onNavigate={(dest) => {
          if (dest === 'checkout') {
            handleNewCheckout();
          } else {
            onNavigate(dest);
          }
        }}
      />
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Check-Out</h1>
        </div>

        {/* Step 1: Find Student */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedStudent ? 'bg-violet-700' : 'bg-violet-500'} text-white font-bold`}>
              {selectedStudent ? <Check className="w-5 h-5" /> : '1'}
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Find Student</h2>
          </div>

          {!selectedStudent ? (
            <div className="relative">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, NetID, or email..."
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setShowStudentDropdown(true);
                  }}
                  onFocus={() => setShowStudentDropdown(true)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Student Dropdown */}
              {showStudentDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {studentsLoading && students.length === 0 ? (
                    <p className="p-3 text-gray-500 text-sm">Loading students...</p>
                  ) : studentsError ? (
                    <div className="p-3 text-gray-600 text-sm">
                      Error loading students. <button onClick={refetchStudents} className="underline">Retry</button>
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <p className="p-3 text-gray-500 text-sm">No students found</p>
                  ) : (
                    filteredStudents.map((student) => (
                      <button
                        key={student.id}
                        onClick={() => handleSelectStudent(student)}
                        className="w-full text-left p-3 hover:bg-violet-50 border-b border-gray-100 last:border-0 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-600">
                          {student.netId} • {student.email}
                          {student.activeFines?.length > 0 && (
                            <span className="ml-2 text-violet-600 font-medium">
                              {student.activeFines.length} fine(s) - ${student.activeFines.reduce((sum, f) => sum + (f.amount || 0), 0).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-violet-50 border border-violet-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center text-white font-bold">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{selectedStudent.name}</div>
                  <div className="text-sm text-gray-600">{selectedStudent.netId} • {selectedStudent.email}</div>
                </div>
              </div>
              <button aria-label="Clear selected student"
                onClick={() => {
                  setSelectedStudent(null);
                  setStudentBorrowals({ active: [], history: [] });
                }}
                className="p-2 hover:bg-violet-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}

          {selectedStudent?.fines > 0 && (
            <div className="mt-3 p-3 bg-violet-50 border border-violet-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-violet-600" />
              <span className="text-sm text-violet-700">
                This student has {selectedStudent.fines} unpaid fine(s) totaling <strong>${selectedStudent.finesTotal?.toFixed(2) || '0.00'}</strong>. Checkout is still allowed.
              </span>
            </div>
          )}

          {/* Student's Current Borrowals */}
          {selectedStudent && (
            <div className="mt-4">
              {borrowalsLoading ? (
                <p className="text-sm text-gray-500">Loading borrowals...</p>
              ) : studentBorrowals.active.length > 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Current Borrowals ({studentBorrowals.active.length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {studentBorrowals.active.map((b) => (
                      <div key={b.id} className="flex justify-between items-center text-sm p-2 bg-white rounded border border-gray-100">
                        <span className="font-medium text-gray-900">{b.item?.name || 'Unknown Item'}</span>
                        <span className={`text-xs ${new Date(b.dueDate) < new Date() ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                          Due: {new Date(b.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {new Date(b.dueDate) < new Date() && ' (OVERDUE)'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No active borrowals</p>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Select Item */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedItem ? 'bg-violet-700' : selectedStudent ? 'bg-violet-500' : 'bg-gray-300'} text-white font-bold`}>
              {selectedItem ? <Check className="w-5 h-5" /> : '2'}
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Select Item</h2>
          </div>

          {!selectedItem ? (
            <div className="relative">
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, asset ID, category, or location..."
                  value={itemSearch}
                  onChange={(e) => {
                    setItemSearch(e.target.value);
                    setShowItemDropdown(true);
                  }}
                  onFocus={() => setShowItemDropdown(true)}
                  disabled={!selectedStudent}
                  className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${!selectedStudent ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
              </div>

              {/* Item Dropdown */}
              {showItemDropdown && selectedStudent && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                  {inventoryLoading && inventoryItems.length === 0 ? (
                    <p className="p-3 text-gray-500 text-sm">Loading inventory...</p>
                  ) : inventoryError ? (
                    <div className="p-3 text-gray-600 text-sm">
                      Error loading inventory. <button onClick={refetchInventory} className="underline">Retry</button>
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <p className="p-3 text-gray-500 text-sm">No available items found</p>
                  ) : (
                    filteredItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => item.availableQuantity > 0 && handleSelectItem(item)}
                        disabled={item.availableQuantity <= 0}
                        className={`w-full text-left p-3 border-b border-gray-100 last:border-0 transition-colors ${
                          item.availableQuantity > 0 ? 'hover:bg-violet-50' : 'bg-gray-50 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-600">
                              {item.assetId} • {item.category} • {item.location}
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.availableQuantity > 0 ? 'bg-violet-100 text-violet-700' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {item.availableQuantity}/{item.quantity} avail
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-violet-50 border border-violet-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center text-white">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{selectedItem.name}</div>
                  <div className="text-sm text-gray-600">
                    {selectedItem.assetId} • {selectedItem.category} • {selectedItem.location}
                  </div>
                  <div className="text-sm text-violet-600 font-medium">
                    {selectedItem.availableQuantity}/{selectedItem.quantity} available
                  </div>
                </div>
              </div>
              <button aria-label="Clear selected item"
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-violet-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}
        </div>

        {/* Checkout Summary */}
        {selectedStudent && selectedItem && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Checkout Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Student:</span>
                <span className="font-medium">{selectedStudent.name} ({selectedStudent.netId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Item:</span>
                <span className="font-medium">{selectedItem.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className="font-medium">
                  {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {checkoutError && (
          <div className="mb-4 p-4 bg-gray-100 border border-gray-300 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-gray-700" />
            <span className="text-gray-700">{checkoutError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleConfirmCheckout}
            disabled={!selectedStudent || !selectedItem || checkoutLoading}
            className={`w-full py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
              selectedStudent && selectedItem && !checkoutLoading
                ? 'bg-violet-500 text-white hover:bg-violet-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {checkoutLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Confirm Checkout
              </>
            )}
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full bg-gray-200 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Click outside to close dropdowns */}
        {(showStudentDropdown || showItemDropdown) && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => {
              setShowStudentDropdown(false);
              setShowItemDropdown(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CheckOut;
