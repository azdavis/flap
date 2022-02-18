// turn off some weird behavior
"use strict";

// canvas setup
// ============

// create a canvas element.
const canvas = document.createElement("canvas");
// get its two-dimensional rendering context.
const cx = canvas.getContext("2d");

// note that the x (horizontal) increases to the right, and y (vertical)
// increases down.
//
//           (0, 0) -> +-------------------------+ <- (innerWidth, 0)
//                     |                         |
//                     |                         |
//                     |                         |
//                     |                         |
//                     |                         |
// (0, innerHeight) -> +-------------------------+ <- (innerWidth, innerHeight)

// resizes the canvas to be the size of the entire window. there's a bit of
// weird stuff with devicePixelRatio to make sure high pixel density screens
// (like apple 'retina' screens) look good.
function resizeCanvas() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  cx.scale(devicePixelRatio, devicePixelRatio);
}

// call that function, resizing the canvas.
resizeCanvas();
// ensure that whenever the window is resized, so too is the canvas.
addEventListener("resize", resizeCanvas);
// add the canvas to the page (i.e. the document's body).
document.body.appendChild(canvas);

// constants
// =========

// the width and height of the player, and the width of walls.
const dim = 50;
// how much space between the upper and lower parts of a single wall.
const wallGap = 6 * dim;
// how fast the player returns to the ground.
const gravityAccel = 0.5;
// how fast the player moves when jumping.
const jumpVel = -8;
// how fast walls advance towards the player.
const wallVel = 2;
// how many ticks between walls appearing.
const wallTicks = 200;

// helper functions
// ================

// returns whether we should keep this wall. once a wall scrolls off the screen
// to the left we should delete it, so we should keep it if it hasn't done that
// yet.
function shouldKeepWall(w) {
  return w.x > -dim;
}

// returns whether a line segment starting at aS and ending at aE (with aS <=
// aE) overlaps with a line segment in the same dimension starting at bS and
// ending at bE (with bS <= bE).
function intersect1d(aS, aE, bS, bE) {
  return aS < bS ? bS < aE : aS < bE;
}

// returns whether a rectangle at position (ax, ay), width aw, and height ah,
// intersects with a rectangle at position (bx, by), width bw, and height bh.
function intersect2d(ax, ay, aw, ah, bx, by, bw, bh) {
  return (
    intersect1d(ax, ax + aw, bx, bx + bw) &&
    intersect1d(ay, ay + ah, by, by + bh)
  );
}

// draws a wall. the player is at (playerX, playerY), the wall is at (wallX,
// wallY) and has height wallH. (the player as always has width and height equal
// to dim and the wall has width equal to dim).
function drawWall(playerX, playerY, wallX, wallY, wallH) {
  // draw the wall as red if the player intersects with it.
  const hit = intersect2d(playerX, playerY, dim, dim, wallX, wallY, dim, wallH);
  cx.fillStyle = hit ? "#a55" : "#55a";
  // actually draw the wall. (will be in red if we intersected, per above)
  cx.fillRect(wallX, wallY, dim, wallH);
}

// mutable state
// =============

// the y position of the player.
let playerY = 10 * dim;
// the y velocity of the player.
let playerVel = 0;
// the walls. each will be an object {r: number, x: number}. x is its x
// position, and r (with 0 < r < 1) tells where the gap in the wall is.
let walls = [];
// the current tick counter. start it at wallTicks so we immediately create a
// wall.
let ticks = wallTicks;

// main logic
// ==========

// this will get called every frame. here we update the mutable state and
// re-draw the canvas.
function tick() {
  // first clear the whole canvas.
  cx.clearRect(0, 0, innerWidth, innerHeight);
  // if it's time to add a new wall...
  if (ticks === wallTicks) {
    // ...add a new wall. make the gap randomly positioned and the wall start
    // all the way on the right.
    walls.push({ r: Math.random(), x: innerWidth });
    // reset the tick counter.
    ticks = 0;
  } else {
    // ...else just increment the tick counter.
    ticks++;
  }
  // if not every wall should be kept...
  if (!walls.every(shouldKeepWall)) {
    /// ...retain only those ones which should be kept.
    walls = walls.filter(shouldKeepWall);
  }
  // the player always is mostly to the left. we have to compute this here in
  // case the window changes size, which causes the global variable innerWidth
  // to change.
  const playerX = Math.floor(0.2 * innerWidth);
  // the player cannot go higher than this. again, innerHeight may change when
  // we resize the window, so we must compute this here.
  const maxY = innerHeight - dim;
  // increase the player's y position by the player's velocity. note that the
  // velocity may be negative. note also that (0, 0) is the upper left.
  playerY += playerVel;
  // stop the player if we're on the ground or hitting the ceiling.
  if (playerY <= 0) {
    playerY = 0;
    playerVel = 0;
  } else if (playerY > maxY) {
    playerY = maxY;
    playerVel = 0;
  }
  // increase the velocity by gravity.
  playerVel += gravityAccel;
  // move and draw all the walls.
  for (let i = 0; i < walls.length; i++) {
    // move the wall to the left.
    walls[i].x -= wallVel;
    const wallX = walls[i].x;
    const topH = Math.floor((innerHeight - wallGap) * walls[i].r);
    const botY = topH + wallGap;
    drawWall(playerX, playerY, wallX, 0, topH);
    drawWall(playerX, playerY, wallX, botY, innerHeight - botY);
  }
  // draw the player.
  cx.fillStyle = "#5a5";
  cx.fillRect(playerX, playerY, dim, dim);
  // call this function again at the browser's next convenience.
  requestAnimationFrame(tick);
}

// enable jumping
// ==============

// jump when we hit the space bar.
addEventListener("keydown", (ev) => {
  if (ev.key === " ") {
    playerVel = jumpVel;
  }
});

// jump when we click anywhere on the screen.
addEventListener("click", () => {
  playerVel = jumpVel;
});

// start the app
// =============

tick();
