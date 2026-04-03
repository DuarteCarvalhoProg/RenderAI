/* ============================================
   SYNTH3D — supabase.js
   Supabase client configuration
   ============================================ */

   const SUPABASE_URL  = 'https://bbevzryiitkzbollshrc.supabase.co';
   const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiZXZ6cnlpaXRremJvbGxzaHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzM1NDksImV4cCI6MjA5MDgwOTU0OX0.JlwCDj7MLVdaskfmA7v4sHnUtUzI9-5GyELIhs9MI3c';
   
   // Initialise the Supabase client
   const { createClient } = supabase;
   const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
   
   // Export for use in auth.js
   window.sb = _supabase;