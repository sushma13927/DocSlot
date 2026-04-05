/* ===== triage.js ===== */

function getDoctorsByReason(reason, hospitalName) {
  const reason_lower = reason.toLowerCase();
  const hospitals = getHospitals();
  const hospital = hospitals.find(h => h.name === hospitalName);
  if (!hospital) return [];

  const specialtyKeywords = {
    'Cardiology':       ['heart', 'chest', 'cardiac', 'blood pressure', 'bp', 'palpitation', 'angina', 'arrhythmia'],
    'General Medicine': ['fever', 'cold', 'cough', 'flu', 'general', 'checkup', 'routine', 'wellness', 'vaccine'],
    'Neurology':        ['brain', 'headache', 'migraine', 'seizure', 'stroke', 'nerve', 'neurological', 'dizziness'],
    'Orthopedics':      ['bone', 'fracture', 'joint', 'sprain', 'arthritis', 'back', 'knee', 'shoulder'],
    'Pediatrics':       ['baby', 'child', 'infant', 'kid', 'pediatric', 'vaccination', 'growth'],
    'Dermatology':      ['skin', 'rash', 'acne', 'allergic', 'eczema', 'psoriasis'],
    'ENT':              ['ear', 'nose', 'throat', 'sinusitis', 'tonsil'],
    'Dentistry':        ['tooth', 'teeth', 'dental', 'cavity', 'gum', 'toothache']
  };

  let matchedDept = null;
  for (const [dept, keywords] of Object.entries(specialtyKeywords)) {
    for (const keyword of keywords) {
      if (reason_lower.includes(keyword)) {
        matchedDept = hospital.departments.find(d => d.name === dept);
        if (matchedDept) {
          // Show department suggestion to user
          const info = document.getElementById('suggestedDeptInfo');
          if (info) info.textContent = 'Suggested department: ' + dept;
          return matchedDept.doctors;
        }
      }
    }
  }

  // Fallback: show all doctors across all departments
  const info = document.getElementById('suggestedDeptInfo');
  if (info) info.textContent = 'Showing General Medicine doctors';
  matchedDept = hospital.departments.find(d => d.name === 'General Medicine');
  if (matchedDept) return matchedDept.doctors;

  // Last resort: return all doctors
  return hospital.departments.flatMap(d => d.doctors);
}

/* ===== patient-booking.js ===== */

let selectedHospital = '';
let selectedReason   = '';
let selectedDoctor   = '';
let selectedDate     = '';
let selectedTime     = '';

function loadHospitals() {
  const hospitals = getHospitals();
  const dropdown = document.getElementById('hospitalSelect');
  dropdown.innerHTML = '<option value="">Select Hospital</option>';
  hospitals.forEach(h => {
    const option = document.createElement('option');
    option.value = h.name;
    option.textContent = h.name;
    dropdown.appendChild(option);
  });
}

function loadDoctorOptions() {
  const doctors = getDoctorsByReason(selectedReason, selectedHospital);
  const dropdown = document.getElementById('doctorSelect');
  dropdown.innerHTML = '<option value="">Select Doctor</option>';

  if (doctors.length === 0) {
    const opt = document.createElement('option');
    opt.disabled = true;
    opt.textContent = 'No doctors found for this hospital';
    dropdown.appendChild(opt);
    return;
  }

  doctors.forEach(d => {
    const option = document.createElement('option');
    option.value = d.name;
    option.textContent = d.name;
    dropdown.appendChild(option);
  });
}

function loadTimes() {
  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  const container = document.getElementById('timeSlots');
  container.innerHTML = '';
  selectedTime = ''; // reset

  timeSlots.forEach(time => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'time-slot-btn';
    btn.textContent = time;
    btn.onclick = () => {
      selectedTime = time;
      container.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    };
    container.appendChild(btn);
  });
}

/* ===== BOOKING WIZARD EVENT LISTENERS ===== */

document.getElementById('startBookingBtn')?.addEventListener('click', function () {
  showPage('hospitalPage');
  loadHospitals();
});

document.getElementById('hospitalNextBtn')?.addEventListener('click', function () {
  selectedHospital = document.getElementById('hospitalSelect').value;
  if (!selectedHospital) { alert('Please select a hospital'); return; }
  showPage('reasonPage');
});

document.getElementById('reasonNextBtn')?.addEventListener('click', function () {
  selectedReason = document.getElementById('reasonText').value.trim();
  if (!selectedReason) { alert('Please describe your symptoms'); return; }
  showPage('doctorSelectPage');
  loadDoctorOptions();
});

document.getElementById('doctorNextBtn')?.addEventListener('click', function () {
  selectedDoctor = document.getElementById('doctorSelect').value;
  if (!selectedDoctor) { alert('Please select a doctor'); return; }

  showPage('appointmentPage');
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('appointmentDate');
  dateInput.min = today;
  dateInput.value = today;
  selectedDate = today;
  loadTimes();
});

document.getElementById('apptNextBtn')?.addEventListener('click', function () {
  selectedDate = document.getElementById('appointmentDate').value;
  if (!selectedDate) { alert('Please select a date'); return; }
  if (!selectedTime) { alert('Please select a time slot'); return; }

  // Get doctor fee and department
  const hospitals = getHospitals();
  const hospital = hospitals.find(h => h.name === selectedHospital);
  let doctorFee  = 300;
  let doctorDept = 'General Medicine';

  if (hospital) {
    for (const dept of hospital.departments) {
      if (dept.doctors.find(d => d.name === selectedDoctor)) {
        doctorFee  = dept.fee;
        doctorDept = dept.name;
        break;
      }
    }
  }

  const summary = `
    <strong>Appointment Summary</strong><br><br>
    <strong>Hospital:</strong> ${selectedHospital}<br>
    <strong>Doctor:</strong> ${selectedDoctor}<br>
    <strong>Department:</strong> ${doctorDept}<br>
    <strong>Date:</strong> ${formatDate(selectedDate)}<br>
    <strong>Time:</strong> ${selectedTime}<br>
    <strong>Consultation Fee:</strong> ₹${doctorFee}
  `;
  document.getElementById('appointmentSummary').innerHTML = summary;

  window.appointmentDetails = {
    hospital: selectedHospital,
    doctor:   selectedDoctor,
    dept:     doctorDept,
    date:     selectedDate,
    time:     selectedTime,
    fee:      doctorFee
  };

  showPage('paymentPage');
});

/* Back buttons */
document.getElementById('hospitalBackBtn')?.addEventListener('click', () => showPage('patientDashboardPage'));
document.getElementById('reasonBackBtn')?.addEventListener('click',   () => showPage('hospitalPage'));
document.getElementById('doctorBackBtn')?.addEventListener('click',   () => showPage('reasonPage'));
document.getElementById('apptBackBtn')?.addEventListener('click',     () => showPage('doctorSelectPage'));
document.getElementById('paymentBackBtn')?.addEventListener('click',  () => showPage('appointmentPage'));
