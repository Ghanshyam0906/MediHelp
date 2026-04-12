import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { DUMMY_DOCTORS } from './doctorListing';
import { getPatientById } from '../../api/patientapi';

const AppointmentPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [patientName, setPatientName] = useState('');
  const [isPatientAuthenticated, setIsPatientAuthenticated] = useState(false);

  const decodeBase64Url = (str) => {
    try { return atob(str.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(str.length / 4) * 4, '=')); }
    catch (e) { return null; }
  };

  const decodeToken = (token) => {
    try { return JSON.parse(decodeBase64Url(token.split('.')[1]))?.id; }
    catch (e) { return null; }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    setIsPatientAuthenticated(Boolean(token && role === 'patient'));
    if (token && role === 'patient') {
      const userId = decodeToken(token);
      if (userId) {
        getPatientById(userId, token).then(data => setPatientName(data.name || 'Patient')).catch(console.error);
      }
    }
  }, []);

  const doctor = location.state?.fetchedDoc || DUMMY_DOCTORS.find((d) => d.id === parseInt(doctorId)) || DUMMY_DOCTORS.find((d) => d.id === doctorId);

  if (!doctor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="card p-10 text-center max-w-sm w-full shadow-md">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="font-bold text-slate-900 mb-1">Doctor Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">This specialist is unavailable or doesn't exist.</p>
          <button onClick={() => navigate('/doctors')} className="btn-primary w-full">
            Return to Directory
          </button>
        </div>
      </div>
    );
  }

  const handleBooking = () => {
    if (!selectedTime) return;
    navigate('/confirmation', { state: { doctor, selectedTime, reason } });
  };

  const timeslots = doctor.availableTimes || doctor.timeslots || doctor.availability?.availabletimeslot || ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM'];

  return (
    <div className="layout-container py-8">

      {/* Back Nav */}
      <button
        onClick={() => navigate('/doctors')}
        className="btn-ghost mb-6 text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Doctors
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Doctor Info Sidebar */}
        <aside className="lg:col-span-1 space-y-4">

          {/* Doctor Card */}
          <div className="card p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-sm flex-shrink-0">
                {doctor.name.charAt(0)}
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-lg leading-tight">{doctor.name}</h1>
                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-100">
                  {doctor.specialization}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Experience</p>
                  <p className="font-semibold text-slate-800">{doctor.experience} years</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Contact</p>
                  <p className="font-semibold text-slate-800">{doctor.contact_info || doctor.contact || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Auth Status */}
          {isPatientAuthenticated && (
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                  {(patientName || '?')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Booking as</p>
                  <p className="font-semibold text-slate-900 text-sm truncate">{patientName}</p>
                </div>
                <button
                  onClick={() => navigate('/profile')}
                  className="ml-auto btn-ghost text-xs px-3 py-1.5"
                >
                  Profile
                </button>
              </div>
            </div>
          )}

          {!isPatientAuthenticated && (
            <div className="card p-4 bg-amber-50 border-amber-200">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-amber-800">Sign in required</p>
                  <p className="text-xs text-amber-700 mt-0.5">You need to be logged in to book.</p>
                  <button onClick={() => navigate('/login')} className="mt-2 text-xs font-semibold text-blue-600 hover:underline">
                    Go to login →
                  </button>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Booking Form */}
        <main className="lg:col-span-2 space-y-5">

          {/* Time Selection */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Choose a Time</h2>
              <span className="badge badge-blue">{timeslots.length} slots</span>
            </div>

            {timeslots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeslots.map((time, idx) => {
                  const isSelected = selectedTime === time;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      disabled={!isPatientAuthenticated}
                      className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-150 text-center ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-sm'
                          : !isPatientAuthenticated
                          ? 'bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-200'
                          : 'bg-slate-50 text-slate-700 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-semibold text-slate-600 mb-1">No Available Slots</p>
                <p className="text-sm text-slate-400 mb-4">This doctor has no open timeslots.</p>
                <button onClick={() => navigate('/doctors')} className="btn-secondary text-sm">
                  Find Another Doctor
                </button>
              </div>
            )}
          </div>

          {/* Reason for Visit */}
          <div className="card p-6">
            <h2 className="section-title mb-3">Reason for Visit <span className="text-slate-400 font-normal text-sm ml-1">(optional)</span></h2>
            <div className="relative">
              <textarea
                className="form-input resize-none min-h-[100px]"
                placeholder="Describe your symptoms or reason for visit..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
              />
              <span className="absolute bottom-3 right-3 text-xs text-slate-400">{reason.length}/500</span>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            className={`w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
              selectedTime && isPatientAuthenticated
                ? 'btn-primary py-4 text-base'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
            disabled={!selectedTime || !isPatientAuthenticated}
            onClick={handleBooking}
          >
            {isPatientAuthenticated ? (
              selectedTime ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Confirm {selectedTime} Appointment
                </>
              ) : 'Select a time slot to continue'
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Sign in to book an appointment
              </>
            )}
          </button>
        </main>
      </div>
    </div>
  );
};

export default AppointmentPage;
