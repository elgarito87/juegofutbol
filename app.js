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
  const width = canvas.width;
  const height = canvas.height;

  // 1. Dibujar césped (franjas)
  const stripeHeight = 40;
  const numStripes = Math.ceil(height / stripeHeight);

  for (let i = 0; i < numStripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? "#4ade80" : "#22c55e"; // Tonos de verde
    ctx.fillRect(0, i * stripeHeight, width, stripeHeight);
  }

  // 2. Dibujar líneas del campo
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
  ctx.lineWidth = 3;

  // Borde exterior
  ctx.strokeRect(fieldPadding, fieldPadding, width - fieldPadding * 2, height - fieldPadding * 2);

  const fieldW = width - fieldPadding * 2;
  const fieldH = height - fieldPadding * 2;
  const centerX = width / 2;
  const centerY = height / 2;

  // Línea de medio campo
  ctx.beginPath();
  ctx.moveTo(centerX, fieldPadding);
  ctx.lineTo(centerX, height - fieldPadding);
  ctx.stroke();

  // Círculo central
  ctx.beginPath();
  ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
  ctx.stroke();

  // Punto central
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
  ctx.fill();

  // Área grande (izquierda - portería propia simulada si fuera necesario, pero aquí solo dibujamos la izquierda y derecha para contexto)
  // En este "tiro libre", asumimos que tiramos hacia la derecha (donde está el portero).
  // Dibujemos el área penal en el lado derecho (destino) y una línea de banda.

  // Área penal derecha (donde está el portero)
  const penaltyBoxWidth = 120;
  const penaltyBoxHeight = 240;
  const goalAreaWidth = 40;
  const goalAreaHeight = 100;

  // Coordenadas base del lado derecho (línea de meta)
  const rightGoalLineX = width - fieldPadding;
  const goalCenterY = height / 2;

  // Área grande
  ctx.strokeRect(rightGoalLineX - penaltyBoxWidth, goalCenterY - penaltyBoxHeight / 2, penaltyBoxWidth, penaltyBoxHeight);

  // Área chica
  ctx.strokeRect(rightGoalLineX - goalAreaWidth, goalCenterY - goalAreaHeight / 2, goalAreaWidth, goalAreaHeight);

  // Punto penal
  ctx.beginPath();
  ctx.arc(rightGoalLineX - 80, goalCenterY, 3, 0, Math.PI * 2);
  ctx.fill();

  // Arco del área (semicírculo)
  ctx.beginPath();
  ctx.arc(rightGoalLineX - 80, goalCenterY, 50, 0.65 * Math.PI, 1.35 * Math.PI);
  ctx.stroke();

  // Portería (postes visuales)
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#e5e7eb";
  ctx.beginPath();
  ctx.moveTo(rightGoalLineX, goalCenterY - 60); // Poste superior
  ctx.lineTo(rightGoalLineX + 15, goalCenterY - 60);
  ctx.moveTo(rightGoalLineX, goalCenterY + 60); // Poste inferior
  ctx.lineTo(rightGoalLineX + 15, goalCenterY + 60);
  ctx.stroke();

  ctx.restore();
};

const drawWall = () => {
  const { x } = toCanvasCoords(wallX, 0);
  const { y } = toCanvasCoords(0, wallHeight);
  const wallWidth = 26;
  const wallHeightPx = canvas.height - fieldPadding - y;

  ctx.save();
  // Sombra de la barrera
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(x - wallWidth / 2 + 5, y + 5, wallWidth, wallHeightPx);

  // Barrera (siluetas estilizadas)
  ctx.fillStyle = "#1e293b"; // Color uniforme camiseta
  // Dibujar 3 figuras simples para simular barrera
  const playerWidth = wallWidth / 3;
  for (let i = 0; i < 3; i++) {
    const px = x - wallWidth / 2 + i * playerWidth;
    // Cuerpo
    ctx.fillRect(px, y, playerWidth - 2, wallHeightPx);
    // Cabeza
    ctx.beginPath();
    ctx.arc(px + playerWidth / 2 - 1, y, playerWidth / 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};

const drawKeeper = () => {
  const { x } = toCanvasCoords(keeperX, 0);
  const { y } = toCanvasCoords(0, keeperHeight);
  const keeperWidth = 30;
  const keeperHeightPx = canvas.height - fieldPadding - y;

  ctx.save();

  // Sombra
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(x + 5, canvas.height - fieldPadding, 15, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Portero estilizado
  ctx.fillStyle = "#ef4444"; // Camiseta roja

  // Cuerpo
  ctx.fillRect(x - 10, y, 20, keeperHeightPx);

  // Cabeza
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fillStyle = "#fecaca"; // Piel
  ctx.fill();

  // Brazos (simulando posición de alerta)
  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x - 10, y + 10);
  ctx.lineTo(x - 25, y - 5); // Brazo izquierdo arriba
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + 10, y + 10);
  ctx.lineTo(x + 25, y - 5); // Brazo derecho arriba
  ctx.stroke();

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

  // Sombra en el suelo (perspectiva simple)
  // Calculamos la altura visual sobre el "suelo" (y=0) para atenuar la sombra
  const groundY = 0;
  const heightAboveGround = y;
  const { x: groundCanvasX, y: groundCanvasY } = toCanvasCoords(x, 0);

  const shadowAlpha = Math.max(0, 0.4 - heightAboveGround * 0.1);
  const shadowScale = Math.max(0.5, 1 - heightAboveGround * 0.2);

  ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
  ctx.beginPath();
  ctx.ellipse(groundCanvasX, groundCanvasY, 12 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Balón
  ctx.translate(canvasX, canvasY);
  // Rotación basada en el avance para dar efecto de rodar/girar
  ctx.rotate(progress * 20);

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Patrón simple (pentágonos simulados)
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(4, -4);
  ctx.lineTo(12, 0);
  ctx.lineTo(4, 4);
  ctx.lineTo(0, 12);
  ctx.lineTo(-4, 4);
  ctx.lineTo(-12, 0);
  ctx.lineTo(-4, -4);
  ctx.closePath();
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
