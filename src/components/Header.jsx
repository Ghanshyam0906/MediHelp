import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = ({ patientName, isAuthenticated, role, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout?.();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="layout-container">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to={role === 'doctor' ? '/doctor/dashboard' : '/doctors'} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              Medi<span className="text-blue-600">Help</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {role !== 'doctor' && (
              <Link
                to="/doctors"
                className={`btn-ghost text-sm ${isActive('/doctors') ? 'bg-blue-50 text-blue-600 font-semibold' : ''}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find Doctors
              </Link>
            )}

            {role === 'doctor' && (
              <>
                <Link to="/doctor/dashboard" className={`btn-ghost text-sm ${isActive('/doctor/dashboard') ? 'bg-blue-50 text-blue-600 font-semibold' : ''}`}>
                  Dashboard
                </Link>
                <Link to="/doctor/profile" className={`btn-ghost text-sm ${isActive('/doctor/profile') ? 'bg-blue-50 text-blue-600 font-semibold' : ''}`}>
                  My Profile
                </Link>
              </>
            )}

            {role === 'patient' && (
              <Link
                to="/profile"
                className={`btn-ghost text-sm ${isActive('/profile') ? 'bg-blue-50 text-blue-600 font-semibold' : ''}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Profile
              </Link>
            )}
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600">
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">
                    {(patientName || '?')[0].toUpperCase()}
                  </div>
                  <span className="hidden lg:block">{patientName}</span>
                </span>
                <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-4">
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Login</Link>
                <Link to="/signup" className="btn-primary text-sm py-2">Sign Up</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden btn-ghost p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1 fade-in">
          {role !== 'doctor' && (
            <Link to="/doctors" onClick={() => setMenuOpen(false)} className="block btn-ghost w-full text-left text-sm">Find Doctors</Link>
          )}
          {role === 'patient' && (
            <Link to="/profile" onClick={() => setMenuOpen(false)} className="block btn-ghost w-full text-left text-sm">My Profile</Link>
          )}
          {role === 'doctor' && (
            <>
              <Link to="/doctor/dashboard" onClick={() => setMenuOpen(false)} className="block btn-ghost w-full text-left text-sm">Dashboard</Link>
              <Link to="/doctor/profile" onClick={() => setMenuOpen(false)} className="block btn-ghost w-full text-left text-sm">My Profile</Link>
            </>
          )}
          {isAuthenticated && (
            <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="block btn-ghost w-full text-left text-sm text-red-500">Logout</button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
