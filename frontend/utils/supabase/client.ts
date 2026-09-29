import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://byjamdrxmurjpycqqktv.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_boIiWW-w1m3QeTAHZfsc9w_x666x4gO";

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );
