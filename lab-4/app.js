const STORAGE_KEY = 'lab4-kanban-v1';

const colsDef = [
  { id: 'todo', title: 'Do zrobienia' },
  { id: 'doing', title: 'W trakcie' },
  { id: 'done', title: 'Zrobione' }
];

const board = document.getElementById('board');
const colTemplate = document.getElementById('col-template');
const cardTemplate = document.getElementById('card-template');

let state = { cols: {} };

function uid() { return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8); }
function randomColor() { const colors = ['#ffd54f', '#ffb86b', '#ff8a80', '#f48fb1', '#b39ddb', '#90caf9', '#a5d6a7', '#ffe082']; return colors[Math.floor(Math.random() * colors.length)]; }
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) { colsDef.forEach(c => state.cols[c.id] = []); save(); return; }
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.cols) { state = parsed; colsDef.forEach(c => { if (!state.cols[c.id]) state.cols[c.id] = []; }); }
    else colsDef.forEach(c => state.cols[c.id] = []);
  } catch { colsDef.forEach(c => state.cols[c.id] = []); }
}

function buildBoard() {
  board.innerHTML = '';
  colsDef.forEach(col => {
    const tpl = colTemplate.content.cloneNode(true);
    const section = tpl.querySelector('.column');
    section.dataset.col = col.id;
    section.querySelector('.col-title').textContent = col.title;
    section.querySelector('.add-card').addEventListener('click', () => onAddCard(col.id));
    section.querySelector('.color-col').addEventListener('click', () => colorColumn(col.id));
    section.querySelector('.sort-col').addEventListener('click', () => sortColumn(col.id));
    section.addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const cardEl = btn.closest('.card');
      const colId = section.dataset.col;
      if (btn.classList.contains('move-left')) {
        if (!cardEl) return;
        const cardId = cardEl.dataset.cardId;
        moveCard(colId, cardId, -1);
      } else if (btn.classList.contains('move-right')) {
        if (!cardEl) return;
        const cardId = cardEl.dataset.cardId;
        moveCard(colId, cardId, 1);
      } else if (btn.classList.contains('del-card')) {
        if (!cardEl) return;
        const cardId = cardEl.dataset.cardId;
        if (confirm('Usunąć kartę?')) deleteCard(colId, cardId);
      } else if (btn.classList.contains('color-card')) {
        if (!cardEl) return;
        const cardId = cardEl.dataset.cardId;
        const card = state.cols[colId].find(c => c.id === cardId);
        if (!card) return;
        card.color = randomColor();
        save();
        renderColumn(colId);
      }
    });
    board.appendChild(section);
  });
  renderAll();
}

function renderAll() { colsDef.forEach(c => renderColumn(c.id)); }

function renderColumn(colId) {
  const columnEl = board.querySelector(`.column[data-col="${colId}"]`);
  if (!columnEl) return;
  const list = columnEl.querySelector('.col-list');
  list.innerHTML = '';
  const cards = state.cols[colId] || [];
  cards.forEach(card => list.appendChild(createCardElement(card)));
  const counter = columnEl.querySelector('.counter');
  if (counter) counter.textContent = String(cards.length);
}

function createCardElement(cardObj) {
  const tpl = cardTemplate.content.cloneNode(true);
  const el = tpl.querySelector('.card');
  el.dataset.cardId = cardObj.id;
  el.style.background = cardObj.color || '';
  const body = el.querySelector('.card-body');
  body.textContent = cardObj.content || '';
  body.addEventListener('input', debounce(() => { cardObj.content = body.textContent.trim(); save(); }, 300));
  body.addEventListener('blur', () => { cardObj.content = body.textContent.trim(); save(); });
  return el;
}

function onAddCard(colId) {
  const text = prompt('Treść karty:', '');
  if (text === null) return;
  const card = { id: uid(), content: text.trim(), color: randomColor(), created: Date.now() };
  state.cols[colId].push(card);
  save();
  renderColumn(colId);
}

function deleteCard(colId, cardId) {
  state.cols[colId] = state.cols[colId].filter(c => c.id !== cardId);
  save();
  renderColumn(colId);
}

function moveCard(fromCol, cardId, dir) {
  const index = state.cols[fromCol].findIndex(c => c.id === cardId);
  if (index === -1) return;
  const card = state.cols[fromCol][index];
  const colIndex = colsDef.findIndex(c => c.id === fromCol);
  const newColIndex = colIndex + dir;
  if (newColIndex < 0 || newColIndex >= colsDef.length) return;
  const toCol = colsDef[newColIndex].id;
  state.cols[fromCol].splice(index, 1);
  state.cols[toCol].push(card);
  save();
  renderColumn(fromCol);
  renderColumn(toCol);
}

function colorColumn(colId) {
  const base = randomColor();
  state.cols[colId].forEach(c => c.color = base);
  save();
  renderColumn(colId);
}

function sortColumn(colId) {
  const list = state.cols[colId];
  const key = list._sortedBy === 'alpha' ? 'created' : 'alpha';
  if (key === 'alpha') { list.sort((a, b) => (a.content || '').localeCompare(b.content || '')); list._sortedBy = 'alpha'; }
  else { list.sort((a, b) => (a.created || 0) - (b.created || 0)); list._sortedBy = 'created'; }
  save();
  renderColumn(colId);
}

function debounce(fn, wait = 200) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn.apply(null, args), wait); }; }

function deleteAllStorage() { localStorage.removeItem(STORAGE_KEY); load(); renderAll(); }

load();
buildBoard();
renderAll();
