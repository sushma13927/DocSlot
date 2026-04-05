/* ===== appointment.js ===== */

document.getElementById('apptConfirmBtn')?.addEventListener('click', function() {
  if (!window.appointmentDetails) {
    alert('Appointment details not found');
    return;
  }
  
  showPage('paymentPage');
});

/* ===== payment.js ===== */

document.getElementById('paymentConfirmBtn')?.addEventListener('click', function() {
  const paymentMethod = document.getElementById('paymentMethod').value;
  
  if (!paymentMethod) {
    alert('Please select a payment method');
    return;
  }

  if (paymentMethod === 'upi') {
    alert('Simulating UPI Payment...\nPlease confirm payment on your UPI app.');
  } else if (paymentMethod === 'card') {
    alert('Card payment feature coming soon!');
    return;
  } else if (paymentMethod === 'cash') {
    alert('Payment will be collected at hospital');
  }

  // Save appointment to localStorage
  const currentUser = getCurrentUser();
  const apptDetails = window.appointmentDetails;
  
  const appointment = {
    id: 'apt_' + Date.now(),
    patient: currentUser.name,
    hospital: apptDetails.hospital,
    doctor: apptDetails.doctor,
    dept: apptDetails.dept,
    fee: apptDetails.fee,
    date: apptDetails.date,
    time: apptDetails.time,
    method: paymentMethod,
    status: 'confirmed'
  };

  const appointments = getAppointments();
  appointments.push(appointment);
  saveAppointments(appointments);

  // Generate receipt
  const receiptHTML = `
    <div style="text-align: center; margin-bottom: 15px;">
      <h2 style="color: #1e58b4; margin-bottom: 10px;">✓ Appointment Confirmed</h2>
      <p style="color: #666; font-size: 14px;">Confirmation has been sent to your email</p>
    </div>
    <div class="receipt-box">
      <strong style="font-size: 16px; color: #1e58b4;">Appointment Details</strong><br><br>
      <strong>Hospital:</strong> ${apptDetails.hospital}<br>
      <strong>Doctor:</strong> ${apptDetails.doctor}<br>
      <strong>Department:</strong> ${apptDetails.dept}<br>
      <strong>Date:</strong> ${formatDate(apptDetails.date)}<br>
      <strong>Time:</strong> ${apptDetails.time}<br>
      <strong>Consultation Fee:</strong> ₹${apptDetails.fee}<br>
      <strong>Payment Method:</strong> ${paymentMethod.toUpperCase()}<br>
      <strong>Status:</strong> CONFIRMED<br><br>
      <strong>Confirmation ID:</strong> ${appointment.id}<br>
      <strong>Patient:</strong> ${currentUser.name}
    </div>
  `;

  document.getElementById('receiptDetails').innerHTML = receiptHTML;
  showPage('receiptPage');
});

// Receipt Done Button
document.getElementById('receiptDoneBtn')?.addEventListener('click', function() {
  document.getElementById('reasonText').value = '';
  document.getElementById('hospitalSelect').value = '';
  document.getElementById('doctorSelect').value = '';
  document.getElementById('appointmentDate').value = '';
  selectedTime = '';
  window.appointmentDetails = null;
  showPage('patientDashboardPage');
});

// View Appointments (Patient Dashboard)
document.getElementById('patientHistoryBtn')?.addEventListener('click', function() {
  const currentUser = getCurrentUser();
  const appointments = getAppointments();
  const userAppointments = appointments.filter(a => a.patient === currentUser.name);

  let html = '<h3>Your Appointments</h3>';
  if (userAppointments.length === 0) {
    html += '<p style="color: #999;">No appointments yet</p>';
  } else {
    userAppointments.forEach(apt => {
      html += `
        <div class="list-item">
          <strong>${apt.doctor}</strong> - ${apt.dept}<br>
          ${formatDate(apt.date)} at ${apt.time}<br>
          <small style="color: #666;">${apt.hospital}</small>
        </div>
      `;
    });
  }
  document.getElementById('patientApptsList').innerHTML = html;
  document.getElementById('patientDashboardContent').style.display = 'none';
  document.getElementById('patientApptsList').style.display = 'block';
  document.getElementById('backToPatientDashBtn').style.display = 'block';
});

// Back from appointments list
document.getElementById('backToPatientDashBtn')?.addEventListener('click', function() {
  document.getElementById('patientDashboardContent').style.display = 'block';
  document.getElementById('patientApptsList').style.display = 'none';
  document.getElementById('backToPatientDashBtn').style.display = 'none';
});
