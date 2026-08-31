// ============================================================================
// Miidear — emailjs.js  (MII14)
// EmailJS wrapper using the EXACT template variable names configured in the
// EmailJS dashboard (no aliases):
//
//   Client template (template_nq865fx), To Email = {{client_email}}:
//     client_email, client_name, email_subject, email_heading, main_message,
//     secondary_message, meeting_link, wedding_date, consultation_type,
//     preferred_time, notes
//
//   Internal template (template_82n5a9r), Subject uses {{client_name}}:
//     client_name, client_email, phone, wedding_date, consultation_type,
//     preferred_time, notes
//
// Sends never throw; they resolve to {ok, error}. Callers decide what to do.
// ============================================================================
(function () {
  'use strict';

  var CFG = {
    PUBLIC_KEY: 'OoDFR6db14jRaokSQ',
    SERVICE_ID: 'service_vhxwsni',
    TEMPLATE_CLIENT: 'template_nq865fx',
    TEMPLATE_INTERNAL: 'template_82n5a9r'
  };

  var sdkPromise = null;
  function getSdk() {
    if (sdkPromise) return sdkPromise;
    sdkPromise = new Promise(function (resolve, reject) {
      if (window.emailjs) { resolve(window.emailjs); return; }
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
      s.onload = function () {
        try { window.emailjs.init({ publicKey: CFG.PUBLIC_KEY }); resolve(window.emailjs); }
        catch (e) { reject(e); }
      };
      s.onerror = function () { reject(new Error('EmailJS SDK failed to load (network/CDN blocked).')); };
      document.head.appendChild(s);
    });
    return sdkPromise;
  }

  function send(label, templateId, params) {
    return getSdk().then(function (ejs) {
      return ejs.send(CFG.SERVICE_ID, templateId, params).then(
        function (res) {
          console.log('[MiidearEmail] ' + label + ' sent:', res && res.status, res && res.text);
          return { ok: true, error: null };
        },
        function (err) {
          var msg = (err && (err.text || err.message)) || String(err);
          console.error('[MiidearEmail] ' + label + ' FAILED:', msg, err);
          return { ok: false, error: { message: msg } };
        }
      );
    }).catch(function (err) {
      var msg = err && err.message ? err.message : String(err);
      console.error('[MiidearEmail] ' + label + ' could not send:', msg);
      return { ok: false, error: { message: msg } };
    });
  }

  // Map an inquiry record to the INTERNAL template's exact variables.
  function internalParams(inq) {
    return {
      client_name: inq.full_name || '',
      client_email: inq.email || '',
      phone: inq.phone || '',
      wedding_date: inq.wedding_date || '',
      consultation_type: inq.consultation_type || '',
      preferred_time: inq.preferred_time || '',
      notes: inq.notes || ''
    };
  }

  // Map an inquiry record to the CLIENT template's exact variables.
  function clientParams(inq, fields) {
    var p = {
      client_email: inq.email || '',      // <-- To Email = {{client_email}}
      client_name: inq.full_name || '',
      email_subject: '',
      email_heading: '',
      main_message: '',
      secondary_message: '',
      meeting_link: '',
      wedding_date: inq.wedding_date || '',
      consultation_type: inq.consultation_type || '',
      preferred_time: inq.preferred_time || '',
      notes: inq.notes || ''
    };
    if (fields) for (var k in fields) if (fields.hasOwnProperty(k)) p[k] = fields[k];
    return p;
  }

  window.MiidearEmail = {
    available: function () { return true; },

    // A — new request: internal notification + client "Request Received".
    // Resolves with both results so the caller can surface failures.
    sendNew: function (inq) {
      var internal = send('internal-notification', CFG.TEMPLATE_INTERNAL, internalParams(inq));
      var client = send('client-received', CFG.TEMPLATE_CLIENT, clientParams(inq, {
        email_subject: 'We have received your request — Miidear',
        email_heading: 'Thank you, ' + (inq.full_name || '') + '.',
        main_message: 'We have received your consultation request and will be in touch very shortly to arrange your private appointment.',
        secondary_message: 'If you have any questions in the meantime, simply reply to this email.'
      }));
      return Promise.all([internal, client]).then(function (r) {
        return { internal: r[0], client: r[1] };
      });
    },

    // B — approved: client email including the meeting link.
    sendApproved: function (inq, meetingLink) {
      return send('client-approved', CFG.TEMPLATE_CLIENT, clientParams(inq, {
        email_subject: 'Your consultation is confirmed — Miidear',
        email_heading: 'Your consultation is confirmed.',
        main_message: 'We are delighted to confirm your consultation. We look forward to speaking with you.',
        secondary_message: meetingLink ? 'You can join using this link when the time comes.' : '',
        meeting_link: meetingLink || ''
      })).then(function (r) { return { client: r }; });
    },

    // C — reschedule requested.
    sendReschedule: function (inq) {
      return send('client-reschedule', CFG.TEMPLATE_CLIENT, clientParams(inq, {
        email_subject: 'About your consultation time — Miidear',
        email_heading: 'A small change to your consultation.',
        main_message: 'We would like to arrange a different time for your consultation. We will be in touch shortly with new options.',
        secondary_message: 'Thank you for your understanding.'
      })).then(function (r) { return { client: r }; });
    }
  };
})();
