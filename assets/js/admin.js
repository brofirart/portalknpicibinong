/* =========================================================
   ADMIN.JS — Dashboard logic (auth guard + CRUD)
   ========================================================= */

let currentTab = "berita";

/* ---------- Auth guard ---------- */
(async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if(!session){ window.location.href = "login.html"; return; }
  initDashboard();
})();

document.getElementById("logoutBtn").addEventListener("click", async (e) => {
  e.preventDefault();
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
});

/* ---------- Tab switching ---------- */
const TAB_LABELS = {
  berita:"Kelola Berita", kegiatan:"Kelola Kegiatan", galeri:"Kelola Galeri",
  profil:"Profil & Visi Misi", struktur:"Struktur Organisasi", pesan:"Pesan Masuk"
};

function initDashboard(){
  document.querySelectorAll(".tab-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const tab = link.dataset.tab;
      currentTab = tab;
      document.querySelectorAll(".tab-link").forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      document.getElementById("panel-" + tab).classList.add("active");
      document.getElementById("tabTitle").textContent = TAB_LABELS[tab];
      document.getElementById("addBtn").style.display = (tab === "profil" || tab === "pesan") ? "none" : "inline-flex";
      loadTab(tab);
    });
  });

  document.getElementById("addBtn").addEventListener("click", () => openModal(currentTab, null));
  document.getElementById("formProfil").addEventListener("submit", saveProfil);

  loadTab("berita");
  loadProfil();
}

function loadTab(tab){
  if(tab === "berita") loadBerita();
  if(tab === "kegiatan") loadKegiatan();
  if(tab === "galeri") loadGaleri();
  if(tab === "struktur") loadStruktur();
  if(tab === "pesan") loadPesan();
}

/* =========================================================
   BERITA
   ========================================================= */
async function loadBerita(){
  const { data } = await supabaseClient.from("berita").select("*").order("created_at",{ascending:false});
  const body = document.getElementById("tableBerita");
  if(!data || data.length === 0){ body.innerHTML = `<tr><td colspan="5">Belum ada berita.</td></tr>`; return; }
  body.innerHTML = data.map(b => `
    <tr>
      <td>${escapeHtml(b.judul)}</td>
      <td>${escapeHtml(b.kategori||"-")}</td>
      <td>${b.status === "published" ? "✅ Terbit" : "📝 Draft"}</td>
      <td>${formatTanggal(b.created_at)}</td>
      <td class="row-actions">
        <button onclick='openModal("berita", ${JSON.stringify(b).replace(/'/g,"&apos;")})'>Edit</button>
        <button class="danger" onclick="deleteItem('berita','${b.id}')">Hapus</button>
      </td>
    </tr>
  `).join("");
}

/* =========================================================
   KEGIATAN
   ========================================================= */
async function loadKegiatan(){
  const { data } = await supabaseClient.from("kegiatan").select("*").order("tanggal_kegiatan",{ascending:false});
  const body = document.getElementById("tableKegiatan");
  if(!data || data.length === 0){ body.innerHTML = `<tr><td colspan="5">Belum ada kegiatan.</td></tr>`; return; }
  body.innerHTML = data.map(k => `
    <tr>
      <td>${escapeHtml(k.judul)}</td>
      <td>${escapeHtml(k.lokasi||"-")}</td>
      <td>${k.tanggal_kegiatan ? formatTanggal(k.tanggal_kegiatan) : "-"}</td>
      <td>${k.status === "published" ? "✅ Terbit" : "📝 Draft"}</td>
      <td class="row-actions">
        <button onclick='openModal("kegiatan", ${JSON.stringify(k).replace(/'/g,"&apos;")})'>Edit</button>
        <button class="danger" onclick="deleteItem('kegiatan','${k.id}')">Hapus</button>
      </td>
    </tr>
  `).join("");
}

/* =========================================================
   GALERI
   ========================================================= */
async function loadGaleri(){
  const { data } = await supabaseClient.from("galeri").select("*").order("created_at",{ascending:false});
  const grid = document.getElementById("gridGaleri");
  if(!data || data.length === 0){ grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">Belum ada foto.</div>`; return; }
  grid.innerHTML = data.map(g => `
    <div class="gallery-item" style="position:relative;">
      <img src="${publicImageUrl('media', g.gambar_path)}" alt="${escapeHtml(g.judul||'')}">
      <button class="danger" onclick="deleteItem('galeri','${g.id}')"
        style="position:absolute;top:6px;right:6px;background:#fff;border:none;border-radius:4px;padding:4px 8px;font-weight:700;">✕</button>
    </div>
  `).join("");
}

/* =========================================================
   STRUKTUR ORGANISASI
   ========================================================= */
async function loadStruktur(){
  const { data } = await supabaseClient.from("struktur_organisasi").select("*").order("urutan",{ascending:true});
  const body = document.getElementById("tableStruktur");
  if(!data || data.length === 0){ body.innerHTML = `<tr><td colspan="4">Belum ada data pengurus.</td></tr>`; return; }
  body.innerHTML = data.map(s => `
    <tr>
      <td>${s.urutan}</td>
      <td>${escapeHtml(s.nama)}</td>
      <td>${escapeHtml(s.jabatan)}</td>
      <td class="row-actions">
        <button onclick='openModal("struktur", ${JSON.stringify(s).replace(/'/g,"&apos;")})'>Edit</button>
        <button class="danger" onclick="deleteItem('struktur_organisasi','${s.id}')">Hapus</button>
      </td>
    </tr>
  `).join("");
}

/* =========================================================
   PESAN KONTAK
   ========================================================= */
async function loadPesan(){
  const { data } = await supabaseClient.from("pesan_kontak").select("*").order("created_at",{ascending:false});
  const body = document.getElementById("tablePesan");
  if(!data || data.length === 0){ body.innerHTML = `<tr><td colspan="5">Belum ada pesan masuk.</td></tr>`; return; }
  body.innerHTML = data.map(p => `
    <tr>
      <td>${escapeHtml(p.nama)}</td>
      <td>${escapeHtml(p.email)}</td>
      <td>${escapeHtml(p.subjek||"-")}</td>
      <td style="max-width:280px;">${escapeHtml(p.pesan)}</td>
      <td>${formatTanggal(p.created_at)}</td>
    </tr>
  `).join("");
}

/* =========================================================
   PROFIL ORGANISASI
   ========================================================= */
async function loadProfil(){
  const { data } = await supabaseClient.from("profil_organisasi").select("*").eq("id",1).single();
  if(!data) return;
  document.getElementById("p_sejarah").value = data.sejarah || "";
  document.getElementById("p_visi").value = data.visi || "";
  try{
    const misiArr = JSON.parse(data.misi || "[]");
    document.getElementById("p_misi").value = misiArr.join("\n");
  }catch(e){ document.getElementById("p_misi").value = data.misi || ""; }
  document.getElementById("p_telepon").value = data.telepon || "";
  document.getElementById("p_email").value = data.email || "";
}

async function saveProfil(e){
  e.preventDefault();
  const misiArr = document.getElementById("p_misi").value.split("\n").map(s=>s.trim()).filter(Boolean);
  const payload = {
    sejarah: document.getElementById("p_sejarah").value.trim(),
    visi: document.getElementById("p_visi").value.trim(),
    misi: JSON.stringify(misiArr),
    telepon: document.getElementById("p_telepon").value.trim(),
    email: document.getElementById("p_email").value.trim(),
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabaseClient.from("profil_organisasi").update(payload).eq("id",1);
  alert(error ? "Gagal menyimpan: " + error.message : "Profil berhasil diperbarui.");
}

/* =========================================================
   MODAL FORM (dinamis per tipe)
   ========================================================= */
function slugify(text){
  return text.toString().toLowerCase().trim()
    .replace(/[^\w\s-]/g,"").replace(/[\s_-]+/g,"-").replace(/^-+|-+$/g,"");
}

function openModal(type, item){
  const overlay = document.getElementById("modalOverlay");
  const form = document.getElementById("modalForm");
  document.getElementById("modalTitle").textContent = (item ? "Edit " : "Tambah ") + TAB_LABELS[type];

  let fieldsHtml = "";
  if(type === "berita"){
    fieldsHtml = `
      <div class="form-field"><label>Judul</label><input id="m_judul" value="${item ? escapeHtml(item.judul) : ""}" required></div>
      <div class="form-field"><label>Kategori</label><input id="m_kategori" value="${item ? escapeHtml(item.kategori||"") : "Umum"}"></div>
      <div class="form-field"><label>Ringkasan</label><textarea id="m_ringkasan">${item ? escapeHtml(item.ringkasan||"") : ""}</textarea></div>
      <div class="form-field"><label>Konten Lengkap</label><textarea id="m_konten" style="min-height:160px;" required>${item ? escapeHtml(item.konten||"") : ""}</textarea></div>
      <div class="form-field"><label>Gambar Sampul</label><input type="file" id="m_gambar" accept="image/*"></div>
      <div class="form-field"><label>Status</label>
        <select id="m_status">
          <option value="published" ${item && item.status==="published" ? "selected":""}>Terbitkan</option>
          <option value="draft" ${item && item.status==="draft" ? "selected":""}>Draft</option>
        </select>
      </div>`;
  } else if(type === "kegiatan"){
    fieldsHtml = `
      <div class="form-field"><label>Judul</label><input id="m_judul" value="${item ? escapeHtml(item.judul) : ""}" required></div>
      <div class="form-field"><label>Tanggal Kegiatan</label><input type="date" id="m_tanggal" value="${item ? item.tanggal_kegiatan||"" : ""}"></div>
      <div class="form-field"><label>Lokasi</label><input id="m_lokasi" value="${item ? escapeHtml(item.lokasi||"") : ""}"></div>
      <div class="form-field"><label>Deskripsi Singkat</label><textarea id="m_deskripsi">${item ? escapeHtml(item.deskripsi||"") : ""}</textarea></div>
      <div class="form-field"><label>Detail Kegiatan</label><textarea id="m_konten" style="min-height:140px;">${item ? escapeHtml(item.konten||"") : ""}</textarea></div>
      <div class="form-field"><label>Gambar</label><input type="file" id="m_gambar" accept="image/*"></div>
      <div class="form-field"><label>Status</label>
        <select id="m_status">
          <option value="published" ${item && item.status==="published" ? "selected":""}>Terbitkan</option>
          <option value="draft" ${item && item.status==="draft" ? "selected":""}>Draft</option>
        </select>
      </div>`;
  } else if(type === "galeri"){
    fieldsHtml = `
      <div class="form-field"><label>Judul Foto</label><input id="m_judul" value=""></div>
      <div class="form-field"><label>Kategori</label><input id="m_kategori" value="Dokumentasi"></div>
      <div class="form-field"><label>Pilih Foto</label><input type="file" id="m_gambar" accept="image/*" required></div>`;
  } else if(type === "struktur"){
    fieldsHtml = `
      <div class="form-field"><label>Nama</label><input id="m_nama" value="${item ? escapeHtml(item.nama) : ""}" required></div>
      <div class="form-field"><label>Jabatan</label><input id="m_jabatan" value="${item ? escapeHtml(item.jabatan) : ""}" required></div>
      <div class="form-field"><label>Urutan (0 = Ketua, tampil paling atas)</label><input type="number" id="m_urutan" value="${item ? item.urutan : 1}"></div>`;
  }

  form.innerHTML = fieldsHtml + `
    <div class="form-actions">
      <button type="submit" class="btn btn-blue">Simpan</button>
      <button type="button" class="btn btn-ghost" id="modalCancel">Batal</button>
    </div>`;

  document.getElementById("modalCancel").addEventListener("click", closeModal);
  form.onsubmit = (e) => submitModal(e, type, item);

  overlay.classList.add("open");
}

function closeModal(){
  document.getElementById("modalOverlay").classList.remove("open");
}

async function uploadImageIfAny(inputId, existingPath){
  const fileInput = document.getElementById(inputId);
  if(!fileInput || !fileInput.files || fileInput.files.length === 0) return existingPath || null;
  const file = fileInput.files[0];
  const path = `${Date.now()}-${slugify(file.name)}`;
  const { error } = await supabaseClient.storage.from("media").upload(path, file, { upsert:true });
  if(error){ alert("Gagal upload gambar: " + error.message); return existingPath || null; }
  return path;
}

async function submitModal(e, type, item){
  e.preventDefault();
  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.textContent = "Menyimpan…"; submitBtn.disabled = true;

  let payload = {}, table = "";

  if(type === "berita"){
    table = "berita";
    const judul = document.getElementById("m_judul").value.trim();
    payload = {
      judul, slug: item ? item.slug : slugify(judul) + "-" + Date.now().toString().slice(-5),
      kategori: document.getElementById("m_kategori").value.trim(),
      ringkasan: document.getElementById("m_ringkasan").value.trim(),
      konten: document.getElementById("m_konten").value.trim(),
      status: document.getElementById("m_status").value,
      gambar_path: await uploadImageIfAny("m_gambar", item ? item.gambar_path : null),
      updated_at: new Date().toISOString(),
    };
  } else if(type === "kegiatan"){
    table = "kegiatan";
    const judul = document.getElementById("m_judul").value.trim();
    payload = {
      judul, slug: item ? item.slug : slugify(judul) + "-" + Date.now().toString().slice(-5),
      tanggal_kegiatan: document.getElementById("m_tanggal").value || null,
      lokasi: document.getElementById("m_lokasi").value.trim(),
      deskripsi: document.getElementById("m_deskripsi").value.trim(),
      konten: document.getElementById("m_konten").value.trim(),
      status: document.getElementById("m_status").value,
      gambar_path: await uploadImageIfAny("m_gambar", item ? item.gambar_path : null),
      updated_at: new Date().toISOString(),
    };
  } else if(type === "galeri"){
    table = "galeri";
    payload = {
      judul: document.getElementById("m_judul").value.trim(),
      kategori: document.getElementById("m_kategori").value.trim(),
      gambar_path: await uploadImageIfAny("m_gambar", null),
    };
  } else if(type === "struktur"){
    table = "struktur_organisasi";
    payload = {
      nama: document.getElementById("m_nama").value.trim(),
      jabatan: document.getElementById("m_jabatan").value.trim(),
      urutan: parseInt(document.getElementById("m_urutan").value || "1", 10),
    };
  }

  let error;
  if(item && item.id){
    ({ error } = await supabaseClient.from(table).update(payload).eq("id", item.id));
  } else {
    ({ error } = await supabaseClient.from(table).insert(payload));
  }

  if(error){
    alert("Gagal menyimpan: " + error.message);
    submitBtn.textContent = "Simpan"; submitBtn.disabled = false;
    return;
  }

  closeModal();
  loadTab(currentTab);
}

async function deleteItem(table, id){
  if(!confirm("Yakin ingin menghapus data ini?")) return;
  const { error } = await supabaseClient.from(table).delete().eq("id", id);
  if(error){ alert("Gagal menghapus: " + error.message); return; }
  loadTab(currentTab);
}
