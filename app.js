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

const horizonY = 90;
const groundY = canvas.height - 60;
const fieldHalfWidth = 260;
const maxDepth = 1;
const wallDepth = 0.55;
const keeperDepth = 1;

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

const curveAt = (t) => {
  const { a, b, c } = getTrajectory();
  return a * t * t + b * t + c;
};

const verticalArc = (t) => {
  const peak = 0.65;
  return Math.max(0, peak * (1 - Math.pow(t * 2 - 1, 2)));
};

const project = (x, y, z) => {
  const depth = Math.min(Math.max(z / maxDepth, 0), 1);
  const scale = 1 - depth * 0.55;
  const centerX = canvas.width / 2;
  const groundLine = groundY - (groundY - horizonY) * depth;
  return {
    x: centerX + x * scale,
    y: groundLine - y * 140 * scale,
    scale,
  };
};

const drawField = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, canvas.width, horizonY + 10);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = "#0b3d2e";
  ctx.fillRect(0, horizonY, canvas.width, canvas.height - horizonY);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - fieldHalfWidth, groundY);
  ctx.lineTo(canvas.width / 2 - fieldHalfWidth * 0.45, horizonY + 6);
  ctx.moveTo(canvas.width / 2 + fieldHalfWidth, groundY);
  ctx.lineTo(canvas.width / 2 + fieldHalfWidth * 0.45, horizonY + 6);
  ctx.stroke();
  ctx.restore();
};

const drawGoal = () => {
  const goalWidth = fieldHalfWidth * 0.9;
  const goalHeight = 120;
  const { x, y, scale } = project(0, 0, keeperDepth);
  const width = goalWidth * scale;
  const height = goalHeight * scale;

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 3 * scale;
  ctx.strokeRect(x - width / 2, y - height, width, height);
  ctx.restore();
};

const drawWall = () => {
  const wallWidth = fieldHalfWidth * 0.5;
  const wallHeight = 80;
  const { x, y, scale } = project(0, 0, wallDepth);
  const width = wallWidth * scale;
  const height = wallHeight * scale;

  ctx.save();
  ctx.fillStyle = "#111827";
  ctx.fillRect(x - width / 2, y - height, width, height);
  ctx.restore();
};

const drawKeeper = () => {
  const keeperWidth = 40;
  const keeperHeight = 70;
  const { x, y, scale } = project(0, 0, keeperDepth);
  const width = keeperWidth * scale;
  const height = keeperHeight * scale;

  ctx.save();
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(x - width / 2, y - height, width, height);
  ctx.restore();
};

const drawTrajectory = () => {
  ctx.save();
  ctx.strokeStyle = "#38bdf8";
  ctx.setLineDash([8, 6]);
  ctx.lineWidth = 3;
  ctx.beginPath();

  const steps = 120;
  const lateralScale = 18;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const lateral = curveAt(t) * lateralScale;
    const height = verticalArc(t);
    const { x, y } = project(lateral, height, t);
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();
  ctx.restore();
};

const drawBall = () => {
  const lateralScale = 18;
  const lateral = curveAt(progress) * lateralScale;
  const height = verticalArc(progress);
  const { x, y, scale } = project(lateral, height, progress);
  const radius = 12 * scale + 4;

  ctx.save();
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const renderScene = () => {
  drawField();
  drawGoal();
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
