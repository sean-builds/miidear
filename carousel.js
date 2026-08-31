// ============================================================================
// Miidear — carousel.js
// Premium horizontal carousel behaviour for every .rail:
//   • Subtle continuous auto-scroll when idle (pauses on hover / touch / drag,
//     resumes after a short delay). Loops seamlessly by wrapping scroll position.
//   • Click-and-drag anywhere with momentum (grab / grabbing cursors).
//   • Smooth horizontal mouse-wheel scrolling.
//   • No visible scrollbars; no accidental text/image selection while dragging.
// Respects prefers-reduced-motion (disables auto-scroll).
// Safe to run after rails are populated; also observes late-added cards.
// ============================================================================
(function () {
  'use strict';

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var AUTO_SPEED = 0.35;      // px per frame — subtle
  var RESUME_DELAY = 1800;    // ms after interaction before auto-scroll resumes

  function setup(rail) {
    if (!rail || rail.__carousel) return;
    rail.__carousel = true;

    var autoOn = !REDUCED;
    var resumeTimer = null;
    var rafId = null;

    // Drag state
    var dragging = false;
    var armed = false;        // MII33: pointer is down but not yet a confirmed drag
    var pointerId = null;
    var startX = 0;
    var startScroll = 0;
    var lastX = 0;
    var lastT = 0;
    var velocity = 0;
    var momentumId = null;
    var moved = false;

    function pauseAuto() {
      autoOn = false;
      clearTimeout(resumeTimer);
    }
    function scheduleResume() {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(function () { autoOn = true; }, RESUME_DELAY);
    }

    // ---- Auto-scroll loop (seamless wrap) --------------------------------
    function tick() {
      if (autoOn && !dragging) {
        rail.scrollLeft += AUTO_SPEED;
        var max = rail.scrollWidth - rail.clientWidth;
        if (max > 0 && rail.scrollLeft >= max - 0.5) {
          rail.scrollLeft = 0; // loop back to start
        }
      }
      rafId = requestAnimationFrame(tick);
    }
    // Only auto-scroll if content actually overflows.
    function hasOverflow() { return rail.scrollWidth - rail.clientWidth > 4; }

    // ---- Pointer drag with momentum --------------------------------------
    function onDown(e) {
      // Left mouse button or touch/pen only.
      if (e.button !== undefined && e.button !== 0) return;
      // MII33: ARM the gesture only. Do NOT add is-dragging or capture the
      // pointer yet — doing so on press retargets a plain tap/click away from
      // interactive children (e.g. the "View Collection" button) because of
      // setPointerCapture + ".rail.is-dragging * { pointer-events:none }".
      // We promote to a real drag in onMove once movement exceeds the threshold.
      armed = true;
      dragging = false;
      moved = false;
      pointerId = e.pointerId;
      startX = e.clientX;
      lastX = e.clientX;
      lastT = performance.now();
      startScroll = rail.scrollLeft;
      velocity = 0;
      if (momentumId) cancelAnimationFrame(momentumId);
    }
    function onMove(e) {
      if (!armed) return;
      var dx = e.clientX - startX;
      // Promote to a real drag only after the finger/mouse actually moves.
      if (!dragging) {
        if (Math.abs(dx) <= 3) return;        // still a tap — leave children clickable
        dragging = true; moved = true;
        rail.classList.add('is-dragging');     // now disable child pointer-events
        pauseAuto();
        try { rail.setPointerCapture(e.pointerId); } catch (err) {}
      }
      rail.scrollLeft = startScroll - dx;
      var now = performance.now();
      var dt = now - lastT;
      if (dt > 0) velocity = (e.clientX - lastX) / dt; // px per ms
      lastX = e.clientX;
      lastT = now;
      e.preventDefault();
    }
    function onUp(e) {
      armed = false;
      if (!dragging) return;   // a tap: nothing to release, click proceeds normally
      dragging = false;
      rail.classList.remove('is-dragging');
      try { rail.releasePointerCapture(e.pointerId); } catch (err) {}
      // Momentum glide
      var v = velocity * 16; // scale to px/frame
      function glide() {
        if (Math.abs(v) < 0.4) { scheduleResume(); return; }
        rail.scrollLeft -= v;
        v *= 0.94; // friction
        var max = rail.scrollWidth - rail.clientWidth;
        if (rail.scrollLeft <= 0 || rail.scrollLeft >= max) { scheduleResume(); return; }
        momentumId = requestAnimationFrame(glide);
      }
      if (Math.abs(v) > 0.5) glide(); else scheduleResume();
    }

    // Mii36 — navigation behavior is intentionally disabled. Horizontal
    // navigation is handled solely by the visible scroll track (addScrollTrack)
    // plus native overflow scrolling. The following were removed:
    //   • auto-scroll (tick loop) — no requestAnimationFrame(tick) kickoff
    //   • drag-scroll + momentum glide — no pointerdown/move/up/cancel/leave
    //   • vertical-wheel → horizontal translation — no wheel handler
    //   • hover/touch auto-pause — only existed to manage auto-scroll
    // Non-navigation protections are KEPT below.

    // KEEP: prevent the browser's native image ghost-drag inside a rail.
    rail.addEventListener('dragstart', function (e) { e.preventDefault(); });

    // KEEP: observe late-populated rails (no-op placeholder; harmless).
    var obs = new MutationObserver(function () { /* presence triggers natural overflow */ });
    obs.observe(rail, { childList: true });
  }

  function init() {
    // Mii36 — setup() still runs (keeps dragstart guard + observer), but its
    // navigation handlers are disabled inside the function. The visible scroll
    // track is the sole navigation control.
    document.querySelectorAll('.rail').forEach(setup);
    document.querySelectorAll('.rail, .collection-grid').forEach(addScrollTrack);
  }

  // Mii35 Part 2 — a large, always-visible, draggable horizontal scroll track.
  // This is a scrollbar-style control (NOT arrows). It reuses the element's
  // native horizontal scroll (the same scrollLeft the carousel already drives),
  // and stays synchronized in both directions. Drag/swipe on the content is
  // untouched. For .collection-grid (a CSS grid), we enable a scroll row mode.
  function addScrollTrack(row) {
    if (!row || row.__track) return; row.__track = true;
    if (row.id === 'portfolioGrid') return;
    if (row.classList.contains('collection-grid')) row.classList.add('is-scroll-row');

    var track = document.createElement('div');
    track.className = 'scroll-track';
    var thumb = document.createElement('div');
    thumb.className = 'scroll-track__thumb';
    track.appendChild(thumb);
    if (row.parentNode) row.parentNode.insertBefore(track, row.nextSibling);

    function maxScroll() { return Math.max(0, row.scrollWidth - row.clientWidth); }
    function sync() {
      var max = maxScroll();
      if (max <= 2) { track.style.display = 'none'; return; }
      track.style.display = '';
      var ratio = row.clientWidth / row.scrollWidth;          // thumb width fraction
      var tw = track.clientWidth;
      var thumbW = Math.max(48, tw * ratio);
      var travel = tw - thumbW;
      var pos = (row.scrollLeft / max) * travel;
      thumb.style.width = thumbW + 'px';
      thumb.style.transform = 'translateX(' + pos + 'px)';
    }
    // content -> track
    row.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    new MutationObserver(sync).observe(row, { childList: true });
    setTimeout(sync, 300); setTimeout(sync, 800);

    // track -> content (drag the thumb, or click the track)
    var dragging = false, startX = 0, startScroll = 0;
    function fromClientX(clientX) {
      var rect = track.getBoundingClientRect();
      var tw = track.clientWidth;
      var thumbW = thumb.getBoundingClientRect().width;
      var travel = Math.max(1, tw - thumbW);
      var x = Math.min(Math.max(0, clientX - rect.left - thumbW / 2), travel);
      row.scrollLeft = (x / travel) * maxScroll();
    }
    thumb.addEventListener('pointerdown', function (e) {
      dragging = true; startX = e.clientX; startScroll = row.scrollLeft;
      try { thumb.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault(); e.stopPropagation();
    });
    thumb.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var tw = track.clientWidth, thumbW = thumb.getBoundingClientRect().width;
      var travel = Math.max(1, tw - thumbW);
      var dx = e.clientX - startX;
      row.scrollLeft = startScroll + (dx / travel) * maxScroll();
      e.preventDefault();
    });
    function end(e) { if (dragging) { dragging = false; try { thumb.releasePointerCapture(e.pointerId); } catch (err) {} } }
    thumb.addEventListener('pointerup', end);
    thumb.addEventListener('pointercancel', end);
    // click on the track (not the thumb) jumps the position
    track.addEventListener('pointerdown', function (e) {
      if (e.target === thumb) return;
      fromClientX(e.clientX);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  // Re-scan shortly after load in case rails are populated asynchronously.
  window.addEventListener('load', function () { setTimeout(init, 400); });
})();
