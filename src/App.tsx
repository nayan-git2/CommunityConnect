import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import LoginPage from './pages/LoginPage';
import SubmitReportPage from './pages/SubmitReportPage';
import DashboardPage from './pages/DashboardPage';
import VolunteerRegistrationPage from './pages/VolunteerRegistrationPage';
import VolunteerMatchingPage from './pages/VolunteerMatchingPage';
import ReportsHistoryPage from './pages/ReportsHistoryPage';

const AppRoutes = () => {
  const { role } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={
            role === 'coordinator' ? <Navigate to="/dashboard" /> : <Navigate to="/submit" />
          } />
          
          <Route path="/submit" element={<SubmitReportPage />} />
          <Route path="/volunteer" element={<VolunteerRegistrationPage />} />
          
          <Route element={<ProtectedRoute allowedRoles={['coordinator']} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/match" element={<VolunteerMatchingPage />} />
            <Route path="/reports" element={<ReportsHistoryPage />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
