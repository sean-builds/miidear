// ============================================================================
// Miidear — content.js
// Public-site content layer. Pulls editable content from Supabase and applies
// it to the page, falling back silently to the content already in the HTML if
// Supabase is unreachable or a value isn't set. This is what lets the owner's
// dashboard edits appear on the live site with no code changes.
//
// Apply rules (data-* hooks, added to the public pages):
//   [data-content="page:key"]      → element.textContent replaced if value set
//   [data-link="key"]              → anchor href replaced if value set
//   [data-hero-video]              → <source> / poster swapped from hero_media
// Reviews + portfolio render into their existing containers when present.
//
// Requires config.js + supabase-client.js loaded first.
// ============================================================================
(function () {
  'use strict';

  if (!window.MiidearDB || !window.MiidearDB.configured || !window.MiidearDB.configured()) return;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ---- Text content -------------------------------------------------------
  function applyContent() {
    var nodes = document.querySelectorAll('[data-content]');
    if (!nodes.length) return;
    window.MiidearDB.selectAll('site_content').then(function (res) {
      if (res.error || !res.data) return;
      var map = {};
      res.data.forEach(function (r) { map[r.page + ':' + r.key] = r.value; });
      Array.prototype.forEach.call(nodes, function (el) {
        var k = el.getAttribute('data-content');
        if (map[k] != null && map[k] !== '') el.textContent = map[k];
      });
    });
  }

  // ---- Links (socials / contact / maps / buttons) -------------------------
  function applyLinks() {
    var nodes = document.querySelectorAll('[data-link]');
    if (!nodes.length) return;
    window.MiidearDB.selectAll('site_links').then(function (res) {
      if (res.error || !res.data) return;
      var map = {};
      res.data.forEach(function (r) { map[r.key] = r.value; });
      Array.prototype.forEach.call(nodes, function (el) {
        var k = el.getAttribute('data-link');
        if (map[k] != null && map[k] !== '') {
          if (el.tagName === 'A') el.setAttribute('href', map[k]);
          else el.textContent = map[k];
        }
      });
    });
  }

  // ---- Hero media (rows are {key:'video'|'poster', value:url}) ------------
  function applyHero() {
    var video = document.getElementById('heroVideo');
    if (!video) return;
    window.MiidearDB.selectAll('hero_media').then(function (res) {
      if (res.error || !res.data) return;
      res.data.forEach(function (r) {
        if (r.key === 'poster' && r.value) video.setAttribute('poster', r.value);
        if (r.key === 'video' && r.value && /^https?:/.test(r.value)) {
          var src = video.querySelector('source');
          if (src) { src.setAttribute('src', r.value); video.load(); }
        }
      });
    });
  }

  // ---- Reviews (Words From Our Couples) -----------------------------------
  function applyReviews() {
    var rail = document.getElementById('testimonialRail');
    if (!rail) return;
    var rvEdit = document.documentElement.getAttribute('data-edit-mode') === '1';
    window.MiidearDB.selectAll('reviews', 'sort_order', true).then(function (res) {
      if (res.error || !res.data || !res.data.length) return; // keep existing samples
      rail.innerHTML = res.data.map(function (r) {
        var stars = '';
        var n = Math.max(1, Math.min(5, parseInt(r.rating, 10) || 5));
        for (var i = 0; i < 5; i++) stars += (i < n ? '\u2605' : '\u2606');
        var couple = esc((r.bride_name || '') + (r.groom_name ? ' & ' + r.groom_name : ''));
        // Mii37: in editor mode only, add Edit/Delete controls per card. These
        // post messages to the dashboard, which calls the EXISTING review CRUD
        // (openReview / DB.deleteRow). Public visitors never see these.
        var controls = rvEdit ? ('<div class="mii-rv-controls">' +
          '<button type="button" class="mii-rv-btn" data-review-edit="' + esc(r.id) + '">Edit</button>' +
          '<button type="button" class="mii-rv-btn mii-rv-btn--danger" data-review-del="' + esc(r.id) + '">Delete</button>' +
        '</div>') : '';
        return '<figure class="testimonial-card">' +
          '<div class="stars" aria-label="' + n + ' out of 5">' + stars + '</div>' +
          '<blockquote class="tc-quote">' + esc(r.review_text || '') + '</blockquote>' +
          '<button type="button" class="tc-more" aria-expanded="false" hidden>Read more</button>' +
          '<figcaption class="who">' + couple + '</figcaption>' +
          controls +
        '</figure>';
      }).join('');
      // Mii48 — clamp long reviews and reveal a "Read more" toggle only when the
      // text actually overflows the clamped height.
      Array.prototype.forEach.call(rail.querySelectorAll('.testimonial-card'), function (card) {
        var q = card.querySelector('.tc-quote');
        var btn = card.querySelector('.tc-more');
        if (!q || !btn) return;
        if (q.scrollHeight - q.clientHeight > 4) {
          btn.hidden = false;
          btn.addEventListener('click', function () {
            var expanded = q.classList.toggle('is-expanded');
            btn.textContent = expanded ? 'Read less' : 'Read more';
            btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
          });
        }
      });
      if (rvEdit) wireReviewControls();
    });
  }

  // Mii37 — editor-mode review controls inside the testimonials section. Reuses
  // the dashboard's existing review CRUD via postMessage; no CRUD here.
  function wireReviewControls() {
    var section = document.getElementById('testimonials');
    if (!section) return;
    function post(msg) { try { window.parent.postMessage(Object.assign({ __miidear: true }, msg), '*'); } catch (e) {} }
    // Add Review button (once), placed above the rail.
    if (!document.getElementById('miiAddReview')) {
      var head = section.querySelector('.section__head, .center, h2, .script');
      var addBtn = document.createElement('button');
      addBtn.type = 'button'; addBtn.id = 'miiAddReview'; addBtn.className = 'mii-rv-add';
      addBtn.textContent = '+ Add Review';
      addBtn.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); post({ type: 'review-add' }); });
      if (head && head.parentNode) head.parentNode.insertBefore(addBtn, head.nextSibling);
      else section.insertBefore(addBtn, section.firstChild);
    }
    Array.prototype.forEach.call(section.querySelectorAll('[data-review-edit]'), function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); post({ type: 'review-edit', id: b.getAttribute('data-review-edit') }); });
    });
    Array.prototype.forEach.call(section.querySelectorAll('[data-review-del]'), function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); post({ type: 'review-del', id: b.getAttribute('data-review-del') }); });
    });
  }

  // ---- Portfolio projects + featured --------------------------------------
  // Editable couple line: bride and groom are separate inline fields (two DB
  // columns), with a non-editable "&" between them. Empty names still render an
  // editable placeholder span so they can be filled in.
  function coupleLine(p) {
    var bride = esc(p.bride_name || '');
    var groom = esc(p.groom_name || '');
    var brideSpan = '<span class="mii-couple-part" data-project-field="bride_name" data-project-id="' + esc(p.id) + '">' + bride + '</span>';
    var groomSpan = '<span class="mii-couple-part" data-project-field="groom_name" data-project-id="' + esc(p.id) + '">' + groom + '</span>';
    // The "&" only shows when both names exist (public view stays clean).
    var amp = (bride && groom) ? ' <span class="mii-couple-amp">&amp;</span> ' : ' ';
    return '<div class="collection-card__couple">' + brideSpan + amp + groomSpan + '</div>';
  }

  function applyProjects() {
    var hasRails = document.querySelector('.rail[data-gallery]');
    var featured = document.getElementById('featuredGrid');
    var pGrid = document.getElementById('portfolioGrid'); // Mii43: all-projects portfolio grid
    if (!hasRails && !featured && !pGrid) return;
    var editMode = document.documentElement.getAttribute('data-edit-mode') === '1';
    function elog(msg) { if (editMode) { try { console.log('[Miidear/editor] ' + msg); } catch (e) {} } }
    function emptyState(label) {
      // Editor-only message so a section is never silently blank. Not shown to
      // public visitors (they simply see no cards until data exists).
      return editMode ? '<div class="mii-empty-state">' + esc(label) + '</div>' : '';
    }
    window.MiidearDB.selectAll('projects', 'sort_order', true).then(function (res) {
      if (res.error) { try { console.error('[Miidear] projects read failed:', res.error.message); } catch (e) {} if (featured) featured.innerHTML = emptyState('Could not load projects. Check connection.'); return; }
      var projects = (res.data || []);
      elog('projects query returned ' + projects.length + ' row(s)');

      // Selection (homepage): strictly projects flagged featured = true.
      if (featured) {
        var feat = projects.filter(function (p) { return p.featured === true; }).slice(0, 3);
        elog('Selection: ' + feat.length + ' featured of ' + projects.length);
        if (feat.length) {
          // NOTE: no "reveal" class here — async-inserted cards never receive
          // .is-visible from main.js's load-time observer, so reveal would keep
          // them at opacity:0. Render them visible directly.
          featured.innerHTML = feat.map(function (p, i) {
            var img = p.banner_url ? '<img src="' + esc(p.banner_url) + '" alt="' + esc(p.title || '') + '" style="width:100%;aspect-ratio:1/1;object-fit:cover">' : '<div class="ph ph--square"></div>';
            return '<article class="collection-card" data-project-id="' + esc(p.id) + '">' +
              '<div class="collection-card__media" data-project-image="' + esc(p.id) + '">' + img + '</div>' +
              '<div class="collection-card__body">' +
                '<div class="collection-card__name" data-project-field="title" data-project-id="' + esc(p.id) + '">' + esc(p.title || '') + '</div>' +
                coupleLine(p) +
                '<button class="link-arrow" data-open-project="' + esc(p.id) + '">View Collection</button>' +
              '</div></article>';
          }).join('');
        } else {
          featured.innerHTML = emptyState('No featured projects yet. In the Portfolio editor, mark a project as “featured” to show it here.');
        }
        elog('Selection rendered ' + featured.querySelectorAll('.collection-card').length + ' card(s)');
      }
      // Expose projects for the lightbox to read galleries on demand.
      window.MIIDEAR_PROJECTS = projects;

      // Portfolio page (Mii41): one grid of ALL projects (categories removed).
      if (pGrid) {
        elog('Portfolio grid: ' + projects.length + ' project(s)');
        if (!projects.length) {
          pGrid.innerHTML = emptyState('No projects yet. Add projects in the Portfolio editor to show them here.');
        } else {
          pGrid.innerHTML = projects.map(function (p) {
            var img = p.banner_url ? '<img src="' + esc(p.banner_url) + '" alt="' + esc(p.title || '') + '" style="width:100%;aspect-ratio:1/1;object-fit:cover">' : '<div class="ph ph--square"></div>';
            return '<article class="collection-card" data-project-id="' + esc(p.id) + '">' +
              '<div class="collection-card__media" data-project-image="' + esc(p.id) + '">' + img + '</div>' +
              '<div class="collection-card__body">' +
                '<div class="collection-card__name" data-project-field="title" data-project-id="' + esc(p.id) + '">' + esc(p.title || '') + '</div>' +
                coupleLine(p) +
                '<button class="link-arrow" data-open-project="' + esc(p.id) + '">View Collection</button>' +
              '</div></article>';
          }).join('');
        }
      }

      // Portfolio page: fill each category rail with its matching projects.
      var rails = document.querySelectorAll('.rail[data-gallery]');
      if (rails.length) {
        Array.prototype.forEach.call(rails, function (rail) {
          var cat = (rail.getAttribute('data-gallery') || '').trim().toLowerCase();
          var inCat = projects.filter(function (p) { return (p.category || '').trim().toLowerCase() === cat; });
          elog('Portfolio rail "' + cat + '": ' + inCat.length + ' match(es)');
          if (!inCat.length) { rail.innerHTML = emptyState('No projects in “' + cat + '” yet. Set a project’s category to “' + cat + '” to show it here.'); return; }
          rail.innerHTML = inCat.map(function (p) {
            var img = p.banner_url
              ? '<img src="' + esc(p.banner_url) + '" alt="' + esc(p.title || '') + '" style="width:100%;height:100%;object-fit:cover">'
              : '<div class="ph"></div>';
            return '<article class="rail-card" data-project-id="' + esc(p.id) + '" data-open-project="' + esc(p.id) + '">' +
              '<div class="rail-card__img" style="aspect-ratio:3/4" data-project-image="' + esc(p.id) + '">' + img + '</div>' +
              '<div class="rail-card__body">' +
                '<div class="collection-card__name" data-project-field="title" data-project-id="' + esc(p.id) + '">' + esc(p.title || '') + '</div>' +
                coupleLine(p) +
                '<button class="link-arrow" data-open-project="' + esc(p.id) + '">View Collection</button>' +
              '</div></article>';
          }).join('');
        });
      }
      // Re-scan for edit hooks AFTER all cards are rendered (async render).
      if (window.__miidearActivateEdit) window.__miidearActivateEdit();
    });
  }

  // ---- Editable images (fixed placeholder slots) -------------------------
  function applyImages() {
    var nodes = document.querySelectorAll('[data-image]');
    if (!nodes.length) return;
    window.MiidearDB.selectAll('site_images').then(function (res) {
      if (res.error || !res.data) return;
      var map = {};
      res.data.forEach(function (r) { map[r.key] = r.value; });
      Array.prototype.forEach.call(nodes, function (el) {
        var k = el.getAttribute('data-image');
        if (map[k]) {
          el.style.backgroundImage = 'url("' + map[k] + '")';
          el.style.backgroundSize = 'cover';
          el.style.backgroundPosition = 'center';
          el.classList.add('has-image');
        }
      });
    });
  }

  function run() {
    applyContent();
    applyLinks();
    applyHero();
    applyImages();
    applyMap();
    applyReviews();
    applyProjects();
    wireOpenProject();
  }

  // MII32 — public collection viewer. Clicking "View Collection" (data-open-project)
  // on a Selection or Portfolio card opens the EXISTING lightbox (window.MiidearLightbox)
  // with that project's images. Single source of truth: the projects record +
  // its project_images rows (no new table, no second system). One delegated
  // listener covers both Home and Portfolio.
  function wireOpenProject() {
    if (window.__miiOpenProjectWired) return; window.__miiOpenProjectWired = true;
    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-open-project]') : null;
      if (!btn) return;
      e.preventDefault();
      var id = btn.getAttribute('data-open-project');
      if (!id || !window.MiidearLightbox) return;
      var list = window.MIIDEAR_PROJECTS || [];
      var proj = list.filter(function (p) { return String(p.id) === String(id); })[0];
      var couple = proj ? ((proj.bride_name || '') + (proj.groom_name ? ' & ' + proj.groom_name : '')) : '';
      // Build slides from project_images (anon-readable); fall back to the cover.
      window.MiidearDB.selectAll('project_images', 'sort_order', true).then(function (res) {
        var imgs = ((res && res.data) || []).filter(function (im) { return String(im.project_id) === String(id); });
        var slides = imgs.map(function (im) { return { img: im.url }; });
        if (!slides.length && proj && proj.banner_url) slides = [{ img: proj.banner_url }];
        window.MiidearLightbox.open({ couple: couple || (proj && proj.title) || '', images: slides });
      });
    });
  }

  // ---- Google Map embed (address-driven) ---------------------------------
  function applyMap() {
    var frame = document.getElementById('mapFrame');
    if (!frame) return;
    window.MiidearDB.selectAll('site_content').then(function (res) {
      if (res.error || !res.data) return;
      var map = {};
      res.data.forEach(function (r) { map[r.page + ':' + r.key] = r.value; });
      // Prefer an explicit embed URL if set, else build from the address.
      var embed = map['contact:map_embed'];
      var addr = map['contact:location_address'] || map['contact:location_name'];
      if (embed && /^https?:/.test(embed)) {
        frame.setAttribute('src', embed);
      } else if (addr) {
        frame.setAttribute('src', 'https://www.google.com/maps?q=' + encodeURIComponent(addr) + '&output=embed');
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();

  // ====================================================================
  //  WEBSITE EDITOR (BETA) — edit-mode bridge
  //  When a public page is loaded inside the dashboard with ?edit=1, it
  //  becomes click-to-edit: text/links/images/videos that carry a data-*
  //  hook are made interactive and changes are posted to the parent window,
  //  which performs the actual Supabase save (authenticated). The public
  //  site itself never enters edit mode for normal visitors.
  // ====================================================================
  (function editorBridge() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('edit') !== '1') return;
    if (window.top === window.self) return; // only inside the dashboard iframe

    document.documentElement.setAttribute('data-edit-mode', '1');

    // MII27 (Issue B): inside the editor iframe, internal links (logo, nav) point
    // to bare pages like "index.html" and would drop ?edit=1 — so returning Home
    // via the logo loaded a non-editable page. Rewrite same-document internal
    // links to carry ?edit=1 so edit mode survives in-page navigation. Edit-mode
    // only; the public site is never affected (this block returns above if not ?edit=1).
    function keepEditParamOnLinks() {
      Array.prototype.forEach.call(document.querySelectorAll('a[href]'), function (a) {
        var href = a.getAttribute('href');
        if (!href) return;
        // skip external, anchors, mailto/tel, and links already carrying edit=1
        if (/^(https?:)?\/\//.test(href) || href.charAt(0) === '#' || /^(mailto:|tel:)/.test(href) || /[?&]edit=1\b/.test(href)) return;
        // only rewrite internal .html page links
        if (!/\.html(\?|#|$)/.test(href) && href.indexOf('.') !== -1 && href.indexOf('.html') === -1) return;
        var sep = href.indexOf('?') === -1 ? '?' : '&';
        // insert edit=1 before any hash
        var hashAt = href.indexOf('#');
        if (hashAt === -1) a.setAttribute('href', href + sep + 'edit=1');
        else a.setAttribute('href', href.slice(0, hashAt) + sep + 'edit=1' + href.slice(hashAt));
      });
    }

    function post(msg) { try { window.parent.postMessage(Object.assign({ __miidear: true }, msg), '*'); } catch (e) {} }

    function ready() {
      keepEditParamOnLinks(); // MII27 Issue B: preserve ?edit=1 on internal links
      // 1) Editable TEXT (data-content="page:key")
      Array.prototype.forEach.call(document.querySelectorAll('[data-content]'), function (el) {
        el.classList.add('mii-editable');
        el.addEventListener('click', function (e) {
          e.preventDefault(); e.stopPropagation();
          startTextEdit(el, el.getAttribute('data-content'), 'content');
        });
      });
      // 2) Editable LINKS (buttons / anchors with data-link or hero button text)
      Array.prototype.forEach.call(document.querySelectorAll('[data-link]'), function (el) {
        el.classList.add('mii-editable');
        el.addEventListener('click', function (e) {
          e.preventDefault(); e.stopPropagation();
          post({ type: 'edit-link', key: el.getAttribute('data-link'), text: el.textContent.trim(), href: el.getAttribute('href') || '', isAnchor: el.tagName === 'A' });
        });
      });
      // 3) Editable IMAGES (data-image slots)
      Array.prototype.forEach.call(document.querySelectorAll('[data-image]'), function (el) {
        el.classList.add('mii-editable-media');
        el.addEventListener('dblclick', function (e) {
          e.preventDefault(); e.stopPropagation();
          post({ type: 'edit-image', key: el.getAttribute('data-image') });
        });
      });
      // 4) Editable HERO VIDEO
      var hv = document.getElementById('heroVideo');
      if (hv) {
        hv.classList.add('mii-editable-media');
        hv.addEventListener('dblclick', function (e) { e.preventDefault(); post({ type: 'edit-video', key: 'hero_video' }); });
      }
      // 5) MII22 — Editable PROJECT cards (Selection of Our Work). These are
      //    rendered dynamically, so they're (re)scanned via __miidearActivateEdit.
      //    Edits route to the projects table (single source of truth), not site_content.
      activateProjectCards();
      post({ type: 'ready', page: document.body.getAttribute('data-page') || document.title });
    }

    function startTextEdit(el, key, kind) {
      var original = el.textContent;
      el.setAttribute('contenteditable', 'true');
      el.focus();
      function finish() {
        el.removeAttribute('contenteditable');
        el.removeEventListener('blur', finish);
        var val = el.textContent.trim();
        if (val !== original) post({ type: 'save-content', key: key, value: val });
      }
      el.addEventListener('blur', finish);
      el.addEventListener('keydown', function (k) { if (k.key === 'Enter' && !k.shiftKey) { k.preventDefault(); el.blur(); } });
    }

    // MII22 — wire the dynamically-rendered project cards. Idempotent: each
    // element is flagged once so re-scans (after re-render) don't double-bind.
    function activateProjectCards() {
      Array.prototype.forEach.call(document.querySelectorAll('[data-project-field]'), function (el) {
        if (el.__miiWired) return; el.__miiWired = true;
        el.classList.add('mii-editable');
        el.addEventListener('click', function (e) {
          e.preventDefault(); e.stopPropagation();
          startProjectTextEdit(el, el.getAttribute('data-project-id'), el.getAttribute('data-project-field'));
        });
      });
      Array.prototype.forEach.call(document.querySelectorAll('[data-project-image]'), function (el) {
        if (el.__miiWired) return; el.__miiWired = true;
        el.classList.add('mii-editable-media');
        el.addEventListener('dblclick', function (e) {
          e.preventDefault(); e.stopPropagation();
          post({ type: 'edit-project-image', id: el.getAttribute('data-project-image') });
        });
      });
    }
    window.__miidearActivateEdit = activateProjectCards;

    // Edit a project text field (e.g. title) and save it to the projects table.
    function startProjectTextEdit(el, id, field) {
      var original = el.textContent;
      el.setAttribute('contenteditable', 'true');
      el.focus();
      function finish() {
        el.removeAttribute('contenteditable');
        el.removeEventListener('blur', finish);
        var val = el.textContent.trim();
        if (val !== original) post({ type: 'save-project-field', id: id, field: field, value: val });
      }
      el.addEventListener('blur', finish);
      el.addEventListener('keydown', function (k) { if (k.key === 'Enter' && !k.shiftKey) { k.preventDefault(); el.blur(); } });
    }

    // Parent can ask us to refresh after a save.
    window.addEventListener('message', function (e) {
      var d = e.data || {};
      if (!d.__miidear) return;
      if (d.type === 'refresh') run();
    });

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
    else ready();
  })();
})();
