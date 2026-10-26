import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Clock, List, Calendar, DollarSign } from 'lucide-react';
import { api } from '../services/api.js';

export default function NotificationInbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  // ================= API ===================
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.getNotifications({ limit: 20 });
      setNotifications(response.notifications || []);
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.getUnreadNotificationCount();
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // ================= EFFECTS ===================
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      document.body.style.overflow = "hidden"; // scroll lock
      panelRef.current?.focus(); // focus trap entry
    } else {
      document.body.style.overflow = "auto";
    }
    return () => (document.body.style.overflow = "auto");
  }, [isOpen]);

  // Esc key close
  useEffect(() => {
    const closeOnEscape = (e) => e.key === "Escape" && setIsOpen(false);
    if (isOpen) window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  // ================= HANDLERS ===================
  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications:', error);
    }
  };

  // ================= UI HELPERS ===================
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'reminder':
      case 'overdue': return <Clock className="w-5 h-5 text-gray-600" />;
      case 'waitlist': return <List className="w-5 h-5 text-gray-600" />;
      case 'reservation': return <Calendar className="w-5 h-5 text-gray-600" />;
      case 'fine': return <DollarSign className="w-5 h-5 text-gray-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type, priority) => {
    if (type === 'overdue' || priority === 'high') return 'border-red-200 bg-red-50';
    if (type === 'waitlist') return 'border-violet-200 bg-violet-50';
    if (type === 'reminder') return 'border-yellow-200 bg-yellow-50';
    return 'border-gray-200 bg-white';
  };

  // ================= UI ===================
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm transition"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsOpen(false)} />

          {/* Panel */}
          <div
            ref={panelRef}
            tabIndex={-1}
            className="
              fixed
              left-2 right-2 sm:left-auto sm:right-0
              top-14 sm:top-12
              w-[calc(100%-1rem)] sm:w-96
              max-w-full
              bg-white
              rounded-lg
              shadow-xl
              border border-gray-200
              z-50
              max-h-[calc(100vh-6rem)]
              flex flex-col
              transition-all duration-200 ease-out
              animate-in fade-in slide-in-from-top-5
              focus:outline-none
            "
          >

            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllAsRead} className="text-sm hover:text-black">
                    <CheckCheck className="w-4 h-4 inline mr-1" /> Mark all
                  </button>
                )}
                <button aria-label="Close notifications" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1">
              {loading && <div className="p-6 text-center">Loading...</div>}
              {!loading && notifications.length === 0 && (
                <div className="p-6 text-center text-gray-500">No notifications</div>
              )}
              {!loading && notifications.map(n => (
                <div
                  key={n._id}
                  className={`p-4 border-l-4 ${getNotificationColor(n.type, n.priority)} ${!n.isRead && 'font-medium'}`}
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {getNotificationIcon(n.type)}
                        <h4 className="text-sm">{n.title}</h4>
                      </div>
                      <p className="text-sm">{n.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!n.isRead && (
                      <button onClick={() => handleMarkAsRead(n._id)} title="Mark as read">
                        <Check className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </>
      )}
    </div>
  );
}
