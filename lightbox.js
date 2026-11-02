// ============================================================================
// Miidear — js/lightbox.js
// A premium collection viewer. Opens a centered modal over a blurred backdrop,
// shows one square frame at a time, and loops infinitely in both directions
// (last → next → first, first → prev → last). Supports image and video slots.
//
// Usage (from main.js):
//   window.MiidearLightbox.open({ couple: 'Pim & Krit', images: [ {img:'...'} , {video:'...'} , {} ] });
// A slot with neither img nor video renders an elegant placeholder.
// ============================================================================
(function () {
  'use strict';

  var root   = document.getElementById('lightbox');
  if (!root) return; // page has no lightbox markup

  var frame  = document.getElementById('lbFrame');
  var who    = document.getElementById('lbWho');
  var count  = document.getElementById('lbCount');
  var prevBtn = document.getElementById('lbPrev');
  var nextBtn = document.getElementById('lbNext');

  var slides = [];
  var index = 0;
  var lastFocus = null;

  function renderSlide() {
    if (!slides.length) return;
    var slide = slides[index];
    var inner = '';
    if (slide && slide.video) {
      inner = '<video src="' + slide.video + '" controls playsinline></video>';
    } else if (slide && slide.img) {
      inner = '<img src="' + slide.img + '" alt="Collection image ' + (index + 1) + '" />';
    } else {
      // Elegant placeholder when no media is supplied yet.
      inner = '<div class="ph ph--square"></div>';
    }
    frame.innerHTML = inner;
    count.textContent = (index + 1) + ' / ' + slides.length;
  }

  // Infinite looping: wrap around at both ends.
  function step(dir) {
    if (!slides.length) return;
    index = (index + dir + slides.length) % slides.length;
    renderSlide();
  }

  function open(collection) {
    slides = (collection && collection.images && collection.images.length) ? collection.images : [{}];
    index = 0;
    who.textContent = collection && collection.couple ? collection.couple : (collection && collection.name) || '';
    renderSlide();
    lastFocus = document.activeElement;
    root.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    nextBtn.focus();
  }

  function close() {
    root.classList.remove('is-open');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    // Stop any playing video.
    var v = frame.querySelector('video');
    if (v) { try { v.pause(); } catch (e) {} }
    frame.innerHTML = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onKey(e) {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  }

  // Controls
  nextBtn.addEventListener('click', function () { step(1); });
  prevBtn.addEventListener('click', function () { step(-1); });
  Array.prototype.forEach.call(root.querySelectorAll('[data-close]'), function (el) {
    el.addEventListener('click', close);
  });

  // Touch swipe
  var startX = 0;
  frame.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  frame.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1);
  }, { passive: true });

  // Expose
  window.MiidearLightbox = { open: open, close: close };
})();
