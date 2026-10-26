import { ArrowRight, Package, LogOut, LogIn, Calendar, AlertTriangle, DollarSign } from 'lucide-react';
import { useApiData } from '../../hooks/useApiData.js';

const StaffDashboard = ({ onNavigate }) => {
  const { data, error, refetch } = useApiData('staffDashboard', {
    initialData: { inventoryStats: null }
  });

  const inventoryStats = data?.inventoryStats ?? {
    available: 0,
    out: 0,
    reserved: 0,
    checkouts: 0,
    returns: 0,
    overdue: 0
  };

  const menuItems = [
    { id: 'inventory', label: 'Inventory', icon: Package, description: 'Manage equipment' },
    { id: 'checkout', label: 'Check Out', icon: LogOut, description: 'Lend items to students' },
    { id: 'checkin', label: 'Check In', icon: LogIn, description: 'Process returns' },
    { id: 'reservations', label: 'Reservations', icon: Calendar, description: 'Today\'s pickups' },
    { id: 'overdue', label: 'Overdue', icon: AlertTriangle, description: `${inventoryStats.overdue} items overdue` },
    { id: 'fines', label: 'Student Accounts', icon: DollarSign, description: 'Fines & add funds' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage equipment and student borrowals</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
            <p className="text-3xl font-bold text-[#57068C]">{inventoryStats.available}</p>
            <p className="text-sm text-gray-500">Available</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
            <p className="text-3xl font-bold text-violet-600">{inventoryStats.out}</p>
            <p className="text-sm text-gray-500">Checked Out</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
            <p className="text-3xl font-bold text-gray-700">{inventoryStats.overdue}</p>
            <p className="text-sm text-gray-500">Overdue</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 text-purple-800 text-sm rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Unable to load stats.
              <button onClick={refetch} className="ml-2 underline hover:text-purple-900">
                Retry
              </button>
            </span>
          </div>
        )}

        {/* Navigation Menu */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Quick Actions</h2>
          </div>
          {menuItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-[#57068C]" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
