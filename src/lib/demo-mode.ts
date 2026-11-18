// Demo mode kicks in automatically while no real Supabase project is
// connected (see .env.local). It skips login and uses in-memory sample
// data so the app can be previewed end to end. Once real
// NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY values are set,
// this flips off and the app behaves normally (real login + database).
export const DEMO_MODE =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");
