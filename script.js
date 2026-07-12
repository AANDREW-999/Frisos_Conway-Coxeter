/* ============================================================
   Frisos de Conway–Coxeter — lógica de la aplicación
   Toda la aritmética usa fracciones exactas (clase Fraction)
   para evitar errores de redondeo en la regla ad - bc = 1.
   ============================================================ */

/* ---------- Fracciones exactas ---------- */
function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a || 1;
}

class Fraction {
  constructor(n, d = 1) {
    if (d === 0) throw new Error('División por cero');
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d);
    this.n = n / g;
    this.d = d / g;
  }
  add(o) { return new Fraction(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { return new Fraction(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { return new Fraction(this.n * o.n, this.d * o.d); }
  div(o) { return new Fraction(this.n * o.d, this.d * o.n); }
  equals(o) { return this.n * o.d === o.n * this.d; }
  toString() { return this.d === 1 ? `${this.n}` : `${this.n}/${this.d}`; }
  toNumber() { return this.n / this.d; }

  static fromNumber(x) {
    if (Number.isInteger(x)) return new Fraction(x, 1);
    let den = 1;
    while (!Number.isInteger(Math.round(x * den * 1e6) / 1e6) && den < 100000) den *= 10;
    return new Fraction(Math.round(x * den), den);
  }
}

/* ============================================================
   NAVEGACIÓN POR PESTAÑAS
   ============================================================ */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

/* ============================================================
   SECCIÓN 1 — RECURRENCIA DE LYNESS
   x_n = (1 + x_{n-1}) / x_{n-2}
   ============================================================ */
const seqStepsEl = document.getElementById('seq-steps');
const periodBanner = document.getElementById('period-banner');
let seqTimer = null;

function computeLyness(x1, x2) {
  const xs = [x1, x2];
  for (let i = 2; i < 7; i++) {
    const prev1 = xs[i - 1], prev2 = xs[i - 2];
    xs.push(new Fraction(1).add(prev1).div(prev2));
  }
  return xs; // [x1..x7] as Fraction, index 0..6
}

function renderSequence(animate) {
  clearTimeout(seqTimer);
  seqStepsEl.innerHTML = '';
  periodBanner.hidden = true;

  const x1raw = parseFloat(document.getElementById('x1-input').value);
  const x2raw = parseFloat(document.getElementById('x2-input').value);

  if (isNaN(x1raw) || isNaN(x2raw) || x1raw === 0 || x2raw === 0) {
    const li = document.createElement('li');
    li.className = 'seq-step';
    li.style.animation = 'none';
    li.style.opacity = '1';
    li.textContent = 'Ingresa dos números distintos de cero para x₁ y x₂.';
    seqStepsEl.appendChild(li);
    return;
  }

  let xs;
  try {
    xs = computeLyness(Fraction.fromNumber(x1raw), Fraction.fromNumber(x2raw));
  } catch (e) {
    const li = document.createElement('li');
    li.className = 'seq-step';
    li.style.animation = 'none';
    li.style.opacity = '1';
    li.textContent = 'Esos valores producen una división por cero en algún paso. Prueba otros números.';
    seqStepsEl.appendChild(li);
    return;
  }

  const labels = [
    { idx: 1, formula: 'x₁ (dado)' },
    { idx: 2, formula: 'x₂ (dado)' },
    { idx: 3, formula: 'x₃ = (1 + x₂) / x₁' },
    { idx: 4, formula: 'x₄ = (1 + x₃) / x₂' },
    { idx: 5, formula: 'x₅ = (1 + x₄) / x₃' },
    { idx: 6, formula: 'x₆ = (1 + x₅) / x₄' },
    { idx: 7, formula: 'x₇ = (1 + x₆) / x₅' },
  ];

  function addStep(i) {
    const li = document.createElement('li');
    li.className = 'seq-step';
    li.style.animationDelay = '0s';
    li.innerHTML = `<span class="step-index">${labels[i].idx}</span>
      <span class="step-formula">${labels[i].formula}</span>
      <span class="step-result">${xs[i].toString()}</span>`;
    seqStepsEl.appendChild(li);
  }

  if (!animate) {
    labels.forEach((_, i) => addStep(i));
    checkPeriod(xs);
    return;
  }

  let i = 0;
  function next() {
    if (i >= labels.length) { checkPeriod(xs); return; }
    addStep(i);
    i++;
    seqTimer = setTimeout(next, 550);
  }
  next();
}

function checkPeriod(xs) {
  const back = xs[5].equals(xs[0]) && xs[6].equals(xs[1]);
  if (back) periodBanner.hidden = false;
}

document.getElementById('btn-play-seq').addEventListener('click', () => renderSequence(true));
document.getElementById('btn-reset-seq').addEventListener('click', () => renderSequence(false));
document.getElementById('btn-random-xy').addEventListener('click', () => {
  document.getElementById('x1-input').value = 1 + Math.floor(Math.random() * 8);
  document.getElementById('x2-input').value = 1 + Math.floor(Math.random() * 8);
  renderSequence(true);
});

renderSequence(false);

/* ============================================================
   SECCIÓN 2 — EXPLORADOR DE LA CUADRÍCULA (Ejemplo 1 del documento)
   Valores verificados: cada diamante cumple ad - bc = 1
   ============================================================ */
const EXAMPLE_ROWS = [
  { values: [0, 0, 0, 0, 0, 0], boundary: true, indent: 1 },
  { values: [1, 1, 1, 1, 1, 1, 1], boundary: false, indent: 0.5 },
  { values: [1, 2, 2, 2, 1, 4, 1], boundary: false, indent: 0, fundamental: [1, 2, 3, 5] }, // Añadido índice 5
  { values: [1, 3, 3, 1, 3, 3], boundary: false, indent: 0.5, fundamental: [1, 2, 4, 5] }, // Añadidos índices 4, 5
  { values: [1, 4, 1, 2, 2, 2], boundary: false, indent: 1, fundamental: [1, 3, 4, 5, 6] },    // Añadidos índices 4, 5, 6
  { values: [1, 1, 1, 1, 1], boundary: false, indent: 1.5 },
  { values: [0, 0, 0, 0], boundary: true, indent: 2 },
];

const grid = document.getElementById('frieze-grid');
const toggleFundamental = document.getElementById('toggle-fundamental');
let gridTimer = null;

function renderGrid(revealAll) {
  grid.innerHTML = '';
  const rowEls = EXAMPLE_ROWS.map(row => {
    const rowEl = document.createElement('div');
    rowEl.className = 'grid-row';
    rowEl.style.marginLeft = `calc(${row.indent} * (var(--cell-size) + var(--grid-gap)))`;
    row.values.forEach((val, i) => {
      const cell = document.createElement('div');
      cell.className = 'grid-cell' + (row.boundary ? ' boundary' : '');
      if (row.fundamental && row.fundamental.includes(i) && toggleFundamental.checked) {
        cell.classList.add('fundamental');
      }
      cell.textContent = val;
      if (revealAll) cell.classList.add('revealed');
      rowEl.appendChild(cell);
    });
    grid.appendChild(rowEl);
    return rowEl;
  });
  return rowEls;
}

function animateGrid() {
  clearTimeout(gridTimer);
  const rowEls = renderGrid(false);
  const maxCols = Math.max(...EXAMPLE_ROWS.map(r => r.values.length));
  let col = 0;
  function step() {
    if (col >= maxCols) return;
    rowEls.forEach(rowEl => {
      const cell = rowEl.children[col];
      if (cell) cell.classList.add('revealed');
    });
    col++;
    gridTimer = setTimeout(step, 300);
  }
  step();
}

document.getElementById('btn-play-grid').addEventListener('click', animateGrid);
document.getElementById('btn-reset-grid').addEventListener('click', () => renderGrid(true));
toggleFundamental.addEventListener('change', () => renderGrid(true));

renderGrid(true);

/* ============================================================
   SECCIÓN 3 — CALCULADORA DE DIAMANTE
   ad - bc = 1
   ============================================================ */
document.getElementById('btn-calc-solve').addEventListener('click', () => {
  const ids = ['calc-a', 'calc-b', 'calc-c', 'calc-d'];
  const vals = {};
  let missing = null;
  ids.forEach(id => {
    const raw = document.getElementById(id).value;
    const key = id.split('-')[1];
    if (raw === '') {
      if (missing) missing = 'multiple';
      else missing = key;
    } else {
      vals[key] = parseFloat(raw);
    }
  });

  const resultEl = document.getElementById('calc-result');
  resultEl.classList.remove('error');

  if (missing === null) {
    const check = vals.a * vals.d - vals.b * vals.c;
    if (Math.abs(check - 1) < 1e-9) {
      resultEl.textContent = `✓ Se cumple la regla: ad − bc = ${check.toFixed(4).replace(/\.?0+$/, '')}`;
    } else {
      resultEl.textContent = `✗ No se cumple: ad − bc = ${check.toFixed(4).replace(/\.?0+$/, '')} (debería ser 1)`;
      resultEl.classList.add('error');
    }
    return;
  }
  if (missing === 'multiple') {
    resultEl.textContent = 'Deja exactamente un campo vacío: el que quieres calcular.';
    resultEl.classList.add('error');
    return;
  }

  try {
    const a = new Fraction(1), b = new Fraction(1); // placeholders, replaced below
    let out;
    const A = vals.a !== undefined ? Fraction.fromNumber(vals.a) : null;
    const B = vals.b !== undefined ? Fraction.fromNumber(vals.b) : null;
    const C = vals.c !== undefined ? Fraction.fromNumber(vals.c) : null;
    const D = vals.d !== undefined ? Fraction.fromNumber(vals.d) : null;

    if (missing === 'a') out = B.mul(C).add(new Fraction(1)).div(D); // a = (1+bc)/d
    if (missing === 'b') out = A.mul(D).sub(new Fraction(1)).div(C); // b = (ad-1)/c
    if (missing === 'c') out = A.mul(D).sub(new Fraction(1)).div(B); // c = (ad-1)/b
    if (missing === 'd') out = B.mul(C).add(new Fraction(1)).div(A); // d = (1+bc)/a

    document.getElementById(`calc-${missing}`).value = out.toString();
    resultEl.textContent = `${missing} = ${out.toString()}`;
  } catch (e) {
    resultEl.textContent = 'No se pudo calcular (¿alguna división por cero?).';
    resultEl.classList.add('error');
  }
});

document.getElementById('btn-calc-clear').addEventListener('click', () => {
  ['calc-a', 'calc-b', 'calc-c', 'calc-d'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('calc-result').textContent = '';
  document.getElementById('calc-result').classList.remove('error');
});

/* ============================================================
   SECCIÓN 4 — CONSTRUCTOR LIBRE
   Estructura: 0s / 1s / fila A (N) / fila B (N-1) / fila C (N-1) / 1s / 0s
   Diamantes validados en vivo:
     A-B (con 1 arriba):        a=A[i], d=A[i+1], b=1,      c=B[i]
     B-C (con A como b):        a=B[i], d=B[i+1], b=A[i+1], c=C[i]
     C-1 (con 1 abajo):         a=C[i], d=C[i+1], b=B[i+1], c=1
   ============================================================ */
const builderGrid = document.getElementById('builder-grid');
let N = 6;

function getBuilderInput(row, col) {
  return builderGrid.querySelector(`input[data-row="${row}"][data-col="${col}"]`);
}

function sanitizeNumber(x) {
  if (!Number.isFinite(x)) return '';
  if (Math.abs(x - Math.round(x)) < 1e-9) return String(Math.round(x));
  return String(Math.round(x * 1e6) / 1e6);
}

function writeBuilderRow(key, values) {
  values.forEach((val, i) => {
    const input = getBuilderInput(key, i);
    if (input) input.value = val == null ? '' : sanitizeNumber(val);
  });
}

function firstColumnReady() {
  const a0 = parseFloat(getBuilderInput('A', 0)?.value ?? '');
  const b0 = parseFloat(getBuilderInput('B', 0)?.value ?? '');
  const c0 = parseFloat(getBuilderInput('C', 0)?.value ?? '');
  return Number.isFinite(a0) && Number.isFinite(b0) && Number.isFinite(c0) &&
    Math.abs(a0) > 1e-12 && Math.abs(b0) > 1e-12 && Math.abs(c0) > 1e-12;
}

function firstColumnAllEqual() {
  const a0 = parseFloat(getBuilderInput('A', 0)?.value ?? '');
  const b0 = parseFloat(getBuilderInput('B', 0)?.value ?? '');
  const c0 = parseFloat(getBuilderInput('C', 0)?.value ?? '');
  if (!Number.isFinite(a0) || !Number.isFinite(b0) || !Number.isFinite(c0)) return false;
  return Math.abs(a0 - b0) < 1e-9 && Math.abs(b0 - c0) < 1e-9;
}

function updateFriezeGreenState() {
  builderGrid.classList.toggle('frieze-green', firstColumnReady() && firstColumnAllEqual());
}

function fillFrieze() {
  // Resetea las columnas calculadas para evitar residuos de ejecuciones previas.
  ['A', 'B', 'C'].forEach(rowKey => {
    builderGrid.querySelectorAll(`input[data-row="${rowKey}"]`).forEach(inp => {
      if (Number(inp.dataset.col) > 0) inp.value = '';
    });
  });

  if (!firstColumnReady()) {
    updateFriezeGreenState();
    validateBuilder();
    return;
  }

  const A = Array(N).fill(null);
  const B = Array(N - 1).fill(null);
  const C = Array(N - 1).fill(null);

  A[0] = parseFloat(getBuilderInput('A', 0).value);
  B[0] = parseFloat(getBuilderInput('B', 0).value);
  C[0] = parseFloat(getBuilderInput('C', 0).value);

  const nextFromDiamond = (a, b, c) => {
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c) || Math.abs(a) < 1e-12) return null;
    return (b * c + 1) / a;
  };

  for (let i = 0; i < N - 1; i++) {
    A[i + 1] = nextFromDiamond(A[i], 1, B[i]);
    if (A[i + 1] == null) break;

    if (i < N - 2) {
      B[i + 1] = nextFromDiamond(B[i], A[i + 1], C[i]);
      if (B[i + 1] == null) break;

      C[i + 1] = nextFromDiamond(C[i], B[i + 1], 1);
      if (C[i + 1] == null) break;
    }
  }

  writeBuilderRow('A', A);
  writeBuilderRow('B', B);
  writeBuilderRow('C', C);
  updateFriezeGreenState();
  validateBuilder();
}

function onBuilderSeedInput() {
  fillFrieze();
}

function buildBuilderGrid() {
  builderGrid.innerHTML = '';
  const rows = [
    { type: 'zero', n: N },
    { type: 'one', n: N },
    { type: 'edit', n: N, key: 'A' },
    { type: 'edit', n: N - 1, key: 'B' },
    { type: 'edit', n: N - 1, key: 'C' },
    { type: 'one', n: N - 1 },
    { type: 'zero', n: N - 1 },
  ];
  const indents = [1, 0.5, 0, 0.5, 1, 1.5, 2];

  rows.forEach((row, r) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'grid-row';
    rowEl.style.marginLeft = `calc(${indents[r]} * (var(--cell-size) + var(--grid-gap)))`;
    for (let i = 0; i < row.n; i++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell revealed';
      if (row.type === 'zero') { cell.classList.add('boundary'); cell.textContent = '0'; }
      else if (row.type === 'one') { cell.textContent = '1'; }
      else {
        cell.classList.add('editable');
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'builder-input';
        input.dataset.row = row.key;
        input.dataset.col = i;
        if (i === 0) {
          input.addEventListener('input', onBuilderSeedInput);
        } else {
          input.readOnly = true;
          input.tabIndex = -1;
        }
        cell.appendChild(input);
      }
      rowEl.appendChild(cell);
    }
    builderGrid.appendChild(rowEl);
  });
}

function readBuilderRow(key) {
  return Array.from(builderGrid.querySelectorAll(`input[data-row="${key}"]`))
    .map(inp => inp.value === '' ? null : parseFloat(inp.value));
}

function cellsForRow(key) {
  return Array.from(builderGrid.querySelectorAll(`input[data-row="${key}"]`)).map(inp => inp.closest('.grid-cell'));
}

function validateBuilder() {
  const A = readBuilderRow('A');
  const B = readBuilderRow('B');
  const C = readBuilderRow('C');
  const cellsA = cellsForRow('A');
  const cellsB = cellsForRow('B');
  const cellsC = cellsForRow('C');

  [...cellsA, ...cellsB, ...cellsC].forEach(c => c.classList.remove('valid', 'invalid'));

  function markDiamond(ok, cells) {
    cells.forEach(c => { if (c) c.classList.add(ok ? 'valid' : 'invalid'); });
  }

  // A-B diamonds (b = 1)
  for (let i = 0; i < A.length - 1; i++) {
    if (A[i] == null || A[i + 1] == null || B[i] == null) continue;
    const ok = Math.abs(A[i] * A[i + 1] - 1 * B[i]) < 1e-9;
    markDiamond(ok, [cellsA[i], cellsA[i + 1], cellsB[i]]);
  }
  // B-C diamonds (b = A[i+1])
  for (let i = 0; i < B.length - 1; i++) {
    if (B[i] == null || B[i + 1] == null || A[i + 1] == null || C[i] == null) continue;
    const ok = Math.abs(B[i] * B[i + 1] - A[i + 1] * C[i]) < 1e-9;
    markDiamond(ok, [cellsB[i], cellsB[i + 1], cellsA[i + 1], cellsC[i]]);
  }
  // C-1 diamonds (c = 1, b = B[i+1])
  for (let i = 0; i < C.length - 1; i++) {
    if (C[i] == null || C[i + 1] == null || B[i + 1] == null) continue;
    const ok = Math.abs(C[i] * C[i + 1] - B[i + 1] * 1) < 1e-9;
    markDiamond(ok, [cellsC[i], cellsC[i + 1], cellsB[i + 1]]);
  }
}

document.getElementById('btn-builder-resize').addEventListener('click', () => {
  const val = parseInt(document.getElementById('builder-cols').value, 10);
  N = Math.min(10, Math.max(3, isNaN(val) ? 6 : val));
  document.getElementById('builder-cols').value = N;
  buildBuilderGrid();
  updateFriezeGreenState();
  validateBuilder();
});

document.getElementById('btn-builder-clear').addEventListener('click', () => {
  builderGrid.querySelectorAll('input').forEach(inp => inp.value = '');
  updateFriezeGreenState();
  validateBuilder();
});

buildBuilderGrid();
updateFriezeGreenState();

/* TODO (ideas para seguir extendiendo con Copilot):
   - Exportar el friso construido como imagen (canvas.toBlob) o PDF.
   - Modo "triangulación de polígono": mostrar la biyección entre frisos
     y triangulaciones de un polígono convexo.
   - Guardar/cargar frisos personalizados con localStorage.
*/