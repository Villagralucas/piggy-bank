import { cookies } from "next/headers";

// Demo mode shows the dashboard with in-memory sample data instead of the
// real database. It is on for everyone while no real Supabase project is
// connected (see .env.local), and per visitor when they click "Ver demo",
// which sets the DEMO_COOKIE cookie (see src/app/demo/route.ts).
export const DEMO_MODE =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

export const DEMO_COOKIE = "pb_demo";

export async function isDemo(): Promise<boolean> {
  if (DEMO_MODE) return true;
  const store = await cookies();
  return store.get(DEMO_COOKIE)?.value === "1";
}
