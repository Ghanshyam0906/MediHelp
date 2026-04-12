import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/authapi';

const TIMESLOT_OPTIONS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM',
];

const DOCTOR_SPECIALIZATIONS = [
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
  'Neurologist',
  'General Physician',
  'Orthopedist',
];

const Signup = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    contactNumber: '',
    age: '',
    gender: '',
    address: '',
    contactInfo: '',
    specialization: '',
    experience: '',
    timeslots: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRoleChange = (nextRole) => {
    setRole(nextRole);
    setFormData((prev) => ({
      ...prev,
      contactInfo: '',
      specialization: '',
      experience: '',
      timeslots: [],
      contactNumber: '',
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        role,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        age: Number(formData.age),
        gender: formData.gender,
        address: formData.address,
      };

      if (role === 'patient') {
        payload.contactNumber = formData.contactNumber;
      } else if (role === 'doctor') {
        payload.contact_info = formData.contactInfo;
        payload.specialization = formData.specialization;
        payload.experience = Number(formData.experience);
        payload.timeslots = formData.timeslots;
        payload.availability = { availabletimeslot: [], bookedtimeslots: [] };
      }

      await registerUser(payload);
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Signup failed. Please retry with valid data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-cyan-50 px-4 py-12">
      <div className="w-full max-w-2xl mx-auto fade-in-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl shadow-md mb-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Medi<span className="text-blue-600">Help</span>
          </h1>
        </div>

        {/* Card */}
        <div className="card shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Create your account</h2>
            <p className="text-sm text-slate-500 mt-1">Join MediHelp to get started</p>
          </div>

          {/* Role Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-6">
            {['patient', 'doctor'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleChange(r)}
                className={`py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 capitalize flex items-center justify-center gap-2 ${
                  role === r
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <svg className={`w-4 h-4 ${role === r ? 'text-blue-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {r === 'doctor' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  )}
                </svg>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={role === 'doctor' ? 'Dr. John Smith' : 'John Smith'}
                  className="form-input"
                  required
                />
              </div>

              {/* Email */}
              <div className="sm:col-span-2">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="form-input"
                  required
                />
              </div>

              {/* Password */}
              <div className="sm:col-span-2">
                <label className="form-label flex items-center justify-between">
                  <span>Password</span>
                  <span className="text-xs font-normal text-slate-400">8+ characters</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className="form-input pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="form-label">Age</label>
                <input
                  type="number"
                  name="age"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="25"
                  className="form-input"
                  required
                />
              </div>

              {/* Gender */}
              <div>
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Prefer not to say</option>
                </select>
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Health St, Wellness City"
                  className="form-input"
                  required
                />
              </div>

              {/* Patient: Phone */}
              {role === 'patient' && (
                <div className="sm:col-span-2">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className="form-input"
                    required
                  />
                </div>
              )}

              {/* Doctor fields */}
              {role === 'doctor' && (
                <>
                  <div className="sm:col-span-2">
                    <label className="form-label">Clinic Contact Info</label>
                    <input
                      type="text"
                      name="contactInfo"
                      value={formData.contactInfo}
                      onChange={handleChange}
                      placeholder="Clinic address or direct phone"
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Specialization</label>
                    <select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className="form-input"
                      required
                    >
                      <option value="">Choose specialty...</option>
                      {DOCTOR_SPECIALIZATIONS.map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Years of Experience</label>
                    <input
                      type="number"
                      name="experience"
                      min="0"
                      max="60"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="10"
                      className="form-input"
                      required
                    />
                  </div>

                  {/* Timeslots */}
                  <div className="sm:col-span-2">
                    <label className="form-label flex items-center justify-between">
                      <span>Available Timeslots</span>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {formData.timeslots.length} selected
                      </span>
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-40 overflow-y-auto">
                      {TIMESLOT_OPTIONS.map((slot) => {
                        const selected = formData.timeslots.includes(slot);
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => {
                              const next = selected
                                ? formData.timeslots.filter((s) => s !== slot)
                                : [...formData.timeslots, slot];
                              setFormData({ ...formData, timeslots: next });
                            }}
                            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 ${
                              selected
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-300 hover:text-blue-700'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Error / Success */}
            {error && (
              <div className="form-error">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="form-success">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                `Create ${role === 'patient' ? 'Patient' : 'Doctor'} Account`
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
