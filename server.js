/**
 * Express Server for e-LKPD Interaktif Barisan & Deret Aritmatika
 * Features: Student Submission API, SQLite persistence, Admin Auth, and Excel Export (.xlsx)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const XLSX = require('xlsx');
const dbOps = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_TOKEN_SECRET = 'elkpd-pmr-admin-auth-token-2026';

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Simple Admin Authentication Middleware
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Autentikasi diperlukan. Silakan login terlebih dahulu.' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (token !== ADMIN_TOKEN_SECRET) {
    return res.status(403).json({ success: false, message: 'Sesi login tidak valid atau telah kedaluwarsa.' });
  }

  next();
}

// =========================================================================
// 1. Student Submission Endpoints
// =========================================================================

/**
 * POST /api/submissions
 * Submit completed e-LKPD from student
 */
app.post('/api/submissions', (req, res) => {
  try {
    const { nama, kelas, no_absen, sekolah, durasi, durasi_detik, jawaban, total_skor, predikat, section_scores } = req.body;

    if (!nama || !kelas || !no_absen) {
      return res.status(400).json({
        success: false,
        message: 'Mohon lengkapi identitas siswa (Nama Lengkap, Kelas, dan No. Absen).'
      });
    }

    const timestamp = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      dateStyle: 'medium',
      timeStyle: 'medium'
    });

    const newSubmission = dbOps.createSubmission({
      nama,
      kelas,
      no_absen,
      sekolah: sekolah || '',
      timestamp,
      durasi: durasi || '00:00',
      durasi_detik: durasi_detik || 0,
      jawaban: jawaban || {},
      total_skor: total_skor !== undefined ? total_skor : 0,
      predikat: predikat || 'Mekanik Junior',
      section_scores: section_scores || {}
    });

    console.log(`[SUBMISSION] Siswa: ${nama} (${kelas} / No.${no_absen}) - Skor: ${total_skor}`);

    return res.status(201).json({
      success: true,
      message: 'Alhamdulillah! Jawaban e-LKPD berhasil dikirimkan ke Guru.',
      submissionId: newSubmission.id,
      timestamp
    });
  } catch (err) {
    console.error('[SUBMISSION ERROR]', err);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem saat menyimpan jawaban: ' + err.message
    });
  }
});

// =========================================================================
// 2. Teacher / Admin Authentication Endpoints
// =========================================================================

/**
 * POST /api/admin/login
 * Verify teacher PIN/Password
 */
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ success: false, message: 'Password wajib diisi.' });
  }

  if (password === ADMIN_PASSWORD) {
    return res.json({
      success: true,
      token: ADMIN_TOKEN_SECRET,
      message: 'Login berhasil! Selamat datang di Portal Guru.'
    });
  } else {
    return res.status(401).json({
      success: false,
      message: 'PIN/Password guru salah! Silakan coba lagi.'
    });
  }
});

/**
 * GET /api/admin/verify
 * Check whether token is still valid
 */
app.get('/api/admin/verify', requireAdminAuth, (req, res) => {
  res.json({ success: true, valid: true });
});

// =========================================================================
// 3. Teacher / Admin Data Endpoints
// =========================================================================

/**
 * GET /api/admin/submissions
 * Get list of student submissions with filter & stats
 */
app.get('/api/admin/submissions', requireAdminAuth, (req, res) => {
  try {
    const { kelas, search } = req.query;
    const submissions = dbOps.getAllSubmissions({ kelas, search });
    const stats = dbOps.getStats();
    const classes = dbOps.getClasses();

    res.json({
      success: true,
      data: submissions,
      stats,
      classes
    });
  } catch (err) {
    console.error('[ADMIN GET ERROR]', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data siswa: ' + err.message });
  }
});

/**
 * GET /api/admin/submissions/:id
 * Get single student submission detail
 */
app.get('/api/admin/submissions/:id', requireAdminAuth, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const submission = dbOps.getSubmissionById(id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Data submission tidak ditemukan.' });
    }
    res.json({ success: true, data: submission });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/admin/submissions/:id
 * Delete a submission (e.g. for re-take test)
 */
app.delete('/api/admin/submissions/:id', requireAdminAuth, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = dbOps.deleteSubmission(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Data submission berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/admin/export
 * Export all or filtered student submissions to Excel (.xlsx) using SheetJS
 */
app.get('/api/admin/export', requireAdminAuth, (req, res) => {
  try {
    const { kelas, search } = req.query;
    const submissions = dbOps.getAllSubmissions({ kelas, search });

    // Prepare rows for Excel table
    const excelRows = submissions.map((s, index) => {
      const scores = s.section_scores || {};
      return {
        'No': index + 1,
        'Waktu Pengumpulan': s.timestamp,
        'Nama Lengkap Siswa': s.nama,
        'Kelas / Jurusan': s.kelas,
        'No. Absen': s.no_absen,
        'Sekolah': s.sekolah || '-',
        'Durasi Pengerjaan': s.durasi,
        'Aktivitas 1 (Max 10)': scores['1'] ? scores['1'].earned : '-',
        'Aktivitas 2 (Max 15)': scores['2'] ? scores['2'].earned : '-',
        'Aktivitas 3 (Max 20)': scores['3'] ? scores['3'].earned : '-',
        'Aktivitas 4 (Max 10)': scores['4'] ? scores['4'].earned : '-',
        'Aktivitas 5 (Max 25)': scores['5'] ? scores['5'].earned : '-',
        'Aktivitas 6 (Max 20)': scores['6'] ? scores['6'].earned : '-',
        'Total Skor (0-100)': s.total_skor,
        'Predikat Kompetensi': s.predikat,
        'Status Kelulusan': s.total_skor >= 75 ? 'TUNTAS (>=75)' : 'BELUM TUNTAS (<75)'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelRows);

    // Auto calculate column widths
    const colWidths = [
      { wch: 6 },  // No
      { wch: 22 }, // Waktu
      { wch: 28 }, // Nama
      { wch: 18 }, // Kelas
      { wch: 10 }, // No Absen
      { wch: 20 }, // Sekolah
      { wch: 18 }, // Durasi
      { wch: 18 }, // Act 1
      { wch: 18 }, // Act 2
      { wch: 18 }, // Act 3
      { wch: 18 }, // Act 4
      { wch: 18 }, // Act 5
      { wch: 18 }, // Act 6
      { wch: 18 }, // Total Skor
      { wch: 22 }, // Predikat
      { wch: 20 }  // Status
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekapitulasi e-LKPD');

    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const safeDateStr = new Date().toISOString().split('T')[0];
    const filename = `Rekap_eLKPD_Barisan_Deret_${safeDateStr}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(excelBuffer);

    console.log(`[EXPORT] Berhasil mengunduh Excel rekapitulasi (${submissions.length} siswa).`);
  } catch (err) {
    console.error('[EXPORT ERROR]', err);
    res.status(500).json({ success: false, message: 'Gagal membuat file Excel: ' + err.message });
  }
});

// =========================================================================
// 4. HTML Page Routes
// =========================================================================

// Admin Portal Page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Student App Default Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fallback Route
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log('================================================================');
  console.log(`🚀 e-LKPD Fullstack Server running at http://localhost:${PORT}`);
  console.log(`📱 Modul Siswa (Multi-step): http://localhost:${PORT}`);
  console.log(`👨‍🏫 Modul Guru (/admin):     http://localhost:${PORT}/admin`);
  console.log(`🔑 Password Default Guru:   ${ADMIN_PASSWORD}`);
  console.log('================================================================');
});
