/* =========================================================
   SUPABASE CLIENT — Portal KNPI Cibinong
   -------------------------------------------------------
   1. Buat project gratis di https://supabase.com
   2. Ambil "Project URL" dan "anon public key" dari
      Settings > API, lalu isi di bawah ini.
   3. Jalankan database/schema.sql di Supabase SQL Editor.
   ========================================================= */

const SUPABASE_URL = "https://GANTI-DENGAN-PROJECT-ID.supabase.co";
const SUPABASE_ANON_KEY = "GANTI-DENGAN-ANON-PUBLIC-KEY";

// Supabase JS diambil dari CDN di setiap halaman HTML (lihat <script> di bawah body)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ---------- Helper umum ---------- */

function formatTanggal(dateString){
  const d = new Date(dateString);
  return d.toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" });
}

function escapeHtml(str){
  if(!str) return "";
  return str.replace(/[&<>"']/g, (m) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));
}

function getParam(name){
  return new URLSearchParams(window.location.search).get(name);
}

/* Path storage publik untuk galeri/gambar berita & kegiatan */
const PLACEHOLDER_IMG = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='250'>
     <rect width='100%' height='100%' fill='#dfe6f2'/>
     <text x='50%' y='50%' font-family='sans-serif' font-size='16' fill='#4478DE' text-anchor='middle'>Belum ada gambar</text>
   </svg>`
);

function publicImageUrl(bucket, path){
  if(!path) return PLACEHOLDER_IMG;
  const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
