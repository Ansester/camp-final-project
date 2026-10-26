/**
 * Main Application Component
 * Handles routing, authentication state, and navigation
 * Integrates AuthContext for global authentication management
 * Related to User Story #43 (Landing/Home Page), Task #698
 */
import React, { lazy, Suspense, useState } from "react";
import { useAuth } from "./context/AuthContext.jsx";
import { Home } from "lucide-react";

const HomePage = lazy(() => import("./pages/HomePage"));
const FilterAndSearchPage = lazy(() => import("./pages/FilterAndSearchPage"));
const ItemDetailPage = lazy(() => import("./pages/ItemDetailPage"));
const ReserveDateTimePage = lazy(() => import("./pages/ReserveDateTimePage"));
const ReservationConfirmedPage = lazy(() => import("./pages/ReservationConfirmedPage"));
const WaitlistConfirmedPage = lazy(() => import("./pages/WaitlistConfirmedPage"));
const MyBorrowalsPage = lazy(() => import("./pages/MyBorrowalsPage"));
const MyReservationsPage = lazy(() => import("./pages/MyReservationsPage"));
const ProfileAndSettingsPage = lazy(() => import("./pages/ProfileAndSettingsPage"));
const FinesPage = lazy(() => import("./pages/FinesPage"));
const PayFinePage = lazy(() => import("./pages/PayFinePage"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));
const HelpAndPoliciesPage = lazy(() => import("./pages/HelpAndPoliciesPage"));

const StaffDashboard = lazy(() => import("./pages/staff/StaffDashboard.jsx"));
const Inventory = lazy(() => import("./pages/staff/Inventory.jsx"));
const CheckOut = lazy(() => import("./pages/staff/CheckOut.jsx"));
const CheckIn = lazy(() => import("./pages/staff/CheckIn.jsx"));
const Reservations = lazy(() => import("./pages/staff/Reservations.jsx"));
const Overdue = lazy(() => import("./pages/staff/Overdue.jsx"));
const ManageFines = lazy(() => import("./pages/staff/ManageFines.jsx"));
const AddItem = lazy(() => import("./pages/staff/AddItem.jsx"));
const EditItem = lazy(() => import("./pages/staff/EditItem.jsx"));

import LandingPage from "./pages/landingpage.jsx";
const StudentLoginPage = lazy(() => import("./pages/StudentLoginPage.jsx"));
const StudentRegisterPage = lazy(() => import("./pages/StudentRegisterPage.jsx"));
const StaffLoginPage = lazy(() => import("./pages/staff/StaffLoginPage.jsx"));
import Protected from "./components/Protected.jsx";
import NotificationInbox from "./components/NotificationInbox.jsx";

function AppContent() {
  const { role, logout, isAuthenticated, initializing } = useAuth();
  const [authPage, setAuthPage] = useState(null); // 'studentLogin', 'studentRegister', 'staffLogin', or null
  const [currentPage, setCurrentPage] = useState("home");

  const [selectedItem, setSelectedItem] = useState(null);
  const [reservationData, setReservationData] = useState(null);
  const [waitlistData, setWaitlistData] = useState(null);
  const [selectedFine, setSelectedFine] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [staffPrefillData, setStaffPrefillData] = useState(null);

  const handleLogout = () => {
    logout();
    setAuthPage(null);
    setCurrentPage("home");
  };

  const handleSelectRole = (selectedRole) => {
    if (selectedRole === "student") setAuthPage("studentLogin");
    else if (selectedRole === "staff") setAuthPage("staffLogin");
  };

  const handleStudentRegister = () => {
    // After registration, stay on home; context should have set user/role
    setAuthPage(null);
    setCurrentPage("home");
  };

  const handleBackToLanding = () => {
    setAuthPage(null);
  };

  if (initializing) {
    return <div className="p-8 text-center text-gray-600">Initializing session...</div>;
  }

  // Show landing page if no role selected
  if (!isAuthenticated && !authPage) {
    return <LandingPage onSelectRole={handleSelectRole} />;
  }

  // Show authentication pages
  if (!isAuthenticated && authPage === "studentLogin") {
    return (
      <StudentLoginPage
        onBack={handleBackToLanding}
        onNavigateToRegister={() => setAuthPage("studentRegister")}
      />
    );
  }

  if (!isAuthenticated && authPage === "studentRegister") {
    return (
      <StudentRegisterPage
        onRegister={handleStudentRegister}
        onBack={handleBackToLanding}
        onNavigateToLogin={() => setAuthPage("studentLogin")}
      />
    );
  }

  if (!isAuthenticated && authPage === "staffLogin") {
    return (
      <StaffLoginPage
        onBack={handleBackToLanding}
      />
    );
  }

  // Staff portal
  if (role === "staff" && isAuthenticated) {
    const onNavigate = (page, data) => {
      // Handle prefill data for fines page
      if (data?.prefillStudent) {
        setStaffPrefillData(data.prefillStudent);
      } else {
        setStaffPrefillData(null);
      }

      // Handle item selection for other pages
      if (data?.item) {
        setSelectedItem(data.item);
      } else if (data && !data.prefillStudent) {
        setSelectedItem(data);
      }

      setCurrentPage(page);
    };

    const shared = { onNavigate, selectedItem, setSelectedItem };

    return (
      <Protected allowedRoles={["staff"]}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Fixed Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Dashboard"
                aria-label="Dashboard"
              >
                <Home className="w-5 h-5 text-[#57068C]" />
              </button>
              <h2 className="font-bold text-base sm:text-lg text-gray-800">C.A.M.P Staff</h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <NotificationInbox />
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm sm:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          {currentPage === "dashboard" && <StaffDashboard {...shared} />}
          {currentPage === "inventory" && <Inventory {...shared} />}
          {currentPage === "checkout" && <CheckOut {...shared} />}
          {currentPage === "checkin" && <CheckIn {...shared} />}
          {currentPage === "reservations" && <Reservations {...shared} />}
          {currentPage === "overdue" && <Overdue {...shared} />}
          {currentPage === "fines" && <ManageFines {...shared} prefillData={staffPrefillData} />}

          {currentPage === "additem" && <AddItem {...shared} />}
          {currentPage === "edititem" && <EditItem {...shared} itemData={selectedItem} />}

          {currentPage === "home" && <StaffDashboard {...shared} />}
        </div>
      </div>
      </Protected>
    );
  }

  // Student portal
  if (role === "student" && isAuthenticated) {
    return (
      <Protected allowedRoles={["student"]}>
      <div className="min-h-screen flex flex-col">
        {/* Fixed Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage('home')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Home"
              aria-label="Home"
            >
              <Home className="w-5 h-5 text-[#57068C]" />
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <NotificationInbox />
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1.5 px-3 sm:py-2 sm:px-4 rounded-lg shadow-sm transition-colors text-sm sm:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {currentPage === "home" && <HomePage onNavigate={setCurrentPage} />}
        {currentPage === "filter" && (
          <FilterAndSearchPage onNavigate={setCurrentPage} setSelectedItem={setSelectedItem} />
        )}
        {currentPage === "itemDetail" && (
          <ItemDetailPage
            onNavigate={setCurrentPage}
            selectedItem={selectedItem}
            setWaitlistData={setWaitlistData}
          />
        )}
        {currentPage === "reserveDateTime" && (
          <ReserveDateTimePage
            onNavigate={setCurrentPage}
            selectedItem={selectedItem}
            setReservationData={setReservationData}
          />
        )}
        {currentPage === "reservationConfirmed" && (
          <ReservationConfirmedPage onNavigate={setCurrentPage} reservationData={reservationData} setSelectedItem={setSelectedItem} />
        )}
        {currentPage === "waitlistConfirmed" && (
          <WaitlistConfirmedPage onNavigate={setCurrentPage} waitlistData={waitlistData} />
        )}
        {currentPage === "borrowals" && <MyBorrowalsPage onNavigate={setCurrentPage} />}
        {currentPage === "reservations" && <MyReservationsPage onNavigate={setCurrentPage} />}
        {currentPage === "profile" && <ProfileAndSettingsPage onNavigate={setCurrentPage} />}
        {currentPage === "fines" && (
          <FinesPage onNavigate={setCurrentPage} setSelectedFine={setSelectedFine} />
        )}
        {currentPage === "payFine" && (
          <PayFinePage
            onNavigate={setCurrentPage}
            selectedFine={selectedFine}
            setPaymentResult={setPaymentResult}
          />
        )}
        {currentPage === "paymentSuccess" && (
          <PaymentSuccessPage onNavigate={setCurrentPage} paymentResult={paymentResult} />
        )}
        {currentPage === "help" && <HelpAndPoliciesPage onNavigate={setCurrentPage} />}
        </div>
      </div>
      </Protected>
    );
  }
}

export default function App() {
  return <Suspense fallback={<p role="status" className="p-8 text-center text-gray-600">Loading page…</p>}><AppContent /></Suspense>;
}
