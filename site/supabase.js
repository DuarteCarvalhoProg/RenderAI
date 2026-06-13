/* ============================================
   RenderAI — supabase.js
   Supabase client configuration

   HOW TO CONNECT:
   1. Go to https://supabase.com and create a free account
   2. Create a new project
   3. Go to Project Settings → API
   4. Copy your "Project URL" and "anon public" key
   5. Replace the two placeholder values below
   6. In Supabase dashboard → Authentication → Email Templates,
      customise the confirmation email to match your brand
   7. In Authentication → Settings, make sure
      "Enable email confirmations" is ON
   ============================================ */

const SUPABASE_URL  = 'YOUR_SUPABASE_URL';   // e.g. https://xyzabc.supabase.co
const SUPABASE_ANON = 'YOUR_SUPABASE_ANON_KEY';

// Initialise the Supabase client
const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// Export for use in auth.js
window.sb = _supabase;