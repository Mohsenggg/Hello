
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = "https://zsiyjcxtslhyjoduoick.supabase.co";
console.log("Here >>>> ");
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXlqY3h0c2xoeWpvZHVvaWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNTM5MjAsImV4cCI6MjA1MTkyOTkyMH0.Wl7WYN6LiciLkVhCBn-bwZA9Tcx2cx6TUCnn8PttQ7s";
const supabase = createClient(supabaseUrl, supabaseKey);
console.log(supabase);
