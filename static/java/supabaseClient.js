
  import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.76.1/dist/supabase.min.js";

  const SUPABASE_URL = "db.ouoodvqsezartigpzwke.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91b29kdnFzZXphcnRpZ3B6d2tlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzI3NDUsImV4cCI6MjA3MTYwODc0NX0.LiS7sXDRc2KA0uYr3QXp0QM3C_PAmL1pVki0g0cp2wU";

  export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

