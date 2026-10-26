import React, { useMemo, useState } from 'react';
import { ChevronLeft, Calendar, Clock } from 'lucide-react';
import { api } from '../services/api.js';

export default function ReserveDateTimePage({ onNavigate, selectedItem, setReservationData }) {
  // Initialize with tomorrow's date to ensure it's always in the future
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const [selectedDate, setSelectedDate] = useState(tomorrow);
  const [selectedTime, setSelectedTime] = useState('10:00');

  const facilityName = selectedItem?.facility && typeof selectedItem.facility === 'object'
    ? selectedItem.facility.name
    : selectedItem?.facility;

  // Minimum date is today
  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  // Maximum date is 30 days from now
  const maxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  }, []);

  // Available time slots
  const timeSlots = [
    { value: '09:00', label: '9:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '13:00', label: '1:00 PM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '16:00', label: '4:00 PM' },
    { value: '17:00', label: '5:00 PM' },
  ];

  const handleNext = async () => {
    if (!selectedDate || !selectedTime) return;

    try {
      // Build proper ISO pickupDate from selected date and time
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const pickupDate = new Date(selectedDate + 'T00:00:00');
      pickupDate.setHours(hours, minutes, 0, 0);

      // Ensure the date is in the future
      if (pickupDate <= new Date()) {
        alert('Please select a future date and time');
        return;
      }

      const itemId = selectedItem?._id || selectedItem?.id;
      const payload = {
        itemId,
        pickupDate: pickupDate.toISOString()
      };

      const res = await api.reserve(payload);
      const r = res?.reservation;
      const reservation = {
        id: r?._id,
        itemId: r?.item?._id || selectedItem.id,
        number: r?._id || `R-${Math.floor(Math.random() * 9000) + 1000}`,
        item: r?.item?.name || selectedItem.name,
        facility: r?.item?.facility?.name || facilityName,
        date: r?.pickupDate ? new Date(r.pickupDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : selectedDate,
        time: r?.pickupDate ? new Date(r.pickupDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : selectedTime
      };
      setReservationData(reservation);
      onNavigate('reservationConfirmed');
    } catch (e) {
      alert(e.message || 'Failed to create reservation');
    }
  };

  if (!selectedItem) {
    onNavigate('filter');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <button aria-label="Back to item details"
              onClick={() => onNavigate('itemDetail')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Reserve - Date & Time</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Item Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 mb-1">Facility</p>
              <p className="text-sm text-gray-500">Item</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">{facilityName}</p>
              <p className="text-lg font-bold text-gray-900">{selectedItem.name}</p>
            </div>
          </div>
        </div>

        {/* Choose Date - Calendar Picker */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#57068C]" />
            Select Pickup Date
          </h3>
          <div className="relative">
            <input
              type="date"
              aria-label="Pickup date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={minDate}
              max={maxDate}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#57068C] focus:border-transparent text-lg cursor-pointer"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Select a date within the next 30 days
          </p>
        </div>

        {/* Choose Time - Time Picker */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#57068C]" />
            Select Pickup Time
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {timeSlots.map((slot) => (
              <button
                key={slot.value}
                type="button"
                onClick={() => setSelectedTime(slot.value)}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  selectedTime === slot.value
                    ? 'bg-[#57068C] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Summary */}
        {selectedDate && selectedTime && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <p className="text-sm text-purple-800">
              <span className="font-semibold">Pickup:</span>{' '}
              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}{' '}
              at {timeSlots.find(s => s.value === selectedTime)?.label}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <button
          onClick={handleNext}
          disabled={!selectedDate || !selectedTime}
          className="w-full py-4 bg-gray-300 text-gray-700 font-bold text-lg rounded-xl hover:bg-gray-400 transition-colors shadow-sm"
        >
          Confirm reservation
        </button>

        <button
          onClick={() => onNavigate('itemDetail')}
          className="w-full py-4 bg-gray-200 text-gray-700 font-semibold text-lg rounded-xl hover:bg-gray-300 transition-colors"
        >
          Back
        </button>

        {/* Bottom Spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}
