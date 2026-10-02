/**
 * api-service.js
 * -----------------------------------------------------------------------------
 * Data Access Layer (DAL) untuk Personal Portfolio & Service Portal.
 * 
 * Prinsip Arsitektur:
 * 1. Modul ini bertanggung jawab PENUH atas pengambilan data (data retrieval).
 * 2. TIDAK BOLEH memanipulasi atau menyentuh Document Object Model (DOM).
 * 3. Menggunakan async/await, penanganan HTTP status via response.ok, serta
 *    melempar (throw) Error deskriptif untuk ditangani oleh Presentation Layer (app.js).
 * -----------------------------------------------------------------------------
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ApiService = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Base path untuk data JSON
  const DATA_PATHS = {
    PROJECTS: 'data/projects.json',
    SERVICES: 'data/services.json',
    PROFILE: 'data/profile.json'
  };

  /**
   * Helper generik untuk mengambil data JSON dengan pengecekan response.ok
   * @param {string} endpoint - Path URL ke file JSON
   * @returns {Promise<any>}
   */
  async function fetchJson(endpoint) {
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json'
        },
        cache: 'default'
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: Gagal memuat resource dari ${endpoint} (${response.statusText || 'Unknown'})`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Re-throw error dengan pesan yang terstruktur agar Presentation Layer dapat menampilkan UI State Error
      console.error(`[ApiService Error] Akses ke ${endpoint} gagal:`, error);
      throw error;
    }
  }

  /**
   * Mengambil daftar seluruh proyek portofolio
   * @returns {Promise<Array<Object>>}
   */
  async function fetchProjects() {
    return await fetchJson(DATA_PATHS.PROJECTS);
  }

  /**
   * Mengambil daftar katalog paket layanan
   * @returns {Promise<Array<Object>>}
   */
  async function fetchServices() {
    return await fetchJson(DATA_PATHS.SERVICES);
  }

  /**
   * Mengambil data profil dan statistik personal
   * @returns {Promise<Object>}
   */
  async function fetchProfile() {
    return await fetchJson(DATA_PATHS.PROFILE);
  }

  /**
   * Mengirim pesanan konsultasi / kontak secara asinkron (REST dispatch simulation)
   * @param {Object} payload - Objek data formulir pemesanan
   * @returns {Promise<Object>}
   */
  async function submitConsultationOrder(payload) {
    // Simulasi network latency (500ms) untuk demonstrasi loading state
    await new Promise(resolve => setTimeout(resolve, 500));

    // Validasi payload dasar sebelum dispatch
    if (!payload || !payload.nama || !payload.email || !payload.pesan) {
      throw new Error('Validasi gagal: Data formulir tidak lengkap.');
    }

    // Mengembalikan response simulasi sukses REST API
    return {
      success: true,
      statusCode: 201,
      message: 'Permintaan konsultasi berhasil dikirim dan dicatat.',
      timestamp: new Date().toISOString(),
      data: payload
    };
  }

  return {
    fetchProjects,
    fetchServices,
    fetchProfile,
    submitConsultationOrder
  };
});
