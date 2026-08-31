// ============================================================================
// Miidear — config.js
// Central configuration for Supabase and admin access.
//
//   • Supabase: the ANON public key below is safe to ship in client-side code;
//     it is protected by your table's Row Level Security policies. (Never put
//     the service_role key here.)
//   • Admin password: stored Base64-obfuscated (decoded at runtime) so it is
//     not readable plaintext in the HTML. Light obfuscation for a static site,
//     not strong security — move auth to a backend for production-grade needs.
// ============================================================================
window.MIIDEAR_CONFIG = {
  // --- Supabase ------------------------------------------------------------
  SUPABASE_URL: 'https://iaikwwkesxxbikidakqu.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_3I6UNx0rEqbrbtUXUORdBw_2d1f8qfn',
  SUPABASE_TABLE: 'inquiries',

  // Storage bucket used by the admin Media/Portfolio managers.
  SUPABASE_BUCKET: 'media',

  // --- Admin access (Base64-obfuscated; decoded at runtime) ---------------
  ADMIN_PASSCODE_B64: 'bTExZDM0ci0='
};
