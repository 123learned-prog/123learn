import { createClient } from "@supabase/supabase-js";

// Só usado dentro de rotas /app/api (roda no servidor). Usa a "service role key",
// que tem permissão total no banco — por isso NUNCA deve ser prefixada com
// NEXT_PUBLIC_ e nunca deve ser importada em componentes de cliente.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseServer = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});
