import React from 'react';
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
import { DataProvider, useData } from './context/DataContext';
import { setAuthToken } from './services/api';
import { useEffect } from 'react';

// ── ScrollToTop ───────────────────────────────────────────────────────────────
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// ── Spinner ───────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
    <div className="w-16 h-16 border-4 border-luxury-blue border-t-transparent rounded-full animate-spin" />
  </div>
);

// ── Protected Route: must be logged in ───────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useData();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

// ── Role Route: must be logged in with specific role ─────────────────────────
// Uses DataContext user as the ONLY source of truth — no localStorage role
const RoleRoute = ({ requiredRole, children }) => {
  const { user, loading } = useData();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  const userRole = user.role?.toLowerCase();
  if (userRole !== requiredRole) {
    // User is logged in but wrong role — send them to their correct dashboard
    return <Navigate to={`/dashboard/${userRole}`} replace />;
  }
  return children;
};

// ── Smart Redirect: already logged-in users bypass login/signup ───────────────
const SmartRedirect = ({ children }) => {
  const { user, loading } = useData();
  if (loading) return <Spinner />;
  if (user) return <Navigate to={`/dashboard/${user.role?.toLowerCase() || 'user'}`} replace />;
  return children;
};

// ── Logout helper ─────────────────────────────────────────────────────────────
const doLogout = () => {
  setAuthToken(null);
  localStorage.removeItem('token');
  // No userRole stored or removed — DataContext is the only source of truth
  window.location.href = '/';
};

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  return (
    <DataProvider>
      <Router>
        <ScrollToTop />
        <Routes>

          {/* Public routes — shared Header + Footer layout */}
          <Route element={
            <div className="flex flex-col min-h-screen relative font-sans text-white font-semibold font-medium bg-luxury-black">
              <Header onLogout={doLogout} />
              <Outlet />
              <Footer />
            </div>
          }>
            <Route path="/" element={<LandingPage />} />
            <Route path="/membership-request" element={<MembershipRequest />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/venue/:id" element={<VenueDetails onLogout={doLogout} />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Auth pages — redirect if already logged in */}
            <Route path="/choose-role" element={<SmartRedirect><RoleSelection /></SmartRedirect>} />
            <Route path="/login"        element={<SmartRedirect><Login       onLogin={() => {}} /></SmartRedirect>} />
            <Route path="/signup"       element={<SmartRedirect><Signup      onLogin={() => {}} /></SmartRedirect>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>

          {/* Standalone pages — ConciergeService has its own DashboardNavbar */}
          <Route path="/contact"   element={<ConciergeService onLogout={doLogout} />} />
          <Route path="/concierge" element={<ConciergeService onLogout={doLogout} />} />

          {/* Protected routes — no Header/Footer */}
          <Route path="/dashboard/admin" element={
            <RoleRoute requiredRole="admin"><AdminDashboard onLogout={doLogout} /></RoleRoute>
          } />
          <Route path="/dashboard/user" element={
            <RoleRoute requiredRole="user"><UserDashboard onLogout={doLogout} /></RoleRoute>
          } />
          <Route path="/booking/:id" element={
            <ProtectedRoute><BookingProcess onLogout={doLogout} /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><UserProfile /></ProtectedRoute>
          } />

        </Routes>
      </Router>
    </DataProvider>
  );
}

export default App;
