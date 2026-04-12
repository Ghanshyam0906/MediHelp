import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'

import Header from './components/Header.jsx'
import Login from './pages/login.jsx'
import Signup from './pages/singup.jsx'
import LandingPage from './pages/LandingPage.jsx'

// Patient Flow Imports
import DoctorListing from './pages/patient/doctorListing.jsx'
import AppointmentPage from './pages/patient/appointmentPage.jsx'
import ConfirmationPage from './pages/patient/confirmationPage.jsx'
import PatientProfile from './pages/patient/profile.jsx'
import PatientHistory from './pages/patient/History.jsx'

// Doctor Flow Imports
import DoctorLayout from './pages/doctor/DoctorLayout.jsx'
import AppointmentDashboard from './pages/doctor/AppointmentDashboard.jsx'
import DoctorProfile from './pages/doctor/profile.jsx'
import History from './pages/doctor/History.jsx'

const AuthAwareHeader = ({ patientName, setPatientName, role, setRole }) => {
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    if (token && storedRole) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        setPatientName(payload.name || 'User');
      } catch {
        setPatientName('User');
      }
      setRole(storedRole);
    } else {
      setPatientName('');
      setRole('');
    }
  }, [location, setPatientName, setRole]);

  const handleLogout = () => {
    localStorage.clear();
    setPatientName('');
    setRole('');
  };

  if (['/', '/login', '/signup'].includes(location.pathname)) return null;

  const token = localStorage.getItem('token');
  const isAuthenticated = Boolean(token);

  return (
    <Header
      patientName={patientName}
      isAuthenticated={isAuthenticated}
      role={role}
      onLogout={handleLogout}
    />
  );
};

const AppContent = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/doctors" element={<DoctorListing />} />
    <Route path="/appointment/:doctorId" element={<AppointmentPage />} />
    <Route path="/confirmation" element={<ConfirmationPage />} />
    <Route path="/profile" element={<PatientProfile />} />
    <Route path="/history" element={<PatientHistory />} />
    <Route path="/doctor" element={<DoctorLayout />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<AppointmentDashboard />} />
      <Route path="profile" element={<DoctorProfile />} />
      <Route path="history" element={<History />} />
    </Route>
  </Routes>
);

const App = () => {
  const [patientName, setPatientName] = useState('');
  const [role, setRole] = useState('');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased">
      <AuthAwareHeader
        patientName={patientName}
        setPatientName={setPatientName}
        role={role}
        setRole={setRole}
      />
      <main className="flex-1">
        <AppContent />
      </main>
    </div>
  );
};

export default App;
