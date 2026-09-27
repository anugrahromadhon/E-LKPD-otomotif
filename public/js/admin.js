/**
 * Admin Portal JavaScript Controller (Portal Guru)
 * Handles Admin Authentication, Dashboard Statistics, Data Filtering, Detail Inspection, and Excel Export
 */

(function () {
  'use strict';

  const TOKEN_KEY = 'elkpd_admin_auth_token_v1';
  let currentSubmissions = [];

  // DOM Elements
  const loginWrapper = document.getElementById('loginWrapper');
  const adminApp = document.getElementById('adminApp');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const adminPasswordInput = document.getElementById('adminPassword');
  const loginAlert = document.getElementById('loginAlert');
  const loginAlertText = document.getElementById('loginAlertText');
  const btnLogout = document.getElementById('btnLogout');

  // Stats Elements
  const statTotalSiswa = document.getElementById('statTotalSiswa');
  const statRataRata = document.getElementById('statRataRata');
  const statTertinggi = document.getElementById('statTertinggi');
  const statKetuntasan = document.getElementById('statKetuntasan');

  // Filter & Table Elements
  const filterKelas = document.getElementById('filterKelas');
  const searchStudent = document.getElementById('searchStudent');
  const btnRefresh = document.getElementById('btnRefresh');
  const btnExportExcel = document.getElementById('btnExportExcel');
  const tableBody = document.getElementById('submissionsTableBody');
  const emptyState = document.getElementById('emptyState');

  // Detail Modal Elements
  const detailModal = document.getElementById('detailModal');
  const detailModalBody = document.getElementById('detailModalBody');
  const btnCloseDetailModal = document.getElementById('btnCloseDetailModal');

  // =========================================================================
  // 1. Authentication Engine
  // =========================================================================

  function checkAuth() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      showLoginScreen();
      return;
    }

    // Verify token with backend
    fetch('/api/admin/verify', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.valid) {
          showDashboardScreen();
          loadDashboardData();
        } else {
          localStorage.removeItem(TOKEN_KEY);
          showLoginScreen();
        }
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        showLoginScreen();
      });
  }

  function showLoginScreen() {
    loginWrapper.style.display = 'flex';
    adminApp.classList.remove('active');
  }

  function showDashboardScreen() {
    loginWrapper.style.display = 'none';
    adminApp.classList.add('active');
  }

  // Handle Login Submit
  adminLoginForm.addEventListener('submit', async e => {
    e.preventDefault();
    loginAlert.classList.remove('show');

    const password = adminPasswordInput.value.trim();
    if (!password) return;

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        adminPasswordInput.value = '';
        showDashboardScreen();
        loadDashboardData();
      } else {
        loginAlertText.textContent = data.message || 'Password salah!';
        loginAlert.classList.add('show');
      }
    } catch (err) {
      loginAlertText.textContent = 'Gagal terhubung ke server backend: ' + err.message;
      loginAlert.classList.add('show');
    }
  });

  // Handle Logout
  btnLogout.addEventListener('click', () => {
    if (confirm('Apakah Bapak/Ibu Guru ingin keluar dari sesi Dashboard?')) {
      localStorage.removeItem(TOKEN_KEY);
      showLoginScreen();
    }
  });

  // =========================================================================
  // 2. Data Loading & Dashboard View
  // =========================================================================

  async function loadDashboardData() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    const kelasVal = filterKelas.value;
    const searchVal = searchStudent.value.trim();

    let url = `/api/admin/submissions?kelas=${encodeURIComponent(kelasVal)}&search=${encodeURIComponent(searchVal)}`;

    try {
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem(TOKEN_KEY);
        showLoginScreen();
        return;
      }

      const data = await res.json();
      if (data.success) {
        currentSubmissions = data.data || [];
        updateStats(data.stats);
        updateClassDropdown(data.classes);
        renderTable(currentSubmissions);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  }

  function updateStats(stats) {
    if (!stats) return;
    statTotalSiswa.textContent = stats.totalSiswa || 0;
    statRataRata.textContent = stats.rataRataSkor || 0;
    statTertinggi.textContent = stats.skorTertinggi || 0;
    statKetuntasan.textContent = `${stats.persentaseLulus || 0}% (${stats.siswaLulus || 0} Siswa)`;
  }

  function updateClassDropdown(classes) {
    if (!classes || !Array.isArray(classes)) return;
    const currentVal = filterKelas.value;
    
    // Clear and rebuild options
    filterKelas.innerHTML = '<option value="ALL">Semua Kelas</option>';
    classes.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      filterKelas.appendChild(opt);
    });

    if (classes.includes(currentVal)) {
      filterKelas.value = currentVal;
    }
  }

  function renderTable(submissions) {
    tableBody.innerHTML = '';

    if (!submissions || submissions.length === 0) {
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    submissions.forEach((item, index) => {
      const tr = document.createElement('tr');

      const isPass = item.total_skor >= 75;
      const statusBadge = isPass 
        ? '<span class="badge-kkm pass"><i class="fas fa-check"></i> TUNTAS</span>' 
        : '<span class="badge-kkm fail"><i class="fas fa-times"></i> BELUM TUNTAS</span>';

      tr.innerHTML = `
        <td style="font-weight: 700; color: #64748b;">${index + 1}</td>
        <td style="font-size: 0.85rem; color: #475569;">${item.timestamp}</td>
        <td><strong>${escapeHtml(item.nama)}</strong></td>
        <td><span style="font-weight: 600; color: #1e3a8a;">${escapeHtml(item.kelas)}</span></td>
        <td style="text-align: center; font-family: monospace; font-weight: 700;">${item.no_absen}</td>
        <td style="font-size: 0.85rem; color: #0284c7;"><i class="fas fa-clock"></i> ${item.durasi}</td>
        <td><span class="score-cell" style="color: ${isPass ? '#10b981' : '#ef4444'};">${item.total_skor}</span> /100</td>
        <td><span class="badge-predikat">${escapeHtml(item.predikat || 'Mekanik Junior')}</span></td>
        <td>${statusBadge}</td>
        <td style="text-align: center;">
          <button type="button" class="btn-action detail" data-id="${item.id}" title="Lihat Jawaban">
            <i class="fas fa-eye"></i> Detail
          </button>
          <button type="button" class="btn-action delete" data-id="${item.id}" title="Hapus Data">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    // Attach row action listeners
    tableBody.querySelectorAll('.btn-action.detail').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openDetailModal(id);
      });
    });

    tableBody.querySelectorAll('.btn-action.delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deleteSubmission(id);
      });
    });
  }

  // =========================================================================
  // 3. Detail Modal & Delete Actions
  // =========================================================================

  async function openDetailModal(id) {
    const token = localStorage.getItem(TOKEN_KEY);
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        const s = data.data;
        const answers = s.jawaban || {};
        const scores = s.section_scores || {};

        let sectionScoresHtml = '';
        for (let i = 1; i <= 6; i++) {
          const sc = scores[i.toString()] || { earned: 0, totalPossible: 0, scorePct: 0 };
          sectionScoresHtml += `
            <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 0.75rem; border-radius: 6px;">
              <div style="font-size: 0.75rem; color: #64748b; font-weight: 700;">Aktivitas ${i}</div>
              <div style="font-size: 1.1rem; font-weight: 800; color: #1e3a8a;">${sc.earned} / ${sc.totalPossible} Poin</div>
              <div style="font-size: 0.75rem; color: ${sc.scorePct >= 80 ? '#10b981' : '#f59e0b'}; font-weight: 700;">${sc.scorePct}%</div>
            </div>
          `;
        }

        detailModalBody.innerHTML = `
          <div class="student-detail-summary">
            <div><strong>Nama Siswa:</strong> <br>${escapeHtml(s.nama)}</div>
            <div><strong>Kelas / No. Absen:</strong> <br>${escapeHtml(s.kelas)} / Absen ${s.no_absen}</div>
            <div><strong>Waktu Selesai:</strong> <br>${s.timestamp}</div>
            <div><strong>Durasi Pengerjaan:</strong> <br><i class="fas fa-clock" style="color: #0284c7;"></i> ${s.durasi}</div>
            <div><strong>Total Nilai:</strong> <br><span style="font-size: 1.4rem; font-weight: 800; color: ${s.total_skor >= 75 ? '#10b981' : '#ef4444'};">${s.total_skor}</span> / 100</div>
            <div><strong>Gelar Predikat:</strong> <br><span class="badge-predikat">${escapeHtml(s.predikat)}</span></div>
          </div>

          <h4 style="margin: 1.25rem 0 0.5rem 0; font-size: 0.95rem; color: #1e3a8a;">
            <i class="fas fa-chart-pie"></i> Rincian Skor Tiap Aktivitas:
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem;">
            ${sectionScoresHtml}
          </div>

          <h4 style="margin: 1.25rem 0 0.5rem 0; font-size: 0.95rem; color: #1e3a8a;">
            <i class="fas fa-pencil-alt"></i> Sampel Jawaban Penting Siswa:
          </h4>

          <div class="answer-item-card">
            <h4><span>Aktivitas 1: Service Record Toyota</span> <span>${scores['1'] ? scores['1'].earned : 0}/10 Poin</span></h4>
            <p><strong>KM Masuk:</strong> ${escapeHtml(answers.act1_masuk_km || '-')} | <strong>KM Kembali:</strong> ${escapeHtml(answers.act1_kembali_km || '-')}</p>
            <p><strong>Tgl Masuk:</strong> ${escapeHtml(answers.act1_masuk_tgl || '-')} | <strong>Tgl Kembali:</strong> ${escapeHtml(answers.act1_kembali_tgl || '-')}</p>
          </div>

          <div class="answer-item-card">
            <h4><span>Aktivitas 2 & 3: Pola Beda & Rumus Suku ke-n</span> <span>${(scores['2'] ? scores['2'].earned : 0) + (scores['3'] ? scores['3'].earned : 0)}/35 Poin</span></h4>
            <p><strong>Selisih KM (b):</strong> ${escapeHtml(answers.act2_diff_km || '-')}</p>
            <p><strong>Hasil Perhitungan Servis ke-20 (U20):</strong> ${escapeHtml(answers.act3_servis20_formula || answers.act3_servis20_manual || '-')}</p>
          </div>

          <div class="answer-item-card">
            <h4><span>Aktivitas 4 & 5: Deret Aritmatika & Sn</span> <span>${(scores['4'] ? scores['4'].earned : 0) + (scores['5'] ? scores['5'].earned : 0)}/35 Poin</span></h4>
            <p><strong>Jumlah KM Servis 1 s.d. 5 (S5):</strong> ${escapeHtml(answers.act4_sum_5 || '-')}</p>
            <p><strong>Jumlah KM Sampai Servis ke-10 (S10):</strong> ${escapeHtml(answers.act5_s10 || '-')}</p>
          </div>

          <div class="answer-item-card">
            <h4><span>Aktivitas 6: Masalah Kontekstual & Refleksi</span> <span>${scores['6'] ? scores['6'].earned : 0}/20 Poin</span></h4>
            <p><strong>Servis ke-15 (U15):</strong> ${escapeHtml(answers.act6_u15 || '-')} | <strong>Total KM (S15):</strong> ${escapeHtml(answers.act6_s15 || '-')}</p>
            <div style="margin-top: 0.5rem; background: #f8fafc; padding: 0.75rem; border-radius: 4px; border: 1px dashed #cbd5e1;">
              <strong>Catatan Refleksi Mandiri Siswa:</strong>
              <p style="font-style: italic; color: #334155; margin-top: 0.25rem;">
                "${escapeHtml(answers.act6_reflection || 'Tidak ada catatan refleksi yang dituliskan.')}"
              </p>
            </div>
          </div>
        `;

        detailModal.classList.add('show');
      }
    } catch (err) {
      alert('Gagal mengambil detail siswa: ' + err.message);
    }
  }

  async function deleteSubmission(id) {
    if (!confirm('Apakah Bapak/Ibu Guru yakin ingin menghapus data pekerjaan siswa ini? Aksi ini tidak dapat dibatalkan.')) {
      return;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        loadDashboardData();
      } else {
        alert(data.message || 'Gagal menghapus data.');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat menghapus: ' + err.message);
    }
  }

  // Close modal
  btnCloseDetailModal.addEventListener('click', () => {
    detailModal.classList.remove('show');
  });

  detailModal.addEventListener('click', e => {
    if (e.target === detailModal) detailModal.classList.remove('show');
  });

  // =========================================================================
  // 4. Excel Export (.xlsx) Handler
  // =========================================================================

  btnExportExcel.addEventListener('click', async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    const kelasVal = filterKelas.value;
    const searchVal = searchStudent.value.trim();

    const exportUrl = `/api/admin/export?kelas=${encodeURIComponent(kelasVal)}&search=${encodeURIComponent(searchVal)}`;

    try {
      btnExportExcel.disabled = true;
      btnExportExcel.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyiapkan Excel...';

      const response = await fetch(exportUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Gagal mengunduh file Excel');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const today = new Date().toISOString().split('T')[0];
      a.download = `Rekap_eLKPD_Barisan_Deret_${kelasVal !== 'ALL' ? kelasVal + '_' : ''}${today}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert('Gagal mengekspor data: ' + err.message);
    } finally {
      btnExportExcel.disabled = false;
      btnExportExcel.innerHTML = '<i class="fas fa-file-excel"></i> Export to Excel (.xlsx)';
    }
  });

  // =========================================================================
  // 5. Filter & Search Events
  // =========================================================================

  filterKelas.addEventListener('change', () => {
    loadDashboardData();
  });

  let searchTimeout = null;
  searchStudent.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      loadDashboardData();
    }, 300);
  });

  btnRefresh.addEventListener('click', () => {
    loadDashboardData();
  });

  // Helper: Escape HTML string
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initialize
  checkAuth();

})();
