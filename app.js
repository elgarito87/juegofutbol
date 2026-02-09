const canvas = document.getElementById("fieldCanvas");
const ctx = canvas.getContext("2d");

const coefA = document.getElementById("coefA");
const coefB = document.getElementById("coefB");
const coefC = document.getElementById("coefC");

const valA = document.getElementById("valA");
const valB = document.getElementById("valB");
const valC = document.getElementById("valC");

const eqA = document.getElementById("eq-a");
const eqB = document.getElementById("eq-b");
const eqC = document.getElementById("eq-c");

const playBtn = document.getElementById("playBtn");
const resetBtn = document.getElementById("resetBtn");

const fieldPadding = 60;
const wallX = 0.55;
const wallHeight = 0.32;
const keeperX = 0.88;
const keeperHeight = 0.22;

let progress = 0;
let isPlaying = false;
let rafId;

const formatNumber = (value) => Number(value).toFixed(1);

const updateLabels = () => {
  valA.textContent = formatNumber(coefA.value);
  valB.textContent = formatNumber(coefB.value);
  valC.textContent = formatNumber(coefC.value);
  eqA.textContent = formatNumber(coefA.value);
  eqB.textContent = formatNumber(coefB.value);
  eqC.textContent = formatNumber(coefC.value);
};

const getTrajectory = () => {
  const a = Number(coefA.value);
  const b = Number(coefB.value);
  const c = Number(coefC.value);
  return { a, b, c };
};

const toCanvasCoords = (x, y) => {
  const width = canvas.width - fieldPadding * 2;
  const height = canvas.height - fieldPadding * 2;
  const canvasX = fieldPadding + x * width;
  const canvasY = canvas.height - fieldPadding - y * height;
  return { x: canvasX, y: canvasY };
};

const computeY = (x) => {
  const { a, b, c } = getTrajectory();
  return a * x * x + b * x + c;
};

const drawField = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 2;
  ctx.strokeRect(fieldPadding, fieldPadding, canvas.width - fieldPadding * 2, canvas.height - fieldPadding * 2);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.fillRect(fieldPadding, canvas.height / 2 - 2, canvas.width - fieldPadding * 2, 4);
  ctx.restore();
};

const drawWall = () => {
  const { x } = toCanvasCoords(wallX, 0);
  const { y } = toCanvasCoords(0, wallHeight);
  const wallWidth = 26;
  const wallHeightPx = canvas.height - fieldPadding - y;

  ctx.save();
  ctx.fillStyle = "#111827";
  ctx.fillRect(x - wallWidth / 2, y, wallWidth, wallHeightPx);
  ctx.restore();
};

const drawKeeper = () => {
  const { x } = toCanvasCoords(keeperX, 0);
  const { y } = toCanvasCoords(0, keeperHeight);
  const keeperWidth = 30;
  const keeperHeightPx = canvas.height - fieldPadding - y;

  ctx.save();
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(x - keeperWidth / 2, y, keeperWidth, keeperHeightPx);
  ctx.restore();
};

const drawTrajectory = () => {
  ctx.save();
  ctx.strokeStyle = "#2563eb";
  ctx.setLineDash([8, 6]);
  ctx.lineWidth = 3;
  ctx.beginPath();

  const steps = 120;
  for (let i = 0; i <= steps; i += 1) {
    const x = i / steps;
    const y = computeY(x);
    const { x: canvasX, y: canvasY } = toCanvasCoords(x, y + 0.25);
    if (i === 0) {
      ctx.moveTo(canvasX, canvasY);
    } else {
      ctx.lineTo(canvasX, canvasY);
    }
  }

  ctx.stroke();
  ctx.restore();
};

const drawBall = () => {
  const x = progress;
  const y = computeY(x) + 0.25;
  const { x: canvasX, y: canvasY } = toCanvasCoords(x, y);

  ctx.save();
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.arc(canvasX, canvasY, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const renderScene = () => {
  drawField();
  drawTrajectory();
  drawWall();
  drawKeeper();
  drawBall();
};

const animate = () => {
  if (!isPlaying) return;
  progress += 0.006;
  if (progress >= 1) {
    progress = 1;
    isPlaying = false;
    playBtn.textContent = "Repetir tiro";
  }
  renderScene();
  rafId = requestAnimationFrame(animate);
};

const startAnimation = () => {
  if (isPlaying) {
    isPlaying = false;
    playBtn.textContent = "Continuar";
    if (rafId) cancelAnimationFrame(rafId);
    return;
  }
  isPlaying = true;
  playBtn.textContent = "Pausar";
  rafId = requestAnimationFrame(animate);
};

const resetAnimation = () => {
  isPlaying = false;
  progress = 0;
  playBtn.textContent = "Iniciar tiro";
  if (rafId) cancelAnimationFrame(rafId);
  renderScene();
};

[coefA, coefB, coefC].forEach((input) => {
  input.addEventListener("input", () => {
    updateLabels();
    renderScene();
  });
});

playBtn.addEventListener("click", startAnimation);
resetBtn.addEventListener("click", resetAnimation);

updateLabels();
renderScene();
