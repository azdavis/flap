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

let yPos = 10 * dim;
let yVel = 0;
let walls = [];
let ticks = wallTicks;

function shouldKeepWall(w) {
  return w.xPos > -dim;
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

function drawWall(xPos, yPos, wallX, wallY, wallH) {
  const oldFill = cx.fillStyle;
  if (intersect2d(xPos, yPos, dim, dim, wallX, wallY, dim, wallH)) {
    cx.fillStyle = "red";
  }
  cx.fillRect(wallX, wallY, dim, wallH);
  cx.fillStyle = oldFill;
}

function tick() {
  cx.clearRect(0, 0, innerWidth, innerHeight);
  if (ticks === wallTicks) {
    walls.push({ r: Math.random(), xPos: innerWidth });
    ticks = 0;
  } else {
    ticks++;
  }
  if (!walls.every(shouldKeepWall)) {
    walls = walls.filter(shouldKeepWall);
  }
  const xPos = Math.floor(0.2 * innerWidth);
  const maxHeight = innerHeight - dim;
  yPos += yVel;
  if (yPos <= 0) {
    yPos = 0;
    yVel = 0;
  } else if (yPos > maxHeight) {
    yPos = maxHeight;
    yVel = 0;
  }
  yVel += gravityAccel;
  for (let i = 0; i < walls.length; i++) {
    walls[i].xPos -= wallVel;
    const wallX = walls[i].xPos;
    const topH = Math.floor((innerHeight - wallGap) * walls[i].r);
    const botY = topH + wallGap;
    drawWall(xPos, yPos, wallX, 0, topH);
    drawWall(xPos, yPos, wallX, botY, innerHeight - botY);
  }
  cx.fillRect(xPos, yPos, dim, dim);
  requestAnimationFrame(tick);
}

tick();

addEventListener("keydown", (ev) => {
  const key = ev.key;
  if (key === " ") {
    yVel = jumpVel;
  }
});

addEventListener("click", () => {
  yVel = jumpVel;
});
