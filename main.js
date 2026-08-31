// ============================================================================
// Miidear — js/main.js
// Shared site behaviour: header/nav, scroll reveals, FAQ accordion, contact
// link wiring, sample gallery + testimonial rendering, and service-worker
// registration. Loaded on every page. Page-specific logic lives in
// booking.js, lightbox.js, and admin.js.
// ============================================================================

/* ---------------------------------------------------------------------------
   1. CONTACT DETAILS — EDIT THESE
   Fill in your real handles / numbers. Leave a value as '' to hide that link.
   For WhatsApp use the international number, digits only (e.g. 66812345678).
   --------------------------------------------------------------------------- */
window.MIIDEAR_CONTACT = {
  phone:     '',   // e.g. '+66 2 000 0000'
  telegram:  '',   // e.g. 'miidear'  or full https URL
  whatsapp:  '',   // e.g. '66812345678'  (country code, digits only)
  line:      '',   // e.g. '@miidear'  or full https URL
  email:     '',   // e.g. 'hello@miidear.com'
  instagram: '',   // e.g. 'https://instagram.com/miidear'
  tiktok:    '',   // e.g. 'https://tiktok.com/@miidear'
  facebook:  ''    // e.g. 'https://facebook.com/miidear'
};

/* ---------------------------------------------------------------------------
   2. SAMPLE CONTENT
   Couple names per collection. Photos are intentionally blank (placeholders);
   each "image" is a slot the lightbox shows. Replace `img` with a real URL or
   add a `video` URL later — the lightbox already supports both.
   --------------------------------------------------------------------------- */
window.MIIDEAR_DATA = {
  featured: [
    { name: 'Aurelia',     couple: 'Pim & Krit',     images: [{}, {}, {}, {}] },
    { name: 'Maison Blanc',couple: 'Aom & Tee',      images: [{}, {}, {}] },
    { name: 'Quiet Lines', couple: 'Mei & Nathan',   images: [{}, {}, {}, {}, {}] }
  ],
  thai: [
    { couple: 'Ploy & Win',    images: [{}, {}, {}] },
    { couple: 'Fah & Arthit',  images: [{}, {}, {}, {}] },
    { couple: 'Nan & Beam',    images: [{}, {}] },
    { couple: 'Som & Tar',     images: [{}, {}, {}] }
  ],
  chinese: [
    { couple: 'Li & Cheng',    images: [{}, {}, {}] },
    { couple: 'Mei & Hao',     images: [{}, {}, {}, {}] },
    { couple: 'Xin & Jun',     images: [{}, {}] },
    { couple: 'Yan & Bo',      images: [{}, {}, {}] }
  ],
  modern: [
    { couple: 'Alyssa & Dom',  images: [{}, {}, {}] },
    { couple: 'Cara & Leo',    images: [{}, {}, {}, {}] },
    { couple: 'Iris & Sam',    images: [{}, {}] },
    { couple: 'Noor & Adam',   images: [{}, {}, {}] }
  ],
  western: [
    { couple: 'Grace & Henry', images: [{}, {}, {}] },
    { couple: 'Clara & James', images: [{}, {}, {}, {}] },
    { couple: 'Eva & Oliver',  images: [{}, {}] },
    { couple: 'Rose & Will',   images: [{}, {}, {}] }
  ]
};

window.MIIDEAR_TESTIMONIALS = [
  { quote: 'Working with Miidear felt less like ordering invitations and more like commissioning a small heirloom.', who: 'Pim & Krit', ctx: 'Bangkok · 2024', rating: 5 },
  { quote: 'Every detail was considered. Our guests still talk about the moment they opened the envelope.', who: 'Aom & Tee', ctx: 'Chiang Mai · 2024', rating: 5 },
  { quote: 'The monogram they drew for us now appears on everything from our menus to our thank-you cards.', who: 'Mei & Nathan', ctx: 'Phuket · 2023', rating: 5 },
  { quote: 'Unhurried, personal, and quietly luxurious. Exactly what we hoped for.', who: 'Ploy & Win', ctx: 'Bangkok · 2024', rating: 4.5 },
  { quote: 'They understood our story before we finished telling it. The suite was perfect.', who: 'Li & Cheng', ctx: 'Bangkok · 2023', rating: 5 },
  { quote: 'The paper, the weight, the printing — everything felt deliberate and rare.', who: 'Alyssa & Dom', ctx: 'Hua Hin · 2024', rating: 5 },
  { quote: 'We changed our minds a hundred times and they remained gracious and patient throughout.', who: 'Cara & Leo', ctx: 'Bangkok · 2023', rating: 4.5 },
  { quote: 'A genuine atelier experience. You feel the craftsmanship in your hands.', who: 'Grace & Henry', ctx: 'Bangkok · 2024', rating: 5 },
  { quote: 'Our destination guests received their invitations flawlessly. The shipping was impeccable.', who: 'Iris & Sam', ctx: 'Krabi · 2023', rating: 5 },
  { quote: 'The most beautiful thing we sent for our wedding. Worth every moment of the process.', who: 'Clara & James', ctx: 'Bangkok · 2024', rating: 5 }
];

(function () {
  'use strict';

  // --- Footer year --------------------------------------------------------
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // --- Header scroll state ------------------------------------------------
  var header = document.getElementById('header');
  if (header && !header.classList.contains('is-scrolled')) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 30); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // --- Mobile nav (full-screen overlay) -----------------------------------
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');
  var navClose = document.getElementById('navClose');

  function setMenu(open) {
    if (!nav) return;
    nav.classList.toggle('is-open', open);
    if (toggle) {
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    document.body.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(!nav.classList.contains('is-open'));
    });
    if (navClose) navClose.addEventListener('click', function () { setMenu(false); });
    // Close after following any link in the overlay.
    Array.prototype.forEach.call(nav.querySelectorAll('a'), function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    // Escape closes the overlay.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) setMenu(false);
    });
  }

  // --- Scroll reveals -----------------------------------------------------
  // Mii51: motion.js owns the reveal choreography whenever it is present AND
  // has claimed the work (it sets window.MiidearMotion only after passing its
  // capability + context gate). If it bailed — reduced motion, the dashboard
  // editor iframe, an unsupported browser, a failed load — the flag is absent
  // and this original path stays in charge exactly as before.
  var reveals = window.MiidearMotion ? [] : document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, i) {
        if (e.isIntersecting) {
          setTimeout(function () { e.target.classList.add('is-visible'); }, i * 60);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-visible'); });
  }

  // --- FAQ accordion ------------------------------------------------------
  var faqItems = document.querySelectorAll('.faq-item');
  Array.prototype.forEach.call(faqItems, function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var open = item.classList.contains('is-open');
      // Close siblings for a clean single-open accordion.
      Array.prototype.forEach.call(faqItems, function (other) {
        other.classList.remove('is-open');
        var oa = other.querySelector('.faq-a');
        var oq = other.querySelector('.faq-q');
        if (oa) oa.style.maxHeight = null;
        if (oq) oq.setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        item.classList.add('is-open');
        q.setAttribute('aria-expanded', 'true');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  // --- Contact / social links --------------------------------------------
  function hrefFor(channel, value) {
    if (!value) return null;
    switch (channel) {
      case 'phone':    return 'tel:' + String(value).replace(/\s+/g, '');
      case 'email':    return 'mailto:' + value;
      case 'whatsapp': return 'https://wa.me/' + String(value).replace(/[^\d]/g, '');
      case 'line':     return value.indexOf('http') === 0 ? value : 'https://line.me/R/ti/p/' + value;
      case 'telegram': return value.indexOf('http') === 0 ? value : 'https://t.me/' + String(value).replace(/^@/, '');
      default:         return value.indexOf('http') === 0 ? value : 'https://' + value;
    }
  }
  function displayValue(channel, value) {
    return value; // show the raw handle/number as the link text
  }
  var contactEls = document.querySelectorAll('[data-contact]');
  Array.prototype.forEach.call(contactEls, function (el) {
    var ch = el.getAttribute('data-contact');
    var val = window.MIIDEAR_CONTACT[ch];
    var href = hrefFor(ch, val);
    if (href) {
      el.setAttribute('href', href);
      if (ch !== 'phone' && ch !== 'email') { el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener'); }
      // If this element is an info-row link or social pill, show the value.
      if (el.closest('.info-row')) el.textContent = displayValue(ch, val);
    } else {
      // No value set: in info rows show an em dash; elsewhere hide the element.
      if (el.closest('.info-row')) { el.removeAttribute('href'); el.textContent = '—'; }
      else el.style.display = 'none';
    }
  });

  // --- Gallery rendering (featured cards + portfolio rails) ---------------
  function star(rating) {
    var full = Math.floor(rating);
    var half = rating - full >= 0.5;
    var s = '';
    for (var i = 0; i < full; i++) s += '★';
    if (half) s += '½';
    while ((s.replace('½', '').length + (half ? 1 : 0)) < 5) s += '☆';
    return s;
  }
  window.MIIDEAR_star = star;

  // MII26: the Featured (Selection of Our Work) grid and the Portfolio rails are
  // now rendered exclusively by content.js from the Supabase `projects` table
  // (single source of truth + Website Editor edit hooks). The previous static
  // MIIDEAR_DATA renderers were removed here to end the two-renderer conflict.
  // NOTE: testimonials, hero video, nav, reveals, FAQ, contact, year — all still
  // handled by this file below and are intentionally untouched.

  // Testimonial rail (homepage)
  var trail = document.getElementById('testimonialRail');
  if (trail) {
    trail.innerHTML = window.MIIDEAR_TESTIMONIALS.map(function (t) {
      return '<figure class="testimonial-card">' +
        '<div class="stars" aria-label="' + t.rating + ' out of 5">' + star(t.rating) + '</div>' +
        '<blockquote>“' + t.quote + '”</blockquote>' +
        '<figcaption><div class="who">' + t.who + '</div><div class="ctx">' + t.ctx + '</div></figcaption>' +
      '</figure>';
    }).join('');
  }

  // Re-observe any reveal cards we just injected.
  // Mii51: skipped when motion.js is in charge — its MutationObserver already
  // choreographs late-inserted cards.
  if (!window.MiidearMotion && 'IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); io2.unobserve(e.target); } });
    }, { threshold: 0.1 });
    Array.prototype.forEach.call(document.querySelectorAll('.collection-card.reveal:not(.is-visible)'), function (el) { io2.observe(el); });
  }

  // --- Wire "View Collection" buttons to the lightbox ---------------------
  // (Lightbox is defined in lightbox.js and attaches a global window.MiidearLightbox.)
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-open-gallery]');
    if (!btn) return;
    var key = btn.getAttribute('data-open-gallery');
    var index = parseInt(btn.getAttribute('data-index'), 10) || 0;
    var collection = (window.MIIDEAR_DATA[key] || [])[index];
    if (collection && window.MiidearLightbox) {
      window.MiidearLightbox.open(collection);
    }
  });

  // --- Hero video: ensure it plays inline on mobile (iOS Safari/Android) ---
  // iOS only autoplays when muted + playsinline are set as PROPERTIES (not just
  // attributes) before play() is called. We enforce them and kick playback,
  // falling back silently to the poster if the browser still refuses.
  var heroVideo = document.getElementById('heroVideo');
  if (heroVideo) {
    heroVideo.muted = true;            // property form required by iOS
    heroVideo.defaultMuted = true;
    heroVideo.playsInline = true;      // property form required by iOS
    heroVideo.setAttribute('muted', '');
    heroVideo.setAttribute('playsinline', '');
    heroVideo.setAttribute('webkit-playsinline', '');
    var tryPlay = function () {
      var p = heroVideo.play();
      if (p && typeof p.catch === 'function') p.catch(function () {/* poster stays as fallback */});
    };
    // Ensure the source is loaded, then attempt playback.
    if (heroVideo.readyState >= 2) tryPlay();
    else heroVideo.addEventListener('loadeddata', tryPlay, { once: true });
    heroVideo.addEventListener('canplay', tryPlay, { once: true });
    // Retry on the first user interaction (covers browsers that gate autoplay).
    ['touchstart', 'click', 'scroll'].forEach(function (evt) {
      document.addEventListener(evt, function once() {
        tryPlay();
        ['touchstart', 'click', 'scroll'].forEach(function (e2) { document.removeEventListener(e2, once); });
      }, { passive: true, once: true });
    });
    // Retry when the hero scrolls back into view.
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) tryPlay(); });
      });
      io.observe(heroVideo);
    }
  }

  // --- Hidden admin access: triple click/tap the footer logo within 2s -----
  var footerLogo = document.querySelector('.footer-logo');
  if (footerLogo) {
    var taps = 0;
    var firstTapAt = 0;
    var resetTimer = null;
    footerLogo.style.cursor = 'pointer';
    footerLogo.addEventListener('click', function (e) {
      e.preventDefault();
      var now = Date.now();
      if (taps === 0 || (now - firstTapAt) > 2000) {
        taps = 1;
        firstTapAt = now;
      } else {
        taps += 1;
      }
      clearTimeout(resetTimer);
      resetTimer = setTimeout(function () { taps = 0; }, 2000);
      if (taps >= 3 && (now - firstTapAt) <= 2000) {
        taps = 0;
        window.location.href = 'admin.html';
      }
    });
  }

  // --- Service worker -----------------------------------------------------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function (err) {
        console.warn('SW registration failed:', err);
      });
    });
  }
})();
