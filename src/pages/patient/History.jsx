import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAppointmentsByPatient } from '../../api/appointmentapi';

const PatientHistory = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [timeFilter, setTimeFilter] = useState('All'); // Today, This Week, All

    const decodeBase64Url = (str) => {
        try { return atob(str.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(str.length / 4) * 4, '=')); }
        catch (e) { return null; }
    };

    const decodeToken = (token) => {
        try { return JSON.parse(decodeBase64Url(token.split('.')[1]))?.id; }
        catch (e) { return null; }
    };

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const userId = decodeToken(token);

                if (!userId) {
                    setError('Authentication required');
                    return;
                }

                const data = await getAppointmentsByPatient(userId, token);
                const now = Date.now();
                const twentyFourHours = 24 * 60 * 60 * 1000;

                const transformed = data.map(appt => {
                    const apptDate = new Date(appt.appointment_date);
                    if (appt.appointment_time) {
                        const [hours, minutes] = appt.appointment_time.split(':');
                        apptDate.setHours(parseInt(hours), parseInt(minutes));
                    }
                    
                    const isHistory = (now - apptDate.getTime()) > twentyFourHours || appt.status === 'completed' || appt.status === 'cancelled';

                    return {
                        id: appt._id,
                        doctorName: `Dr. ${appt.doctor?.name || 'Unknown'}`,
                        specialization: appt.doctor?.specialization || 'General',
                        date: apptDate,
                        dateStr: apptDate.toLocaleDateString(),
                        time: appt.appointment_time,
                        status: appt.status,
                        reason: appt.reason || 'Routine Checkup',
                        isHistory
                    };
                }).filter(appt => appt.isHistory);

                setAppointments(transformed.sort((a, b) => b.date - a.date));
            } catch (err) {
                setError('Failed to fetch appointment history');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const filteredAppointments = useMemo(() => {
        let filtered = appointments.filter(appt =>
            appt.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const now = new Date();
        const todayStart = new Date(now.setHours(0, 0, 0, 0)).getTime();
        const weekStart = new Date().setDate(now.getDate() - now.getDay());

        if (timeFilter === 'Today') {
            filtered = filtered.filter(appt => appt.date.getTime() >= todayStart);
        } else if (timeFilter === 'This Week') {
            filtered = filtered.filter(appt => appt.date.getTime() >= weekStart);
        }

        return filtered;
    }, [appointments, searchQuery, timeFilter]);

    const groupedAppointments = useMemo(() => {
        const groups = { Today: [], Yesterday: [], Older: [] };
        const today = new Date().toLocaleDateString();
        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();

        filteredAppointments.forEach(appt => {
            if (appt.dateStr === today) groups.Today.push(appt);
            else if (appt.dateStr === yesterday) groups.Yesterday.push(appt);
            else groups.Older.push(appt);
        });
        return groups;
    }, [filteredAppointments]);

    if (loading) return <div className="layout-container py-12 text-center text-slate-500">Loading history...</div>;

    return (
        <div className="layout-container py-8 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="page-title text-3xl">Appointment History</h1>
                    <p className="text-slate-500 mt-1">Track your past medical visits and records</p>
                </div>
                <button onClick={() => navigate('/profile')} className="btn-secondary text-sm">
                    Back to Dashboard
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by doctor name..."
                        className="form-input pl-10 h-10 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    {['All', 'Today', 'This Week'].map(f => (
                        <button
                            key={f}
                            onClick={() => setTimeFilter(f)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFilter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="space-y-10">
                {Object.entries(groupedAppointments).map(([group, list]) => {
                    if (list.length === 0) return null;
                    return (
                        <div key={group}>
                            <div className="flex items-center gap-4 mb-4">
                                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{group}</h2>
                                <div className="h-px flex-1 bg-slate-200"></div>
                            </div>
                            <div className="grid gap-4">
                                {list.map(appt => (
                                    <div key={appt.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            {appt.doctorName.replace('Dr. ', '')[0]}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900">{appt.doctorName}</h3>
                                            <p className="text-xs text-slate-500 mb-1">{appt.specialization}</p>
                                            <p className="text-xs text-slate-400 italic">" {appt.reason} "</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <span className={`badge ${appt.status === 'completed' ? 'badge-green' : appt.status === 'cancelled' ? 'badge-red' : 'badge-slate'}`}>
                                                {appt.status}
                                            </span>
                                            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-2">
                                                <span>{appt.dateStr}</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                <span>{appt.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {filteredAppointments.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-medium">No appointments found for the selected filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientHistory;
