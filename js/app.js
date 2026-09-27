/**
 * e-LKPD Barisan dan Deret Aritmatika Berbasis PMR (Konteks Pergantian Oli)
 * Interactive Controller: Form Inputs, Drag-and-Drop Matching, Auto-Grading & Persistence
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. Data Store & Configuration
  // =========================================================================
  const STORAGE_KEY = 'elkpd_aritmatika_pmr_data_v1';

  // Scoring rubric & answer keys
  const ANSWER_KEY = {
    // Section 1: Aktivitas 1 - Membaca Service Record (10 pts)
    act1_masuk_km: { value: 56125, type: 'number', weight: 2 },
    act1_masuk_tgl: { value: '04-12-2021', type: 'text-match', weight: 1 },
    act1_kembali_km: { value: 66125, type: 'number', weight: 2 },
    act1_kembali_tgl: { value: 'juni', type: 'contains', weight: 1 },
    act1_filter_oli: { value: true, type: 'checkbox', weight: 2 },
    act1_check_complete: { value: 'ya', type: 'radio', weight: 2 },

    // Section 2: Aktivitas 2 - Pola Perubahan KM / Beda (15 pts)
    act2_diff_km: { value: 10000, type: 'number', weight: 3 },
    act2_can_predict: { value: 'ya', type: 'radio', weight: 2 },
    act2_predict_km1: { value: 76125, type: 'number', weight: 2 },
    act2_tbl_prev: { value: 56125, type: 'number', weight: 1 },
    act2_tbl_curr: { value: 66125, type: 'number', weight: 1 },
    act2_tbl_next1: { value: 76125, type: 'number', weight: 1 },
    act2_tbl_next2: { value: 86125, type: 'number', weight: 1 },
    act2_predict_km2: { value: [86125, 96125], type: 'any-number', weight: 2 },
    act2_consider_both: { value: 'ya', type: 'radio', weight: 2 },

    // Section 3: Aktivitas 3 - Menemukan Rumus Un (20 pts)
    act3_servis20_manual: { value: 246125, type: 'number', weight: 3 },
    act3_practical_method: { value: 'ada', type: 'radio', weight: 1 },
    act3_f_a: { value: 'a', type: 'text-exact', weight: 1 },
    act3_f_n: { value: 'n', type: 'text-exact', weight: 1 },
    act3_f_1: { value: '1', type: 'text-exact', weight: 1 },
    act3_f_b: { value: 'b', type: 'text-exact', weight: 1 },
    // Drag and Drop 1: 4 matches @ 2 pts = 8 pts
    dnd1_un: { value: 'Suku Ke-n', type: 'dnd', weight: 2 },
    dnd1_a: { value: 'Suku Pertama', type: 'dnd', weight: 2 },
    dnd1_b: { value: 'Beda', type: 'dnd', weight: 2 },
    dnd1_n: { value: 'Banyak Suku', type: 'dnd', weight: 2 },
    act3_servis20_formula: { value: 246125, type: 'number', weight: 2 },
    act3_compare_result: { value: 'sama', type: 'radio', weight: 1 },

    // Section 4: Aktivitas 4 - Menghitung Jumlah KM (10 pts)
    act4_sum_5: { value: 380625, type: 'number', weight: 6 },
    act4_easy_for_many: { value: 'tidak', type: 'radio', weight: 4 },

    // Section 5: Aktivitas 5 - Deret Aritmatika & Rumus Sn (25 pts)
    act5_s2: { value: 122250, type: 'number', weight: 2 },
    act5_s3: { value: 198375, type: 'number', weight: 2 },
    act5_s4: { value: 284500, type: 'number', weight: 2 },
    act5_s5: { value: 380625, type: 'number', weight: 2 },
    act5_s2_count: { value: 2, type: 'number', weight: 1 },
    act5_s3_count: { value: 3, type: 'number', weight: 1 },
    act5_gauss_pairs: { value: ['n', 'n pasangan', 'sebanyak n'], type: 'text-options', weight: 2 },
    act5_f_sn_un: { value: ['un', 'u_n'], type: 'text-options', weight: 1 },
    act5_f_2a: { value: '2a', type: 'text-exact', weight: 1 },
    // Drag and Drop 2: 5 matches @ 1 pt = 5 pts
    dnd2_sn: { value: 'Jumlah n Suku', type: 'dnd', weight: 1 },
    dnd2_un: { value: 'Suku Ke-n', type: 'dnd', weight: 1 },
    dnd2_a: { value: 'Suku Pertama', type: 'dnd', weight: 1 },
    dnd2_b: { value: 'Beda', type: 'dnd', weight: 1 },
    dnd2_n: { value: 'Banyak Suku', type: 'dnd', weight: 1 },
    // Soal Servis ke-10 (6 pts)
    act5_a: { value: 56125, type: 'number', weight: 1 },
    act5_b: { value: 10000, type: 'number', weight: 1 },
    act5_n: { value: 10, type: 'number', weight: 1 },
    act5_s10: { value: 1011250, type: 'number', weight: 3 },

    // Section 6: Aktivitas 6 - Kasus Baru & Refleksi (20 pts)
    act6_a: { value: 30000, type: 'number', weight: 2 },
    act6_b: { value: 10000, type: 'number', weight: 2 },
    act6_n: { value: 15, type: 'number', weight: 2 },
    act6_u15: { value: 170000, type: 'number', weight: 5 },
    act6_s15: { value: 1500000, type: 'number', weight: 5 },
    act6_reflection: { value: 15, type: 'min-words', weight: 4 } // min 5 words completed
  };

  // State
  const state = {
    student: {
      name: '',
      class: '',
      absent: '',
      school: ''
    },
    answers: {},
    dnd: {
      dnd1: {}, // slotId: chipValue
      dnd2: {}
    },
    odometerKM: 56125,
    lastScore: null,
    sectionScores: {}
  };

  // Helper: Normalize Indonesian numbers (e.g., "56.125" -> 56125, "1.011.250" -> 1011250)
  function parseIndoNumber(str) {
    if (typeof str === 'number') return str;
    if (!str || typeof str !== 'string') return NaN;
    // Remove "KM", spaces, dots, commas
    const cleaned = str.toLowerCase()
      .replace(/km/g, '')
      .replace(/\s+/g, '')
      .replace(/\./g, '')
      .replace(/,/g, '');
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? NaN : num;
  }

  // Format number to Indonesian standard with dots
  function formatIndoNumber(num) {
    if (isNaN(num)) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  // =========================================================================
  // 2. Interactive Odometer Simulator
  // =========================================================================
  function initOdometer() {
    const odoDisplay = document.getElementById('odoDisplayKM');
    const odoServiceNo = document.getElementById('odoServiceNo');
    const btnNext = document.getElementById('btnOdoNext');
    const btnPrev = document.getElementById('btnOdoPrev');
    const btnReset = document.getElementById('btnOdoReset');

    function updateOdometerUI() {
      if (odoDisplay) {
        odoDisplay.textContent = formatIndoNumber(state.odometerKM);
      }
      if (odoServiceNo) {
        // base 56.125 is service 1
        const diff = state.odometerKM - 56125;
        const sNo = 1 + Math.round(diff / 10000);
        odoServiceNo.textContent = sNo > 0 ? `Servis ke-${sNo}` : 'Sebelum Servis 1';
      }
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        state.odometerKM += 10000;
        updateOdometerUI();
        saveState();
      });
    }

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (state.odometerKM >= 10000) {
          state.odometerKM -= 10000;
          updateOdometerUI();
          saveState();
        }
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        state.odometerKM = 56125;
        updateOdometerUI();
        saveState();
      });
    }

    updateOdometerUI();
  }

  // =========================================================================
  // 3. Drag-and-Drop Matching Engine (HTML5 + Click/Touch Fallback)
  // =========================================================================
  let selectedChipForTouch = null;

  function initDragAndDrop() {
    document.querySelectorAll('.dnd-container').forEach(container => {
      const dndId = container.dataset.dndId; // 'dnd1' or 'dnd2'
      const bank = container.querySelector('.draggable-bank');
      const resetBtn = container.querySelector('.dnd-reset-btn');

      // Setup Draggable Chips
      container.querySelectorAll('.drag-item').forEach(chip => {
        chip.setAttribute('draggable', 'true');

        // Drag start
        chip.addEventListener('dragstart', e => {
          e.dataTransfer.setData('text/plain', chip.dataset.value);
          e.dataTransfer.setData('source-dnd', dndId);
          chip.classList.add('dragging');
        });

        chip.addEventListener('dragend', () => {
          chip.classList.remove('dragging');
        });

        // Touch & Click-to-place fallback
        chip.addEventListener('click', e => {
          e.stopPropagation();
          if (chip.parentElement.classList.contains('drop-zone')) {
            // If already in a drop zone, clicking removes it back to bank
            removeChipFromZone(chip, bank, dndId);
            return;
          }

          // In bank: toggle select
          if (selectedChipForTouch === chip) {
            chip.classList.remove('selected-for-touch');
            selectedChipForTouch = null;
          } else {
            document.querySelectorAll('.drag-item.selected-for-touch').forEach(c => c.classList.remove('selected-for-touch'));
            chip.classList.add('selected-for-touch');
            selectedChipForTouch = chip;
          }
        });
      });

      // Setup Drop Zones
      container.querySelectorAll('.drop-zone').forEach(zone => {
        const slotKey = zone.dataset.slotKey;

        zone.addEventListener('dragover', e => {
          e.preventDefault();
          zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', () => {
          zone.classList.remove('drag-over');
        });

        zone.addEventListener('drop', e => {
          e.preventDefault();
          zone.classList.remove('drag-over');
          const chipValue = e.dataTransfer.getData('text/plain');
          const sourceDnd = e.dataTransfer.getData('source-dnd');
          if (sourceDnd !== dndId) return;

          // Find the chip with this value
          const chip = container.querySelector(`.drag-item[data-value="${chipValue}"]`);
          if (chip) {
            placeChipIntoZone(chip, zone, bank, dndId, slotKey);
          }
        });

        // Click zone to place if touch selected
        zone.addEventListener('click', () => {
          if (selectedChipForTouch && selectedChipForTouch.closest('.dnd-container') === container) {
            placeChipIntoZone(selectedChipForTouch, zone, bank, dndId, slotKey);
            selectedChipForTouch.classList.remove('selected-for-touch');
            selectedChipForTouch = null;
          }
        });
      });

      // Reset Button
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          resetDndSet(container, dndId);
        });
      }
    });
  }

  function placeChipIntoZone(chip, targetZone, bank, dndId, slotKey) {
    // If target zone already has a chip, return existing chip to bank
    const existingChip = targetZone.querySelector('.drag-item');
    if (existingChip && existingChip !== chip) {
      removeChipFromZone(existingChip, bank, dndId);
    }

    // If this chip was previously in another drop-zone of this dnd, clear that zone's state
    const previousZone = chip.closest('.drop-zone');
    if (previousZone && previousZone !== targetZone) {
      const prevKey = previousZone.dataset.slotKey;
      delete state.dnd[dndId][prevKey];
      previousZone.classList.remove('has-item');
      const placeholder = previousZone.querySelector('.slot-placeholder');
      if (placeholder) placeholder.style.display = 'block';
    }

    // Hide placeholder in target zone
    const placeholder = targetZone.querySelector('.slot-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    // Append chip to zone
    targetZone.appendChild(chip);
    targetZone.classList.add('has-item');

    // Add remove button if not exists
    if (!chip.querySelector('.remove-dropped-btn')) {
      const rmBtn = document.createElement('button');
      rmBtn.type = 'button';
      rmBtn.className = 'remove-dropped-btn';
      rmBtn.innerHTML = '&times;';
      rmBtn.title = 'Kembalikan';
      rmBtn.addEventListener('click', e => {
        e.stopPropagation();
        removeChipFromZone(chip, bank, dndId);
      });
      chip.appendChild(rmBtn);
    }

    // Save to state
    state.dnd[dndId][slotKey] = chip.dataset.value;
    updateBankEmptyHint(bank);
    saveState();
  }

  function removeChipFromZone(chip, bank, dndId) {
    const zone = chip.closest('.drop-zone');
    if (zone) {
      const slotKey = zone.dataset.slotKey;
      delete state.dnd[dndId][slotKey];
      zone.classList.remove('has-item');
      zone.classList.remove('correct', 'incorrect');
      const placeholder = zone.querySelector('.slot-placeholder');
      if (placeholder) placeholder.style.display = 'block';
    }

    const rmBtn = chip.querySelector('.remove-dropped-btn');
    if (rmBtn) rmBtn.remove();

    chip.classList.remove('selected-for-touch');
    bank.appendChild(chip);
    updateBankEmptyHint(bank);
    saveState();
  }

  function resetDndSet(container, dndId) {
    const bank = container.querySelector('.draggable-bank');
    container.querySelectorAll('.drop-zone .drag-item').forEach(chip => {
      removeChipFromZone(chip, bank, dndId);
    });
    container.querySelectorAll('.drop-zone').forEach(zone => {
      zone.classList.remove('has-item', 'correct', 'incorrect');
      const placeholder = zone.querySelector('.slot-placeholder');
      if (placeholder) placeholder.style.display = 'block';
    });
    state.dnd[dndId] = {};
    updateBankEmptyHint(bank);
    saveState();
  }

  function updateBankEmptyHint(bank) {
    if (!bank) return;
    const chipsInBank = bank.querySelectorAll('.drag-item').length;
    let hint = bank.querySelector('.bank-empty-hint');
    if (chipsInBank === 0) {
      if (!hint) {
        hint = document.createElement('span');
        hint.className = 'bank-empty-hint';
        hint.textContent = 'Semua pilihan sudah dipasangkan. Klik item pada slot untuk mengembalikan.';
        bank.appendChild(hint);
      }
      hint.style.display = 'block';
    } else if (hint) {
      hint.style.display = 'none';
    }
  }

  // =========================================================================
  // 4. Auto-Grading Engine & Evaluator
  // =========================================================================
  function evaluateItem(key, config) {
    let studentVal;
    let isCorrect = false;

    // Check if DnD item
    if (config.type === 'dnd') {
      const dndGroup = key.startsWith('dnd1_') ? 'dnd1' : 'dnd2';
      studentVal = state.dnd[dndGroup]?.[key];
      isCorrect = studentVal === config.value;
      return { isCorrect, studentVal, key, weight: config.weight, correctVal: config.value };
    }

    // Normal form inputs
    const el = document.querySelector(`[name="${key}"], #${key}`);
    if (!el) {
      return { isCorrect: false, studentVal: null, key, weight: config.weight, correctVal: config.value };
    }

    if (config.type === 'checkbox') {
      studentVal = el.checked;
      isCorrect = studentVal === config.value;
    } else if (config.type === 'radio') {
      const checkedRadio = document.querySelector(`input[name="${key}"]:checked`);
      studentVal = checkedRadio ? checkedRadio.value : '';
      isCorrect = studentVal.toLowerCase() === config.value.toLowerCase();
    } else if (config.type === 'number') {
      const raw = el.value.trim();
      studentVal = parseIndoNumber(raw);
      isCorrect = !isNaN(studentVal) && studentVal === config.value;
    } else if (config.type === 'any-number') {
      const raw = el.value.trim();
      studentVal = parseIndoNumber(raw);
      isCorrect = !isNaN(studentVal) && Array.isArray(config.value) && config.value.includes(studentVal);
    } else if (config.type === 'text-exact') {
      studentVal = el.value.trim().toLowerCase();
      isCorrect = studentVal === config.value.toLowerCase();
    } else if (config.type === 'text-match') {
      studentVal = el.value.trim().toLowerCase();
      isCorrect = studentVal.includes(config.value.toLowerCase());
    } else if (config.type === 'contains') {
      studentVal = el.value.trim().toLowerCase();
      isCorrect = studentVal.includes(config.value.toLowerCase());
    } else if (config.type === 'text-options') {
      studentVal = el.value.trim().toLowerCase().replace(/\s+/g, ' ');
      isCorrect = config.value.some(opt => studentVal.includes(opt));
    } else if (config.type === 'min-words') {
      studentVal = el.value.trim();
      const words = studentVal ? studentVal.split(/\s+/).length : 0;
      isCorrect = words >= 5; // student provided meaningful explanation
    }

    return {
      isCorrect,
      studentVal,
      key,
      weight: config.weight,
      correctVal: Array.isArray(config.value) ? config.value.join(' atau ') : config.value,
      element: el
    };
  }

  // Grade an entire section
  function gradeSection(sectionNumber) {
    const prefix = `act${sectionNumber}`;
    let totalPossible = 0;
    let earned = 0;
    let allKeys = [];

    // Collect keys for this section
    for (const key in ANSWER_KEY) {
      if (key.startsWith(prefix) || (sectionNumber === 3 && key.startsWith('dnd1')) || (sectionNumber === 5 && key.startsWith('dnd2'))) {
        allKeys.push(key);
      }
    }

    allKeys.forEach(k => {
      const res = evaluateItem(k, ANSWER_KEY[k]);
      totalPossible += res.weight;
      if (res.isCorrect) earned += res.weight;

      // Apply UI state indicators
      applyItemFeedback(res);
    });

    const scorePct = totalPossible > 0 ? Math.round((earned / totalPossible) * 100) : 0;
    state.sectionScores[sectionNumber] = { earned, totalPossible, scorePct };

    // Update section score pill
    const pill = document.getElementById(`scorePillAct${sectionNumber}`);
    if (pill) {
      pill.textContent = `${earned}/${totalPossible} Poin`;
      pill.style.background = scorePct >= 80 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)';
      pill.style.color = scorePct >= 80 ? '#34d399' : '#f87171';
    }

    // Show section feedback banner
    const feedbackBox = document.getElementById(`feedbackBoxAct${sectionNumber}`);
    if (feedbackBox) {
      feedbackBox.className = 'section-feedback-box show ' + (scorePct >= 80 ? 'success' : 'warning');
      feedbackBox.innerHTML = scorePct >= 80
        ? `<i class="fas fa-check-circle"></i> <span><strong>Bagus Sekali!</strong> Aktivitas ${sectionNumber} selesai dengan nilai ${scorePct}% (${earned}/${totalPossible} Poin).</span>`
        : `<i class="fas fa-exclamation-circle"></i> <span><strong>Perlu Dicek Kembali:</strong> Aktivitas ${sectionNumber} memperoleh ${earned}/${totalPossible} Poin. Periksa kembali jawaban bertanda merah!</span>`;
    }

    // Reveal explanation panel if requested
    const explPanel = document.getElementById(`explPanelAct${sectionNumber}`);
    if (explPanel) {
      explPanel.classList.add('show');
    }

    saveState();
    updateHeaderScore();
    return { earned, totalPossible, scorePct };
  }

  function applyItemFeedback(res) {
    if (res.element) {
      if (res.element.type === 'radio') {
        const parentLabel = res.element.closest('.choice-label');
        if (parentLabel) {
          parentLabel.classList.toggle('correct', res.isCorrect);
          parentLabel.classList.toggle('incorrect', !res.isCorrect);
        }
      } else {
        res.element.classList.toggle('correct', res.isCorrect);
        res.element.classList.toggle('incorrect', !res.isCorrect);
      }
    }

    // If DnD
    if (res.key.startsWith('dnd1_') || res.key.startsWith('dnd2_')) {
      const zone = document.querySelector(`.drop-zone[data-slot-key="${res.key}"]`);
      if (zone) {
        zone.classList.toggle('correct', res.isCorrect);
        zone.classList.toggle('incorrect', !res.isCorrect);
      }
    }
  }

  // Master Grading (All Sections)
  function gradeAll() {
    let grandEarned = 0;
    let grandTotal = 0;

    for (let i = 1; i <= 6; i++) {
      const res = gradeSection(i);
      grandEarned += res.earned;
      grandTotal += res.totalPossible;
    }

    const totalScore = Math.round((grandEarned / grandTotal) * 100);
    state.lastScore = totalScore;
    saveState();
    updateHeaderScore();

    showReportModal(totalScore, grandEarned, grandTotal);
  }

  function updateHeaderScore() {
    let earned = 0;
    let total = 0;
    for (const key in ANSWER_KEY) {
      const res = evaluateItem(key, ANSWER_KEY[key]);
      total += res.weight;
      if (res.isCorrect) earned += res.weight;
    }
    const currentScore = total > 0 ? Math.round((earned / total) * 100) : 0;
    const headerDisplay = document.getElementById('headerTotalScore');
    if (headerDisplay) {
      headerDisplay.textContent = currentScore;
      // Color-code by score tier
      headerDisplay.style.color = currentScore >= 80 ? '#34d399' : currentScore >= 60 ? '#fbbf24' : '#f87171';
    }
    // Animate progress bar
    const progressBar = document.getElementById('headerProgressBar');
    if (progressBar) {
      progressBar.style.width = `${currentScore}%`;
      progressBar.style.background = currentScore >= 80
        ? 'linear-gradient(90deg, #10b981, #34d399)'
        : currentScore >= 60
          ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
          : 'linear-gradient(90deg, #ef4444, #f87171)';
    }
  }

  // =========================================================================
  // 5. Report Modal & Certificate
  // =========================================================================
  function showReportModal(score, earned, total) {
    const modal = document.getElementById('gradingModal');
    if (!modal) return;

    // Set badge & title based on score
    let badgeTitle = 'Mekanik Magang';
    let badgeIcon = 'fa-tools';
    let badgeColor = '#94a3b8';

    if (score >= 90) {
      badgeTitle = 'Mekanik Ahli Matematika (Master Technician)';
      badgeIcon = 'fa-award';
      badgeColor = '#f59e0b';
    } else if (score >= 75) {
      badgeTitle = 'Mekanik Terampil (Senior Technician)';
      badgeIcon = 'fa-medal';
      badgeColor = '#3b82f6';
    } else if (score >= 60) {
      badgeTitle = 'Mekanik Pratama (Junior Technician)';
      badgeIcon = 'fa-wrench';
      badgeColor = '#10b981';
    }

    document.getElementById('reportScoreNumber').textContent = score;
    document.getElementById('reportBadgeTitle').textContent = badgeTitle;
    const badgeIconEl = document.getElementById('reportBadgeIcon');
    if (badgeIconEl) {
      badgeIconEl.className = `fas ${badgeIcon} report-badge-icon`;
      badgeIconEl.style.color = badgeColor;
    }

    // Set conic gradient score ring
    const ring = document.getElementById('reportScoreRing');
    if (ring) {
      ring.style.setProperty('--score-pct', `${score}%`);
    }

    // Student meta
    document.getElementById('modalStudentName').textContent = state.student.name || '(Belum diisi)';
    document.getElementById('modalStudentClass').textContent = state.student.class || '(Belum diisi)';
    document.getElementById('modalStudentAbsent').textContent = state.student.absent || '-';
    document.getElementById('modalTimestamp').textContent = new Date().toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    // Breakdown list
    const breakdownList = document.getElementById('modalBreakdownList');
    if (breakdownList) {
      breakdownList.innerHTML = '';
      const titles = [
        'Aktivitas 1: Membaca Service Record',
        'Aktivitas 2: Menemukan Pola Perubahan KM (Beda)',
        'Aktivitas 3: Menemukan Rumus Suku ke-n (Un)',
        'Aktivitas 4: Menghitung Jumlah KM Berkala',
        'Aktivitas 5: Menemukan Rumus Deret (Sn)',
        'Aktivitas 6: Masalah Baru & Refleksi'
      ];

      for (let i = 1; i <= 6; i++) {
        const sc = state.sectionScores[i] || { earned: 0, totalPossible: 0, scorePct: 0 };
        const li = document.createElement('li');
        li.className = 'breakdown-row';
        li.innerHTML = `
          <span>${titles[i - 1]}</span>
          <span class="breakdown-score" style="color: ${sc.scorePct >= 80 ? 'var(--success)' : 'var(--error)'}">
            ${sc.earned}/${sc.totalPossible} (${sc.scorePct}%)
          </span>
        `;
        breakdownList.appendChild(li);
      }
    }

    modal.classList.add('show');
  }

  function hideReportModal() {
    const modal = document.getElementById('gradingModal');
    if (modal) modal.classList.remove('show');
  }

  // =========================================================================
  // 6. Navigation Stepper & Smooth Scrolling
  // =========================================================================
  function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-step-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          navButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Observe active section on scroll
    const sections = document.querySelectorAll('.lkpd-card, .cover-hero');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.target === id);
          });
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });

    sections.forEach(s => observer.observe(s));
  }

  // =========================================================================
  // 7. Event Handlers & Persistence (LocalStorage)
  // =========================================================================
  function saveState() {
    // Read student info
    state.student.name = document.getElementById('studentName')?.value || '';
    state.student.class = document.getElementById('studentClass')?.value || '';
    state.student.absent = document.getElementById('studentAbsent')?.value || '';
    state.student.school = document.getElementById('studentSchool')?.value || '';

    // Read form inputs
    const inputs = document.querySelectorAll('input:not([type="button"]):not([type="submit"]), textarea, select');
    inputs.forEach(input => {
      const name = input.name || input.id;
      if (!name) return;
      if (input.type === 'checkbox') {
        state.answers[name] = input.checked;
      } else if (input.type === 'radio') {
        if (input.checked) state.answers[name] = input.value;
      } else {
        state.answers[name] = input.value;
      }
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const data = JSON.parse(saved);

      // Restore student
      if (data.student) {
        state.student = data.student;
        if (document.getElementById('studentName')) document.getElementById('studentName').value = data.student.name || '';
        if (document.getElementById('studentClass')) document.getElementById('studentClass').value = data.student.class || '';
        if (document.getElementById('studentAbsent')) document.getElementById('studentAbsent').value = data.student.absent || '';
        if (document.getElementById('studentSchool')) document.getElementById('studentSchool').value = data.student.school || '';
      }

      // Restore odometer
      if (data.odometerKM) {
        state.odometerKM = data.odometerKM;
      }

      // Restore answers
      if (data.answers) {
        state.answers = data.answers;
        for (const name in data.answers) {
          const val = data.answers[name];
          const el = document.querySelector(`[name="${name}"], #${name}`);
          if (el) {
            if (el.type === 'checkbox') {
              el.checked = !!val;
            } else if (el.type === 'radio') {
              const radio = document.querySelector(`input[name="${name}"][value="${val}"]`);
              if (radio) {
                radio.checked = true;
                const parentLabel = radio.closest('.choice-label');
                if (parentLabel) parentLabel.classList.add('selected');
              }
            } else {
              el.value = val;
            }
          }
        }
      }

      // Restore DnD
      if (data.dnd) {
        state.dnd = data.dnd;
        ['dnd1', 'dnd2'].forEach(dndId => {
          const set = data.dnd[dndId];
          if (!set) return;
          const container = document.querySelector(`.dnd-container[data-dnd-id="${dndId}"]`);
          if (!container) return;
          const bank = container.querySelector('.draggable-bank');

          for (const slotKey in set) {
            const chipVal = set[slotKey];
            const chip = container.querySelector(`.drag-item[data-value="${chipVal}"]`);
            const zone = container.querySelector(`.drop-zone[data-slot-key="${slotKey}"]`);
            if (chip && zone) {
              placeChipIntoZone(chip, zone, bank, dndId, slotKey);
            }
          }
        });
      }

      updateHeaderScore();
    } catch (e) {
      console.warn('Failed to load saved state:', e);
    }
  }

  function resetAllLKPD() {
    if (confirm('Apakah kamu yakin ingin mengosongkan semua isian LKPD dan mengulang dari awal?')) {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  }

  // =========================================================================
  // 8. Initialization
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initOdometer();
    initDragAndDrop();

    // Auto-save listeners on inputs
    document.addEventListener('input', e => {
      saveState();
      // Remove wrong styling while typing
      if (e.target.classList.contains('incorrect')) {
        e.target.classList.remove('incorrect');
      }
    });

    // Radio choice styling helper
    document.querySelectorAll('.choice-label input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const group = document.querySelectorAll(`input[name="${radio.name}"]`);
        group.forEach(r => {
          const lbl = r.closest('.choice-label');
          if (lbl) lbl.classList.remove('selected', 'correct', 'incorrect');
        });
        const activeLabel = radio.closest('.choice-label');
        if (activeLabel) activeLabel.classList.add('selected');
        saveState();
      });
    });

    // Check Section Buttons
    for (let i = 1; i <= 6; i++) {
      const btn = document.getElementById(`btnCheckAct${i}`);
      if (btn) {
        btn.addEventListener('click', () => gradeSection(i));
      }
      const explBtn = document.getElementById(`btnToggleExplAct${i}`);
      if (explBtn) {
        explBtn.addEventListener('click', () => {
          const panel = document.getElementById(`explPanelAct${i}`);
          if (panel) panel.classList.toggle('show');
        });
      }
    }

    // Master Submit & Grade Button
    const btnSubmitAll = document.getElementById('btnSubmitAllLKPD');
    if (btnSubmitAll) {
      btnSubmitAll.addEventListener('click', gradeAll);
    }

    // Modal Close
    const btnCloseModal = document.getElementById('btnCloseReportModal');
    if (btnCloseModal) {
      btnCloseModal.addEventListener('click', hideReportModal);
    }
    const modalBackdrop = document.getElementById('gradingModal');
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', e => {
        if (e.target === modalBackdrop) hideReportModal();
      });
    }

    // Print & Reset Buttons
    const btnPrint = document.getElementById('btnPrintReport');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        hideReportModal();
        window.print();
      });
    }

    const btnResetAll = document.getElementById('btnResetAllLKPD');
    if (btnResetAll) {
      btnResetAll.addEventListener('click', resetAllLKPD);
    }

    // Document View Switcher (Photo Card vs Full TMO Form)
    const btnPhotoCard = document.getElementById('btnShowPhotoCard');
    const btnFullForm = document.getElementById('btnShowFullForm');
    const serviceImg = document.getElementById('serviceRecordImg');
    const serviceCaption = document.getElementById('serviceRecordCaption');

    if (btnPhotoCard && btnFullForm && serviceImg) {
      btnPhotoCard.addEventListener('click', () => {
        serviceImg.src = 'assets/service_record_real.png';
        serviceImg.alt = 'Foto Asli Service Record Toyota';
        if (serviceCaption) {
          serviceCaption.innerHTML = '<i class="fas fa-camera"></i> Foto Service Record Pelanggan (Perhatikan tanggal dan angka KM)';
        }
        btnPhotoCard.className = 'btn btn-sm btn-primary';
        btnFullForm.className = 'btn btn-sm btn-outline';
        btnFullForm.style.background = '#fff';
      });

      btnFullForm.addEventListener('click', () => {
        serviceImg.src = 'assets/service_record_form.png';
        serviceImg.alt = 'Lembar Form Service Record TMO Toyota';
        if (serviceCaption) {
          serviceCaption.innerHTML = '<i class="fas fa-file-invoice"></i> Lembar Form Service Record TMO Toyota (Halaman 5 dari Dokumen)';
        }
        btnFullForm.className = 'btn btn-sm btn-primary';
        btnPhotoCard.className = 'btn btn-sm btn-outline';
        btnPhotoCard.style.background = '#fff';
      });
    }

    // Lightbox Preview Modal for Zooming
    const lightboxModal = document.getElementById('imageLightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const btnCloseLightbox = document.getElementById('btnCloseLightbox');

    if (serviceImg && lightboxModal && lightboxImg) {
      serviceImg.addEventListener('click', () => {
        lightboxImg.src = serviceImg.src;
        lightboxImg.alt = serviceImg.alt;
        if (lightboxTitle) {
          lightboxTitle.innerHTML = `<i class="fas fa-magnifying-glass-plus" style="color: var(--accent-gold);"></i> ${serviceImg.alt}`;
        }
        lightboxModal.classList.add('show');
      });
    }

    if (btnCloseLightbox && lightboxModal) {
      btnCloseLightbox.addEventListener('click', () => {
        lightboxModal.classList.remove('show');
      });
    }

    if (lightboxModal) {
      lightboxModal.addEventListener('click', e => {
        if (e.target === lightboxModal) {
          lightboxModal.classList.remove('show');
        }
      });
    }

    // Enter Key Navigation for Form Inputs
    document.querySelectorAll('.interactive-input').forEach(input => {
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const allInputs = Array.from(document.querySelectorAll('.interactive-input'));
          const nextIndex = allInputs.indexOf(input) + 1;
          if (nextIndex < allInputs.length) {
            allInputs[nextIndex].focus();
          }
        }
      });
    });

    // Load persisted state
    loadState();
  });

})();
