/**
 * Database Module for e-LKPD Fullstack Application
 * Powered by SQLite via better-sqlite3
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'elkpd.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency performance
db.pragma('journal_mode = WAL');

// Initialize schema
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      kelas TEXT NOT NULL,
      no_absen TEXT NOT NULL,
      sekolah TEXT DEFAULT '',
      timestamp TEXT NOT NULL,
      durasi TEXT NOT NULL,
      durasi_detik INTEGER DEFAULT 0,
      jawaban TEXT NOT NULL,
      total_skor REAL NOT NULL,
      predikat TEXT DEFAULT '',
      section_scores TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('[DATABASE] SQLite initialized at:', dbPath);
}

initDatabase();

// Database Operations
const dbOps = {
  /**
   * Save a new student submission
   */
  createSubmission(data) {
    const stmt = db.prepare(`
      INSERT INTO submissions (
        nama, kelas, no_absen, sekolah, timestamp, durasi, durasi_detik, jawaban, total_skor, predikat, section_scores
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const jawabanStr = typeof data.jawaban === 'object' ? JSON.stringify(data.jawaban) : (data.jawaban || '{}');
    const scoresStr = typeof data.section_scores === 'object' ? JSON.stringify(data.section_scores) : (data.section_scores || '{}');

    const result = stmt.run(
      data.nama.trim(),
      data.kelas.trim(),
      data.no_absen.toString().trim(),
      (data.sekolah || '').trim(),
      data.timestamp || new Date().toLocaleString('id-ID'),
      data.durasi || '00:00',
      parseInt(data.durasi_detik, 10) || 0,
      jawabanStr,
      parseFloat(data.total_skor) || 0,
      data.predikat || 'Mekanik Junior',
      scoresStr
    );

    return {
      id: result.lastInsertRowid,
      ...data
    };
  },

  /**
   * Get all submissions with optional filter
   */
  getAllSubmissions(filters = {}) {
    let query = 'SELECT * FROM submissions WHERE 1=1';
    const params = [];

    if (filters.kelas && filters.kelas !== 'ALL') {
      query += ' AND kelas = ?';
      params.push(filters.kelas);
    }

    if (filters.search && filters.search.trim() !== '') {
      query += ' AND (nama LIKE ? OR no_absen LIKE ?)';
      params.push(`%${filters.search.trim()}%`, `%${filters.search.trim()}%`);
    }

    query += ' ORDER BY id DESC';

    const rows = db.prepare(query).all(...params);
    return rows.map(row => ({
      ...row,
      jawaban: JSON.parse(row.jawaban || '{}'),
      section_scores: JSON.parse(row.section_scores || '{}')
    }));
  },

  /**
   * Get single submission by ID
   */
  getSubmissionById(id) {
    const row = db.prepare('SELECT * FROM submissions WHERE id = ?').get(id);
    if (!row) return null;
    return {
      ...row,
      jawaban: JSON.parse(row.jawaban || '{}'),
      section_scores: JSON.parse(row.section_scores || '{}')
    };
  },

  /**
   * Delete submission by ID
   */
  deleteSubmission(id) {
    const result = db.prepare('DELETE FROM submissions WHERE id = ?').run(id);
    return result.changes > 0;
  },

  /**
   * Get distinct classes
   */
  getClasses() {
    const rows = db.prepare('SELECT DISTINCT kelas FROM submissions ORDER BY kelas ASC').all();
    return rows.map(r => r.kelas);
  },

  /**
   * Get statistics summary
   */
  getStats() {
    const totalRow = db.prepare('SELECT COUNT(*) as total, AVG(total_skor) as avg_skor, MAX(total_skor) as max_skor, MIN(total_skor) as min_skor FROM submissions').get();
    const passedRow = db.prepare('SELECT COUNT(*) as passed FROM submissions WHERE total_skor >= 75').get();

    const total = totalRow.total || 0;
    const avgScore = total > 0 ? Math.round((totalRow.avg_skor || 0) * 10) / 10 : 0;
    const maxScore = total > 0 ? totalRow.max_skor : 0;
    const minScore = total > 0 ? totalRow.min_skor : 0;
    const passed = passedRow.passed || 0;
    const passPercentage = total > 0 ? Math.round((passed / total) * 100) : 0;

    return {
      totalSiswa: total,
      rataRataSkor: avgScore,
      skorTertinggi: maxScore,
      skorTerendah: minScore,
      siswaLulus: passed,
      persentaseLulus: passPercentage,
      kkm: 75
    };
  }
};

module.exports = dbOps;
