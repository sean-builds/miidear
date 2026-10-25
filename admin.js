// ============================================================================
// Miidear — js/admin.js
// Demo admin dashboard. Password-gates the view, then lists appointments from
// the same localStorage store used by the booking form. Supports approve and
// delete. Session is remembered for the browser session only (sessionStorage).
//
// NOTE: This is a front-end demo. The password lives in the client and is not
// real security — replace with a real backend + auth before production use.
// ============================================================================
(function () {
  'use strict';

  var DEMO_PASSWORD = 'admin123';
  var SESSION_KEY = 'miidear_admin_ok';
  var STORAGE_KEY = (window.MiidearStore && window.MiidearStore.key) || 'miidear_appointments';
  var WORKING_HOURS = (window.MiidearStore && window.MiidearStore.workingHours) ||
    ['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];

  var gateView = document.getElementById('gateView');
  var dashView = document.getElementById('dashView');
  if (!gateView || !dashView) return; // not on admin page

  // --- Storage (independent of booking.js so admin works standalone) ------
  function loadAll() {
    try { var list = JSON.parse(localStorage.getItem(STORAGE_KEY)); return Array.isArray(list) ? list.filter(function(a){return a && typeof a.prefDate === 'string' && typeof a.prefTime === 'string';}) : []; }
    catch (e) { return []; }
  }
  function saveAll(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }

  // --- Toast --------------------------------------------------------------
  var toastTimer;
  window.MiidearToast = function (text) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2400);
  };

  // --- Gate ---------------------------------------------------------------
  function showDash() {
    gateView.style.display = 'none';
    dashView.style.display = 'block';
    render();
  }
  function showGate() {
    sessionStorage.removeItem(SESSION_KEY);
    dashView.style.display = 'none';
    gateView.style.display = 'block';
  }

  if (sessionStorage.getItem(SESSION_KEY) === '1') showDash();

  var gateForm = document.getElementById('gateForm');
  gateForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var pw = document.getElementById('pw').value;
    var gateMsg = document.getElementById('gateMsg');
    if (pw === DEMO_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      gateMsg.textContent = '';
      showDash();
    } else {
      gateMsg.textContent = 'Incorrect password. Please try again.';
      document.getElementById('pw').value = '';
    }
  });

  document.getElementById('signOut').addEventListener('click', showGate);

  // --- Helpers ------------------------------------------------------------
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function fmtDate(d) {
    if (!d) return '—';
    var dt = new Date(d.length > 10 ? d : d + 'T00:00:00');
    if (isNaN(dt)) return d;
    return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // --- Render -------------------------------------------------------------
  function render() {
    var all = loadAll().slice().sort(function (a, b) {
      // Soonest consultation first.
      return (a.prefDate + a.prefTime).localeCompare(b.prefDate + b.prefTime);
    });

    // Stats
    var pending = all.filter(function (a) { return a.status === 'pending'; }).length;
    var approved = all.filter(function (a) { return a.status === 'approved'; }).length;
    var todayStr = new Date().toISOString().slice(0, 10);
    var upcoming = all.filter(function (a) { return a.prefDate >= todayStr && a.status !== 'cancelled'; }).length;

    document.getElementById('statRow').innerHTML = [
      ['Local drafts & requests', all.length],
      ['Pending', pending],
      ['Approved', approved],
      ['Upcoming', upcoming]
    ].map(function (s) {
      return '<div class="stat"><div class="label">' + s[0] + '</div><div class="value">' + s[1] + '</div></div>';
    }).join('');

    // Table
    var body = document.getElementById('apptBody');
    var empty = document.getElementById('emptyNote');
    if (!all.length) {
      body.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';
    body.innerHTML = all.map(function (a) {
      return '<tr>' +
        '<td>' + esc(a.fullName) +
          (a.brideName || a.groomName ? '<div class="muted" style="font-size:0.8rem">' + esc([a.brideName, a.groomName].filter(Boolean).join(' & ')) + '</div>' : '') +
        '</td>' +
        '<td>' + esc(fmtDate(a.weddingDate)) + '</td>' +
        '<td>' + esc(fmtDate(a.prefDate)) + '</td>' +
        '<td>' + esc(a.prefTime) + '</td>' +
        '<td>' + esc(a.consultationType) + '</td>' +
        '<td><span class="badge ' + (a.status === 'approved' ? 'approved' : 'pending') + '">' + esc(a.status) + '</span></td>' +
        '<td><div class="admin-actions" style="justify-content:flex-end">' +
          (a.status !== 'approved' ? '<button class="btn-xs go" data-approve="' + esc(a.id) + '">Approve</button>' : '') +
          '<button class="btn-xs danger" data-delete="' + esc(a.id) + '">Delete</button>' +
        '</div></td>' +
      '</tr>';
    }).join('');

    // Wire actions
    Array.prototype.forEach.call(body.querySelectorAll('[data-approve]'), function (b) {
      b.addEventListener('click', function () {
        var list = loadAll();
        var item = list.filter(function (x) { return x.id === b.getAttribute('data-approve'); })[0];
        if (item) { item.status = 'approved'; saveAll(list); window.MiidearToast('Appointment approved.'); render(); }
      });
    });
    Array.prototype.forEach.call(body.querySelectorAll('[data-delete]'), function (b) {
      b.addEventListener('click', function () {
        if (!confirm('Delete this appointment? This cannot be undone.')) return;
        var id = b.getAttribute('data-delete');
        var list = loadAll().filter(function (x) { return x.id !== id; });
        saveAll(list);
        window.MiidearToast('Appointment deleted.');
        render();
      });
    });
  }
})();
