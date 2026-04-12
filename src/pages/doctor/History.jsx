import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAppointmentsByDoctorId } from '../../api/appointment.js';

const History = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('patient') || '');
  const [timeFilter, setTimeFilter] = useState('All time'); // Today, This Week, All time

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const doctorId = localStorage.getItem('userId');

        if (!doctorId || !token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const data = await getAppointmentsByDoctorId(doctorId, token);
        
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        // Filtering logic for History:
        // 1. Status is NOT 'scheduled'
        // 2. OR appointment is more than 24 hours old
        const transformed = data.map(appt => {
          const apptDate = new Date(appt.appointment_date);
          const [hours, minutes] = appt.appointment_time.split(':');
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
            isHistory: appt.status !== 'scheduled' || isExpired
          };
        }).filter(appt => appt.isHistory);

        setAppointments(transformed);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch history');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Sunday-start week logic
  const getStartOfCurrentWeek = () => {
    const d = new Date();
    const day = d.getDay(); // Sunday is 0
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

    // Default Sort: Newest first for History
    return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [appointments, searchQuery, timeFilter]);

  const groupedAppointments = useMemo(() => {
    const today = new Date().toLocaleDateString('en-US');
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toLocaleDateString('en-US');

    const groups = {
      Today: [],
      Yesterday: [],
      Older: []
    };

    filteredAppointments.forEach(appt => {
      const apptDateStr = appt.dateStr;
      if (apptDateStr === today) groups.Today.push(appt);
      else if (apptDateStr === yesterday) groups.Yesterday.push(appt);
      else groups.Older.push(appt);
    });

    return groups;
  }, [filteredAppointments]);

  const stats = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, rate };
  }, [appointments]);

  if (loading) return <div className="p-8 animate-pulse text-center text-slate-500">Loading history...</div>;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Appointment History</h1>
          <p className="text-sm text-slate-500">View and analyze your past patient interactions</p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-4">
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="font-bold text-lg">{stats.total}</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Resolved</p>
              <p className="text-xs font-bold text-slate-700">Total Cases</p>
            </div>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="font-bold text-lg">{stats.rate}%</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Success</p>
              <p className="text-xs font-bold text-slate-700">Completion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Filter by patient name..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['All time', 'This Week', 'Today'].map(f => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                timeFilter === f 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {Object.entries(groupedAppointments).map(([group, list]) => {
          if (list.length === 0) return null;
          return (
            <div key={group} className="space-y-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{group}</h2>
                <div className="h-[1px] flex-1 bg-slate-100" />
                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{list.length}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map(appt => (
                  <div key={appt.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          {appt.patientName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{appt.patientName}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{appt.gender} • Age {appt.age}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight ${
                        appt.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                        appt.status === 'cancelled' ? 'bg-red-50 text-red-500' :
                        appt.status === 'no-show' ? 'bg-amber-50 text-amber-600' :
                        'bg-slate-100 text-slate-400'
                      }`}>
                        {appt.status}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                          <span className="font-medium">{appt.dateStr}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          <span className="font-medium">{appt.time}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50/50 rounded-xl">
                        <p className="text-[11px] text-slate-500 italic leading-relaxed">
                          "{appt.reason}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filteredAppointments.length === 0 && (
          <div className="py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-800">No records found</h3>
            <p className="text-sm text-slate-410">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
