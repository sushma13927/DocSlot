/* ===== otp.js ===== */

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendOtp(email) {
  window.generatedOtp = generateOtp();
  console.log('OTP sent to ' + email + ': ' + window.generatedOtp);
}

function verifyOtp(input) {
  return input === window.generatedOtp;
}

/* ===== utils.js ===== */

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatPhone(phone) {
  if (!phone) return '';
  return phone.replace(/(\d{2})(\d{5})(\d{5})/, '$1 $2 $3');
}

function getCurrentDateISO() {
  return new Date().toISOString().split('T')[0];
}
