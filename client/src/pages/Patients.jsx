import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Plus, Search, UserPlus, Filter, X, Check, Eye, User, Calendar, 
  Building2, Activity, ShieldAlert
} from 'lucide-react';

const Patients = () => {
  const { user, isHospitalAdmin } = useAuth();
  
  // Data States
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter
  const [search, setSearch] = useState('');
  const [patientTypeFilter, setPatientTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null); // for viewing details
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [form, setForm] = useState({
    patientId: '',
    patientName: '',
    age: '',
    gender: 'Male',
    mobileNumber: '',
    patientType: 'Inpatient',
    department: 'General Medicine',
    doctorName: '',
    ward: '',
    bedNumber: '',
    admissionDate: '',
    dischargeDate: '',
    visitDate: '',
    diagnosis: '',
    treatment: '',
    status: 'Discharged'
  });

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (patientTypeFilter) queryParams.append('patientType', patientTypeFilter);
      if (statusFilter) queryParams.append('status', statusFilter);
      
      const data = await api.get(`/patient?${queryParams.toString()}`);
      setPatients(data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch patient registries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search, patientTypeFilter, statusFilter]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setForm({
      patientId: '',
      patientName: '',
      age: '',
      gender: 'Male',
      mobileNumber: '',
      patientType: 'Inpatient',
      department: 'General Medicine',
      doctorName: '',
      ward: '',
      bedNumber: '',
      admissionDate: '',
      dischargeDate: '',
      visitDate: '',
      diagnosis: '',
      treatment: '',
      status: 'Discharged'
    });
    setError('');
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    if (!form.patientId.trim() || !form.patientName.trim() || !form.mobileNumber.trim()) {
      setError('Please fill in required fields (ID, Name, Mobile).');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Validate conditional date rules before sending to backend
      const payload = { ...form };
      if (form.patientType === 'Inpatient') {
        delete payload.visitDate;
        if (!form.admissionDate || !form.dischargeDate) {
          throw new Error('Inpatients require both Admission Date and Discharge Date.');
        }
      } else {
        delete payload.admissionDate;
        delete payload.dischargeDate;
        delete payload.ward;
        delete payload.bedNumber;
        if (!form.visitDate) {
          throw new Error('Outpatients require a Visit Date.');
        }
      }

      await api.post('/patient', payload);
      setIsModalOpen(false);
      fetchPatients();
      alert('Patient stay record registered successfully!');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to register patient record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-150 pb-5 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Patient Stays & Visits Registry</h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Browse admissions, confirm discharge status, and register stays to authorize feedback access.
          </p>
        </div>

        {isHospitalAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-hospital-600 hover:bg-hospital-700 text-white px-5 py-3 text-xs font-bold shadow-lg shadow-hospital-600/10 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Register Stay / Visit</span>
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute inset-y-0 left-0 my-auto ml-4 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Patient ID, Name, Doctor, Department..."
            className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-hospital-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:w-80">
          <select
            value={patientTypeFilter}
            onChange={(e) => setPatientTypeFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white py-3 px-3 text-xs font-semibold text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350"
          >
            <option value="">All Types</option>
            <option value="Inpatient">Inpatient</option>
            <option value="Outpatient">Outpatient</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white py-3 px-3 text-xs font-semibold text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350"
          >
            <option value="">All Statuses</option>
            <option value="Admitted">Admitted</option>
            <option value="Discharged">Discharged</option>
          </select>
        </div>
      </div>

      {/* Registry Table */}
      <div className="rounded-3xl border border-gray-200/50 bg-white shadow-md dark:border-slate-800/60 dark:bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800/80 dark:bg-slate-900/30">
                <th className="py-4 px-6">Patient ID / Name</th>
                <th className="py-4 px-6">Classification</th>
                <th className="py-4 px-6">Dept / Doctor</th>
                <th className="py-4 px-6">Date Details</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Review State</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-semibold text-slate-650 dark:divide-slate-800/60 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">Loading registries...</td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">No patient stays registered matching search.</td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/5">
                    <td className="py-4.5 px-6">
                      <p className="font-bold text-slate-900 dark:text-white">{p.patientName}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">{p.patientId} | Age {p.age} ({p.gender})</p>
                    </td>
                    <td className="py-4.5 px-6">
                      <span className={`
                        inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide
                        ${p.patientType === 'Inpatient' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400' : 'bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400'}
                      `}>
                        {p.patientType}
                      </span>
                    </td>
                    <td className="py-4.5 px-6">
                      <p className="text-slate-805 dark:text-slate-200">{p.department}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Dr. {p.doctorName}</p>
                    </td>
                    <td className="py-4.5 px-6 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      {p.patientType === 'Inpatient' ? (
                        <p>{new Date(p.admissionDate).toLocaleDateString()} to {new Date(p.dischargeDate).toLocaleDateString()}</p>
                      ) : (
                        <p>Visited: {new Date(p.visitDate).toLocaleDateString()}</p>
                      )}
                    </td>
                    <td className="py-4.5 px-6">
                      <span className={`
                        inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold
                        ${p.status === 'Discharged' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'}
                      `}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4.5 px-6">
                      <span className={`
                        inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold
                        ${p.reviewSubmitted ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}
                      `}>
                        {p.reviewSubmitted ? 'Submitted' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 text-right">
                      <button
                        onClick={() => setSelectedPatient(p)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        title="View Metadata"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTER PATIENT STAY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800/80 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4.5 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-hospital-600 dark:text-hospital-450" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Register Stay / Outpatient Visit
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddPatient} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {error && (
                <div className="rounded-2xl bg-red-50 p-4 font-semibold text-red-750 border border-red-200/40">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5">Patient ID (Medical Reg No.) *</label>
                  <input
                    type="text"
                    name="patientId"
                    value={form.patientId}
                    onChange={handleInputChange}
                    placeholder="e.g. P108"
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-800 outline-none focus:border-hospital-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5">Patient Name *</label>
                  <input
                    type="text"
                    name="patientName"
                    value={form.patientName}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-800 outline-none focus:border-hospital-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5">Age *</label>
                  <input
                    type="number"
                    name="age"
                    value={form.age}
                    onChange={handleInputChange}
                    placeholder="e.g. 35"
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-800 outline-none focus:border-hospital-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5">Gender *</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-800 outline-none focus:border-hospital-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5">Mobile Number *</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={form.mobileNumber}
                    onChange={handleInputChange}
                    placeholder="Enter 10 digits"
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-800 outline-none focus:border-hospital-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5">Stay Type *</label>
                  <select
                    name="patientType"
                    value={form.patientType}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-800 outline-none focus:border-hospital-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Inpatient">Inpatient Stay</option>
                    <option value="Outpatient">Outpatient Visit</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5">Department *</label>
                  <select
                    name="department"
                    value={form.department}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-800 outline-none focus:border-hospital-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="General Medicine">General Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Gynaecology">Gynaecology</option>
                    <option value="Gastroenterology">Gastroenterology</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-355 mb-1.5">Consulting Doctor Name *</label>
                  <input
                    type="text"
                    name="doctorName"
                    value={form.doctorName}
                    onChange={handleInputChange}
                    placeholder="e.g. Dr. Prasad"
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-800 outline-none focus:border-hospital-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Conditional Stay Dates & Rooms */}
              {form.patientType === 'Inpatient' ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 border-t border-gray-50 pt-4 dark:border-slate-800">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5">Ward / ICU Room</label>
                    <input
                      type="text"
                      name="ward"
                      value={form.ward}
                      onChange={handleInputChange}
                      placeholder="e.g. Ward A"
                      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-800 outline-none focus:border-hospital-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5">Bed Number</label>
                    <input
                      type="text"
                      name="bedNumber"
                      value={form.bedNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. Bed 08"
                      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-800 outline-none focus:border-hospital-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5">Admission Date *</label>
                    <input
                      type="date"
                      name="admissionDate"
                      value={form.admissionDate}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-850 outline-none focus:border-hospital-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5">Discharge Date *</label>
                    <input
                      type="date"
                      name="dischargeDate"
                      value={form.dischargeDate}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-850 outline-none focus:border-hospital-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-gray-50 pt-4 dark:border-slate-800">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5">Visit Date *</label>
                    <input
                      type="date"
                      name="visitDate"
                      value={form.visitDate}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-855 outline-none focus:border-hospital-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-gray-50 pt-4 dark:border-slate-800">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5">Medical Diagnosis</label>
                  <input
                    type="text"
                    name="diagnosis"
                    value={form.diagnosis}
                    onChange={handleInputChange}
                    placeholder="e.g. Mild Hypertension"
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-800 outline-none focus:border-hospital-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-355 mb-1.5">Treatment Given</label>
                  <input
                    type="text"
                    name="treatment"
                    value={form.treatment}
                    onChange={handleInputChange}
                    placeholder="e.g. Prescribed Medications & Rest"
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-800 outline-none focus:border-hospital-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5">Admission Status *</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-800 outline-none focus:border-hospital-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Admitted">Admitted</option>
                    <option value="Discharged">Discharged</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-5 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-hospital-600 px-6 py-2.5 font-bold text-white shadow-lg hover:bg-hospital-700 disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Register stay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* METADATA VIEW DETAILS MODAL */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800/80 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4.5 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-hospital-600 bg-hospital-50 px-2 py-0.5 rounded dark:bg-hospital-950/20 dark:text-hospital-450">
                  {selectedPatient.patientId}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  Stay Registration Details
                </h3>
              </div>
              <button 
                onClick={() => setSelectedPatient(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs font-semibold text-slate-600 dark:text-slate-350">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Patient Name</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{selectedPatient.patientName}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Mobile Number</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{selectedPatient.mobileNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-gray-50 pt-4 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Age / Gender</span>
                  <p className="text-slate-800 dark:text-slate-200 mt-0.5">{selectedPatient.age} years / {selectedPatient.gender}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Stay Classification</span>
                  <p className="text-slate-800 dark:text-slate-200 mt-0.5">{selectedPatient.patientType}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Stay Status</span>
                  <p className="text-slate-800 dark:text-slate-200 mt-0.5">{selectedPatient.status}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-4 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Admitted Department</span>
                  <p className="text-slate-800 dark:text-slate-200 mt-0.5">{selectedPatient.department}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Consulting Doctor</span>
                  <p className="text-slate-800 dark:text-slate-200 mt-0.5">Dr. {selectedPatient.doctorName}</p>
                </div>
              </div>

              {selectedPatient.patientType === 'Inpatient' ? (
                <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-4 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Ward & Bed No.</span>
                    <p className="text-slate-800 dark:text-slate-200 mt-0.5">
                      {selectedPatient.ward || 'N/A'} / {selectedPatient.bedNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Stay Duration</span>
                    <p className="text-slate-800 dark:text-slate-200 mt-0.5">
                      {new Date(selectedPatient.admissionDate).toLocaleDateString()} to {new Date(selectedPatient.dischargeDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-4 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Visit Date</span>
                    <p className="text-slate-800 dark:text-slate-200 mt-0.5">
                      {new Date(selectedPatient.visitDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-4 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Diagnosis</span>
                  <p className="text-slate-800 dark:text-slate-200 mt-0.5">{selectedPatient.diagnosis || 'None logged'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Treatment</span>
                  <p className="text-slate-800 dark:text-slate-200 mt-0.5">{selectedPatient.treatment || 'None logged'}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 px-6 py-4 dark:border-slate-800 text-right">
              <button
                onClick={() => setSelectedPatient(null)}
                className="rounded-xl bg-slate-900 px-5 py-2 font-bold text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
