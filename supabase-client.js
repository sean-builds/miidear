// ============================================================================
// Miidear — supabase-client.js
// Thin wrapper around the Supabase JS client. Loads the official library from
// the CDN (jsDelivr) and exposes two helpers used by the site:
//
//   window.MiidearDB.insertInquiry(record)  -> Promise<{data,error}>
//   window.MiidearDB.listInquiries()        -> Promise<{data,error}> (newest first)
//
// Requires config.js (window.MIIDEAR_CONFIG) to be loaded first.
// ============================================================================
(function () {
  'use strict';

  var cfg = window.MIIDEAR_CONFIG || {};
  var anonPromise = null;   // public/booking client — NEVER persists a session
  var authPromise = null;   // dashboard client — real Supabase Auth, persists

  function configured() {
    return cfg.SUPABASE_URL &&
           cfg.SUPABASE_ANON_KEY &&
           cfg.SUPABASE_ANON_KEY !== 'INSERT_CURRENT_ANON_KEY_HERE';
  }

  function importSupabase() {
    return import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  }

  // PUBLIC client: anonymous only. No session persistence, no token refresh,
  // no auth storage. This guarantees the booking form always submits as the
  // pure anon (publishable) key and can never inherit a dashboard login token.
  function getClient() {
    if (anonPromise) return anonPromise;
    anonPromise = importSupabase().then(function (mod) {
      return mod.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storage: undefined }
      });
    });
    return anonPromise;
  }

  // DASHBOARD client: real Supabase Auth. This one persists the admin session
  // under 'miidear-auth'. It is ONLY created when an auth method is called,
  // so it never initializes on public pages / the booking flow.
  function getAuthClient() {
    if (authPromise) return authPromise;
    authPromise = importSupabase().then(function (mod) {
      return mod.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'miidear-auth' }
      });
    });
    return authPromise;
  }

  // Generate a unique, human-readable inquiry id, e.g. MII-20260601-7F3KQ.
  function generateInquiryId() {
    var d = new Date();
    var ymd = d.getFullYear().toString() +
              String(d.getMonth() + 1).padStart(2, '0') +
              String(d.getDate()).padStart(2, '0');
    var rand = Math.random().toString(36).slice(2, 7).toUpperCase();
    return 'MII-' + ymd + '-' + rand;
  }

  window.MiidearDB = {
    configured: configured,
    generateInquiryId: generateInquiryId,

    // Public list of blocked slot strings ("YYYY-MM-DD HH:MM") via RPC.
    // No personal data is exposed — only the times that are taken.
    blockedSlots: function () {
      if (!configured()) return Promise.resolve({ data: [], error: null });
      return getClient().then(function (client) {
        return client.rpc('blocked_slots').then(function (res) {
          if (res.error) return { data: [], error: res.error };
          var arr = (res.data || []).map(function (r) { return typeof r === 'string' ? r : (r && r.blocked_slots) || ''; });
          return { data: arr, error: null };
        });
      }).catch(function (err) { return { data: [], error: { message: String(err) } }; });
    },

    // Insert one inquiry row. `record` should already match table columns.
    // NOTE: no .select() here — an anonymous visitor is allowed to INSERT a
    // booking but NOT to SELECT from `inquiries` (RLS). Chaining .select()
    // forces a read-back of the new row, which RLS blocks for anon and
    // surfaces as "new row violates row-level security policy". We only need
    // to know the insert succeeded, so we do not request the row back.
    insertInquiry: function (record) {
      if (!configured()) {
        return Promise.resolve({
          data: null,
          error: { message: 'Supabase is not configured. Add your anon key to config.js.' }
        });
      }
      return getClient().then(function (client) {
        return client.from(cfg.SUPABASE_TABLE).insert([record]);
      }).catch(function (err) {
        return { data: null, error: { message: err && err.message ? err.message : String(err) } };
      });
    },

    // Fetch all inquiries, newest first. Dashboard-only: requires the
    // authenticated session, so it uses the auth client (anon cannot SELECT
    // inquiries under RLS).
    listInquiries: function () {
      if (!configured()) {
        return Promise.resolve({
          data: null,
          error: { message: 'Supabase is not configured. Add your anon key to config.js.' }
        });
      }
      return getAuthClient().then(function (client) {
        return client.from(cfg.SUPABASE_TABLE)
          .select('*')
          .order('created_at', { ascending: false });
      }).catch(function (err) {
        return { data: null, error: { message: err && err.message ? err.message : String(err) } };
      });
    },

    // ---- Generic table helpers -------------------------------------------
    // Change log — dashboard-only; its RLS grants SELECT to authenticated only,
    // so this MUST use the auth client (the anon client returns 0 rows under RLS).
    listChangeLog: function () {
      if (!configured()) return notConfigured();
      return getAuthClient().then(function (client) {
        return client.from('change_log').select('*').order('changed_at', { ascending: false });
      }).catch(errToObj);
    },

    // Public, anon-readable content tables (site_content, site_links, reviews,
    // projects, hero_media) — uses the anon client so public pages work.
    selectAll: function (table, orderCol, ascending) {
      if (!configured()) return notConfigured();
      return getClient().then(function (client) {
        var q = client.from(table).select('*');
        if (orderCol) q = q.order(orderCol, { ascending: !!ascending });
        return q;
      }).catch(errToObj);
    },

    // Dashboard write — requires the authenticated session. `conflict` names
    // the unique column(s) to upsert on (e.g. 'key' or 'page,key').
    upsertByKey: function (table, rows, conflict) {
      if (!configured()) return notConfigured();
      return getAuthClient().then(function (client) {
        return client.from(table).upsert(rows, { onConflict: conflict || 'key' }).select();
      }).catch(errToObj);
    },

    // Dashboard upload — requires the authenticated session.
    uploadMedia: function (path, file, onProgress) {
      if (!configured()) return notConfigured();
      return getAuthClient().then(function (client) {
        return client.storage.from(cfg.SUPABASE_BUCKET || 'media')
          .upload(path, file, { upsert: true, cacheControl: '3600' })
          .then(function (res) {
            if (res.error) return { data: null, error: res.error };
            var pub = client.storage.from(cfg.SUPABASE_BUCKET || 'media').getPublicUrl(path);
            return { data: { publicUrl: pub.data.publicUrl, path: path }, error: null };
          });
      }).catch(errToObj);
    },

    // List files in the media bucket (optionally within a folder).
    listMedia: function (folder) {
      if (!configured()) return notConfigured();
      return getAuthClient().then(function (client) {
        return client.storage.from(cfg.SUPABASE_BUCKET || 'media')
          .list(folder || '', { limit: 200, sortBy: { column: 'created_at', order: 'desc' } })
          .then(function (res) {
            if (res.error) return { data: null, error: res.error };
            var base = client.storage.from(cfg.SUPABASE_BUCKET || 'media');
            var files = (res.data || []).filter(function (f) { return f.id || f.name; }).map(function (f) {
              var path = (folder ? folder.replace(/\/$/, '') + '/' : '') + f.name;
              return { name: f.name, path: path, url: base.getPublicUrl(path).data.publicUrl, meta: f.metadata || {} };
            });
            return { data: files, error: null };
          });
      }).catch(errToObj);
    },

    // Delete files from the media bucket.
    removeMedia: function (paths) {
      if (!configured()) return notConfigured();
      return getAuthClient().then(function (client) {
        return client.storage.from(cfg.SUPABASE_BUCKET || 'media').remove([].concat(paths));
      }).catch(errToObj);
    },

    // ---- Authentication (dashboard auth client only) ---------------------
    signIn: function (email, password) {
      if (!configured()) return notConfigured();
      return getAuthClient().then(function (client) {
        return client.auth.signInWithPassword({ email: email, password: password });
      }).catch(errToObj);
    },
    signOut: function () {
      return getAuthClient().then(function (client) { return client.auth.signOut(); }).catch(errToObj);
    },
    getSession: function () {
      if (!configured()) return Promise.resolve({ data: { session: null }, error: null });
      return getAuthClient().then(function (client) { return client.auth.getSession(); }).catch(function (err) {
        return { data: { session: null }, error: { message: String(err) } };
      });
    },

    // ---- Generic CRUD (dashboard editors — authenticated) ----------------
    insertRow: function (table, row) {
      if (!configured()) return notConfigured();
      return getAuthClient().then(function (client) {
        return client.from(table).insert([row]).select();
      }).catch(errToObj);
    },
    updateRow: function (table, id, patch) {
      if (!configured()) return notConfigured();
      return getAuthClient().then(function (client) {
        return client.from(table).update(patch).eq('id', id).select();
      }).catch(errToObj);
    },
    deleteRow: function (table, id) {
      if (!configured()) return notConfigured();
      return getAuthClient().then(function (client) {
        return client.from(table).delete().eq('id', id);
      }).catch(errToObj);
    }
  };

  function notConfigured() {
    return Promise.resolve({ data: null, error: { message: 'Supabase is not configured. Add your anon key to config.js.' } });
  }
  function errToObj(err) {
    return { data: null, error: { message: err && err.message ? err.message : String(err) } };
  }
})();
