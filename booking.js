// ============================================================================
// Miidear — booking.js  (Mii7)
// Saves each consultation request into the Supabase `inquiries` table.
//   * Generates a unique inquiry_id.
//   * Maps the booking form to the table columns:
//       full_name, email, phone, wedding_date, consultation_type,
//       preferred_time, notes, created_at  (+ inquiry_id)
//   * Bride / groom / venue / guests are folded into notes so nothing is lost.
// No email, no calendar logic, no availability blocking (per Mii7 scope).
// Requires: config.js + supabase-client.js loaded before this file.
// ============================================================================
(function () {
  'use strict';

  // Minimal toast (safe fallback if admin.js's richer one isn't present).
  if (!window.MiidearToast) {
    window.MiidearToast = function (text) {
      var el = document.getElementById('toast');
      if (!el) return;
      el.textContent = text;
      el.classList.add('show');
      setTimeout(function () { el.classList.remove('show'); }, 2400);
    };
  }

  var form = document.getElementById('bookingForm');
  if (!form) return; // not on the booking page

  var msg = document.getElementById('formMsg');
  var slotHint = document.getElementById('slotHint');
  var slotOptions = document.getElementById('slotOptions');
  var prefDate = document.getElementById('prefDate');
  var prefTime = document.getElementById('prefTime');
  var submitBtn = document.getElementById('submitBtn');

  // Mii44 — set true when the client has chosen to proceed despite blank
  // optional fields, so the next submit skips the confirmation and goes through.
  var proceedConfirmed = false;

  // Mii44 — elegant confirmation when optional details are left blank. Returns
  // true if the dialog was shown (caller should wait), false if it could not be
  // built (caller should submit normally — never block a valid booking).
  function showOptionalConfirm(missing) {
    if (!form || !document.body) return false;
    // Remove any prior instance (defensive).
    var prior = document.getElementById('miiConfirmOverlay');
    if (prior && prior.parentNode) prior.parentNode.removeChild(prior);

    var overlay = document.createElement('div');
    overlay.id = 'miiConfirmOverlay';
    overlay.className = 'mii-confirm-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'miiConfirmTitle');

    var list = missing.map(function (m) { return '<li>' + m + '</li>'; }).join('');
    overlay.innerHTML =
      '<div class="mii-confirm">' +
        '<h3 class="mii-confirm__title" id="miiConfirmTitle">A Few Details Remain</h3>' +
        '<p class="mii-confirm__lead">To help us prepare for your consultation with the utmost care, we noticed the following were left blank:</p>' +
        '<ul class="mii-confirm__list">' + list + '</ul>' +
        '<p class="mii-confirm__lead">You are welcome to proceed — we will gather anything outstanding together. How would you like to continue?</p>' +
        '<div class="mii-confirm__actions">' +
          '<button type="button" class="btn mii-confirm__no" id="miiConfirmNo">No, Let Me Complete It</button>' +
          '<button type="button" class="btn btn--accent mii-confirm__yes" id="miiConfirmYes">Yes, Reserve My Consultation</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    function close() {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) { if (e.key === 'Escape') { close(); } } // Escape = safe cancel
    document.addEventListener('keydown', onKey);

    var yes = document.getElementById('miiConfirmYes');
    var no = document.getElementById('miiConfirmNo');
    if (yes) yes.addEventListener('click', function () {
      close();
      proceedConfirmed = true;
      // Re-submit through the normal path (validation re-runs, modal skipped).
      if (typeof form.requestSubmit === 'function') form.requestSubmit();
      else form.dispatchEvent(new Event('submit', { cancelable: true }));
    });
    if (no) no.addEventListener('click', function () { close(); }); // cancel, form intact
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    if (yes) yes.focus();
    return true;
  }

  // Restrict preferred date to tomorrow … +120 days (UX only).
  var today = new Date();
  var min = new Date(today.getTime() + 24 * 3600 * 1000);
  var max = new Date(today.getTime() + 120 * 86400 * 1000);
  if (prefDate) {
    prefDate.min = min.toISOString().slice(0, 10);
    prefDate.max = max.toISOString().slice(0, 10);
  }

  // ---- M/13.0 slot locking ------------------------------------------------
  // Blocked = any preferred_time string already taken (Pending/Confirmed/
  // Completed). We disable matching <option>s for the chosen date.
  var blocked = {};   // { 'YYYY-MM-DD HH:MM': true }
  function loadBlocked() {
    if (!window.MiidearDB || !window.MiidearDB.blockedSlots) return Promise.resolve();
    return window.MiidearDB.blockedSlots().then(function (res) {
      blocked = {};
      (res.data || []).forEach(function (s) { if (s) blocked[String(s).trim()] = true; });
      refreshTimeOptions();
    });
  }
  function refreshTimeOptions() {
    if (!prefTime || !prefDate || !prefDate.value) return;
    Array.prototype.forEach.call(prefTime.options, function (opt) {
      if (!opt.value) return;
      var taken = blocked[prefDate.value + ' ' + opt.value];
      opt.disabled = !!taken;
      opt.textContent = taken ? (opt.value + ' — booked') : opt.value;
    });
    // If the currently selected time just became blocked, clear it.
    if (prefTime.value && blocked[prefDate.value + ' ' + prefTime.value]) prefTime.value = '';
  }
  if (prefDate) prefDate.addEventListener('change', refreshTimeOptions);
  loadBlocked();

  function fail(text) {
    msg.textContent = text;
    msg.className = 'form-msg error';
    msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Build the notes field, folding in the extra (non-column) form values.
  function composeNotes(v) {
    var extras = [];
    if (v.brideName) extras.push('Bride: ' + v.brideName);
    if (v.groomName) extras.push('Groom: ' + v.groomName);
    if (v.venue) extras.push('Venue: ' + v.venue);
    if (v.guests) extras.push('Guests: ' + v.guests);
    var parts = [];
    if (v.notes) parts.push(v.notes);
    if (extras.length) parts.push(extras.join(' · '));
    return parts.join('\n');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.textContent = '';
    msg.className = 'form-msg';
    if (slotOptions) slotOptions.innerHTML = '';

    var v = {
      fullName: form.fullName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      brideName: form.brideName.value.trim(),
      groomName: form.groomName.value.trim(),
      weddingDate: form.weddingDate.value || '',
      venue: form.venue.value.trim(),
      guests: form.guests.value || '',
      consultationType: form.consultationType.value,
      prefDate: form.prefDate.value,
      prefTime: form.prefTime.value,
      notes: form.notes.value.trim()
    };

    // Validation — hard floor (a consultation cannot be booked without these).
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) return fail('Please enter a valid email address.');
    if (!v.consultationType) return fail('Please choose a consultation type.');
    if (!v.prefDate) return fail('Please choose a preferred date.');
    if (!v.prefTime) return fail('Please choose a preferred time.');

    // Mii44 — optional details: rather than block, gently confirm before
    // proceeding if any are left blank. The hard-floor fields above are always
    // required. If the confirmation can't be shown for any reason, we fall
    // through and submit normally (never block a valid booking on the modal).
    if (!proceedConfirmed) {
      var missing = [];
      if (!v.fullName) missing.push('Full name');
      if (!v.phone) missing.push('Phone number');
      if (!v.brideName) missing.push('Bride’s name');
      if (!v.groomName) missing.push('Groom’s name');
      if (!v.weddingDate) missing.push('Wedding date');
      if (!v.venue) missing.push('Wedding venue');
      if (!v.guests) missing.push('Estimated guest count');
      if (!v.notes) missing.push('Additional notes');
      if (missing.length) {
        var shown = false;
        try { shown = showOptionalConfirm(missing); } catch (err) { shown = false; }
        if (shown) return; // wait for the client's choice; submit re-runs on "Yes"
      }
    }
    proceedConfirmed = false; // reset for subsequent submissions

    // Combined preferred date + time stored in preferred_time column.
    var preferredTime = v.prefDate + ' ' + v.prefTime;

    submitBtn.disabled = true;
    var originalLabel = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';

    // Revalidate against the latest blocked slots right before submitting,
    // to guard against a slot taken since the page loaded (race condition).
    var revalidate = window.MiidearDB.blockedSlots
      ? window.MiidearDB.blockedSlots()
      : Promise.resolve({ data: [] });

    revalidate.then(function (b) {
      var taken = {};
      (b.data || []).forEach(function (s) { if (s) taken[String(s).trim()] = true; });
      blocked = taken; refreshTimeOptions();
      if (taken[preferredTime]) {
        submitBtn.disabled = false; submitBtn.textContent = originalLabel;
        return fail('That time has just been reserved. Please choose another available time.');
      }

      // Row matching the `inquiries` table columns.
      var record = {
        inquiry_id: window.MiidearDB.generateInquiryId(),
        full_name: v.fullName,
        email: v.email,
        phone: v.phone,
        wedding_date: v.weddingDate || null,
        consultation_type: v.consultationType,
        preferred_time: preferredTime,
        notes: composeNotes(v),
        created_at: new Date().toISOString()
      };

      window.MiidearDB.insertInquiry(record).then(function (res) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;

        if (res.error) {
          fail('We could not submit your request just now. Please try again, or contact us directly. (' + res.error.message + ')');
          return;
        }

        // Fire confirmation + internal notification emails. Booking has
        // already saved at this point, so email problems never block it —
        // but we DO surface failures to the console for diagnosis.
        if (window.MiidearEmail) {
          window.MiidearEmail.sendNew(record).then(function (r) {
            if (r && r.client && !r.client.ok) {
              console.error('[Miidear] Client confirmation email failed:', r.client.error && r.client.error.message);
            }
            if (r && r.internal && !r.internal.ok) {
              console.error('[Miidear] Internal notification email failed:', r.internal.error && r.internal.error.message);
            }
          });
        }

        // Confirmation.
        form.style.display = 'none';
        var conf = document.getElementById('confirmation');
        conf.style.display = 'block';
        var when = new Date(v.prefDate + 'T' + v.prefTime).toLocaleDateString('en-GB', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
        document.getElementById('confirmDetail').textContent =
          v.consultationType + ' consultation · ' + when + ' at ' + v.prefTime;
        conf.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.MiidearToast('Consultation requested.');
        loadBlocked(); // refresh so this slot now shows as taken
      });
    });
  });

  // "Book Another" resets the form.
  var another = document.getElementById('anotherBtn');
  if (another) {
    another.addEventListener('click', function () {
      form.reset();
      form.style.display = 'block';
      document.getElementById('confirmation').style.display = 'none';
      if (slotHint) slotHint.textContent = '';
      if (slotOptions) slotOptions.innerHTML = '';
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
})();
