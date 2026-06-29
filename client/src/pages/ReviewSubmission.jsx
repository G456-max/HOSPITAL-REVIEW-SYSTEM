import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, CheckCircle, HeartHandshake, ShieldAlert, Star, User, Calendar, ShieldCheck
} from 'lucide-react';
import api from '../services/api';

const SURVEY_SECTIONS = [
  {
    sectionName: 'REGISTRATION PROCESS',
    colorClass: 'bg-blue-50 dark:bg-slate-900/60 text-hospital-700 dark:text-hospital-300',
    questions: [
      { key: 'registrationProcess', label: 'Efficiency & speed of the registration and admission process' }
    ]
  },
  {
    sectionName: 'EXPERIENCE AT HOSPITAL',
    colorClass: 'bg-sky-50 dark:bg-slate-900/40 text-hospital-700 dark:text-hospital-300',
    questions: [
      // Doctors
      { key: 'doctorListened', label: 'Doctor listened to your complaints patiently', subcat: 'Doctor Care' },
      { key: 'doctorExplained', label: 'Doctor explained the diagnosis and treatment plan clearly', subcat: 'Doctor Care' },
      { key: 'doctorSpentTime', label: 'Doctor spent adequate time examining and talking to you', subcat: 'Doctor Care' },
      { key: 'doctorBehaved', label: 'Doctor behaved politely and with empathy', subcat: 'Doctor Care' },
      { key: 'doctorConfidence', label: 'Doctor instilled confidence in you regarding your recovery', subcat: 'Doctor Care' },
      // Nursing Care
      { key: 'nursesPolite', label: 'Nurses behaved politely and respectfully', subcat: 'Nursing Care' },
      { key: 'nursesQuick', label: 'Nurses responded promptly when called', subcat: 'Nursing Care' },
      { key: 'nursesMedicinesTime', label: 'Nurses administered medicines and injections on time', subcat: 'Nursing Care' },
      { key: 'nursesPainManagement', label: 'Nurses managed your pain and discomfort effectively', subcat: 'Nursing Care' },
      { key: 'nursesOverallSupport', label: 'Overall support, warmth, and care shown by nursing staff', subcat: 'Nursing Care' },
      // Housekeeping & Hygiene
      { key: 'wardCleanliness', label: 'Cleanliness and sanitization of the ward/room', subcat: 'Housekeeping' },
      { key: 'bathroomCleanliness', label: 'Cleanliness and hygiene of the bathrooms', subcat: 'Housekeeping' },
      { key: 'bedCleanliness', label: 'Quality and cleanliness of bedsheets, linen, and pillows', subcat: 'Housekeeping' },
      { key: 'dustFreeEnvironment', label: 'Maintenance of a dust-free and quiet environment', subcat: 'Housekeeping' },
      { key: 'overallHygiene', label: 'Overall hygiene standards maintained in the inpatient wing', subcat: 'Housekeeping' },
      // Laboratory
      { key: 'sampleCollectionExperience', label: 'Sample collection experience (blood draw, comfort, hygiene)', subcat: 'Lab Services' },
      { key: 'waitingTimeLab', label: 'Waiting time for laboratory tests and sample collection', subcat: 'Lab Services' },
      { key: 'staffBehaviourLab', label: 'Behaviour and politeness of laboratory technicians/staff', subcat: 'Lab Services' },
      { key: 'reportDeliveryLab', label: 'Accuracy and timely delivery of diagnostic lab reports', subcat: 'Lab Services' },
      // Food Services
      { key: 'foodQuality', label: 'Nutritional quality and healthiness of food served', subcat: 'Dietary & Food' },
      { key: 'foodTaste', label: 'Taste, flavour, and freshness of meals', subcat: 'Dietary & Food' },
      { key: 'foodTemperature', label: 'Temperature of food when served (hot/cold as required)', subcat: 'Dietary & Food' },
      { key: 'foodTimelyDelivery', label: 'Punctuality and timely delivery of breakfast, lunch, and dinner', subcat: 'Dietary & Food' },
      { key: 'foodDietFollowed', label: 'Compliance of served food with the diet prescribed by doctors', subcat: 'Dietary & Food' },
      // Billing & Discharge
      { key: 'billingProcess', label: 'Speed and efficiency of the discharge billing process', subcat: 'Billing & Clearance' },
      { key: 'billingTransparency', label: 'Transparency, clarity, and detailed breakdown of bills', subcat: 'Billing & Clearance' },
      { key: 'billingWaitingTime', label: 'Waiting time at the billing and insurance desk', subcat: 'Billing & Clearance' },
      { key: 'billingOverallSatisfaction', label: 'Overall satisfaction with financial clearance and billing support', subcat: 'Billing & Clearance' }
    ]
  },
  {
    sectionName: 'DRUG DISPENSING',
    colorClass: 'bg-blue-50 dark:bg-slate-900/60 text-hospital-700 dark:text-hospital-300',
    questions: [
      { key: 'medicineAvailability', label: 'Availability of all prescribed medicines at the pharmacy' },
      { key: 'waitingTimePharmacy', label: 'Waiting time in queues at the pharmacy counter' },
      { key: 'pharmacistExplanation', label: 'Pharmacist explanation of dosage, frequency, and instructions' },
      { key: 'medicineQuality', label: 'Quality of medicines provided (packaging, expiry checks)' }
    ]
  },
  {
    sectionName: 'SUMMARY',
    colorClass: 'bg-sky-50 dark:bg-slate-900/40 text-hospital-700 dark:text-hospital-300',
    questions: [
      { key: 'hospitalSecurity', label: 'Sense of safety, security, and visitor management' },
      { key: 'hospitalNavigation', label: 'Ease of navigation, signs, and directions inside hospital' },
      { key: 'hospitalEnvironment', label: 'Ambient noise level, ventilation, lighting, and general comfort' },
      { key: 'hospitalRecommendation', label: 'Likelihood of recommending this hospital to friends/family' },
      { key: 'hospitalOverallExperience', label: 'Overall stay experience at Visakha Steel General Hospital' }
    ]
  }
];

const ratingLabels = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent'
};

const ReviewSubmission = () => {
  const navigate = useNavigate();

  // Patient Stay Info Fields
  const [patientId, setPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [mobileNumber, setMobileNumber] = useState('');
  const [patientType, setPatientType] = useState('Inpatient');
  const [department, setDepartment] = useState('General Medicine');
  const [doctorName, setDoctorName] = useState('');
  const [ward, setWard] = useState('');
  const [bedNumber, setBedNumber] = useState('');
  const [admissionDate, setAdmissionDate] = useState('');
  const [dischargeDate, setDischargeDate] = useState('');
  const [visitDate, setVisitDate] = useState('');

  // Lock status to prevent re-entering details if found in database
  const [isPreRegistered, setIsPreRegistered] = useState(false);
  const [lookUpLoading, setLookUpLoading] = useState(false);

  // Ratings & Comments
  const [ratings, setRatings] = useState({});
  const [suggestions, setSuggestions] = useState('');
  const [overallRating, setOverallRating] = useState(5);
  const [aiLoading, setAiLoading] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Initialize ratings list
  useEffect(() => {
    const initialRatings = {};
    SURVEY_SECTIONS.forEach(sec => {
      sec.questions.forEach(q => {
        initialRatings[q.key] = 0;
      });
    });
    setRatings(initialRatings);
  }, []);

  // Look up patient when they finish typing the Patient ID
  const handlePatientIdBlur = async () => {
    if (!patientId.trim()) return;
    setLookUpLoading(true);
    setError('');
    try {
      const data = await api.get(`/patient/${patientId.trim()}`);
      if (data) {
        if (data.reviewSubmitted) {
          setError('A review has already been submitted for this Patient ID.');
          setIsPreRegistered(false);
          return;
        }

        // Auto-populate
        setPatientName(data.patientName || '');
        setAge(data.age || '');
        setGender(data.gender || 'Male');
        setMobileNumber(data.mobileNumber || '');
        setPatientType(data.patientType || 'Inpatient');
        setDepartment(data.department || 'General Medicine');
        setDoctorName(data.doctorName || '');
        setWard(data.ward || '');
        setBedNumber(data.bedNumber || '');
        
        if (data.admissionDate) setAdmissionDate(data.admissionDate.split('T')[0]);
        if (data.dischargeDate) setDischargeDate(data.dischargeDate.split('T')[0]);
        if (data.visitDate) setVisitDate(data.visitDate.split('T')[0]);

        setIsPreRegistered(true);
      }
    } catch (err) {
      // Not pre-registered, allow patient to fill manually
      setIsPreRegistered(false);
    } finally {
      setLookUpLoading(false);
    }
  };

  const handleRatingChange = (key, val) => {
    setRatings(prev => ({ ...prev, [key]: val }));
    setError('');
  };

  const handleAiAssist = async () => {
    setAiLoading(true);
    setError('');
    try {
      const response = await api.post('/review/generate-comments', {
        ratings,
        overallRating,
        suggestions
      });
      if (response && response.draft) {
        setSuggestions(response.draft);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to auto-fill review suggestions.');
    } finally {
      setAiLoading(false);
    }
  };

  const validateForm = () => {
    if (!patientId.trim()) {
      setError('Please provide a Patient ID.');
      return false;
    }
    if (!patientName.trim()) {
      setError('Please provide Patient Name.');
      return false;
    }
    if (!mobileNumber.trim()) {
      setError('Please provide a Mobile Number.');
      return false;
    }
    if (!doctorName.trim()) {
      setError('Please provide Consulting Doctor Name.');
      return false;
    }

    if (patientType === 'Inpatient') {
      if (!admissionDate || !dischargeDate) {
        setError('Inpatients must provide both Admission and Discharge dates.');
        return false;
      }
    } else {
      if (!visitDate) {
        setError('Outpatients must provide a Visit date.');
        return false;
      }
    }

    // Check ratings
    const unanswered = [];
    SURVEY_SECTIONS.forEach(sec => {
      sec.questions.forEach(q => {
        if (!ratings[q.key]) unanswered.push(q.label);
      });
    });

    if (unanswered.length > 0) {
      setError(`Please complete the survey. You have left ${unanswered.length} questions unanswered.`);
      return false;
    }

    if (!suggestions.trim()) {
      setError('Please write comments or suggestions in the text box below.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        patientId: patientId.toUpperCase(),
        patientName,
        age: Number(age),
        gender,
        mobileNumber,
        patientType,
        department,
        doctorName,
        ward,
        bedNumber,
        admissionDate,
        dischargeDate,
        visitDate,
        ratings,
        overallRating,
        suggestions
      };

      await api.post('/review', payload);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to submit review.');
      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-hospital-50 via-slate-50 to-hospital-100 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
        <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl text-center border border-gray-150 dark:border-slate-800 animate-fade-in">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-hospital-100 text-hospital-600 dark:bg-hospital-950 dark:text-hospital-400">
            <CheckCircle className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Feedback Submitted!
          </h1>
          <p className="mt-4 text-slate-655 dark:text-slate-350 leading-relaxed font-semibold">
            Thank you, <span className="text-hospital-600 dark:text-hospital-400">{patientName}</span>. Your valuable feedback has been recorded successfully.
          </p>
          <div className="mt-8 rounded-2xl bg-slate-50 dark:bg-slate-955/40 p-4 inline-flex items-center gap-2 border border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <HeartHandshake className="h-5 w-5 text-hospital-500" />
            <span>We wish you and your family a healthy recovery.</span>
          </div>
          <div className="mt-8">
            <button
              onClick={() => {
                setSuccess(false);
                setPatientId('');
                setPatientName('');
                setAge('');
                setMobileNumber('');
                setDoctorName('');
                setWard('');
                setBedNumber('');
                setAdmissionDate('');
                setDischargeDate('');
                setVisitDate('');
                setSuggestions('');
                setIsPreRegistered(false);
                setRatings(prev => {
                  const reset = {};
                  Object.keys(prev).forEach(k => { reset[k] = 0; });
                  return reset;
                });
              }}
              className="rounded-2xl bg-hospital-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-hospital-700 transition-all"
            >
              Submit Another Feedback
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Upper Brand Info Bar */}
      <header className="sticky top-0 z-40 border-b border-gray-200/50 bg-white py-4 px-6 dark:border-slate-800/50 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-hospital-600 text-white shadow-md">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                Visakha Steel General Hospital
              </h2>
              <p className="text-xs font-semibold text-hospital-600 dark:text-hospital-400">Feedback Submission Portal</p>
            </div>
          </div>
          <div className="text-right">
            <a 
              href="/admin/login" 
              className="text-xs font-bold text-hospital-600 hover:underline dark:text-hospital-400"
            >
              Administrative Login
            </a>
          </div>
        </div>
      </header>

      {/* Main Form Body */}
      <main className="mx-auto mt-8 max-w-5xl px-4">
        
        {error && (
          <div className="mb-6 flex items-start gap-2.5 rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200/50 dark:border-red-900/30">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Patient Details Fields Section at the Top */}
        <div className="rounded-3xl bg-white border border-gray-200/60 dark:bg-slate-900 dark:border-slate-800/60 p-6 md:p-8 shadow-md mb-6 space-y-5">
          <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <User className="h-5 w-5 text-hospital-600" />
            <h3 className="text-sm font-extrabold text-slate-850 dark:text-white">Patient Stay & Admission Details</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5">Patient ID (Medical Reg No.) *</label>
              <div className="relative">
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  onBlur={handlePatientIdBlur}
                  placeholder="Type ID (e.g. P102) & tap away to lookup"
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-800 outline-none focus:border-hospital-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  required
                />
                {lookUpLoading && (
                  <span className="absolute right-3 top-2.5 h-4 w-4 animate-spin rounded-full border-2 border-hospital-200 border-t-hospital-600" />
                )}
                {isPreRegistered && (
                  <ShieldCheck className="absolute right-3 top-2 text-emerald-500 h-5 w-5" title="Pre-registered stay loaded" />
                )}
              </div>
            </div>
            
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5">Patient Name *</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                disabled={isPreRegistered}
                placeholder="Enter full name"
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-850 outline-none focus:border-hospital-500 disabled:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:disabled:bg-slate-900/60"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5">Age *</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                disabled={isPreRegistered}
                placeholder="Age"
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-850 outline-none focus:border-hospital-500 disabled:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:disabled:bg-slate-900/60"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5">Gender *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={isPreRegistered}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-850 outline-none focus:border-hospital-500 disabled:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:disabled:bg-slate-900/60"
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
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                disabled={isPreRegistered}
                placeholder="10 digits"
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-850 outline-none focus:border-hospital-500 disabled:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:disabled:bg-slate-900/60"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5">Stay Type *</label>
              <select
                value={patientType}
                onChange={(e) => setPatientType(e.target.value)}
                disabled={isPreRegistered}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-850 outline-none focus:border-hospital-500 disabled:bg-slate-50 dark:border-slate-800 dark:bg-slate-955 dark:text-white dark:disabled:bg-slate-900/60"
              >
                <option value="Inpatient">Inpatient Stay</option>
                <option value="Outpatient">Outpatient Visit</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5">Department *</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={isPreRegistered}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-850 outline-none focus:border-hospital-500 disabled:bg-slate-50 dark:border-slate-800 dark:bg-slate-955 dark:text-white dark:disabled:bg-slate-900/60"
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
              <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5">Consulting Doctor Name *</label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                disabled={isPreRegistered}
                placeholder="Dr. Name"
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-850 outline-none focus:border-hospital-500 disabled:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:disabled:bg-slate-900/60"
                required
              />
            </div>
          </div>

          {/* Conditional Dates */}
          {patientType === 'Inpatient' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 border-t border-slate-100 pt-4 dark:border-slate-850 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5">Ward / Room</label>
                <input
                  type="text"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  disabled={isPreRegistered}
                  placeholder="e.g. Cardio ICU"
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-850 outline-none focus:border-hospital-500 disabled:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:disabled:bg-slate-900/60"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5">Bed Number</label>
                <input
                  type="text"
                  value={bedNumber}
                  onChange={(e) => setBedNumber(e.target.value)}
                  disabled={isPreRegistered}
                  placeholder="e.g. Bed 05"
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-855 outline-none focus:border-hospital-500 disabled:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:disabled:bg-slate-900/60"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5">Admission Date *</label>
                <input
                  type="date"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  disabled={isPreRegistered}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-850 outline-none focus:border-hospital-500 disabled:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5">Discharge Date *</label>
                <input
                  type="date"
                  value={dischargeDate}
                  onChange={(e) => setDischargeDate(e.target.value)}
                  disabled={isPreRegistered}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-850 outline-none focus:border-hospital-500 disabled:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-slate-100 pt-4 dark:border-slate-850 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5">Visit Date *</label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  disabled={isPreRegistered}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 font-semibold text-slate-850 outline-none focus:border-hospital-500 disabled:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* 2. Survey Table Matrix */}
        <div className="rounded-3xl bg-white border border-gray-200/60 dark:bg-slate-900 dark:border-slate-800/60 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-gray-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800/80 dark:bg-slate-900/30">
                  <th className="py-4 px-6 w-44">Section</th>
                  <th className="py-4 px-6 w-96">Feedback Checkpoint</th>
                  <th className="py-4 px-6 text-center">Rate from Poor (1) to Excellent (5)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                {SURVEY_SECTIONS.map((section, secIdx) => {
                  return section.questions.map((q, qIdx) => {
                    const isFirstInSec = qIdx === 0;
                    return (
                      <tr key={q.key} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/5 transition-colors">
                        {isFirstInSec && (
                          <td 
                            rowSpan={section.questions.length} 
                            className={`py-4 px-6 align-middle font-extrabold text-[10px] tracking-wider border-r border-gray-100 dark:border-slate-800 ${section.colorClass}`}
                          >
                            <div className="vertical-text uppercase select-none">
                              {section.sectionName}
                            </div>
                          </td>
                        )}
                        
                        <td className="py-4.5 px-6 border-r border-gray-50 dark:border-slate-800/40">
                          {q.subcat && (
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-hospital-600 dark:text-hospital-400 mb-1">
                              {q.subcat}
                            </span>
                          )}
                          <span className="text-slate-855 dark:text-slate-200 leading-relaxed font-semibold">
                            {q.label}
                          </span>
                        </td>

                        <td className="py-4.5 px-6">
                          <div className="flex items-center justify-center gap-1.5 max-w-sm mx-auto">
                            {[1, 2, 3, 4, 5].map((val) => {
                              const isSelected = ratings[q.key] === val;
                              return (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => handleRatingChange(q.key, val)}
                                  className={`
                                    flex h-8 w-14 flex-col items-center justify-center rounded-lg border transition-all duration-150
                                    ${isSelected
                                      ? 'bg-hospital-600 text-white border-hospital-600 shadow-sm shadow-hospital-600/10'
                                      : 'bg-slate-50 border-gray-200/60 text-slate-600 hover:bg-slate-100 dark:bg-slate-955 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/50'
                                    }
                                  `}
                                >
                                  <span className="text-[11px] font-bold">{val}</span>
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Suggestions & Overall comments */}
        <div className="rounded-3xl bg-white border border-gray-200/60 dark:bg-slate-900 dark:border-slate-800/60 p-6 md:p-8 mt-6 shadow-md space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-850 dark:text-slate-200 mb-3">
              How would you rate your overall experience with the hospital stay / visit?
            </label>
            <div className="flex flex-wrap gap-2.5">
              {[1, 2, 3, 4, 5].map((val) => {
                const isSelected = overallRating === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setOverallRating(val)}
                    className={`
                      flex items-center gap-2 rounded-xl px-5 py-2.5 border font-bold text-xs transition-all duration-200
                      ${isSelected
                        ? 'bg-hospital-600 text-white border-hospital-600 shadow-lg shadow-hospital-600/15'
                        : 'bg-slate-50 border-gray-200/50 hover:bg-slate-100 text-slate-700 dark:bg-slate-950/50 dark:border-slate-800 dark:text-slate-350'
                      }
                    `}
                  >
                    <Star className={`h-4.5 w-4.5 ${isSelected ? 'fill-white text-white' : 'text-slate-400'}`} />
                    <span>{val} - {ratingLabels[val]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-slate-850 dark:text-slate-200">
                Comments and Suggestions for Improvement (Max 1000 characters)
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAiAssist}
                  disabled={aiLoading}
                  className="flex items-center gap-1.5 rounded-lg border border-hospital-200 bg-white px-2.5 py-1 text-[11px] font-bold text-hospital-600 shadow-sm hover:bg-hospital-50 hover:text-hospital-700 disabled:opacity-50 transition-all dark:border-slate-800 dark:bg-slate-900 dark:text-hospital-400 dark:hover:bg-slate-800/80"
                >
                  {aiLoading ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-hospital-200 border-t-hospital-600 shrink-0" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>AI Generate Comments</span>
                    </>
                  )}
                </button>
                <span className="text-[10px] text-slate-400 font-bold">
                  {suggestions.length}/1000 characters
                </span>
              </div>
            </div>
            <textarea
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value.substring(0, 1000))}
              placeholder="Please describe your experience during registration, consulting doctors, nurse behaviors, food quality, or drug availability..."
              rows={5}
              className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-hospital-500 dark:border-slate-800 dark:bg-slate-955 dark:text-white"
              required
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-50 dark:border-slate-800">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-2xl bg-hospital-600 px-10 py-4 text-xs font-bold text-white shadow-lg hover:bg-hospital-700 active:scale-[0.98] disabled:opacity-50 transition-all"
            >
              {submitting ? 'Submitting & Analyzing with Gemini AI...' : 'Submit Official Review'}
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default ReviewSubmission;
