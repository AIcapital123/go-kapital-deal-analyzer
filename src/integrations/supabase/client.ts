import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "https://vnnbryzspkxzjmnzvems.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZubmJyeXpzcGt4emptbnp2ZW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2MjEzMTUsImV4cCI6MjEwMTE5NzMxNX0.53ZONmt090JzfrUbkFkenqcu01Kgk56CNkv2Yr4yFZo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
