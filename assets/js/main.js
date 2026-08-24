/* =========================================================
   MAIN.JS — komponen bersama (header/footer) + interaksi umum
   Setiap halaman cukup punya <div id="site-header"></div>
   dan <div id="site-footer"></div>, lalu set body[data-page="..."]
   untuk menandai menu aktif.
   ========================================================= */

const NAV_ITEMS = [
  { href:"index.html",    label:"Beranda",     key:"beranda" },
  { href:"tentang.html",  label:"Tentang Kami", key:"tentang" },
  { href:"berita.html",   label:"Berita",       key:"berita" },
  { href:"kegiatan.html", label:"Kegiatan",     key:"kegiatan" },
  { href:"galeri.html",   label:"Galeri",       key:"galeri" },
  { href:"kontak.html",   label:"Kontak",       key:"kontak" },
];

function renderHeader(){
  const mount = document.getElementById("site-header");
  if(!mount) return;
  const current = document.body.dataset.page || "";

  mount.innerHTML = `
    <header class="site-header">
      <div class="bar">
        <a href="index.html" class="brand">
          <img src="assets/img/logo-portal.png" alt="Portal KNPI Cibinong">
        </a>
        <nav class="nav-main" id="navMain">
          ${NAV_ITEMS.map(item => `
            <a href="${item.href}" class="${item.key === current ? "active" : ""}">${item.label}</a>
          `).join("")}
        </nav>
        <button class="nav-toggle" id="navToggle" aria-label="Buka menu">&#9776;</button>
      </div>
    </header>
  `;

  document.getElementById("navToggle").addEventListener("click", () => {
    document.getElementById("navMain").classList.toggle("open");
  });
}

function renderFooter(){
  const mount = document.getElementById("site-footer");
  if(!mount) return;
  const year = new Date().getFullYear();

  mount.innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <div class="footer-brand">
              <img src="assets/img/logo-knpi.png" alt="Lambang KNPI">
              <strong style="color:#fff;font-family:'Space Grotesk',sans-serif;">PK KNPI Cibinong</strong>
            </div>
            <p style="max-width:38ch;font-size:.9rem;">
              Komite Nasional Pemuda Indonesia Pengurus Kecamatan Cibinong —
              wadah pemersatu dan pengembangan potensi pemuda Cibinong.
            </p>
          </div>
          <div>
            <h4>Navigasi</h4>
            ${NAV_ITEMS.map(item => `<a href="${item.href}">${item.label}</a>`).join("")}
          </div>
          <div>
            <h4>Kontak</h4>
            <a href="kontak.html">Jl. Teguh Beriman No.2, Pakansari, Cibinong, Kab. Bogor 16915</a>
            <a href="admin/login.html" style="opacity:.5;">Login Admin</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>&copy; ${year} PK KNPI Cibinong. Seluruh hak cipta dilindungi.</span>
          <span>Portal KNPI Cibinong</span>
        </div>
      </div>
    </footer>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
});
