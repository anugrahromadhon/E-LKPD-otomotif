/**
 * Database Module for e-LKPD Fullstack Application
 * Dual-Engine: SQLite (via better-sqlite3) with resilient JSON Fallback for Serverless (Vercel)
 */

const path = require('path');
const fs = require('fs');

let db = null;
let useJsonFallback = false;
let jsonFilePath = '';

// Check if running in Vercel or read-only environment
const isVercel = process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

try {
  if (isVercel) {
    // Vercel only allows writing to /tmp
    const tmpDataDir = '/tmp';
    jsonFilePath = path.join(tmpDataDir, 'elkpd_submissions.json');
    useJsonFallback = true;
    console.log('[DATABASE] Running in Serverless/Vercel environment. Using resilient JSON storage at:', jsonFilePath);
  } else {
    const Database = require('better-sqlite3');
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, 'elkpd.sqlite');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');

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
} catch (err) {
  console.warn('[DATABASE] SQLite unavailable or read-only filesystem. Falling back to JSON Storage:', err.message);
  useJsonFallback = true;
  jsonFilePath = isVercel ? '/tmp/elkpd_submissions.json' : path.join(__dirname, 'data', 'elkpd_submissions.json');
}

// =========================================================================
// JSON Storage Helper Functions (For Serverless / Vercel Fallback)
// =========================================================================
function readJsonSubmissions() {
  try {
    if (!fs.existsSync(jsonFilePath)) {
      return [];
    }
    const raw = fs.readFileSync(jsonFilePath, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

function writeJsonSubmissions(list) {
  try {
    const dir = path.dirname(jsonFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(jsonFilePath, JSON.stringify(list, null, 2), 'utf-8');
  } catch (e) {
    console.error('[DATABASE] Failed writing to JSON storage:', e.message);
  }
}

// =========================================================================
// Unified Database Operations (Works with SQLite or JSON fallback)
// =========================================================================
const dbOps = {
  /**
   * Save a new student submission
   */
  createSubmission(data) {
    if (!useJsonFallback && db) {
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
    } else {
      const list = readJsonSubmissions();
      const newId = list.length > 0 ? Math.max(...list.map(s => s.id || 0)) + 1 : 1;
      const record = {
        id: newId,
        nama: data.nama.trim(),
        kelas: data.kelas.trim(),
        no_absen: data.no_absen.toString().trim(),
        sekolah: (data.sekolah || '').trim(),
        timestamp: data.timestamp || new Date().toLocaleString('id-ID'),
        durasi: data.durasi || '00:00',
        durasi_detik: parseInt(data.durasi_detik, 10) || 0,
        jawaban: typeof data.jawaban === 'object' ? data.jawaban : JSON.parse(data.jawaban || '{}'),
        total_skor: parseFloat(data.total_skor) || 0,
        predikat: data.predikat || 'Mekanik Junior',
        section_scores: typeof data.section_scores === 'object' ? data.section_scores : JSON.parse(data.section_scores || '{}'),
        created_at: new Date().toISOString()
      };
      list.unshift(record);
      writeJsonSubmissions(list);
      return record;
    }
  },

  /**
   * Get all submissions with optional filter
   */
  getAllSubmissions(filters = {}) {
    if (!useJsonFallback && db) {
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
    } else {
      let list = readJsonSubmissions();

      if (filters.kelas && filters.kelas !== 'ALL') {
        list = list.filter(s => s.kelas === filters.kelas);
      }

      if (filters.search && filters.search.trim() !== '') {
        const q = filters.search.trim().toLowerCase();
        list = list.filter(s => (s.nama || '').toLowerCase().includes(q) || (s.no_absen || '').includes(q));
      }

      return list;
    }
  },

  /**
   * Get single submission by ID
   */
  getSubmissionById(id) {
    if (!useJsonFallback && db) {
      const row = db.prepare('SELECT * FROM submissions WHERE id = ?').get(id);
      if (!row) return null;
      return {
        ...row,
        jawaban: JSON.parse(row.jawaban || '{}'),
        section_scores: JSON.parse(row.section_scores || '{}')
      };
    } else {
      const list = readJsonSubmissions();
      return list.find(s => s.id === parseInt(id, 10)) || null;
    }
  },

  /**
   * Delete submission by ID
   */
  deleteSubmission(id) {
    if (!useJsonFallback && db) {
      const result = db.prepare('DELETE FROM submissions WHERE id = ?').run(id);
      return result.changes > 0;
    } else {
      const list = readJsonSubmissions();
      const filtered = list.filter(s => s.id !== parseInt(id, 10));
      if (filtered.length !== list.length) {
        writeJsonSubmissions(filtered);
        return true;
      }
      return false;
    }
  },

  /**
   * Get distinct classes
   */
  getClasses() {
    if (!useJsonFallback && db) {
      const rows = db.prepare('SELECT DISTINCT kelas FROM submissions ORDER BY kelas ASC').all();
      return rows.map(r => r.kelas);
    } else {
      const list = readJsonSubmissions();
      const unique = [...new Set(list.map(s => s.kelas))].filter(Boolean);
      unique.sort();
      return unique;
    }
  },

  /**
   * Get statistics summary
   */
  getStats() {
    const list = this.getAllSubmissions();
    const total = list.length;
    if (total === 0) {
      return {
        totalSiswa: 0,
        rataRataSkor: 0,
        skorTertinggi: 0,
        skorTerendah: 0,
        siswaLulus: 0,
        persentaseLulus: 0,
        kkm: 75
      };
    }

    const scores = list.map(s => s.total_skor || 0);
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = Math.round((sum / total) * 10) / 10;
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    const passed = list.filter(s => s.total_skor >= 75).length;
    const passPct = Math.round((passed / total) * 100);

    return {
      totalSiswa: total,
      rataRataSkor: avg,
      skorTertinggi: max,
      skorTerendah: min,
      siswaLulus: passed,
      persentaseLulus: passPct,
      kkm: 75
    };
  }
};

module.exports = dbOps;
