const SUPABASE_URL = "https://oyuxvmmpzlfzeuxrxqxm.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95dXh2bW1wemxmemV1eHJ4cXhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMzI5MDgsImV4cCI6MjA2MjcwODkwOH0.Y-xRdgMHmQJMDTfGZRyGr_MZ6P1v-YpMfXDXZVAlW6I";

let _sb = null;

export async function getSB() {
  if (_sb) return _sb;
  
  if (!window.supabase) {
    await new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/supabase/2.39.3/umd/supabase.min.js";
      s.onload = res;
      s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  
  _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
  return _sb;
}

export const SUPABASE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/supabase/2.39.3/umd/supabase.min.js";
export const XLSX_CDN = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";