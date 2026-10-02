/**
 * app.js
 * -----------------------------------------------------------------------------
 * Controller & DOM Presentation Layer untuk Personal Portfolio & Service Portal.
 * 
 * Fitur Utama:
 * 1. Sanitasi Ketat XSS (escapeHTML) pada seluruh data JSON & input pengguna.
 * 2. Dynamic Client-Side Rendering (CSR) dengan 4 UI States:
 *    - Loading (Skeleton Placeholder)
 *    - Success (Render Data Lengkap)
 *    - Empty (Pemberitahuan Data Kosong)
 *    - Error (Bootstrap Alert & Tombol Retry)
 * 3. Client-Side Instant Category Filtering (in-memory, tanpa fetch ulang).
 * 4. Rendering Dinamis Katalog Layanan & Profil.
 * -----------------------------------------------------------------------------
 */

const App = (function () {
  'use strict';

  // State aplikasi dalam memori
  let allProjects = [];
  let currentCategory = 'all';

  // DOM Elements Cache
  let projectsContainer = null;
  let servicesContainer = null;
  let filterGroup = null;

  /**
   * Sanitasi String untuk mencegah serangan Cross-Site Scripting (XSS).
   * Seluruh data yang disisipkan ke DOM via template literals WAJIB melalui fungsi ini.
   * @param {any} input
   * @returns {string}
   */
  function escapeHTML(input) {
    if (input === null || input === undefined) return '';
    return String(input)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* =========================================================================
     4 UI STATES UNTUK PROJECTS CONTAINER
     ========================================================================= */

  /**
   * 1. STATE: LOADING
   * Menampilkan skeleton loading card beranimasi saat proses fetch berlangsung.
   */
  function renderProjectsLoading() {
    if (!projectsContainer) return;
    const skeletonCardHTML = `
      <div class="col">
        <div class="card h-100 skeleton-card">
          <div class="skeleton-banner"></div>
          <div class="card-body">
            <div class="skeleton-text w-75 mb-3"></div>
            <div class="skeleton-text w-100"></div>
            <div class="skeleton-text w-50 mb-3"></div>
            <div class="d-flex gap-2">
              <span class="skeleton-text" style="width: 50px; height: 22px;"></span>
              <span class="skeleton-text" style="width: 60px; height: 22px;"></span>
            </div>
          </div>
          <div class="card-footer bg-transparent border-0 d-flex justify-content-end pb-3">
            <div class="skeleton-text" style="width: 80px; height: 32px; border-radius: 8px;"></div>
          </div>
        </div>
      </div>
    `;
    projectsContainer.innerHTML = skeletonCardHTML.repeat(3);
  }

  /**
   * 2. STATE: SUCCESS
   * Merender daftar proyek ke dalam kartu Bootstrap.
   * @param {Array<Object>} projects
   */
  function renderProjectsSuccess(projects) {
    if (!projectsContainer) return;

    const cardsHTML = projects.map(project => {
      const bannerClass = project.bannerClass ? escapeHTML(project.bannerClass) : 'card-banner-frontend';
      const iconClass = project.thumbnail ? escapeHTML(project.thumbnail) : 'bi-folder-fill';
      const title = escapeHTML(project.title);
      const desc = escapeHTML(project.description);
      const category = escapeHTML(project.category);
      const projectId = escapeHTML(project.id);

      // Render daftar badge tags dengan sanitasi
      const tagsHTML = (Array.isArray(project.tags) ? project.tags : [])
        .map(tag => `<span class="badge tech-badge">${escapeHTML(tag)}</span>`)
        .join(' ');

      return `
        <div class="col" data-project-category="${category}">
          <article class="portfolio-card card h-100 shadow-sm">
            <div class="card-banner ${bannerClass}">
              <i class="bi ${iconClass} card-banner-icon"></i>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h3 class="card-title h5 mb-0">${title}</h3>
                <span class="badge bg-secondary-subtle text-secondary-emphasis">${category}</span>
              </div>
              <p class="card-text text-muted mb-3">${desc}</p>
              <div class="d-flex flex-wrap gap-2 mb-3">
                ${tagsHTML}
              </div>
            </div>
            <div class="card-footer bg-transparent border-0 d-flex justify-content-end pb-3 pt-0">
              <button 
                type="button" 
                class="btn btn-primary btn-sm btn-detail" 
                data-project-id="${projectId}"
                aria-label="Lihat detail ${title}"
              >
                <i class="bi bi-arrow-up-right-circle me-1"></i>Detail
              </button>
            </div>
          </article>
        </div>
      `;
    }).join('');

    projectsContainer.innerHTML = cardsHTML;
  }

  /**
   * 3. STATE: EMPTY
   * Menampilkan pesan ramah jika hasil filter tidak memiliki data.
   */
  function renderProjectsEmpty() {
    if (!projectsContainer) return;
    projectsContainer.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="p-4 border rounded-3 bg-light-subtle shadow-sm">
          <i class="bi bi-inbox text-muted" style="font-size: 2.75rem;"></i>
          <h4 class="mt-3 text-secondary">Tidak Ada Proyek</h4>
          <p class="text-muted mb-0">Belum ada portofolio yang terdaftar pada kategori <strong>${escapeHTML(currentCategory)}</strong>.</p>
        </div>
      </div>
    `;
  }

  /**
   * 4. STATE: ERROR
   * Menampilkan peringatan Bootstrap jika fetch gagal, tanpa merusak layout halaman.
   * @param {Error} error
   */
  function renderProjectsError(error) {
    if (!projectsContainer) return;
    projectsContainer.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger d-flex align-items-center shadow-sm" role="alert">
          <i class="bi bi-exclamation-triangle-fill flex-shrink-0 me-3 fs-2 text-danger"></i>
          <div class="w-100">
            <h5 class="alert-heading mb-1">Gagal Memuat Data Portofolio</h5>
            <p class="mb-2 small">Terjadi kesalahan pada sistem saat mengakses berkas JSON: <em>${escapeHTML(error.message)}</em></p>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="App.loadProjects()">
              <i class="bi bi-arrow-clockwise me-1"></i>Coba Muat Ulang
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /* =========================================================================
     PENGAMBILAN & FILTER DATA PORTOFOLIO
     ========================================================================= */

  /**
   * Mengambil data proyek via ApiService dan merender ke UI.
   */
  async function loadProjects() {
    renderProjectsLoading();
    try {
      const data = await window.ApiService.fetchProjects();
      allProjects = Array.isArray(data) ? data : [];
      applyCategoryFilter(currentCategory);
    } catch (error) {
      renderProjectsError(error);
    }
  }

  /**
   * Memfilter proyek secara instan di sisi klien (client-side in-memory filter).
   * @param {string} category - Kategori yang dipilih ('all', 'Frontend', dll.)
   */
  function applyCategoryFilter(category) {
    currentCategory = category;

    // Filter data tanpa request jaringan ulang
    const filtered = (category === 'all')
      ? allProjects
      : allProjects.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());

    if (filtered.length === 0) {
      renderProjectsEmpty();
    } else {
      renderProjectsSuccess(filtered);
    }
  }

  /**
   * Setup Event Listener untuk tombol filter kategori
   */
  function initFilterListeners() {
    if (!filterGroup) return;

    filterGroup.addEventListener('click', function (e) {
      const targetBtn = e.target.closest('.btn-filter');
      if (!targetBtn) return;

      const category = targetBtn.getAttribute('data-category');
      if (!category) return;

      // Update state tombol aktif
      const allBtns = filterGroup.querySelectorAll('.btn-filter');
      allBtns.forEach(btn => btn.classList.remove('active'));
      targetBtn.classList.add('active');

      // Terapkan filter instan
      applyCategoryFilter(category);
    });
  }

  /* =========================================================================
     RENDERING KATALOG LAYANAN (services.json)
     ========================================================================= */

  /**
   * Mengambil dan merender katalog paket layanan dari services.json
   */
  async function loadServices() {
    if (!servicesContainer) return;

    // Loading State untuk Services
    servicesContainer.innerHTML = `
      <div class="col-12 text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Memuat layanan...</span>
        </div>
      </div>
    `;

    try {
      const services = await window.ApiService.fetchServices();
      if (!Array.isArray(services) || services.length === 0) {
        servicesContainer.innerHTML = `
          <div class="col-12 text-center text-muted py-4">
            <p>Katalog paket layanan sedang diperbarui.</p>
          </div>
        `;
        return;
      }

      const servicesHTML = services.map(srv => {
        const isFeatured = !!srv.popular;
        const featuresHTML = (Array.isArray(srv.features) ? srv.features : [])
          .map(f => `<li><i class="bi bi-check-circle-fill"></i><span>${escapeHTML(f)}</span></li>`)
          .join('');

        return `
          <div class="col">
            <div class="card h-100 service-card ${isFeatured ? 'featured' : ''} p-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="badge ${isFeatured ? 'service-badge-popular' : 'bg-light text-dark border'}">
                  ${escapeHTML(srv.badge || 'Layanan')}
                </span>
                ${isFeatured ? '<i class="bi bi-award-fill text-warning fs-5"></i>' : ''}
              </div>
              <h3 class="h5 fw-bold mb-2">${escapeHTML(srv.name)}</h3>
              <p class="text-muted small mb-3">${escapeHTML(srv.description)}</p>
              <div class="mb-4">
                <span class="service-price">${escapeHTML(srv.price)}</span>
              </div>
              <hr class="my-2 border-secondary-subtle">
              <h6 class="text-uppercase fw-bold text-muted small mt-3 mb-2">Fitur Unggulan:</h6>
              <ul class="service-feature-list flex-grow-1 mb-4">
                ${featuresHTML}
              </ul>
              <div class="mt-auto pt-2">
                <a href="#layanan" class="btn ${isFeatured ? 'btn-primary' : 'btn-outline-brand'} w-100 btn-sm">
                  <i class="bi bi-chat-text me-1"></i>Pilih Layanan Ini
                </a>
              </div>
            </div>
          </div>
        `;
      }).join('');

      servicesContainer.innerHTML = servicesHTML;
    } catch (err) {
      servicesContainer.innerHTML = `
        <div class="col-12">
          <div class="alert alert-warning py-3">
            <i class="bi bi-exclamation-circle me-2"></i>
            Katalog layanan belum dapat dimuat saat ini (${escapeHTML(err.message)}).
          </div>
        </div>
      `;
    }
  }

  /* =========================================================================
     UNIVERSAL DYNAMIC MODAL (Stub untuk Langkah 5)
     ========================================================================= */
  function openProjectModal(projectId) {
    const project = allProjects.find(p => p.id === projectId);
    if (!project) return;

    const modalEl = document.getElementById('universalProjectModal');
    if (!modalEl) {
      console.warn('Elemen #universalProjectModal belum ditemukan di DOM.');
      return;
    }

    const titleEl = document.getElementById('universalModalTitle');
    const bodyEl = document.getElementById('universalModalBody');

    if (titleEl) {
      titleEl.innerHTML = `<i class="bi ${escapeHTML(project.thumbnail || 'bi-folder-fill')} me-2"></i>${escapeHTML(project.title)}`;
    }

    if (bodyEl) {
      const details = project.details || {};
      const overview = escapeHTML(details.overview || project.description || '');
      const bannerClass = escapeHTML(project.bannerClass || 'card-banner-frontend');
      const icon = escapeHTML(project.thumbnail || 'bi-folder-fill');

      const techBadges = (Array.isArray(details.technologies) ? details.technologies : project.tags || [])
        .map(t => `<span class="badge tech-badge">${escapeHTML(t)}</span>`)
        .join(' ');

      const achievementsList = (Array.isArray(details.achievements) ? details.achievements : [])
        .map(a => `<li>${escapeHTML(a)}</li>`)
        .join('');

      bodyEl.innerHTML = `
        <div class="modal-banner ${bannerClass} mb-4 rounded-3 d-flex align-items-center justify-content-center" style="height: 140px;">
          <i class="bi ${icon} text-white" style="font-size: 3.5rem; opacity: 0.9;"></i>
        </div>
        <h6 class="fw-bold mb-2">Deskripsi Proyek</h6>
        <p class="text-secondary mb-3">${overview}</p>

        <h6 class="fw-bold mb-2">Teknologi &amp; Konsep</h6>
        <div class="d-flex flex-wrap gap-2 mb-3">
          ${techBadges}
        </div>

        ${achievementsList ? `
          <h6 class="fw-bold mb-2">Capaian &amp; Penerapan</h6>
          <ul class="text-secondary small ps-3 mb-3">
            ${achievementsList}
          </ul>
        ` : ''}

        ${project.link && (project.link.startsWith('http://') || project.link.startsWith('https://')) ? `
          <div class="mt-3 pt-2 border-top">
            <a href="${escapeHTML(project.link)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-brand">
              <i class="bi bi-github me-1"></i>Lihat Repository Proyek
            </a>
          </div>
        ` : ''}
      `;
    }

    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
      modalInstance.show();
    }
  }

  /* =========================================================================
     LANGKAH 6: ASYNC REST DISPATCH, LOCALSTORAGE, & REACTIVE COUNTER
     ========================================================================= */

  const STORAGE_KEY = 'ppw_consultation_orders';

  /**
   * Mengambil riwayat pesanan dari localStorage
   * @returns {Array<Object>}
   */
  function getOrderHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Gagal membaca riwayat dari localStorage:', e);
      return [];
    }
  }

  /**
   * Menyimpan pesanan baru ke localStorage dan memperbarui counter UI
   * @param {Object} order
   */
  function saveOrderToStorage(order) {
    try {
      const orders = getOrderHistory();
      orders.unshift(order);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
      updateOrderCounters();
    } catch (e) {
      console.error('Gagal menyimpan pesanan ke localStorage:', e);
    }
  }

  /**
   * Memperbarui badge counter pesanan di UI secara reaktif tanpa reload
   */
  function updateOrderCounters() {
    const orders = getOrderHistory();
    const count = orders.length;

    const navBadge = document.getElementById('navOrderCounter');
    const formBadge = document.getElementById('formOrderCounter');

    if (navBadge) {
      navBadge.textContent = count;
      navBadge.style.display = count > 0 ? 'inline-block' : 'none';
    }

    if (formBadge) {
      formBadge.textContent = count;
    }
  }

  /**
   * Menampilkan Bootstrap Toast notifikasi sukses
   * @param {string} senderName
   */
  function showToast(senderName) {
    const toastEl = document.getElementById('orderSuccessToast');
    if (!toastEl) return;

    const msgEl = document.getElementById('toastMessage');
    if (msgEl) {
      msgEl.textContent = `Terima kasih, ${senderName}! Permintaan konsultasi Anda telah berhasil dikirim & disimpan.`;
    }

    if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
      const toastInstance = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 5000 });
      toastInstance.show();
    }
  }

  /**
   * Menginisialisasi async form submission handler
   */
  function initFormOrderHandler() {
    const form = document.getElementById('formKonsultasi');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
      // 1. Cegah reload halaman default browser
      e.preventDefault();

      // Pengecekan validitas HTML5
      if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
      }

      const submitBtn = form.querySelector('#btn-kirim');
      const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';

      // 2. Konversi FormData ke Objek JSON (Payload)
      const formData = new FormData(form);
      const payload = {
        id: 'ord-' + Date.now(),
        nama: (formData.get('nama') || '').trim(),
        email: (formData.get('email') || '').trim(),
        telepon: (formData.get('telepon') || '').trim() || '-',
        topik: formData.get('topik') || 'umum',
        jumlahOrang: Number(formData.get('jumlah-orang')) || 1,
        jadwal: formData.get('jadwal') || 'pagi',
        pesan: (formData.get('pesan') || '').trim(),
        setuju: formData.get('setuju') === 'on',
        timestamp: new Date().toISOString()
      };

      // 3. UI State: Disable tombol submit + tampilkan spinner
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Mengirimkan Permintaan...
        `;
      }

      try {
        // 4. Dispatch REST asinkron via ApiService
        await window.ApiService.submitConsultationOrder(payload);

        // 5. Simpan ke localStorage & perbarui badge counter secara reaktif
        saveOrderToStorage(payload);

        // 6. Tampilkan notifikasi Bootstrap Toast
        showToast(payload.nama);

        // Reset form input & validasi visual
        form.reset();
        form.classList.remove('was-validated');
      } catch (err) {
        console.error('Pengiriman formulir gagal:', err);
        alert('Pengiriman gagal: ' + err.message);
      } finally {
        // 7. Kembalikan status tombol ke keadaan semula (try/finally)
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
        }
      }
    });
  }

  /* =========================================================================
     RENDERING PROFIL (profile.json)
     ========================================================================= */
  async function loadProfile() {
    try {
      const profile = await window.ApiService.fetchProfile();
      if (!profile) return;

      const kickerEl = document.querySelector('.hero-kicker');
      const h1El = document.querySelector('.hero-text h1');
      const descEl = document.querySelector('.hero-desc');

      if (kickerEl && profile.kicker) kickerEl.textContent = profile.kicker;
      if (h1El && profile.name) h1El.textContent = profile.name;
      if (descEl && profile.bio) descEl.textContent = profile.bio;
    } catch (err) {
      console.warn('Gagal memuat data profile.json:', err);
    }
  }

  /* =========================================================================
     INISIALISASI APLIKASI
     ========================================================================= */
  function init() {
    projectsContainer = document.getElementById('projectsContainer');
    servicesContainer = document.getElementById('servicesContainer');
    filterGroup = document.getElementById('projectFilterGroup');

    // Delegasi event klik tombol detail pada kartu proyek
    if (projectsContainer) {
      projectsContainer.addEventListener('click', function (e) {
        const detailBtn = e.target.closest('.btn-detail');
        if (detailBtn) {
          const projectId = detailBtn.getAttribute('data-project-id');
          if (projectId) {
            openProjectModal(projectId);
          }
        }
      });
    }

    initFilterListeners();
    initFormOrderHandler();
    updateOrderCounters();
    loadProfile();
    loadProjects();
    loadServices();
  }

  // Jalankan saat DOM siap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    init,
    loadProjects,
    loadServices,
    applyCategoryFilter,
    openProjectModal,
    getOrderHistory,
    updateOrderCounters,
    escapeHTML
  };
})();

// Expose openProjectModal secara global sesuai spesifikasi instruksi praktikum
window.openProjectModal = App.openProjectModal;

