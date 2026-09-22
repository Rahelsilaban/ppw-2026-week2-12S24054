# Portofolio Personal — Rahel Juri Elisabet Silaban

## Identitas

| Atribut | Detail |
|---|---|
| **Nama** | Rahel Juri Elisabet Silaban |
| **NIM** | 12S24054 |
| **Program Studi** | S1 Sistem Informasi |
| **Kampus** | Institut Teknologi Del |
| **Mata Kuliah** | Pemrograman dan Pengujian Web (PPW) |
| **Tahun Ajaran** | 2025/2026 |

---

## Ringkasan Proyek

Proyek ini adalah **Personal Portfolio & Service Portal** yang dikembangkan bertahap selama Praktikum PPW:

- **Praktikum 1 (Minggu 2):** Membangun portofolio statis dari nol menggunakan HTML5 semantik murni dan CSS custom (tanpa framework), dengan struktur `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`.
- **Praktikum 2 (Minggu 3):** Merefaktor dan mengembangkan proyek yang sama dengan mengintegrasikan **Bootstrap 5.3.3** sebagai framework CSS, sambil mempertahankan identitas visual personal melalui CSS custom properties dan override cascade.

---

## Pembaruan dari Minggu 2 ke Minggu 3

### Langkah 1 — Setup Bootstrap
- Menambahkan CDN Bootstrap 5.3.3 CSS di `<head>` **sebelum** `style.css`, sehingga custom CSS menang via cascade order.
- Menambahkan Bootstrap Icons CDN untuk ikon dekoratif dan fungsional.
- Menambahkan Bootstrap JS Bundle sebelum `</body>` untuk mengaktifkan komponen interaktif (Modal, Collapse/Navbar).

### Langkah 2 — Navbar Responsif
- Mengubah navigasi lama menjadi `navbar navbar-expand-lg navbar-dark sticky-top`.
- Menambahkan tombol hamburger dengan `data-bs-toggle="collapse"` yang berfungsi tanpa error di ukuran mobile.
- Mempertahankan brand logo `Rahel.dev` dan semua link navigasi asli.
- Override warna navbar dengan `--color-accent` (#7C3AED) sesuai identitas brand.

### Langkah 3 — Hero Section Grid Bootstrap
- Menyusun ulang hero dengan `container > row > col-lg-7 + col-lg-5`.
- Menambahkan dua tombol CTA: "Lihat Portofolio" (→ `#portofolio`) dan "Hubungi Saya" (→ `#layanan`).
- Mempertahankan semua konten asli: foto profil, bio, meta info NIM/Prodi/Kampus, skills aside.

### Langkah 4 — Portfolio Grid + Modal
- Mengubah kartu lama menjadi Bootstrap grid `row-cols-1 row-cols-md-2 row-cols-lg-3 g-4`.
- Menambahkan kartu ke-4: **Version Control & Git**.
- Setiap kartu dilengkapi banner gradient CSS, badge teknologi, deskripsi, dan tombol "Detail".
- **3 Bootstrap Modal** dengan konten berbeda: Frontend & UI, Basis Data, Version Control & Git.

### Langkah 5 — Modernisasi Form Kontak
- Input Group dengan ikon Bootstrap Icons di setiap field.
- `<select>` dengan `form-select` + kategori layanan diperluas.
- Radio jadwal dan checkbox syarat menggunakan `form-check` Bootstrap.
- Elemen `.valid-feedback` / `.invalid-feedback` dengan validasi HTML5 Bootstrap (`needs-validation`).

### Langkah 6 — Custom Theming
- Mendefinisikan **8+ CSS custom properties** di `:root` dengan prefix `--color-*`.
- Variabel diterapkan konsisten ke navbar, cards, tombol, form, modal.
- Transisi hover halus (`transform + box-shadow`) pada card dan tombol.
- Satu penggunaan `!important` yang didokumentasi: background navbar (alasan: spesifisitas Bootstrap utility class).

---

## Tabel Komparasi Sebelum vs Sesudah Integrasi Framework

| Aspek |  Sebelum (Minggu 2 — HTML + CSS Murni) | Sesudah (Minggu 3 — Bootstrap 5.3.3) |
|---|---|---|
| **Navbar** | Flexbox manual dengan `header-inner`, tanpa hamburger | `navbar navbar-expand-lg` + hamburger `data-bs-toggle` yang fully functional |
| **Responsivitas Navbar** | Wrap ke bawah dengan `flex-wrap` sederhana | Collapse/expand otomatis dengan animasi Bootstrap |
| **Layout Hero** | CSS Grid manual `grid-template-columns: 1.5fr 1fr` | Bootstrap grid `col-lg-7 + col-lg-5` dalam `.row` |
| **Tombol CTA** | 1 tombol "Hubungi Saya" | 2 tombol CTA: ke portofolio dan ke kontak, dengan ikon |
| **Portfolio Cards** | 3 kartu, CSS Grid `repeat(3, 1fr)`, tanpa gambar/tombol | 4 kartu, `row-cols-*` responsif, banner gradient, badge, tombol Detail |
| **Interaktivitas Cards** | Tidak ada | 3 Modal detail dengan konten berbeda per kartu |
| **Form — Input** | `input + label` biasa dengan CSS manual | `input-group` + ikon + `form-control` + `valid/invalid-feedback` |
| **Form — Select** | `<select>` dengan CSS custom | `form-select` Bootstrap, terintegrasi input-group |
| **Form — Radio/Checkbox** | Custom radio/checkbox dengan class `radio-option` | `form-check` Bootstrap dengan ikon dekoratif |
| **Validasi Form** | Hanya validasi HTML5 default browser | Bootstrap validation visual (`needs-validation` + `was-validated`) |
| **CSS Variables** | 14 variabel `--*` di `:root` | 8 variabel `--color-*` + alias, diterapkan konsisten ke semua komponen |
| **Hover Efek** | `translateY(-5px)` pada card saja | `transform + box-shadow + filter` pada card, tombol, nav link |
| **Ikon** | Tidak ada ikon | Bootstrap Icons di navbar, form, tombol, modal |
| **Dependencies** | 0 (murni HTML + CSS + Google Fonts) | Bootstrap 5.3.3 CSS + JS Bundle, Bootstrap Icons |

---

## Screenshot

> 📸 *Tambahkan screenshot di sini setelah deploy ke GitHub Pages.*

```
<!-- Contoh:
![Desktop View](./screenshots/desktop.png)
![Mobile View](./screenshots/mobile.png)
![Modal Detail](./screenshots/modal.png)
-->
```

---

## Link Live Demo

> 🔗 **Live Demo:** [https://rahelsilaban.github.io/ppw-2026-week2-12S24054/](https://rahelsilaban.github.io/ppw-2026-week2-12S24054/)

---

## Teknologi yang Digunakan

- **HTML5** — Struktur semantik (`header`, `nav`, `main`, `section`, `footer`, `article`, `aside`, `fieldset`)
- **CSS3** — Custom Properties, Flexbox, Grid, Transitions, Gradients
- **Bootstrap 5.3.3** — Grid system, Navbar, Cards, Modals, Form components, Utility classes
- **Bootstrap Icons 1.11.3** — Ikon SVG berbasis font
- **Google Fonts** — Sora (display) + Inter (body)

---

## Struktur File

```
ppw-2026-week2-12S24054/
├── index.html          # Halaman utama (refactored dengan Bootstrap)
├── style.css           # Custom CSS override (setelah Bootstrap)
├── foto-profil.jpg     # Foto profil
├── portfolio-banner.jpg # Banner portfolio (generated)
└── README.md           # Dokumentasi ini
```

---

*Praktikum PPW 2026 — Institut Teknologi Del*