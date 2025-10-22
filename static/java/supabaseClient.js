

import { createClient } from "./libs/supabase.min.js";

const SUPABASE_URL = "https://TU-PROJECTO.supabase.co";
const SUPABASE_KEY = "TU-API-KEY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
