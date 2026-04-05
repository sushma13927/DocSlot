/* ===== storage.js ===== */

const STORAGE_KEYS = {
  USERS: 'docslot_users',
  HOSPITALS: 'docslot_hospitals',
  APPOINTMENTS: 'docslot_appointments',
  CURRENT_USER: 'docslot_current_user'
};

function getUsers() {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function getHospitals() {
  const data = localStorage.getItem(STORAGE_KEYS.HOSPITALS);
  return data ? JSON.parse(data) : [];
}

function saveHospitals(hospitals) {
  localStorage.setItem(STORAGE_KEYS.HOSPITALS, JSON.stringify(hospitals));
}

function getAppointments() {
  const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
  return data ? JSON.parse(data) : [];
}

function saveAppointments(appointments) {
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
}

function getCurrentUser() {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
}

function saveCurrentUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

/* ===== Demo Data Pre-load ===== */
function preloadDemoData() {
  // Always refresh demo data so credentials are always valid
  const demoUsers = [
    {
      id: 'patient1',
      name: 'John Patient',
      username: 'patient1',
      email: 'patient1@mail.com',
      phone: '9876543210',
      password: 'Patient@123',
      role: 'patient'
    },
    {
      id: 'doctor1',
      name: 'Dr. Vivek Kumar',
      username: 'doctor1',
      email: 'doctor@mail.com',
      phone: '9876543211',
      password: 'Doctor@123',
      role: 'doctor'
    },
    {
      id: 'admin1',
      name: 'Hospital Admin',
      username: 'admin1',
      email: 'admin@mail.com',
      phone: '9876543212',
      password: 'Admin@123',
      role: 'admin'
    }
  ];

  const demoHospitals = [
    {
      id: 'h1',
      name: 'Apollo Hospital',
      address: '123 Medical Road, City Center',
      phone: '9999999999',
      departments: [
        {
          id: 'd1',
          name: 'Cardiology',
          fee: 500,
          doctors: [
            { id: 'doc1', name: 'Dr. Vivek Kumar', phone: '9876543211', email: 'doctor@mail.com' },
            { id: 'doc2', name: 'Dr. Priya Singh', phone: '9876543213', email: 'priya@mail.com' }
          ]
        },
        {
          id: 'd2',
          name: 'General Medicine',
          fee: 300,
          doctors: [
            { id: 'doc3', name: 'Dr. Rajesh Gupta', phone: '9876543214', email: 'rajesh@mail.com' }
          ]
        },
        {
          id: 'd3',
          name: 'Neurology',
          fee: 600,
          doctors: [
            { id: 'doc4', name: 'Dr. Anjali Verma', phone: '9876543215', email: 'anjali@mail.com' }
          ]
        },
        {
          id: 'd4',
          name: 'Orthopedics',
          fee: 450,
          doctors: [
            { id: 'doc5', name: 'Dr. Arun Kumar', phone: '9876543216', email: 'arun@mail.com' }
          ]
        }
      ]
    },
    {
      id: 'h2',
      name: 'Max Healthcare',
      address: '456 Health Avenue, Downtown',
      phone: '8888888888',
      departments: [
        {
          id: 'd5',
          name: 'General Medicine',
          fee: 350,
          doctors: [
            { id: 'doc6', name: 'Dr. Sunita Sharma', phone: '9876543217', email: 'sunita@mail.com' }
          ]
        },
        {
          id: 'd6',
          name: 'Pediatrics',
          fee: 400,
          doctors: [
            { id: 'doc7', name: 'Dr. Meera Gupta', phone: '9876543218', email: 'meera@mail.com' }
          ]
        }
      ]
    }
  ];

  const demoAppointments = [
    {
      id: 'apt1',
      patient: 'John Patient',
      hospital: 'Apollo Hospital',
      doctor: 'Dr. Vivek Kumar',
      dept: 'Cardiology',
      fee: 500,
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      method: 'UPI',
      status: 'confirmed'
    }
  ];

  // Merge demo users with any existing newly registered users
  const existingUsers = getUsers();
  const demoIds = demoUsers.map(u => u.id);
  const newUsers = existingUsers.filter(u => !demoIds.includes(u.id));
  saveUsers([...demoUsers, ...newUsers]);

  // Only set hospitals and appointments if not already customised
  if (!localStorage.getItem('demo_data_loaded')) {
    saveHospitals(demoHospitals);
    saveAppointments(demoAppointments);
    localStorage.setItem('demo_data_loaded', 'true');
  }
}

// Run on every page load
preloadDemoData();

/* ===== Page Navigation ===== */
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) {
    page.classList.add('active');
  } else {
    console.error('Page not found:', pageId);
  }
}

/* ===== LOGIN ===== 
   FIX: Removed <form> submit interference. Uses plain button click.
   FIX: Normalises identifier (trim + lowercase) before comparison.
   FIX: Sets welcome name in dashboard header after login.
*/
document.getElementById('loginBtn').addEventListener('click', function () {
  const identifier = document.getElementById('loginIdentifier').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!identifier || !password) {
    alert('Please fill in both fields');
    return;
  }

  const users = getUsers();

  // Normalise for comparison — case-insensitive email/username match
  const id_lower = identifier.toLowerCase();
  const user = users.find(u => {
    return (
      u.email.toLowerCase() === id_lower ||
      u.username.toLowerCase() === id_lower ||
      u.phone === identifier
    ) && u.password === password;
  });

  if (user) {
    saveCurrentUser(user);

    if (user.role === 'patient') {
      const el = document.getElementById('patientWelcome');
      if (el) el.textContent = 'Welcome, ' + user.name;
      showPage('patientDashboardPage');

    } else if (user.role === 'doctor') {
      const el = document.getElementById('doctorWelcome');
      if (el) el.textContent = 'Welcome, ' + user.name;
      showPage('doctorDashboardPage');
      renderDoctorDashboard();

    } else if (user.role === 'admin') {
      const el = document.getElementById('adminWelcome');
      if (el) el.textContent = 'Welcome, ' + user.name;
      showPage('adminDashboardPage');
      loadAdminDashboard();
    }
  } else {
    alert('Invalid credentials. Please check your email/username/phone and password.');
  }
});

// Allow Enter key on password field to trigger login
document.getElementById('loginPassword').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') document.getElementById('loginBtn').click();
});

/* ===== NAVIGATION ===== */
document.getElementById('goSignup').addEventListener('click', function () {
  showPage('signupPage');
});

document.getElementById('goLogin').addEventListener('click', function () {
  showPage('loginPage');
});

/* ===== SIGNUP & OTP =====
   FIX: window.signupData is used to pass data to OTP step.
   FIX: On successful OTP, user is pushed to localStorage and can immediately log in.
*/
document.getElementById('sendOtpBtn').addEventListener('click', function () {
  const name = document.getElementById('signupName').value.trim();
  const username = document.getElementById('signupUsername').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const countryCode = document.getElementById('signupCountryCode').value;
  const phone = document.getElementById('signupPhone').value.trim();
  const role = document.getElementById('signupRole').value;
  const password = document.getElementById('signupPassword').value.trim();
  const confirmPassword = document.getElementById('signupConfirm').value.trim();

  if (!name || !username || !email || !phone || !role || !password || !confirmPassword) {
    alert('Please fill all fields');
    return;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    alert('Password must be 8+ chars with uppercase, lowercase, digit, and special char (@$!%*?&)');
    return;
  }

  const users = getUsers();
  const exists = users.find(u =>
    u.email.toLowerCase() === email.toLowerCase() ||
    u.username.toLowerCase() === username.toLowerCase() ||
    u.phone === phone
  );

  if (exists) {
    alert('An account with this email, username, or phone already exists');
    return;
  }

  // Store pending signup
  window.signupData = {
    id: 'user_' + Date.now(),
    name,
    username,
    email,
    phone: countryCode + phone,
    password,
    role
  };

  const otp = generateOtp();
  window.generatedOtp = otp;
  alert('Your OTP is: ' + otp + '\n\n(For demo purposes, OTP is shown here)');
  showPage('otpPage');
});

document.getElementById('verifyOtpBtn').addEventListener('click', function () {
  const otpInput = document.getElementById('otpInput').value.trim();

  if (!otpInput) {
    alert('Please enter the OTP');
    return;
  }

  if (!verifyOtp(otpInput)) {
    alert('Invalid OTP. Please try again.');
    return;
  }

  if (!window.signupData) {
    alert('Session expired. Please sign up again.');
    showPage('signupPage');
    return;
  }

  // Save new user
  const users = getUsers();
  users.push(window.signupData);
  saveUsers(users);

  // Clear state
  window.signupData = null;
  window.generatedOtp = null;
  document.getElementById('otpInput').value = '';

  // Clear signup form
  ['signupName', 'signupUsername', 'signupEmail', 'signupPhone',
   'signupPassword', 'signupConfirm'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('signupRole').value = '';

  alert('Account created successfully! You can now log in.');
  showPage('loginPage');
});

document.getElementById('backSignup').addEventListener('click', function () {
  document.getElementById('otpInput').value = '';
  showPage('signupPage');
});

/* ===== LOGOUT ===== */
function doLogout() {
  saveCurrentUser(null);
  document.getElementById('loginIdentifier').value = '';
  document.getElementById('loginPassword').value = '';
  showPage('loginPage');
}

document.getElementById('patientLogoutBtn').addEventListener('click', doLogout);
document.getElementById('doctorLogoutBtn').addEventListener('click', doLogout);
document.getElementById('adminLogoutBtn').addEventListener('click', doLogout);
