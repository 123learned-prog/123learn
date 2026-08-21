import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Usado no browser (páginas) — usa a chave "anon", segura para expor no client.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
