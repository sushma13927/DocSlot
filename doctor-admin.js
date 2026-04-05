/* ===== doctor-dashboard.js ===== */

function renderDoctorDashboard() {
  const currentUser = getCurrentUser();
  const appointments = getAppointments();
  const today = getCurrentDateISO();

  // Today's Appointments
  const todayAppts = appointments.filter(a => a.doctor === currentUser.name && a.date === today);
  let todayHTML = '<h3>Today\'s Appointments</h3>';
  if (todayAppts.length === 0) {
    todayHTML += '<p style="color: #999;">No appointments today</p>';
  } else {
    todayHTML += '<div class="list">';
    todayAppts.forEach(apt => {
      todayHTML += `
        <div class="list-item">
          <strong>${apt.time}</strong> - ${apt.patient}<br>
          ${apt.dept} | ${apt.hospital}<br>
          <small style="color: #666;">Fee: ₹${apt.fee}</small>
        </div>
      `;
    });
    todayHTML += '</div>';
  }
  document.getElementById('doctorTodayList').innerHTML = todayHTML;

  // All Appointments
  const allAppts = appointments.filter(a => a.doctor === currentUser.name);
  let allHTML = '<h3>All Appointments</h3>';
  if (allAppts.length === 0) {
    allHTML += '<p style="color: #999;">No appointments</p>';
  } else {
    allHTML += '<div class="list">';
    allAppts.forEach(apt => {
      allHTML += `
        <div class="list-item">
          <strong>${apt.patient}</strong><br>
          ${formatDate(apt.date)} at ${apt.time}<br>
          ${apt.dept} | ${apt.hospital} | ₹${apt.fee}
        </div>
      `;
    });
    allHTML += '</div>';
  }
  document.getElementById('doctorAllList').innerHTML = allHTML;
}

/* ===== hospital-admin.js ===== */

function loadAdminDashboard() {
  loadHospitalsForAdmin();
  loadAdminAppointments();
}

function loadHospitalsForAdmin() {
  const hospitals = getHospitals();
  const dropdown = document.getElementById('adminHospitalSelect');
  const deptDropdown = document.getElementById('adminDeptSelect');
  const doctorHospitalDropdown = document.getElementById('doctorHospitalSelect');
  const feeHospitalDropdown = document.getElementById('feeHospitalSelect');

  dropdown.innerHTML = '<option value="">Select Hospital</option>';
  deptDropdown.innerHTML = '<option value="">Select Hospital First</option>';
  doctorHospitalDropdown.innerHTML = '<option value="">Select Hospital</option>';
  feeHospitalDropdown.innerHTML = '<option value="">Select Hospital</option>';

  hospitals.forEach(h => {
    const opt1 = document.createElement('option');
    opt1.value = h.id;
    opt1.textContent = h.name;
    opt1.dataset.name = h.name;
    dropdown.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = h.id;
    opt2.textContent = h.name;
    opt2.dataset.name = h.name;
    doctorHospitalDropdown.appendChild(opt2);

    const opt3 = document.createElement('option');
    opt3.value = h.id;
    opt3.textContent = h.name;
    opt3.dataset.name = h.name;
    feeHospitalDropdown.appendChild(opt3);
  });

  // Update departments when hospital selected
  dropdown.addEventListener('change', function() {
    const hospitalId = this.value;
    const hospitalName = this.options[this.selectedIndex].dataset.name;
    const hospital = hospitals.find(h => h.id === hospitalId);

    deptDropdown.innerHTML = '<option value="">Select Department</option>';
    if (hospital && hospital.departments) {
      hospital.departments.forEach(dept => {
        const opt = document.createElement('option');
        opt.value = dept.id;
        opt.textContent = dept.name;
        opt.dataset.name = dept.name;
        opt.dataset.fee = dept.fee;
        deptDropdown.appendChild(opt);
      });
    }
  });

  // Update departments for doctor assignment
  doctorHospitalDropdown.addEventListener('change', function() {
    const hospitalId = this.value;
    const doctorDeptDropdown = document.getElementById('doctorDeptSelect');
    const hospital = hospitals.find(h => h.id === hospitalId);

    doctorDeptDropdown.innerHTML = '<option value="">Select Department</option>';
    if (hospital && hospital.departments) {
      hospital.departments.forEach(dept => {
        const opt = document.createElement('option');
        opt.value = dept.id;
        opt.textContent = dept.name;
        opt.dataset.name = dept.name;
        doctorDeptDropdown.appendChild(opt);
      });
    }
  });

  // Update departments for fee setting
  feeHospitalDropdown.addEventListener('change', function() {
    const hospitalId = this.value;
    const feeDeptDropdown = document.getElementById('feeDeptSelect');
    const hospital = hospitals.find(h => h.id === hospitalId);

    feeDeptDropdown.innerHTML = '<option value="">Select Department</option>';
    if (hospital && hospital.departments) {
      hospital.departments.forEach(dept => {
        const opt = document.createElement('option');
        opt.value = dept.id;
        opt.textContent = dept.name + ' (Current: ₹' + dept.fee + ')';
        opt.dataset.name = dept.name;
        opt.dataset.currentFee = dept.fee;
        feeDeptDropdown.appendChild(opt);
      });
    }
  });
}

// Add Hospital
document.getElementById('addHospitalBtn')?.addEventListener('click', function() {
  const name = document.getElementById('newHospitalName').value.trim();
  const address = document.getElementById('newHospitalAddress').value.trim();
  const phone = document.getElementById('newHospitalPhone').value.trim();

  if (!name || !address || !phone) {
    alert('Please fill all hospital details');
    return;
  }

  const hospitals = getHospitals();
  if (hospitals.find(h => h.name === name)) {
    alert('Hospital already exists');
    return;
  }

  const newHospital = {
    id: 'h_' + Date.now(),
    name: name,
    address: address,
    phone: phone,
    departments: []
  };

  hospitals.push(newHospital);
  saveHospitals(hospitals);

  document.getElementById('newHospitalName').value = '';
  document.getElementById('newHospitalAddress').value = '';
  document.getElementById('newHospitalPhone').value = '';

  alert('Hospital added successfully');
  loadHospitalsForAdmin();
});

// Add Department
document.getElementById('addDeptBtn')?.addEventListener('click', function() {
  const hospitalId = document.getElementById('adminHospitalSelect').value;
  const hospitalName = document.getElementById('adminHospitalSelect').options[document.getElementById('adminHospitalSelect').selectedIndex].dataset.name;
  const deptName = document.getElementById('newDeptName').value.trim();

  if (!hospitalId || !deptName) {
    alert('Please select hospital and enter department name');
    return;
  }

  const hospitals = getHospitals();
  const hospital = hospitals.find(h => h.id === hospitalId);

  if (!hospital) {
    alert('Hospital not found');
    return;
  }

  if (hospital.departments.find(d => d.name === deptName)) {
    alert('Department already exists in this hospital');
    return;
  }

  hospital.departments.push({
    id: 'd_' + Date.now(),
    name: deptName,
    fee: 300,
    doctors: []
  });

  saveHospitals(hospitals);
  document.getElementById('newDeptName').value = '';
  alert('Department added successfully');
  loadHospitalsForAdmin();
});

// Assign Doctor
document.getElementById('assignDoctorBtn')?.addEventListener('click', function() {
  const hospitalId = document.getElementById('doctorHospitalSelect').value;
  const deptId = document.getElementById('doctorDeptSelect').value;
  const doctorName = document.getElementById('newDoctorName').value.trim();
  const doctorEmail = document.getElementById('newDoctorEmail').value.trim();
  const doctorPhone = document.getElementById('newDoctorPhone').value.trim();

  if (!hospitalId || !deptId || !doctorName || !doctorEmail || !doctorPhone) {
    alert('Please fill all doctor details');
    return;
  }

  const hospitals = getHospitals();
  const hospital = hospitals.find(h => h.id === hospitalId);
  const dept = hospital.departments.find(d => d.id === deptId);

  if (dept.doctors.find(d => d.name === doctorName)) {
    alert('Doctor already assigned');
    return;
  }

  dept.doctors.push({
    id: 'doc_' + Date.now(),
    name: doctorName,
    email: doctorEmail,
    phone: doctorPhone
  });

  saveHospitals(hospitals);

  document.getElementById('newDoctorName').value = '';
  document.getElementById('newDoctorEmail').value = '';
  document.getElementById('newDoctorPhone').value = '';

  alert('Doctor assigned successfully');
  loadHospitalsForAdmin();
});

// Set Fee
document.getElementById('adminSetFeeBtn')?.addEventListener('click', function() {
  const hospitalId = document.getElementById('feeHospitalSelect').value;
  const deptId = document.getElementById('feeDeptSelect').value;
  const newFee = document.getElementById('newFee').value.trim();

  if (!hospitalId || !deptId || !newFee) {
    alert('Please select hospital, department and enter fee');
    return;
  }

  if (isNaN(newFee) || newFee < 0) {
    alert('Please enter a valid fee amount');
    return;
  }

  const hospitals = getHospitals();
  const hospital = hospitals.find(h => h.id === hospitalId);
  const dept = hospital.departments.find(d => d.id === deptId);

  dept.fee = parseInt(newFee);
  saveHospitals(hospitals);

  document.getElementById('newFee').value = '';
  alert('Fee updated successfully');
  loadHospitalsForAdmin();
});

function loadAdminAppointments() {
  const appointments = getAppointments();

  let html = '<h3>All Appointments in System</h3>';
  if (appointments.length === 0) {
    html += '<p style="color: #999;">No appointments</p>';
  } else {
    html += '<div class="list">';
    appointments.forEach(apt => {
      html += `
        <div class="list-item">
          <strong>${apt.patient}</strong> → <strong>${apt.doctor}</strong><br>
          ${formatDate(apt.date)} at ${apt.time} | ${apt.dept}<br>
          ${apt.hospital} | ₹${apt.fee} | ${apt.status.toUpperCase()}
        </div>
      `;
    });
    html += '</div>';
  }
  document.getElementById('adminAppointmentsList').innerHTML = html;
}
