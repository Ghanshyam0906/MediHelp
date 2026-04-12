import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAppointmentsByDoctorId, updateAppointment } from '../../api/appointment.js';

const AppointmentDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('All Active'); // Today, This Week, All Active

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const doctorId = localStorage.getItem('userId');

        if (!doctorId || !token) {
          setError('Authentication required. Please log in again.');
          setLoading(false);
          return;
        }

        const data = await getAppointmentsByDoctorId(doctorId, token);
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        // 1. Transform and Filter Active
        const transformed = data.map((appt) => {
          const apptDate = new Date(appt.appointment_date);
          const [hours, minutes] = (appt.appointment_time || '00:00').split(':');
          apptDate.setHours(parseInt(hours), parseInt(minutes));
          
          const isExpired = (now - apptDate.getTime()) > oneDay;

          return {
            id: appt._id,
            patientName: appt.patient?.name || appt.patient_id?.name || 'Unknown Patient',
            age: appt.patient?.age || appt.patient_id?.age || 'N/A',
            gender: appt.patient?.gender || 'N/A',
            date: apptDate,
            dateStr: apptDate.toLocaleDateString('en-US'),
            time: appt.appointment_time,
            status: appt.status, 
            reason: appt.reason || 'No reason specified',
            isExpired,
            isActive: appt.status === 'scheduled' && !isExpired,
            appointmentData: appt,
          };
        }).filter(appt => appt.isActive);

        // 2. Safeguard: Filter Unique Appointments by ID
        const uniqueTransformed = transformed.filter(
          (item, index, self) => index === self.findIndex((t) => t.id === item.id)
        );

        // 3. Sort by nearest first
        const sorted = uniqueTransformed.sort((a, b) => a.date.getTime() - b.date.getTime());

        setAppointments(sorted);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const token = localStorage.getItem('token');
      const appointmentToUpdate = appointments.find((appt) => appt.id === id);
      if (!appointmentToUpdate) return;

      const updatedPayload = { 
        ...appointmentToUpdate.appointmentData, 
        status: newStatus 
      };

      await updateAppointment(id, updatedPayload, token);

      // Successfully updated -> Move to History (remove from Dashboard)
      setAppointments((prev) => prev.filter((appt) => appt.id !== id));
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to update appointment status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStartOfCurrentWeek = () => {
    const d = new Date();
    const day = d.getDay(); 
    const diff = d.getDate() - day; 
    return new Date(d.setDate(diff)).setHours(0, 0, 0, 0);
  };

  const filteredAppointments = useMemo(() => {
    let filtered = appointments.filter(appt => 
      appt.patientName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const todayStart = new Date().setHours(0, 0, 0, 0);
    const weekStart = getStartOfCurrentWeek();

    if (timeFilter === 'Today') {
      filtered = filtered.filter(appt => appt.date.getTime() >= todayStart);
    } else if (timeFilter === 'This Week') {
      filtered = filtered.filter(appt => appt.date.getTime() >= weekStart);
    }

    // Sort by nearest first
    return filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [appointments, searchQuery, timeFilter]);

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading dashboard...</div>;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-slate-800">Active Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">You have {appointments.length} active appointments scheduled</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Today: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
             </div>
             <button 
                onClick={() => navigate('/doctor/history')}
                className="bg-blue-600 text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
             >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                View History
             </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 flex items-center gap-3 text-sm font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        {/* Main Controls */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search patients..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {['All Active', 'This Week', 'Today'].map(f => (
              <button
                key={f}
                onClick={() => setTimeFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  timeFilter === f 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Appointment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAppointments.map((appt) => {
            const isToday = appt.dateStr === new Date().toLocaleDateString('en-US');
            const isUpdating = updatingId === appt.id;

            return (
              <div 
                key={appt.id} 
                className={`group relative bg-white p-6 rounded-[2rem] border-2 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 ${
                  isToday ? 'border-blue-500 shadow-xl shadow-blue-500/5' : 'border-slate-100 shadow-sm'
                }`}
              >
                {/* Decorative Elements */}
                <div className={`absolute top-0 right-0 w-32 h-32 opacity-[0.03] rounded-bl-full transition-all duration-500 group-hover:scale-110 ${isToday ? 'bg-blue-600' : 'bg-slate-400'}`} />

                {isToday && (
                  <div className="absolute -top-4 left-8 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/30 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    Today
                  </div>
                )}

                <div className="flex justify-between items-start mb-6 relative">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner transition-all duration-500 ${
                      isToday ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-800 group-hover:text-white'
                    }`}>
                      {appt.patientName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 tracking-tight text-lg group-hover:text-blue-600 transition-colors">{appt.patientName}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-500 rounded-md uppercase tracking-tight">{appt.gender}</span>
                        <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-500 rounded-md uppercase tracking-tight">{appt.age} YRS</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/doctor/history?patient=${appt.patientName}`)}
                    className="p-2.5 rounded-2xl text-slate-400 hover:bg-blue-50 hover:text-blue-600 hover:rotate-12 transition-all duration-300"
                    title="View Patient History"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </button>
                </div>

                <div className="space-y-5 relative">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2.5 bg-blue-50/80 px-4 py-3 rounded-2xl border border-blue-100/50">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-blue-600/60 uppercase tracking-widest leading-none mb-1">Time Slot</p>
                        <p className="text-sm font-black text-blue-700 leading-none">{appt.time}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-50/80 rounded-2xl border border-slate-200/50">
                    <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Scheduled Date</p>
                      <p className="text-sm font-bold text-slate-600 leading-none">{appt.dateStr}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50/20 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason for visit</p>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2 italic">
                      "{appt.reason}"
                    </p>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    {isUpdating ? (
                      <div className="w-full py-3 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-3 animate-pulse">
                         <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                         Updating Registry...
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleStatusChange(appt.id, 'completed')}
                          className="flex-3 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-500/20 flex-[2]"
                        >
                          Complete visit
                        </button>
                        <button 
                          onClick={() => handleStatusChange(appt.id, 'no-show')}
                          className="flex-1 py-3 bg-white border-2 border-amber-200 text-amber-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 hover:border-amber-400 transition-all active:scale-95 flex-[1.2]"
                        >
                          No-show
                        </button>
                        <button 
                          onClick={() => handleStatusChange(appt.id, 'cancelled')}
                          className="p-3 bg-white border-2 border-rose-100 text-rose-500 rounded-2xl hover:bg-rose-50 hover:border-rose-300 transition-all active:scale-95 group/cancel"
                          title="Cancel Appointment"
                        >
                          <svg className="w-5 h-5 group-hover/cancel:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAppointments.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Clear for now!</h2>
            <p className="text-slate-500 max-w-xs mx-auto mt-2 text-sm">No active appointments matching your criteria. Take a deep breath or check your history.</p>
            <button 
              onClick={() => {setSearchQuery(''); setTimeFilter('All Active');}}
              className="mt-8 text-blue-600 text-sm font-bold hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentDashboard;
