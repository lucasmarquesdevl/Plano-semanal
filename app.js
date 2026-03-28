/* =========================================
   STUDYWEEK — app.js
   ========================================= */

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const DAYS_SHORT = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
const STORAGE_KEY = 'studyweek_sessions';

// ——— STATE ———
let sessions = [];      // { id, day, subject, start, end, color, notes, done }
let selectedDay = null;
let selectedColor = '#FF6B6B';
let editingId = null;

// ——— DOM REFS ———
const weekGrid    = document.getElementById('weekGrid');
const btnAdd      = document.getElementById('btnAdd');
const btnClear    = document.getElementById('btnClear');
const dayPicker   = document.getElementById('dayPicker');
const colorPicker = document.getElementById('colorPicker');
const legendList  = document.getElementById('legendList');
const modalOverlay = document.getElementById('modalOverlay');
const toast       = document.getElementById('toast');

// form inputs
const inputSubject = document.getElementById('inputSubject');
const inputStart   = document.getElementById('inputStart');
const inputEnd     = document.getElementById('inputEnd');
const inputNotes   = document.getElementById('inputNotes');

// modal inputs
const editSubject = document.getElementById('editSubject');
const editStart   = document.getElementById('editStart');
const editEnd     = document.getElementById('editEnd');
const editNotes   = document.getElementById('editNotes');
const btnSave     = document.getElementById('btnSave');
const btnDelete   = document.getElementById('btnDelete');
const btnCancel   = document.getElementById('btnCancel');

// stats
const statTotal    = document.getElementById('statTotal');
const statDone     = document.getElementById('statDone');
const statHours    = document.getElementById('statHours');
const statSubjects = document.getElementById('statSubjects');
const progressPct  = document.getElementById('progressPct');
const ringFill     = document.getElementById('ringFill');
const weekRangeEl  = document.getElementById('weekRange');

// ——— INIT ———
function init() {
  loadData();
  buildWeekGrid();
  setWeekRange();
  bindEvents();
  render();
}

// ——— STORAGE ———
function loadData() {
  try {
    sessions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { sessions = []; }
}
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

// ——— WEEK RANGE LABEL ———
function setWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0 = sun
  // Monday = start
  const diffMon = (day === 0) ? -6 : 1 - day;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);

  const fmt = (d) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  weekRangeEl.textContent = `${fmt(mon)} – ${fmt(sun)}`;
}

// ——— BUILD GRID ———
function buildWeekGrid() {
  weekGrid.innerHTML = '';
  const now = new Date();
  // Get Monday of current week
  const day = now.getDay();
  const diffMon = (day === 0) ? -6 : 1 - day;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffMon);

  for (let i = 0; i < 7; i++) {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    const isToday = d.toDateString() === now.toDateString();

    const col = document.createElement('div');
    col.className = 'day-column' + (isToday ? ' today' : '');
    col.dataset.day = i;

    col.innerHTML = `
      <div class="day-header">
        <div class="day-name">${DAYS_SHORT[i]}</div>
        <div class="day-date">${d.getDate()}</div>
        <div class="day-count" id="dayCount${i}"></div>
      </div>
      <div class="day-body" id="dayBody${i}"></div>
    `;
    weekGrid.appendChild(col);
  }
}

// ——— RENDER ———
function render() {
  for (let i = 0; i < 7; i++) {
    const body = document.getElementById(`dayBody${i}`);
    const countEl = document.getElementById(`dayCount${i}`);
    const daySessions = sessions
      .filter(s => s.day === i)
      .sort((a, b) => a.start.localeCompare(b.start));

    body.innerHTML = '';
    if (daySessions.length === 0) {
      body.innerHTML = `<div class="empty-col"><span>📚</span><span>Sem sessões</span></div>`;
    } else {
      daySessions.forEach(s => body.appendChild(createCard(s)));
    }

    const total = daySessions.length;
    const done  = daySessions.filter(s => s.done).length;
    countEl.textContent = total ? `${done}/${total} concluídas` : '';
  }

  updateStats();
  updateLegend();
}

// ——— CREATE CARD ———
function createCard(s) {
  const card = document.createElement('div');
  card.className = 'session-card' + (s.done ? ' done' : '');
  card.style.background = hexToRgba(s.color, 0.18);
  card.style.borderColor = hexToRgba(s.color, 0.35);
  card.style.setProperty('--card-color', s.color);
  card.innerHTML = `
    <div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:${s.color};border-radius:3px 0 0 3px;"></div>
    <div class="card-time">${s.start} – ${s.end}</div>
    <div class="card-subject">${escHtml(s.subject)}</div>
    ${s.notes ? `<div class="card-notes">${escHtml(s.notes)}</div>` : ''}
    <div class="card-check" data-id="${s.id}" title="Marcar como concluída">${s.done ? '✓' : ''}</div>
  `;

  // click card body → edit
  card.addEventListener('click', (e) => {
    if (e.target.closest('.card-check')) return;
    openEditModal(s.id);
  });

  // click check → toggle done
  card.querySelector('.card-check').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDone(s.id);
  });

  return card;
}

// ——— STATS ———
function updateStats() {
  const total = sessions.length;
  const done  = sessions.filter(s => s.done).length;
  const hours = sessions.reduce((acc, s) => acc + minutesDiff(s.start, s.end), 0);
  const subjects = [...new Set(sessions.map(s => s.subject.trim().toLowerCase()))].length;

  statTotal.textContent    = total;
  statDone.textContent     = done;
  statHours.textContent    = formatHours(hours);
  statSubjects.textContent = subjects;

  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  progressPct.textContent = `${pct}%`;
  const circumference = 125.6;
  ringFill.style.strokeDashoffset = circumference - (circumference * pct / 100);
}

// ——— LEGEND ———
function updateLegend() {
  const map = {};
  sessions.forEach(s => {
    const key = s.subject.trim();
    if (!map[key]) map[key] = { color: s.color, count: 0 };
    map[key].count++;
  });
  legendList.innerHTML = '';
  Object.entries(map)
    .sort((a, b) => b[1].count - a[1].count)
    .forEach(([name, val]) => {
      const li = document.createElement('li');
      li.className = 'legend-item';
      li.innerHTML = `
        <span class="legend-dot" style="background:${val.color}"></span>
        <span class="legend-name">${escHtml(name)}</span>
        <span class="legend-count">${val.count}</span>
      `;
      legendList.appendChild(li);
    });
}

// ——— ADD SESSION ———
function addSession() {
  const subject = inputSubject.value.trim();
  if (!subject) { showToast('⚠️ Insira o nome da matéria'); return; }
  if (selectedDay === null) { showToast('⚠️ Selecione um dia'); return; }
  const start = inputStart.value;
  const end   = inputEnd.value;
  if (!start || !end) { showToast('⚠️ Defina os horários'); return; }
  if (start >= end) { showToast('⚠️ O horário de fim deve ser depois do início'); return; }

  const session = {
    id: Date.now().toString(),
    day: selectedDay,
    subject,
    start,
    end,
    color: selectedColor,
    notes: inputNotes.value.trim(),
    done: false,
  };
  sessions.push(session);
  saveData();
  render();
  showToast(`✓ "${subject}" adicionado`);

  // reset form (mantém dia e cor)
  inputSubject.value = '';
  inputNotes.value = '';
}

// ——— TOGGLE DONE ———
function toggleDone(id) {
  const s = sessions.find(s => s.id === id);
  if (!s) return;
  s.done = !s.done;
  saveData();
  render();
  showToast(s.done ? '✓ Sessão concluída!' : 'Sessão reaberta');
}

// ——— EDIT MODAL ———
function openEditModal(id) {
  const s = sessions.find(s => s.id === id);
  if (!s) return;
  editingId = id;
  editSubject.value = s.subject;
  editStart.value   = s.start;
  editEnd.value     = s.end;
  editNotes.value   = s.notes;
  modalOverlay.classList.add('open');
}
function closeModal() {
  modalOverlay.classList.remove('open');
  editingId = null;
}

function saveEdit() {
  if (!editingId) return;
  const s = sessions.find(s => s.id === editingId);
  if (!s) return;
  const newSubject = editSubject.value.trim();
  const newStart   = editStart.value;
  const newEnd     = editEnd.value;
  if (!newSubject) { showToast('⚠️ Insira o nome'); return; }
  if (newStart >= newEnd) { showToast('⚠️ Horário inválido'); return; }
  s.subject = newSubject;
  s.start   = newStart;
  s.end     = newEnd;
  s.notes   = editNotes.value.trim();
  saveData();
  render();
  closeModal();
  showToast('✓ Sessão atualizada');
}

function deleteSession() {
  if (!editingId) return;
  sessions = sessions.filter(s => s.id !== editingId);
  saveData();
  render();
  closeModal();
  showToast('🗑 Sessão removida');
}

function clearWeek() {
  if (!sessions.length) return;
  if (!confirm('Deseja apagar TODAS as sessões da semana?')) return;
  sessions = [];
  saveData();
  render();
  showToast('Semana limpa!');
}

// ——— BIND EVENTS ———
function bindEvents() {
  btnAdd.addEventListener('click', addSession);
  inputSubject.addEventListener('keydown', e => { if (e.key === 'Enter') addSession(); });

  btnClear.addEventListener('click', clearWeek);

  // Day picker
  dayPicker.querySelectorAll('.day-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      dayPicker.querySelectorAll('.day-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedDay = parseInt(btn.dataset.day);
    });
  });

  // Color picker
  colorPicker.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      colorPicker.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedColor = btn.dataset.color;
    });
  });

  // Modal
  btnSave.addEventListener('click', saveEdit);
  btnDelete.addEventListener('click', deleteSession);
  btnCancel.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

// ——— HELPERS ———
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function minutesDiff(start, end) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
}

function formatHours(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}m`;
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ——— START ———
init();
