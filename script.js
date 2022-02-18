const canvas = document.createElement("canvas");
const cx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  cx.scale(devicePixelRatio, devicePixelRatio);
}

resizeCanvas();
addEventListener("resize", resizeCanvas);
document.body.appendChild(canvas);

const dim = 50;
const wallGap = 6 * dim;
const gravityAccel = 0.5;
const jumpVel = -8;
const wallVel = 2;
const wallTicks = 200;

function shouldKeepWall(w) {
  return w.x > -dim;
}

function intersect1d(aS, aE, bS, bE) {
  return aS < bS ? bS < aE : aS < bE;
}

function intersect2d(ax, ay, aw, ah, bx, by, bw, bh) {
  return (
    intersect1d(ax, ax + aw, bx, bx + bw) &&
    intersect1d(ay, ay + ah, by, by + bh)
  );
}

function drawWall(playerX, playerY, wallX, wallY, wallH) {
  const oldFill = cx.fillStyle;
  if (intersect2d(playerX, playerY, dim, dim, wallX, wallY, dim, wallH)) {
    cx.fillStyle = "red";
  }
  cx.fillRect(wallX, wallY, dim, wallH);
  cx.fillStyle = oldFill;
}

let playerY = 10 * dim;
let playerVel = 0;
let walls = [];
let ticks = wallTicks;

function tick() {
  cx.clearRect(0, 0, innerWidth, innerHeight);
  if (ticks === wallTicks) {
    walls.push({ r: Math.random(), x: innerWidth });
    ticks = 0;
  } else {
    ticks++;
  }
  if (!walls.every(shouldKeepWall)) {
    walls = walls.filter(shouldKeepWall);
  }
  const playerX = Math.floor(0.2 * innerWidth);
  const maxY = innerHeight - dim;
  playerY += playerVel;
  if (playerY <= 0) {
    playerY = 0;
    playerVel = 0;
  } else if (playerY > maxY) {
    playerY = maxY;
    playerVel = 0;
  }
  playerVel += gravityAccel;
  for (let i = 0; i < walls.length; i++) {
    walls[i].x -= wallVel;
    const wallX = walls[i].x;
    const topH = Math.floor((innerHeight - wallGap) * walls[i].r);
    const botY = topH + wallGap;
    drawWall(playerX, playerY, wallX, 0, topH);
    drawWall(playerX, playerY, wallX, botY, innerHeight - botY);
  }
  cx.fillRect(playerX, playerY, dim, dim);
  requestAnimationFrame(tick);
}

tick();

addEventListener("keydown", (ev) => {
  const key = ev.key;
  if (key === " ") {
    playerVel = jumpVel;
  }
});

addEventListener("click", () => {
  playerVel = jumpVel;
});
