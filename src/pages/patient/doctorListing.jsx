import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDoctors } from '../../api/doctorapi';
import { getPatientById } from '../../api/patientapi';

export const DUMMY_DOCTORS = [
  { id: 1, name: 'Dr. Sarah Jenkins', age: 42, contact: '+1-555-0192', experience: 12, specialization: 'Cardiologist', availableTimes: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
  { id: 2, name: 'Dr. Michael Chen', age: 38, contact: '+1-555-8834', experience: 8, specialization: 'Dermatologist', availableTimes: ['10:00 AM', '01:00 PM', '03:30 PM'] },
];

const DoctorListing = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [doctorsList, setDoctorsList] = useState(DUMMY_DOCTORS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const data = await getAllDoctors();
        if (Array.isArray(data)) setDoctorsList(data);
        else if (data.data && Array.isArray(data.data)) setDoctorsList(data.data);
        else if (data.doctors && Array.isArray(data.doctors)) setDoctorsList(data.doctors);
      } catch (err) {
        setError("Operating with offline directory.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filteredDoctors = doctorsList.filter(doc => {
    const query = searchQuery.toLowerCase();
    return (doc.specialization?.toLowerCase() || '').includes(query) || (doc.name?.toLowerCase() || '').includes(query);
  });

  const parseSlotToMinutes = (timeString) => {
    if (!timeString) return Infinity;
    const [time, meridiem] = timeString.split(' ');
    const [hour, minute] = time.split(':').map(Number);
    return (hour === 12 ? (meridiem === 'AM' ? 0 : 12) : (meridiem === 'PM' ? hour + 12 : hour)) * 60 + minute;
  };

  const nextAvailable = doctorsList.map(doc => {
    const slots = doc.availableTimes || doc.timeslots || doc.availability?.availabletimeslot || [];
    const nextSlot = slots.filter(Boolean).sort((a, b) => parseSlotToMinutes(a) - parseSlotToMinutes(b))[0];
    return { doc, nextSlot };
  }).filter(({ nextSlot }) => nextSlot).sort((a, b) => parseSlotToMinutes(a.nextSlot) - parseSlotToMinutes(b.nextSlot))[0];

  const SPECIALIZATION_COLORS = {
    'Cardiologist': 'bg-red-50 text-red-700 border-red-100',
    'Dermatologist': 'bg-orange-50 text-orange-700 border-orange-100',
    'Pediatrician': 'bg-green-50 text-green-700 border-green-100',
    'Neurologist': 'bg-purple-50 text-purple-700 border-purple-100',
    'General Physician': 'bg-blue-50 text-blue-700 border-blue-100',
    'Orthopedist': 'bg-cyan-50 text-cyan-700 border-cyan-100',
  };

  return (
    <div className="layout-container py-8">

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="page-title">Find a Doctor</h1>
        <p className="text-sm text-slate-500 mt-1">
          {loading ? 'Loading...' : `${filteredDoctors.length} specialist${filteredDoctors.length !== 1 ? 's' : ''} available`}
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search by name or specialty (e.g. Cardiologist)..."
          className="form-input pl-11 py-3"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm font-medium">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Quick Pick Banner */}
      {nextAvailable && !searchQuery && (
        <div className="mb-6 card border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-0.5">Next Available</p>
              <p className="font-semibold text-slate-900 truncate">
                {nextAvailable.doc.name}
                <span className="text-slate-500 font-normal ml-2">— {nextAvailable.doc.specialization}</span>
              </p>
              <p className="text-sm text-slate-600">First slot: <span className="font-semibold text-slate-900">{nextAvailable.nextSlot}</span></p>
            </div>
            <button
              onClick={() => navigate(`/appointment/${nextAvailable.doc._id || nextAvailable.doc.id}`, { state: { fetchedDoc: nextAvailable.doc } })}
              className="btn-primary text-sm whitespace-nowrap"
            >
              Book Now
            </button>
          </div>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-20 mb-4" />
              <div className="flex gap-4 mb-4">
                <div className="w-14 h-14 bg-slate-200 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
              <div className="h-10 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <>
          {filteredDoctors.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {filteredDoctors.map((doc) => {
                const totalAvailable = doc.availability?.availabletimeslot?.length || doc.availableTimes?.length || doc.timeslots?.length || 0;
                const totalBooked = doc.availability?.bookedtimeslots?.length || 0;
                const specColor = SPECIALIZATION_COLORS[doc.specialization] || 'bg-slate-50 text-slate-700 border-slate-100';
                const initial = doc.name.charAt(0).toUpperCase();
                const isAvailable = totalAvailable > 0;

                return (
                  <article key={doc.id || doc._id} className={`card-hover p-6 flex flex-col fade-in-up transition-all duration-300 ${!isAvailable ? 'opacity-75 grayscale-[0.5] shadow-inner bg-slate-50/50' : ''}`}>

                    {/* Specialty & Status badge */}
                    <div className="flex justify-between items-start mb-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${specColor}`}>
                        {doc.specialization}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                        {isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>

                    {/* Doctor Info */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-14 h-14 flex-shrink-0 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md transition-transform group-hover:scale-105 ${isAvailable ? 'bg-gradient-to-br from-blue-500 to-cyan-500' : 'bg-slate-400'}`}>
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 truncate text-lg">{doc.name}</h3>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                          <span className="font-medium">{doc.experience} Years Exp</span>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1 group">
                            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {doc.contact_info || doc.contact || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Slot Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6 py-3 border-y border-slate-100">
                      <div className="text-center">
                        <p className={`text-xl font-black ${isAvailable ? 'text-blue-600' : 'text-slate-400'}`}>{totalAvailable}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Slots Left</p>
                      </div>
                      <div className="text-center border-l border-slate-100">
                        <p className="text-xl font-black text-slate-700">{totalBooked}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Booked Today</p>
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => isAvailable && navigate(`/appointment/${doc._id || doc.id}`, { state: { fetchedDoc: doc } })}
                      disabled={!isAvailable}
                      className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                        isAvailable 
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100' 
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isAvailable ? 'Book Appointment' : 'Fully Booked'}
                      {isAvailable && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      )}
                    </button>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 mb-1">No doctors found</h3>
              <p className="text-sm text-slate-500 mb-4">Try a different name or specialty</p>
              <button onClick={() => setSearchQuery('')} className="btn-secondary text-sm">
                Clear Search
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DoctorListing;