import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://oyuxvmmpzlfzeuxrxqxm.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95dXh2bW1wemxmemV1eHJ4cXhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1OTgzMTUsImV4cCI6MjA5NDE3NDMxNX0.KcZrY_T793YPZ7cOc4pwiduCYlNBYzfpDJ_BVUzUhVQ";

let _sb = null;

export async function getSB() {
  if (_sb) return _sb;
  
  _sb = createClient(SUPABASE_URL, SUPABASE_ANON);
  return _sb;
}

export const XLSX_CDN = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";