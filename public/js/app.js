/**
 * e-LKPD Barisan dan Deret Aritmatika Berbasis PMR (Konteks Pergantian Oli)
 * Interactive Controller: Multi-step Wizard Flow, Stopwatch Timer, DnD Engine, Auto-Grading, LocalStorage & Backend API Submission
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. Storage & State Store
  // =========================================================================
  const STORAGE_KEY = 'elkpd_aritmatika_pmr_state_v2';

  // Master Answer Key & Rubric (Total: 100 Poin)
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
    // Drag and Drop 1 (8 pts)
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
    act5_gauss_pairs: { value: ['n', 'n pasangan', 'sebanyak n'], type: 'text-options', weight: 2 },
    act5_f_2a: { value: '2a', type: 'text-exact', weight: 2 },
    // Drag and Drop 2 (5 pts)
    dnd2_sn: { value: 'Jumlah n Suku', type: 'dnd', weight: 1 },
    dnd2_un: { value: 'Suku Ke-n', type: 'dnd', weight: 1 },
    dnd2_a: { value: 'Suku Pertama', type: 'dnd', weight: 1 },
    dnd2_b: { value: 'Beda', type: 'dnd', weight: 1 },
    dnd2_n: { value: 'Banyak Suku', type: 'dnd', weight: 1 },
    // Soal Servis ke-10 (8 pts)
    act5_a: { value: 56125, type: 'number', weight: 1 },
    act5_b: { value: 10000, type: 'number', weight: 1 },
    act5_n: { value: 10, type: 'number', weight: 1 },
    act5_s10: { value: 1011250, type: 'number', weight: 5 },

    // Section 6: Aktivitas 6 - Kasus Baru & Refleksi (20 pts)
    act6_a: { value: 30000, type: 'number', weight: 2 },
    act6_b: { value: 10000, type: 'number', weight: 2 },
    act6_n: { value: 15, type: 'number', weight: 2 },
    act6_u15: { value: 170000, type: 'number', weight: 5 },
    act6_s15: { value: 1500000, type: 'number', weight: 5 },
    act6_reflection: { value: 5, type: 'min-words', weight: 4 }
  };

  // Activity Meta Information for Summary
  const ACTIVITIES_INFO = [
    { num: 1, title: 'Aktivitas 1', topic: 'Membaca & Memahami Service Record Toyota', weight: 10, prefix: 'act1' },
    { num: 2, title: 'Aktivitas 2', topic: 'Pola Perubahan Jarak Tempuh & Beda (b)', weight: 15, prefix: 'act2' },
    { num: 3, title: 'Aktivitas 3', topic: 'Rumus Suku ke-n (Un) & Drag-and-Drop 1', weight: 20, prefix: 'act3' },
    { num: 4, title: 'Aktivitas 4', topic: 'Menghitung Total KM (Pengantar Deret)', weight: 10, prefix: 'act4' },
    { num: 5, title: 'Aktivitas 5', topic: 'Rumus Deret (Sn) & Drag-and-Drop 2', weight: 25, prefix: 'act5' },
    { num: 6, title: 'Aktivitas 6', topic: 'Studi Kasus Nyata & Refleksi Mandiri', weight: 20, prefix: 'act6' }
  ];

  // State Management
  const state = {
    currentStep: 1,
    student: {
      name: '',
      class: '',
      absent: '',
      school: ''
    },
    answers: {},
    dnd: {
      dnd1: {},
      dnd2: {}
    },
    odometerKM: 56125,
    lastScore: null,
    sectionScores: {},
    timerSeconds: 0,
    isTimerRunning: false,
    hasSubmitted: false
  };

  let timerInterval = null;

  // Step Meta Titles
  const STEP_TITLES = {
    1: 'Cover & Identitas Siswa',
    2: 'Ayo Mengamati (Konteks Servis Otomotif)',
    3: 'Aktivitas 1: Service Record Toyota',
    4: 'Aktivitas 2: Pola Perubahan KM / Beda (b)',
    5: 'Aktivitas 3: Menemukan Rumus Un',
    6: 'Aktivitas 4: Menghitung Jumlah KM',
    7: 'Aktivitas 5: Menemukan Rumus Deret Sn',
    8: 'Aktivitas 6: Masalah Kontekstual & Refleksi',
    9: 'Ringkasan & Pengumpulan Lembar Kerja'
  };

  // Helper: Number parser (handles Indonesian format "56.125" -> 56125)
  function parseIndoNumber(str) {
    if (typeof str === 'number') return str;
    if (!str || typeof str !== 'string') return NaN;
    const cleaned = str.toLowerCase()
      .replace(/km/g, '')
      .replace(/\s+/g, '')
      .replace(/\./g, '')
      .replace(/,/g, '');
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? NaN : num;
  }

  function formatIndoNumber(num) {
    if (isNaN(num)) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function formatDuration(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hrs} jam ${remMins} m ${secs} d`;
    }
    return `${mins} menit ${secs} detik`;
  }

  function formatTimerDisplay(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // =========================================================================
  // 2. Stopwatch Timer Controller
  // =========================================================================
  function startTimer() {
    if (state.isTimerRunning) return;
    state.isTimerRunning = true;
    timerInterval = setInterval(() => {
      state.timerSeconds++;
      const timerDisplay = document.getElementById('wizardTimerDisplay');
      if (timerDisplay) {
        timerDisplay.textContent = formatTimerDisplay(state.timerSeconds);
      }
      if (state.timerSeconds % 10 === 0) {
        saveState();
      }
    }, 1000);
  }

  function stopTimer() {
    state.isTimerRunning = false;
    clearInterval(timerInterval);
  }

  // =========================================================================
  // 3. Multi-Step Wizard Engine (Step 1 s/d Step 9)
  // =========================================================================
  window.goToStep = function (stepNumber) {
    if (stepNumber < 1 || stepNumber > 9) return;

    // Validate Step 1 before leaving
    if (state.currentStep === 1 && stepNumber > 1) {
      if (!validateStep1()) {
        alert('Mohon lengkapi Nama Lengkap, Kelas, dan No. Absen terlebih dahulu.');
        return;
      }
      startTimer();
    }

    // Hide all steps, show target step
    document.querySelectorAll('.wizard-step').forEach(stepEl => {
      stepEl.classList.remove('active');
    });

    const targetEl = document.getElementById(`step-${stepNumber}`);
    if (targetEl) {
      targetEl.classList.add('active');
    }

    state.currentStep = stepNumber;

    // Update Step Badge & Title
    const stepBadge = document.getElementById('wizardStepBadge');
    const stepTitle = document.getElementById('wizardStepTitle');
    if (stepBadge) {
      stepBadge.innerHTML = `<i class="fas fa-layer-group"></i> Langkah ${stepNumber} / 9`;
    }
    if (stepTitle) {
      stepTitle.textContent = STEP_TITLES[stepNumber] || '';
    }

    // Update Progress Bar
    const progressBarFill = document.getElementById('wizardProgressBarFill');
    if (progressBarFill) {
      const pct = Math.round((stepNumber / 9) * 100);
      progressBarFill.style.width = `${pct}%`;
    }

    // Update Dots Track
    document.querySelectorAll('.wizard-dot-btn').forEach(dot => {
      const dStep = parseInt(dot.getAttribute('data-step'), 10);
      dot.classList.remove('active', 'completed');
      if (dStep === stepNumber) {
        dot.classList.add('active');
      } else if (dStep < stepNumber) {
        dot.classList.add('completed');
      }
    });

    // If entering Step 9 (Summary), render summary table
    if (stepNumber === 9) {
      renderSummaryStep();
    }

    // Smooth scroll to top of card
    window.scrollTo({ top: 120, behavior: 'smooth' });

    saveState();
  };

  // Step 1 Validation Checker
  function validateStep1() {
    const nameEl = document.getElementById('studentName');
    const classEl = document.getElementById('studentClass');
    const absentEl = document.getElementById('studentAbsent');

    const nameVal = nameEl ? nameEl.value.trim() : '';
    const classVal = classEl ? classEl.value.trim() : '';
    const absentVal = absentEl ? absentEl.value.trim() : '';

    const isValid = nameVal.length >= 2 && classVal.length >= 1 && absentVal.length >= 1;

    const btnStart = document.getElementById('btnStartWizard');
    const hint = document.getElementById('identitasValidationHint');

    if (btnStart) {
      btnStart.disabled = !isValid;
    }
    if (hint) {
      hint.style.display = isValid ? 'none' : 'block';
    }

    state.student.name = nameVal;
    state.student.class = classVal;
    state.student.absent = absentVal;
    const schoolEl = document.getElementById('studentSchool');
    state.student.school = schoolEl ? schoolEl.value.trim() : '';

    return isValid;
  }

  // =========================================================================
  // 4. Interactive Odometer Simulator
  // =========================================================================
  function initOdometer() {
    const odoDisplay = document.getElementById('odoDisplayKM');
    const odoServiceNo = document.getElementById('odoServiceNo');
    const btnNext = document.getElementById('btnOdoNext');
    const btnPrev = document.getElementById('btnOdoPrev');
    const btnReset = document.getElementById('btnOdoReset');

    function updateOdometerUI() {
      if (odoDisplay) odoDisplay.textContent = formatIndoNumber(state.odometerKM);
      if (odoServiceNo) {
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
  // 5. Drag-and-Drop Matching Engine (HTML5 + Click/Touch Fallback)
  // =========================================================================
  let selectedChipForTouch = null;

  function initDragAndDrop() {
    document.querySelectorAll('.dnd-container').forEach(container => {
      const dndId = container.getAttribute('data-dnd-id');
      const bank = container.querySelector('.draggable-bank');
      const resetBtn = container.querySelector('[data-reset-dnd]');

      if (resetBtn) {
        resetBtn.addEventListener('click', () => resetDnD(dndId, container));
      }

      container.querySelectorAll('.drag-item').forEach(item => {
        item.addEventListener('dragstart', e => {
          e.dataTransfer.setData('text/plain', item.getAttribute('data-value'));
          e.dataTransfer.setData('application/chip-id', item.id);
          item.classList.add('dragging');
        });

        item.addEventListener('dragend', () => {
          item.classList.remove('dragging');
        });

        // Touch / Click fallback
        item.addEventListener('click', () => {
          const parentZone = item.closest('.drop-zone');
          if (parentZone) {
            // Return chip to bank
            bank.appendChild(item);
            const slotKey = parentZone.getAttribute('data-slot-key');
            if (slotKey) delete state.dnd[dndId][slotKey];
            parentZone.classList.remove('has-item', 'correct', 'incorrect');
            const placeholder = parentZone.querySelector('.drop-placeholder');
            if (placeholder) placeholder.style.display = 'block';
            updateBankEmptyHint(bank);
            saveState();
            return;
          }

          if (selectedChipForTouch === item) {
            item.classList.remove('touch-selected');
            selectedChipForTouch = null;
          } else {
            container.querySelectorAll('.drag-item').forEach(i => i.classList.remove('touch-selected'));
            item.classList.add('touch-selected');
            selectedChipForTouch = item;
          }
        });
      });

      container.querySelectorAll('.drop-zone').forEach(zone => {
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
          const chipId = e.dataTransfer.getData('application/chip-id');
          const chipEl = document.getElementById(chipId);
          if (chipEl && zone) {
            placeChipIntoZone(chipEl, zone, dndId, chipValue, bank);
          }
        });

        zone.addEventListener('click', () => {
          if (selectedChipForTouch && !zone.querySelector('.drag-item')) {
            const chipValue = selectedChipForTouch.getAttribute('data-value');
            placeChipIntoZone(selectedChipForTouch, zone, dndId, chipValue, bank);
            selectedChipForTouch.classList.remove('touch-selected');
            selectedChipForTouch = null;
          }
        });
      });
    });
  }

  function placeChipIntoZone(chipEl, zone, dndId, chipValue, bank) {
    // If zone already has a chip, return it to bank
    const existingChip = zone.querySelector('.drag-item');
    if (existingChip) {
      bank.appendChild(existingChip);
    }

    zone.appendChild(chipEl);
    zone.classList.add('has-item');
    const placeholder = zone.querySelector('.drop-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    const slotKey = zone.getAttribute('data-slot-key');
    if (slotKey) {
      state.dnd[dndId][slotKey] = chipValue;
    }

    updateBankEmptyHint(bank);
    saveState();
    updateHeaderScore();
  }

  function resetDnD(dndId, container) {
    const bank = container.querySelector('.draggable-bank');
    container.querySelectorAll('.drop-zone').forEach(zone => {
      const chip = zone.querySelector('.drag-item');
      if (chip) bank.appendChild(chip);
      zone.classList.remove('has-item', 'correct', 'incorrect');
      const placeholder = zone.querySelector('.drop-placeholder');
      if (placeholder) placeholder.style.display = 'block';
    });
    state.dnd[dndId] = {};
    updateBankEmptyHint(bank);
    saveState();
    updateHeaderScore();
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
  // 6. Auto-Grading Engine & Evaluator
  // =========================================================================
  function evaluateItem(key, config) {
    let studentVal;
    let isCorrect = false;

    // DnD items
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
      isCorrect = words >= 5;
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

  function gradeSection(sectionNumber) {
    const prefix = `act${sectionNumber}`;
    let totalPossible = 0;
    let earned = 0;
    const allKeys = [];

    for (const key in ANSWER_KEY) {
      if (key.startsWith(prefix) || (sectionNumber === 3 && key.startsWith('dnd1')) || (sectionNumber === 5 && key.startsWith('dnd2'))) {
        allKeys.push(key);
      }
    }

    allKeys.forEach(k => {
      const res = evaluateItem(k, ANSWER_KEY[k]);
      totalPossible += res.weight;
      if (res.isCorrect) earned += res.weight;
      applyItemFeedback(res);
    });

    const scorePct = totalPossible > 0 ? Math.round((earned / totalPossible) * 100) : 0;
    state.sectionScores[sectionNumber.toString()] = { earned, totalPossible, scorePct };

    // Update section score pill
    const pill = document.getElementById(`scorePillAct${sectionNumber}`);
    if (pill) {
      pill.textContent = `${earned}/${totalPossible} Poin`;
      pill.style.background = scorePct >= 80 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)';
      pill.style.color = scorePct >= 80 ? '#34d399' : '#f87171';
    }

    // Feedback banner
    const feedbackBox = document.getElementById(`feedbackBoxAct${sectionNumber}`);
    if (feedbackBox) {
      feedbackBox.className = 'section-feedback-box show ' + (scorePct >= 80 ? 'success' : 'warning');
      feedbackBox.innerHTML = scorePct >= 80
        ? `<i class="fas fa-check-circle"></i> <span><strong>Bagus Sekali!</strong> Aktivitas ${sectionNumber} selesai dengan nilai ${scorePct}% (${earned}/${totalPossible} Poin).</span>`
        : `<i class="fas fa-exclamation-circle"></i> <span><strong>Perlu Dicek Kembali:</strong> Aktivitas ${sectionNumber} memperoleh ${earned}/${totalPossible} Poin. Periksa kembali jawaban bertanda merah!</span>`;
    }

    // Reveal explanation panel
    const explPanel = document.getElementById(`explPanelAct${sectionNumber}`);
    if (explPanel) explPanel.classList.add('show');

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

    // DnD slots
    if (res.key.startsWith('dnd1_') || res.key.startsWith('dnd2_')) {
      const zone = document.querySelector(`.drop-zone[data-slot-key="${res.key}"]`);
      if (zone) {
        zone.classList.toggle('correct', res.isCorrect);
        zone.classList.toggle('incorrect', !res.isCorrect);
      }
    }
  }

  function computeTotalScore() {
    let grandEarned = 0;
    let grandTotal = 0;

    for (let i = 1; i <= 6; i++) {
      const prefix = `act${i}`;
      let sEarned = 0;
      let sTotal = 0;

      for (const key in ANSWER_KEY) {
        if (key.startsWith(prefix) || (i === 3 && key.startsWith('dnd1')) || (i === 5 && key.startsWith('dnd2'))) {
          const res = evaluateItem(key, ANSWER_KEY[key]);
          sTotal += res.weight;
          if (res.isCorrect) sEarned += res.weight;
        }
      }

      grandEarned += sEarned;
      grandTotal += sTotal;
      const sPct = sTotal > 0 ? Math.round((sEarned / sTotal) * 100) : 0;
      state.sectionScores[i.toString()] = { earned: sEarned, totalPossible: sTotal, scorePct: sPct };
    }

    const totalScore = grandTotal > 0 ? Math.round((grandEarned / grandTotal) * 100) : 0;
    state.lastScore = totalScore;
    return { totalScore, grandEarned, grandTotal };
  }

  function updateHeaderScore() {
    const { totalScore } = computeTotalScore();
    const headerDisplay = document.getElementById('headerTotalScore');
    if (headerDisplay) {
      headerDisplay.textContent = totalScore;
      headerDisplay.style.color = totalScore >= 80 ? '#34d399' : totalScore >= 60 ? '#fbbf24' : '#f87171';
    }
    const progressBar = document.getElementById('headerProgressBar');
    if (progressBar) {
      progressBar.style.width = `${totalScore}%`;
      progressBar.style.background = totalScore >= 80
        ? 'linear-gradient(90deg, #10b981, #34d399)'
        : totalScore >= 60
          ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
          : 'linear-gradient(90deg, #ef4444, #f87171)';
    }
  }

  function getPredikatTitle(score) {
    if (score >= 90) return 'Master Technician (Sangat Memuaskan)';
    if (score >= 75) return 'Senior Technician (Tuntas / Memuaskan)';
    if (score >= 60) return 'Junior Technician (Cukup)';
    return 'Apprentice Technician (Perlu Remedial)';
  }

  // =========================================================================
  // 7. Step 9: Render Summary & Backend Submission
  // =========================================================================
  function renderSummaryStep() {
    const { totalScore } = computeTotalScore();

    // Render Student Metadata
    const sName = document.getElementById('summaryStudentName');
    const sClass = document.getElementById('summaryStudentClass');
    const sDur = document.getElementById('summaryStudentDuration');
    const sScore = document.getElementById('summaryStudentScore');

    if (sName) sName.textContent = state.student.name || '-';
    if (sClass) sClass.textContent = `${state.student.class || '-'} / No.${state.student.absent || '-'}`;
    if (sDur) sDur.textContent = formatDuration(state.timerSeconds);
    if (sScore) sScore.textContent = `${totalScore} / 100`;

    // Render Activities Summary Table
    const tbody = document.getElementById('summaryTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    ACTIVITIES_INFO.forEach(act => {
      const sc = state.sectionScores[act.num.toString()] || { earned: 0, totalPossible: act.weight, scorePct: 0 };
      const isComplete = sc.earned > 0 || checkActivityAnswered(act.prefix, act.num);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 700; color: #64748b;">${act.num}</td>
        <td><strong>${act.title}</strong></td>
        <td style="font-size: 0.85rem; color: #475569;">${act.topic}</td>
        <td><span style="font-weight: 700; color: #1e3a8a;">${sc.earned}/${act.weight} Poin</span></td>
        <td>
          <span style="display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; font-weight: 700; color: ${isComplete ? '#10b981' : '#f59e0b'};">
            <i class="fas ${isComplete ? 'fa-check-circle' : 'fa-hourglass-half'}"></i> ${isComplete ? 'Sudah Terisi' : 'Belum Lengkap'}
          </span>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function checkActivityAnswered(prefix, num) {
    if (num === 3 && Object.keys(state.dnd.dnd1).length > 0) return true;
    if (num === 5 && Object.keys(state.dnd.dnd2).length > 0) return true;
    for (const key in state.answers) {
      if (key.startsWith(prefix) && state.answers[key]) return true;
    }
    return false;
  }

  // Submit Completed e-LKPD to Backend API
  async function submitToBackend() {
    const btnSubmit = document.getElementById('btnSubmitToBackend');
    const alertBox = document.getElementById('submissionAlert');
    const alertTitle = document.getElementById('submissionAlertTitle');
    const alertMsg = document.getElementById('submissionAlertMsg');
    const alertIcon = document.getElementById('submissionAlertIcon');

    // Make sure student has identified themselves
    if (!validateStep1()) {
      alert('Mohon lengkapi Nama Lengkap, Kelas, dan No. Absen di Langkah 1!');
      window.goToStep(1);
      return;
    }

    collectAllAnswers();
    const { totalScore } = computeTotalScore();
    const predikat = getPredikatTitle(totalScore);

    const payload = {
      nama: state.student.name,
      kelas: state.student.class,
      no_absen: state.student.absent,
      sekolah: state.student.school || '',
      durasi: formatDuration(state.timerSeconds),
      durasi_detik: state.timerSeconds,
      jawaban: state.answers,
      total_skor: totalScore,
      predikat: predikat,
      section_scores: state.sectionScores
    };

    try {
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sedang Mengirim Jawaban...';
      }

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        stopTimer();
        state.hasSubmitted = true;
        saveState();

        if (alertBox) {
          alertBox.className = 'submission-status-alert show success';
          if (alertTitle) alertTitle.textContent = 'Alhamdulillah, Jawaban Berhasil Dikirim!';
          if (alertMsg) alertMsg.textContent = `Tersimpan di Database Guru dengan ID #${data.submissionId} pada ${data.timestamp}. Laporan hasil belajarmu telah diterbitkan.`;
          if (alertIcon) alertIcon.className = 'fas fa-check-circle';
        }

        if (btnSubmit) {
          btnSubmit.innerHTML = '<i class="fas fa-circle-check"></i> Sudah Terkirim ke Guru';
          btnSubmit.classList.remove('btn-gold');
          btnSubmit.classList.add('btn-primary');
        }

        // Open evaluation report modal
        showReportModal(totalScore, data.timestamp);
      } else {
        throw new Error(data.message || 'Gagal menyimpan ke server');
      }
    } catch (err) {
      if (alertBox) {
        alertBox.className = 'submission-status-alert show error';
        if (alertTitle) alertTitle.textContent = 'Gagal Mengirim ke Server';
        if (alertMsg) alertMsg.textContent = 'Terjadi kendala jaringan: ' + err.message + '. Jawaban tetap aman di perambanmu!';
        if (alertIcon) alertIcon.className = 'fas fa-exclamation-triangle';
      }
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<i class="fas fa-paper-plane"></i> Coba Kirim Ulang';
      }
    }
  }

  // =========================================================================
  // 8. Evaluation Report Modal & Print
  // =========================================================================
  function showReportModal(score, timestampStr) {
    const modal = document.getElementById('gradingModal');
    if (!modal) return;

    const ring = document.getElementById('reportScoreRing');
    const numDisplay = document.getElementById('reportScoreNumber');
    const badgeTitle = document.getElementById('reportBadgeTitle');
    const badgeIcon = document.getElementById('reportBadgeIcon');

    if (numDisplay) numDisplay.textContent = score;

    if (ring) {
      ring.style.setProperty('--score-pct', `${score}%`);
      ring.style.background = `conic-gradient(
        ${score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'} 0% ${score}%,
        #e2e8f0 ${score}% 100%
      )`;
    }

    if (badgeTitle) {
      badgeTitle.textContent = getPredikatTitle(score);
      badgeTitle.style.color = score >= 80 ? '#059669' : score >= 60 ? '#d97706' : '#dc2626';
    }

    if (badgeIcon) {
      badgeIcon.className = score >= 80 ? 'fas fa-trophy report-badge-icon' : score >= 60 ? 'fas fa-medal report-badge-icon' : 'fas fa-wrench report-badge-icon';
      badgeIcon.style.color = score >= 80 ? '#f59e0b' : score >= 60 ? '#3b82f6' : '#64748b';
    }

    // Student meta in modal
    const mName = document.getElementById('modalStudentName');
    const mClass = document.getElementById('modalStudentClass');
    const mAbsent = document.getElementById('modalStudentAbsent');
    const mTime = document.getElementById('modalTimestamp');

    if (mName) mName.textContent = state.student.name || '-';
    if (mClass) mClass.textContent = state.student.class || '-';
    if (mAbsent) mAbsent.textContent = state.student.absent || '-';
    if (mTime) mTime.textContent = timestampStr || new Date().toLocaleString('id-ID');

    // Breakdown list
    const breakdownList = document.getElementById('modalBreakdownList');
    if (breakdownList) {
      breakdownList.innerHTML = '';
      ACTIVITIES_INFO.forEach(act => {
        const sc = state.sectionScores[act.num.toString()] || { earned: 0, totalPossible: act.weight, scorePct: 0 };
        const li = document.createElement('li');
        li.className = 'breakdown-item';
        li.innerHTML = `
          <span><strong>${act.title}:</strong> ${act.topic}</span>
          <span class="breakdown-score" style="color: ${sc.scorePct >= 80 ? '#059669' : '#d97706'};">
            ${sc.earned}/${act.weight} Poin (${sc.scorePct}%)
          </span>
        `;
        breakdownList.appendChild(li);
      });
    }

    modal.classList.add('show');
  }

  function hideReportModal() {
    const modal = document.getElementById('gradingModal');
    if (modal) modal.classList.remove('show');
  }

  // =========================================================================
  // 9. State Persistence & Answer Collection
  // =========================================================================
  function collectAllAnswers() {
    document.querySelectorAll('.interactive-input, .interactive-textarea').forEach(input => {
      const key = input.id || input.name;
      if (key) state.answers[key] = input.value;
    });

    document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
      state.answers[radio.name] = radio.value;
    });

    document.querySelectorAll('input[type="checkbox"]').forEach(check => {
      const key = check.id || check.name;
      if (key) state.answers[key] = check.checked;
    });
  }

  function saveState() {
    collectAllAnswers();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      Object.assign(state, parsed);

      // Restore student identity fields
      const sName = document.getElementById('studentName');
      const sClass = document.getElementById('studentClass');
      const sAbsent = document.getElementById('studentAbsent');
      const sSchool = document.getElementById('studentSchool');

      if (sName && state.student.name) sName.value = state.student.name;
      if (sClass && state.student.class) sClass.value = state.student.class;
      if (sAbsent && state.student.absent) sAbsent.value = state.student.absent;
      if (sSchool && state.student.school) sSchool.value = state.student.school;

      // Restore answers
      if (state.answers) {
        for (const key in state.answers) {
          const val = state.answers[key];
          const el = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
          if (!el) continue;
          if (el.type === 'checkbox') {
            el.checked = Boolean(val);
          } else if (el.type === 'radio') {
            const r = document.querySelector(`input[name="${key}"][value="${val}"]`);
            if (r) r.checked = true;
          } else {
            el.value = val;
          }
        }
      }

      // Restore DnD
      ['dnd1', 'dnd2'].forEach(dndId => {
        const dndData = state.dnd[dndId] || {};
        for (const slotKey in dndData) {
          const val = dndData[slotKey];
          const zone = document.querySelector(`.drop-zone[data-slot-key="${slotKey}"]`);
          const chip = document.querySelector(`.dnd-container[data-dnd-id="${dndId}"] .drag-item[data-value="${val}"]`);
          if (zone && chip) {
            zone.appendChild(chip);
            zone.classList.add('has-item');
            const ph = zone.querySelector('.drop-placeholder');
            if (ph) ph.style.display = 'none';
          }
        }
      });

      // Restore timer display
      const timerDisplay = document.getElementById('wizardTimerDisplay');
      if (timerDisplay) {
        timerDisplay.textContent = formatTimerDisplay(state.timerSeconds);
      }

      validateStep1();

      // If user had started, restore timer and step
      if (state.currentStep > 1) {
        startTimer();
        window.goToStep(state.currentStep);
      }

      updateHeaderScore();
    } catch (e) {
      console.warn('Failed to parse saved state:', e);
    }
  }

  // =========================================================================
  // 10. Initialization & Event Bindings
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    initOdometer();
    initDragAndDrop();

    // Step 1 Validation Listeners
    ['studentName', 'studentClass', 'studentAbsent', 'studentSchool'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          validateStep1();
          saveState();
        });
      }
    });

    const btnStart = document.getElementById('btnStartWizard');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        if (validateStep1()) {
          startTimer();
          window.goToStep(2);
        }
      });
    }

    // Dots Track Clicks
    document.querySelectorAll('.wizard-dot-btn').forEach(dot => {
      dot.addEventListener('click', () => {
        const targetStep = parseInt(dot.getAttribute('data-step'), 10);
        window.goToStep(targetStep);
      });
    });

    // Inputs Auto-save & Validation Realtime Feedback
    document.querySelectorAll('.interactive-input, .interactive-textarea').forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('correct', 'incorrect');
        saveState();
        updateHeaderScore();
      });
    });

    // Radio choice styling
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
        updateHeaderScore();
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

    // Submit to Backend Button (Step 9)
    const btnSubmit = document.getElementById('btnSubmitToBackend');
    if (btnSubmit) {
      btnSubmit.addEventListener('click', submitToBackend);
    }

    // Modal Close
    const btnCloseModal = document.getElementById('btnCloseReportModal');
    if (btnCloseModal) btnCloseModal.addEventListener('click', hideReportModal);

    const gradingModal = document.getElementById('gradingModal');
    if (gradingModal) {
      gradingModal.addEventListener('click', e => {
        if (e.target === gradingModal) hideReportModal();
      });
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
