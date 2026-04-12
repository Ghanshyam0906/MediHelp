import React, { useState, useEffect } from 'react';
import { getPatientById } from '../../api/patientapi';
import { getAppointmentsByPatient } from '../../api/appointmentapi';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [patientData, setPatientData] = useState({
    id: '', name: '', email: '', contactNumber: '', age: '', gender: '', address: '',
  });
  const [patientName, setPatientName] = useState('');
  const [isPatientAuthenticated, setIsPatientAuthenticated] = useState(false);
  const [bookedAppointments, setBookedAppointments] = useState([]);

  const decodeBase64Url = (str) => {
    try { return atob(str.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(str.length / 4) * 4, '=')); }
    catch (e) { return null; }
  };

  const decodeToken = (token) => {
    try { return JSON.parse(decodeBase64Url(token.split('.')[1]))?.id; }
    catch (e) { return null; }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      setIsPatientAuthenticated(Boolean(token && role === 'patient'));

      if (token && role === 'patient') {
        const userId = decodeToken(token);
        if (userId) {
          try {
            const data = await getPatientById(userId, token);
            setPatientData({
              id: data.id || data._id, name: data.name || '', email: data.email || '',
              contactNumber: data.contactNumber || '', age: data.age || '',
              gender: data.gender || '', address: data.address || '',
            });
            setPatientName(data.name || 'Patient');
          } catch (err) {
            console.error('Error fetching patient data:', err);
          }

          try {
            const appointments = await getAppointmentsByPatient(userId, token);
            
            // Safety Layer: Filter unique appointments to prevent duplicate rendering
            const uniqueAppointments = (appointments || []).filter(
              (item, index, self) => index === self.findIndex((t) => (t._id || t.id) === (item._id || item.id))
            );

            const now = Date.now();
            const twentyFourHours = 24 * 60 * 60 * 1000;

            const transformedAppointments = uniqueAppointments.map((appt) => {
              const apptDate = new Date(appt.appointment_date);
              if (appt.appointment_time) {
                const [hours, minutes] = appt.appointment_time.split(':');
                apptDate.setHours(parseInt(hours), parseInt(minutes));
              }

              return {
                id: appt._id,
                doctorName: `Dr. ${appt.doctor?.name || 'Unknown'}`,
                specialization: appt.doctor?.specialization || 'Unknown',
                date: apptDate,
                dateStr: appt.appointment_date ? new Date(appt.appointment_date).toISOString().split('T')[0] : 'N/A',
                timeSlot: appt.appointment_time,
                status: appt.status === 'scheduled' ? 'Upcoming' : (appt.status === 'completed' ? 'Completed' : appt.status),
                reason: appt.reason || 'Regular Checkup'
              };
            });

            // Dashboard shows appointments from now-24h into future, if not completed/cancelled
            const dashboardAppointments = transformedAppointments
              .filter(appt => (appt.date.getTime() > now - twentyFourHours) && appt.status !== 'Completed' && appt.status !== 'Cancelled' && appt.status !== 'cancelled' && appt.status !== 'completed')
              .sort((a, b) => a.date - b.date);

            setBookedAppointments(dashboardAppointments);
          } catch (err) {
            console.error('Error fetching appointments:', err);
            setBookedAppointments([]);
          }
        }
      }
    };
    fetchProfileData();
  }, []);

  const handleChange = (e) => setPatientData({ ...patientData, [e.target.name]: e.target.value });

  const handleSave = () => {
    setIsEditing(false);
    // TODO: Connect to backend to save data
  };

  const STATUS_STYLES = {
    Upcoming:  'badge-blue',
    Completed: 'badge-green',
    Cancelled: 'badge-red',
    Pending:   'badge-yellow',
  };

  return (
    <div className="layout-container py-8">

      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
            {(patientName || 'P')[0].toUpperCase()}
          </div>
          <div>
            <h1 className="page-title">Hello, {patientName || 'Patient'}</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage your profile and appointments</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/doctors')}
          className="btn-primary text-sm self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Find Doctor
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Profile Panel */}
        <div className="w-full lg:w-5/12 xl:w-1/3">
          <div className="card p-6 h-full">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h2 className="section-title">Your Profile</h2>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="btn-secondary text-xs py-2 px-3">
                  Edit
                </button>
              ) : (
                <button onClick={handleSave} className="btn-primary text-xs py-2 px-3">
                  Save
                </button>
              )}
            </div>

            <div className="space-y-4">

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Patient ID</p>
                <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 font-mono text-xs font-semibold text-blue-700 truncate">
                  # {patientData.id || '—'}
                </div>
              </div>

              {[
                { label: 'Full Name', name: 'name', type: 'text' },
                { label: 'Email', name: 'email', type: 'email' },
                { label: 'Contact Number', name: 'contactNumber', type: 'text' },
                { label: 'Address', name: 'address', type: 'text' },
              ].map(({ label, name, type }) => (
                <div key={name}>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
                  {isEditing ? (
                    <input
                      type={type}
                      name={name}
                      className="form-input text-sm"
                      value={patientData[name]}
                      onChange={handleChange}
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-800">{patientData[name] || '—'}</p>
                  )}
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Age</p>
                  {isEditing ? (
                    <input type="number" name="age" className="form-input text-sm" value={patientData.age} onChange={handleChange} />
                  ) : (
                    <p className="text-sm font-medium text-slate-800">{patientData.age || '—'}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Gender</p>
                  {isEditing ? (
                    <select name="gender" className="form-input text-sm" value={patientData.gender} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <p className="text-sm font-medium text-slate-800 capitalize">{patientData.gender || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments Feed */}
        <div className="flex-1">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
              <h2 className="section-title">Active Appointments</h2>
              <button 
                onClick={() => navigate('/history')}
                className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1"
              >
                View History
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>

            {bookedAppointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 bg-blue-50 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-700 mb-1">All caught up!</h3>
                <p className="text-sm text-slate-500 mb-4 max-w-xs mx-auto">You have no upcoming appointments scheduled at the moment.</p>
                <button onClick={() => navigate('/doctors')} className="btn-primary text-sm shadow-lg shadow-blue-100">
                  Book a Visit
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookedAppointments.map((appt) => {
                  const statusClass = STATUS_STYLES[appt.status] || 'badge-slate';
                  const isToday = new Date().toDateString() === appt.date.toDateString();
                  
                  return (
                    <div
                      key={appt.id}
                      className={`flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border transition-all duration-300 ${
                        isToday ? 'border-blue-200 bg-blue-50/50 shadow-sm' : 'border-slate-100 hover:border-blue-100 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        isToday ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-410'
                      }`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-bold text-slate-900 truncate">{appt.doctorName}</p>
                          {isToday && <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter">Today</span>}
                        </div>
                        <p className="text-xs text-slate-500 mb-2">{appt.specialization}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                            {appt.dateStr}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            {appt.timeSlot}
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
                        <span className={`badge ${statusClass}`}>{appt.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;