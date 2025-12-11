import { randomHsl, uid } from './helpers.js';
import store from './store.js';
const addSquareBtn = document.getElementById('addSquare');
const addCircleBtn = document.getElementById('addCircle');
const recolorSquaresBtn = document.getElementById('recolorSquares');
const recolorCirclesBtn = document.getElementById('recolorCircles');
const cntSquaresEl = document.getElementById('cntSquares');
const cntCirclesEl = document.getElementById('cntCircles');
const board = document.getElementById('board');


function createShapeElement(shape) {
const el = document.createElement('div');
el.className = `shape ${shape.type}`;
el.style.backgroundColor = shape.color;
el.setAttribute('data-id', shape.id);
el.setAttribute('aria-label', shape.type);
el.style.width = '60px';
el.style.height = '60px';
el.style.border = '3px solid black';
el.style.borderRadius = shape.type === 'circle' ? '50%' : '6px';
el.style.transition = 'transform 0.2s, background-color 0.3s';
el.style.cursor = 'pointer';
return el;
}


let prevState = { shapes: [] };
store.subscribe(({ state, action }) => {

const squares = state.shapes.filter(s => s.type === 'square').length;
const circles = state.shapes.filter(s => s.type === 'circle').length;
cntSquaresEl.textContent = squares;
cntCirclesEl.textContent = circles;



if (!action) {
board.innerHTML = '';
for (const s of state.shapes) {
board.appendChild(createShapeElement(s));
}
} else if (action.type === 'ADD') {
const s = action.payload;
board.appendChild(createShapeElement(s));
} else if (action.type === 'REMOVE') {
const id = action.payload.id;
const el = board.querySelector(`[data-id="${id}"]`);
if (el) el.remove();
} else if (action.type === 'RECOLOR_TYPE') {
const type = action.payload.type;
const live = board.getElementsByClassName(type);
for (const el of live) {
el.style.backgroundColor = action.payload.color;
}
}


prevState = state;
});


addSquareBtn.addEventListener('click', () => {
const shape = { id: uid(), type: 'square', color: randomHsl() };
store.dispatch({ type: 'ADD', payload: shape });
});
addCircleBtn.addEventListener('click', () => {
const shape = { id: uid(), type: 'circle', color: randomHsl() };
store.dispatch({ type: 'ADD', payload: shape });
});


board.addEventListener('click', (e) => {
const el = e.target.closest('.shape');
if (!el || !board.contains(el)) return;
const id = el.getAttribute('data-id');
if (id) store.dispatch({ type: 'REMOVE', payload: { id } });
});


recolorSquaresBtn.addEventListener('click', () => {
store.dispatch({ type: 'RECOLOR_TYPE', payload: { type: 'square', color: randomHsl() } });
});
recolorCirclesBtn.addEventListener('click', () => {
store.dispatch({ type: 'RECOLOR_TYPE', payload: { type: 'circle', color: randomHsl() } });
});