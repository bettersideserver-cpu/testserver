import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.111.0/+esm';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config.js';
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  document.body.innerHTML = '<main style="max-width:640px;margin:60px auto;font:18px/1.6 sans-serif;padding:24px"><h1>CM Infinia setup required</h1><p>Add your CM Infinia project URL and publishable key to JS/cm-config.js, then run the SQL files listed in ADMIN-SETUP.md.</p></main>';
  throw new Error('CM Infinia Supabase configuration is missing');
}
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth: { storageKey: 'cm-infinia-admin-auth' } });
