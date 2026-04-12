import React, { useState, useEffect } from 'react';
import { getDoctorById, updateDoctor } from '../../api/doctorapi.js';

const TIMESLOT_OPTIONS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM',
];

const Field = ({ label, name, value, isEditing, onChange, type = 'text', icon }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
      {icon && <span className="text-blue-500">{icon}</span>}
      {label}
    </label>
    {isEditing ? (
      name === 'address' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={3}
          className="form-input focus:ring-4 focus:ring-blue-500/10 transition-all text-sm py-2 resize-none h-auto min-h-[80px]"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="form-input focus:ring-4 focus:ring-blue-500/10 transition-all text-sm h-11"
        />
      )
    ) : (
      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl group hover:border-blue-200 transition-colors">
        <p className="text-sm font-semibold text-slate-700 whitespace-pre-line">
          {value
            ? (name === 'experience' ? `${value} years` : value)
            : <span className="text-slate-300 font-normal italic">Not set</span>}
        </p>
      </div>
    )}
  </div>
);

const DoctorProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [doctorData, setDoctorData] = useState({
    doctorId: '',
    name: '',
    email: '',
    age: '',
    gender: '',
    contact_info: '',
    specialization: '',
    experience: '',
    address: '',
    isAvailable: false,
    timeslots: [],
  });

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const doctorId = localStorage.getItem('userId');

        if (!doctorId) {
          setError('Doctor ID not found. Please log in again.');
          setLoading(false);
          return;
        }

        if (!token) {
          setError('Authentication token not found. Please log in again.');
          setLoading(false);
          return;
        }

        const response = await getDoctorById(doctorId, token);
        const docData = response.doctor || response;

        setDoctorData({
          doctorId: docData._id || doctorId,
          name: docData.name || '',
          email: docData.email || '',
          age: docData.age || '',
          gender: docData.gender || '',
          contact_info: docData.contact_info || '',
          specialization: docData.specialization || '',
          experience: docData.experience || '',
          address: docData.address || '',
          isAvailable: Boolean(docData.timeslots && docData.timeslots.length),
          timeslots: docData.timeslots || [],
        });
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch doctor profile');
        console.error('Error fetching doctor profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, []);

  const handleChange = (e) => {
    setDoctorData({ ...doctorData, [e.target.name]: e.target.value });
  };

  const toggleTimeslot = (slot) => {
    setDoctorData((prev) => ({
      ...prev,
      timeslots: prev.timeslots.includes(slot)
        ? prev.timeslots.filter((s) => s !== slot)
        : [...prev.timeslots, slot],
    }));
  };

  const selectAllTimeslots = () => {
    setDoctorData((prev) => ({ ...prev, timeslots: [...TIMESLOT_OPTIONS] }));
  };

  const clearAllTimeslots = () => {
    setDoctorData((prev) => ({ ...prev, timeslots: [] }));
  };

  const toggleAvailability = () => {
    setDoctorData((prev) => ({
      ...prev,
      isAvailable: !prev.isAvailable,
      timeslots: prev.isAvailable ? [] : prev.timeslots.length ? prev.timeslots : ['09:00 AM'],
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const doctorId = localStorage.getItem('userId');

      if (!token || !doctorId) {
        setError('Authentication required. Please log in again.');
        return;
      }

      // Validation
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(doctorData.contact_info)) {
        setError('Contact number must be exactly 10 digits.');
        return;
      }

      const updateData = {
        name: doctorData.name,
        email: doctorData.email,
        age: Number(doctorData.age),
        gender: doctorData.gender,
        contact_info: doctorData.contact_info,
        specialization: doctorData.specialization,
        experience: Number(doctorData.experience),
        address: doctorData.address,
        timeslots: doctorData.isAvailable ? doctorData.timeslots.filter(Boolean) : [],
      };

      await updateDoctor(doctorId, updateData, token);

      setIsEditing(false);
      setError(null);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save doctor profile');
      console.error('Error saving doctor profile:', err);
    }
  };

  const ICON_USER = (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
  );
  const ICON_MAIL = (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
  );
  const ICON_PHONE = (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
  );
  const ICON_LOCATION = (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  );
  const ICON_CALENDAR = (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
  );
  const ICON_GENDER = (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 11a5 5 0 100-10 5 5 0 000 10zm0 0v10m-5-4l5 4 5-4" /></svg>
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 space-y-8 bg-slate-50/50">

        {/* Header */}
        <div className="flex items-end justify-between border-b border-slate-200 pb-6">
          <div>
            <span className="text-blue-600 font-bold uppercase tracking-widest text-[10px]">MediHelp Portal</span>
            <h1 className="text-3xl font-black text-slate-900 mt-1 uppercase">Doctor Profile</h1>
            <p className="text-sm text-slate-500 font-medium">Manage your clinical information and digital presence</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsEditing((prev) => !prev)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${isEditing ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 shadow-sm'}`}
            >
              {isEditing ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  Cancel
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 00-2 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Edit Profile
                </>
              )}
            </button>
            {isEditing && (
              <button type="button" onClick={handleSave} className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all animate-in zoom-in-95">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Save Changes
              </button>
            )}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center gap-3 text-red-700 text-sm font-semibold shadow-sm animate-in slide-in-from-top-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl flex items-center gap-3 text-emerald-700 text-sm font-semibold shadow-sm animate-in slide-in-from-top-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {success}
          </div>
        )}

        <div className="grid gap-8">

          {/* Personal Info Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Personal Information
              </h2>
            </div>

            <div className="p-8">
              {loading ? (
                <div className="grid md:grid-cols-2 gap-8 animate-pulse">
                  {[...Array(6)].map((_, i) => (
                    <div key={i}>
                      <div className="h-3 bg-slate-100 rounded w-20 mb-3" />
                      <div className="h-11 bg-slate-50 rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 gap-3">
                    <div>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Digital Registry ID</p>
                      <p className="font-mono text-sm font-bold text-slate-700"># {doctorData.doctorId || 'UNREGISTERED'}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-bold text-[10px] uppercase">Active Status</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                    <Field label="Full Name" name="name" value={doctorData.name} isEditing={isEditing} onChange={handleChange} icon={ICON_USER} />
                    <Field label="Email Address" name="email" value={doctorData.email} isEditing={isEditing} onChange={handleChange} type="email" icon={ICON_MAIL} />
                    <Field label="Contact Number" name="contact_info" value={doctorData.contact_info} isEditing={isEditing} onChange={handleChange} type="tel" icon={ICON_PHONE} />
                    <Field label="Home Address" name="address" value={doctorData.address} isEditing={isEditing} onChange={handleChange} icon={ICON_LOCATION} />
                    <Field label="Age" name="age" value={doctorData.age} isEditing={isEditing} onChange={handleChange} type="number" icon={ICON_CALENDAR} />
                    
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="text-blue-500">{ICON_GENDER}</span>
                        Gender
                      </label>
                      {isEditing ? (
                        <select 
                          name="gender" 
                          value={doctorData.gender} 
                          onChange={handleChange} 
                          className="form-input focus:ring-4 focus:ring-blue-500/10 transition-all text-sm h-11"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      ) : (
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl group hover:border-blue-200 transition-colors capitalize">
                          <p className="text-sm font-semibold text-slate-700">
                            {doctorData.gender || <span className="text-slate-300 font-normal italic">Not specified</span>}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Practice Settings Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                Practice & Availability
              </h2>
            </div>

            <div className="p-8 space-y-10">
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                <Field label="Specialization" name="specialization" value={doctorData.specialization} isEditing={isEditing} onChange={handleChange} />
                <Field label="Years of Experience" name="experience" value={doctorData.experience} isEditing={isEditing} onChange={handleChange} type="number" />
              </div>

              {/* Availability Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Availability</p>
                  <p className="text-xs text-slate-500 mt-0.5">Toggle your booking status</p>
                </div>
                <button
                  type="button"
                  onClick={toggleAvailability}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    doctorData.isAvailable
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {doctorData.isAvailable ? '● Available' : '○ Unavailable'}
                </button>
              </div>

              {/* Timeslots */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <label className="form-label">Available Timeslots</label>
                    <p className="text-xs text-slate-400">
                      {doctorData.timeslots.length > 0
                        ? `${doctorData.timeslots.length} slot${doctorData.timeslots.length !== 1 ? 's' : ''} selected`
                        : 'No slots selected'}
                    </p>
                  </div>
                  {isEditing && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={selectAllTimeslots}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors px-2 py-1 hover:bg-blue-50 rounded-lg"
                      >
                        Select All
                      </button>
                      <span className="text-slate-300 text-xs">|</span>
                      <button
                        type="button"
                        onClick={clearAllTimeslots}
                        className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors px-2 py-1 hover:bg-red-50 rounded-lg"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  /* Edit mode: toggle grid */
                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    {TIMESLOT_OPTIONS.map((slot) => {
                      const selected = doctorData.timeslots.includes(slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => toggleTimeslot(slot)}
                          className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 text-center ${
                            selected
                              ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-200'
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50'
                          }`}
                        >
                          {selected && (
                            <span className="inline-block w-1.5 h-1.5 bg-white rounded-full mr-1.5 align-middle" />
                          )}
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* View mode: pill list */
                  doctorData.timeslots.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-xl px-4 py-6 text-center text-sm text-slate-400">
                      No timeslots configured yet. Click <strong>Edit Profile</strong> to add some.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {doctorData.timeslots
                        .slice()
                        .sort()
                        .map((slot) => (
                          <span
                            key={slot}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-xs font-semibold text-blue-700"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {slot}
                          </span>
                        ))}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
