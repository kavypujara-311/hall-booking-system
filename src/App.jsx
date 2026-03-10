import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import RoleSelection from './components/RoleSelection';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import BookingProcess from './pages/BookingProcess';
import UserProfile from './pages/UserProfile';
import VenueDetails from './pages/VenueDetails';

import Login from './pages/Login';
import Signup from './pages/Signup';
import LandingPage from './pages/LandingPage';
import ConciergeService from './pages/ConciergeService';
import AuthCallback from './pages/AuthCallback';
import MembershipRequest from './pages/MembershipRequest';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';

// ScrollToTop component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

import { DataProvider, useData } from './context/DataContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useData();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-luxury-blue border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

// In-memory role management (reset on reload)
import { setAuthToken } from './services/api';

function App() {
  // Restore role from localStorage so it survives refreshes
  const [role, setRole] = useState(() => localStorage.getItem('userRole') || null);

  const handleLogin = (selectedRole) => {
    localStorage.setItem('userRole', selectedRole);
    setRole(selectedRole);
  };

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem('userRole');
    setRole(null);
    window.location.href = '/';
  };

  return (
    <DataProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route element={
            <div className="flex flex-col min-h-screen relative font-sans text-white bg-luxury-black selection:bg-luxury-blue selection:text-black">
              <Header role={role} onLogout={handleLogout} />
              <Outlet />
              <Footer />
            </div>
          }>
            <Route path="/" element={<LandingPage />} />
            <Route path="/membership-request" element={<MembershipRequest />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />

            <Route path="/choose-role" element={
              role ? <Navigate to={`/dashboard/${role}`} replace /> : <RoleSelection />
            } />

            <Route path="/login" element={
              role ? <Navigate to={`/dashboard/${role}`} replace /> : <Login onLogin={handleLogin} />
            } />

            <Route path="/signup" element={
              role ? <Navigate to={`/dashboard/${role}`} replace /> : <Signup onLogin={handleLogin} />
            } />

            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Public/Protected Venue Routes */}
            <Route path="/venue/:id" element={<VenueDetails onLogout={handleLogout} />} />
            <Route path="/concierge" element={<ConciergeService onLogout={handleLogout} />} />
            {/* Protected Booking Route */}


            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>

          {/* Protected Dashboards - Standalone Layouts */}
          <Route path="/dashboard/admin" element={
            role === 'admin' ? (
              <AdminDashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/dashboard/user" element={
            role === 'user' ? (
              <UserDashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          <Route path="/booking/:id" element={
            <ProtectedRoute>
              <BookingProcess onLogout={handleLogout} />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            role ? (
              <UserProfile />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
        </Routes>
      </Router>
    </DataProvider>
  );
}

export default App;
