import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { createAppointment } from '../../api/appointmentapi';

const ConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { doctor, selectedTime, reason } = location.state || {};
  const [isBooking, setIsBooking] = useState(false);
  const [appointmentCreated, setAppointmentCreated] = useState(false);
  const [appointmentError, setAppointmentError] = useState(null);

  const decodeToken = (token) => {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=')));
      return decoded?.id;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const handleConfirmBooking = async () => {
    if (isBooking || appointmentCreated) return;
    
    console.log('--- TRIGGERING APPOINTMENT CREATION ---');
    setIsBooking(true);
    setAppointmentError(null);

    try {
      const token = localStorage.getItem('token');
      const patientId = decodeToken(token);

      if (!patientId) throw new Error('Patient ID not found. Please log in again.');

      const appointmentData = {
        id: `appt_${Date.now()}`,
        patient_id: patientId,
        doctor_id: doctor._id || doctor.id,
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: selectedTime,
        status: 'scheduled',
        reason: reason || '',
      };

      await createAppointment(appointmentData, token);
      console.log('Appointment created successfully!');
      setAppointmentCreated(true);
    } catch (err) {
      console.error('Error creating appointment:', err);
      setAppointmentError(err.message || 'Unable to confirm appointment at this time.');
    } finally {
      setIsBooking(false);
    }
  };

  if (!doctor || !selectedTime) {
    return <Navigate to="/doctors" />;
  }

  const bookingRef = doctor._id?.slice(-6).toUpperCase() || 'AB1234';
  const bookingDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="layout-container py-12 min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-lg fade-in-up">

        {/* Success / Status Banner */}
        <div className={`transition-all duration-500 rounded-2xl p-8 text-center text-white mb-4 shadow-lg ${
          appointmentCreated 
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
            : appointmentError ? 'bg-rose-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
        }`}>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {appointmentCreated ? (
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : appointmentError ? (
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-9 h-9 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <h1 className="text-2xl font-bold mb-1">
            {appointmentCreated ? 'Appointment Confirmed!' : appointmentError ? 'Booking Failed' : 'Confirm Your Visit'}
          </h1>
          <p className="text-white/80 text-sm">
            {appointmentCreated 
              ? `Your booking with ${doctor.name} has been scheduled.` 
              : `Review your details before scheduling with ${doctor.name}.`}
          </p>
        </div>

        {/* Error */}
        {appointmentError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3 text-sm font-medium mb-4 animate-shake">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {appointmentError}
          </div>
        )}

        {/* Details Card */}
        <div className="card shadow-md p-6 space-y-4">
          <h2 className="section-title mb-4">Booking Details</h2>

          {/* Doctor */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm">
              {doctor.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Doctor</p>
              <p className="font-bold text-slate-900">{doctor.name}</p>
              <p className="text-sm text-blue-600 font-medium">{doctor.specialization || 'Specialist'}</p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-400 font-medium mb-1">Time</p>
              <p className="font-bold text-slate-900">{selectedTime}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-400 font-medium mb-1">Date</p>
              <p className="font-bold text-slate-900 text-xs">{bookingDate}</p>
            </div>
          </div>

          {/* Reference */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Booking Reference</p>
              <p className="font-bold text-slate-900 font-mono tracking-widest uppercase">
                # {appointmentCreated ? bookingRef : 'PENDING'}
              </p>
            </div>
            <span className={`badge ${appointmentCreated ? 'badge-green' : appointmentError ? 'badge-rose' : 'badge-blue animate-pulse'}`}>
              {appointmentCreated ? 'Confirmed' : appointmentError ? 'Failed' : 'Ready'}
            </span>
          </div>

          {/* Reason */}
          {reason && (
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-400 font-medium mb-1">Reason for Visit</p>
              <p className="text-slate-700 text-sm leading-relaxed">{reason}</p>
            </div>
          )}

          {!appointmentCreated && !appointmentError && (
            <p className="text-xs text-slate-500 text-center pt-2">
              By clicking the button below, you agree to our clinical scheduling policy.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-6">
          {!appointmentCreated && (
            <button
              onClick={handleConfirmBooking}
              disabled={isBooking}
              className={`w-full py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95 ${
                isBooking 
                  ? 'bg-slate-100 text-slate-400 cursor-wait' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
              }`}
            >
              {isBooking ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                  Securing Slot...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Finalize Appointment
                </>
              )}
            </button>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/profile')}
              className={`justify-center py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 border-2 transition-all ${
                appointmentCreated 
                  ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                  : 'bg-white text-slate-600 border-slate-100 hover:border-slate-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Appointments
            </button>
            <button
              onClick={() => navigate('/doctors')}
              className="bg-white text-slate-600 border-2 border-slate-100 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:border-slate-200 transition-all"
            >
              {appointmentCreated ? 'Back to Doctors' : 'Change Doctor'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
