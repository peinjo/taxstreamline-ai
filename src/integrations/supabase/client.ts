import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ukuhdrsywxbuhcytjfog.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdWhkcnN5d3hidWhjeXRqZm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0MzI2NzEsImV4cCI6MjA0ODAwODY3MX0.98XpogU4WCMXHboFgYjjR8JCYzUav7HIKwohUkRB9zE";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);