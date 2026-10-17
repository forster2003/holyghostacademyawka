import { createClient } from "@supabase/supabase-js";

// ============================================================================
// PASTE YOUR SUPABASE CREDENTIALS HERE 👇
// ============================================================================

// 1. Paste your Supabase Project URL here:
const SUPABASE_URL = "https://deqdcwkhzodctbibtspw.supabase.co";

// 2. Paste your Supabase Anon / Publishable API Key here:
const SUPABASE_PUBLIC_KEY = "sb_publishable_of-ch6e__VSV6uiE4M4DIg_lvA6rk7Z";

// Create and export the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
