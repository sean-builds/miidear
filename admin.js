// ============================================================================
// Miidear — admin.js  (Mii9 login, real Supabase Auth)
// Signs the admin in with email + password via Supabase Auth. On success the
// session persists (handled by the Supabase client) and the dashboard opens.
// If already signed in, redirects straight to the dashboard.
// ============================================================================
(function () {
  'use strict';

  var form = document.getElementById('gateForm');
  if (!form) return;

  var email = document.getElementById('email');
  var pw = document.getElementById('pw');
  var msg = document.getElementById('gateMsg');
  var btn = document.getElementById('signInBtn');

  // If a valid session already exists, go to the dashboard.
  if (window.MiidearDB && window.MiidearDB.getSession) {
    window.MiidearDB.getSession().then(function (res) {
      if (res && res.data && res.data.session) window.location.replace('dashboard.html');
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.textContent = '';
    msg.className = 'form-msg error';

    var em = (email.value || '').trim();
    var pwd = pw.value || '';
    if (!em || !pwd) { msg.textContent = 'Please enter your email and password.'; return; }

    btn.disabled = true;
    var label = btn.textContent;
    btn.textContent = 'Signing in…';

    window.MiidearDB.signIn(em, pwd).then(function (res) {
      btn.disabled = false;
      btn.textContent = label;
      if (res.error || !res.data || !res.data.session) {
        msg.textContent = 'Access denied. Please check your email and password.';
        pw.value = '';
        pw.focus();
        return;
      }
      window.location.replace('dashboard.html');
    });
  });
})();
