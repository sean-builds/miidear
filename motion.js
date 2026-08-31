// ============================================================================
// Miidear — motion.js
// Scroll choreography for the public site: entrance reveals, image unveilings,
// staggered cascades, hero parallax, a hairline reading rule, and the drawn
// timeline on The Experience.
//
// The register is deliberately unhurried — long easings, generous delays, no
// bounce. An invitation is opened slowly; the site should behave the same way.
//
// ----------------------------------------------------------------------------
// SAFETY CONTRACT — read before editing
// ----------------------------------------------------------------------------
// Nothing is ever hidden unless this script is alive and has claimed the work.
// Every initial hidden state in style.css sits behind `html.js-motion`, a class
// only this file sets, and only after it has verified it can finish the job.
// If this file is missing, blocked, throws, or the visitor prefers reduced
// motion, that class is never set and the pages render exactly as they would
// with no motion layer at all.
//
// Four layers, in order:
//   1. Capability + context gate  — bail before touching the DOM.
//   2. try/catch around init      — on throw, reveal everything.
//   3. window 'error' listener    — any script error anywhere reveals all.
//   4. Hard 6s timer              — armed immediately; sweeps up stragglers.
//
// main.js stands down from its own reveal observer ONLY when this file has set
// window.MiidearMotion, so the original path stays in charge whenever we bail.
// ============================================================================

(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;

  // --- 1. Gate --------------------------------------------------------------
  // Editor iframe: the dashboard loads public pages with ?edit=1 to edit them
  // in place. Motion would fight the editor click targets, so we sit it out.
  var inFrame = true;
  try { inFrame = (window.top !== window.self); } catch (e) { inFrame = true; }
  var inEditor = inFrame || /[?&]edit=1(?:&|$)/.test(location.search || '');

  var reduced = false;
  try {
    reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch (e) {}

  var capable = ('IntersectionObserver' in window) &&
                ('MutationObserver' in window) &&
                !!root.classList &&
                !!window.requestAnimationFrame;

  if (inEditor || reduced || !capable) return;

  root.classList.add('js-motion');
  window.MiidearMotion = { v: 1 };

  // --- 2. Reveal primitives -------------------------------------------------
  var SHOWN = 'is-visible';
  var STRAGGLERS = '.reveal:not(.' + SHOWN + '), [data-anim]:not(.' + SHOWN + ')';

  function show(el) {
    if (el && el.classList && !el.classList.contains(SHOWN)) el.classList.add(SHOWN);
  }

  // Last resort only: used on error paths, never on a timer. Revealing the
  // whole document would defeat the choreography for everything below the fold.
  function revealAll() {
    var list = doc.querySelectorAll(STRAGGLERS);
    for (var i = 0; i < list.length; i++) show(list[i]);
  }

  // The routine safety net: reveal only what should already have arrived —
  // anything at or above the fold. Content further down stays hidden so the
  // observer can still bring it in as you reach it.
  //
  // The threshold is the fold exactly, never past it. The observer above uses
  // a -6% bottom rootMargin, so in a healthy browser it always fires first and
  // the element animates properly; this only catches what the observer missed.
  // Reaching below the fold here would reveal blocks before they are on screen
  // and rob them of their entrance.
  function sweep() {
    var vh = window.innerHeight || 0;
    var list = doc.querySelectorAll(STRAGGLERS);
    for (var i = 0; i < list.length; i++) {
      var top;
      try { top = list[i].getBoundingClientRect().top; } catch (e) { top = 0; }
      if (top < vh) show(list[i]);
    }
  }

  // Failsafes 3 + 4, armed now so they survive an init that never runs.
  setTimeout(sweep, 6000);
  window.addEventListener('error', function () { try { revealAll(); } catch (e) {} });

  // --- 3. Observer ----------------------------------------------------------
  // rootMargin lifts the trigger line off the very bottom edge, so a block has
  // committed to entering the viewport before it begins to arrive.
  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      if (!entry.isIntersecting) continue;
      io.unobserve(entry.target);
      show(entry.target);
      var kids = entry.target.__mKids;
      if (kids) for (var k = 0; k < kids.length; k++) show(kids[k]);
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

  function watch(el) { try { io.observe(el); } catch (e) { show(el); } }

  // --- 4. Tagging -----------------------------------------------------------
  function tag(el, variant, index) {
    if (!el || !el.getAttribute || el.getAttribute('data-anim')) return false;
    if (el.classList.contains(SHOWN)) return false;
    el.setAttribute('data-anim', variant);
    if (index != null) el.style.setProperty('--m-i', index);
    return true;
  }

  function each(sel, fn) {
    var list = doc.querySelectorAll(sel);
    for (var i = 0; i < list.length; i++) fn(list[i], i);
  }

  // A cascade host stays put while its children arrive one after another. The
  // host own .reveal is neutralised so the block does not fade twice over.
  function cascade(host, variant) {
    if (host.__mDone) return;
    host.__mDone = true;
    var kids = [], n = 0, children = host.children;
    for (var i = 0; i < children.length; i++) {
      if (tag(children[i], variant, n)) { kids.push(children[i]); n++; }
    }
    // Snap the host visible rather than fading it: if it carries the legacy
    // .reveal class, a parent fade would compound with the children arriving
    // inside it and muddy both.
    try { host.style.transition = 'none'; } catch (e) {}
    show(host);
    if (!kids.length) return;
    host.__mKids = kids;
    watch(host);
  }

  function solo(el, variant, index) {
    if (!tag(el, variant, index)) return;
    watch(el);
  }

  // --- 5. Choreography ------------------------------------------------------
  // Re-runnable: everything is guarded so a second pass over already-tagged or
  // already-revealed elements is a no-op. The MutationObserver below leans on
  // that when Supabase content lands after first paint.
  function choreograph() {
    // Hero — eyebrow, headline, lead and buttons arrive in sequence.
    each('.hero__inner', function (el) { cascade(el, 'rise'); });

    // Section headings — flourish, script title, then the lead beneath it.
    each('.section-head', function (el) { cascade(el, 'rise'); });

    // Philosophy column — paragraphs settle one after another.
    each('.split__body', function (el) { cascade(el, 'rise'); });

    // Imagery lifts like tissue drawn back off a printed suite.
    each('.ph:not([data-anim]):not(.' + SHOWN + ')', function (el) {
      solo(el, 'unveil');
    });

    // Project and testimonial cards. Observed individually so a long portfolio
    // reveals as you travel it; the modulo gives each row a left-to-right lilt.
    each('.collection-card, .testimonial-card', function (el, i) {
      solo(el, 'rise', i % 3);
    });

    // The Experience timeline and the FAQ both read as a list you descend, so
    // each entry is triggered on its own rather than cascaded as a block.
    each('.tl-step', function (el) { solo(el, 'step'); });
    each('.faq-item', function (el) { solo(el, 'rise'); });

    // Anything still carrying the legacy .reveal class.
    each('.reveal:not([data-anim]):not(.' + SHOWN + ')', function (el) {
      solo(el, 'rise');
    });
  }

  // --- 6. Late content ------------------------------------------------------
  // content.js writes the Selection, Portfolio and testimonial rails from
  // Supabase well after first paint. Debounced so a bulk innerHTML write
  // settles before we choreograph what it produced.
  var mo = new MutationObserver(function (records) {
    var added = false;
    for (var i = 0; i < records.length; i++) {
      if (records[i].addedNodes && records[i].addedNodes.length) { added = true; break; }
    }
    if (!added) return;
    // Synchronous on purpose. MutationObserver callbacks run as a microtask,
    // before the browser paints, so freshly inserted cards are hidden in the
    // same frame they arrive. Deferring even briefly lets them paint at full
    // opacity and then snap away — a visible blink on every Supabase load.
    // choreograph() is idempotent, and we observe childList only, so setting
    // attributes in here cannot re-enter this callback.
    try { choreograph(); } catch (e) { revealAll(); }
  });

  // --- 7. Scroll effects ----------------------------------------------------
  var bar = null, header = null, heroVideo = null, heroCue = null, timeline = null;
  var lastY = 0, ticking = false;

  function scrollFx() {
    var y = window.pageYOffset || root.scrollTop || 0;
    var vh = window.innerHeight || 1;

    // Hairline reading rule across the top of the page.
    if (bar) {
      var span = Math.max(doc.body.scrollHeight, root.scrollHeight) - vh;
      var p = span > 0 ? y / span : 0;
      bar.style.transform = 'scaleX(' + (p < 0 ? 0 : p > 1 ? 1 : p) + ')';
    }

    // The header withdraws as you read downward and returns the moment you
    // turn back. It never withdraws near the top, or with the menu open.
    if (header) {
      var menuOpen = doc.body.classList.contains('menu-open');
      if (!menuOpen && y > 560 && y > lastY + 4) header.classList.add('is-away');
      else if (menuOpen || y < 140 || y < lastY - 4) header.classList.remove('is-away');
    }

    // Hero: the film drifts slower than the page, and the scroll cue retires.
    if (heroVideo && y < vh * 1.5) {
      heroVideo.style.transform = 'translate3d(0,' + (y * 0.2).toFixed(2) + 'px,0) scale(1.12)';
    }
    if (heroCue) {
      var o = 1 - (y / (vh * 0.3));
      heroCue.style.opacity = o < 0 ? 0 : o > 1 ? 1 : o;
    }

    // The timeline spine draws itself as you descend the process.
    if (timeline) {
      var r = timeline.getBoundingClientRect();
      if (r.height > 0) {
        var d = (vh * 0.55 - r.top) / r.height;
        timeline.style.setProperty('--m-draw', (d < 0 ? 0 : d > 1 ? 1 : d).toFixed(4));
      }
    }

    lastY = y;
  }

  // A throttled positional sweep rides along with scrolling, so that even if
  // the observer were to miss an element the page still fills in as you travel.
  var lastSweep = 0;

  function onScroll() {
    var now = Date.now();
    if (now - lastSweep > 700) {
      lastSweep = now;
      try { sweep(); } catch (e) {}
    }
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      try { scrollFx(); } catch (e) {}
    });
  }

  // --- 8. Init --------------------------------------------------------------
  function init() {
    choreograph();

    header = doc.getElementById('header');
    heroVideo = doc.getElementById('heroVideo');
    heroCue = doc.querySelector('.hero__scroll');
    timeline = doc.querySelector('.timeline');

    if (doc.body) {
      bar = doc.createElement('div');
      bar.className = 'm-progress';
      bar.setAttribute('aria-hidden', 'true');
      doc.body.appendChild(bar);
      mo.observe(doc.body, { childList: true, subtree: true });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    scrollFx();

    // A late sweep for anything above the fold the observer could not reach
    // (a container that never scrolls, a card inside a collapsed row).
    window.addEventListener('load', function () { setTimeout(sweep, 2500); });
  }

  function boot() {
    try { init(); } catch (e) {
      try { revealAll(); } catch (e2) {}
    }
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
