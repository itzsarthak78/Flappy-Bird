const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bird, pipes, score;
let gameRunning = false;
let animationId = null;
let frame = 0;

const birdImg = new Image();
birdImg.src = "assets/bird.png";

/* =========================
   SCREEN CONTROL
========================= */

function startGame() {

  // Hide overlays properly
  document.getElementById("menu").classList.remove("active");
  document.getElementById("gameOver").classList.remove("active");

  canvas.style.display = "block";

  bird = {
    x: 120,
    y: canvas.height / 2,
    w: 60,
    h: 45,
    velocity: 0,
    gravity: 0.25,
    lift: -6
  };

  pipes = [];
  score = 0;
  gameRunning = true;

  spawnPipe();
  loop();
}

function goToMenu() {
  gameRunning = false;
  cancelAnimationFrame(animationId);

  canvas.style.display = "none";

  // Remove game over
  document.getElementById("gameOver").classList.remove("active");

  // Show menu
  document.getElementById("menu").classList.add("active");
}

function exitGame() {
  alert("Thanks for playing!");
}

/* =========================
   PIPE SPAWN
========================= */

function spawnPipe() {
  let gap = 220;
  let top = Math.random() * (canvas.height - gap - 200) + 100;

  pipes.push({
    x: canvas.width + 200,
    w: 85,
    top: top,
    bottom: top + gap,
    passed: false
  });

  if (gameRunning) {
    setTimeout(spawnPipe, 2000);
  }
}

/* =========================
   DRAW BIRD
========================= */

function drawBird() {
  ctx.save();
  ctx.translate(bird.x, bird.y);

  let rotation = Math.max(Math.min(bird.velocity / 25, 0.4), -0.4);
  ctx.rotate(rotation);

  let flapScale = 1 + Math.sin(frame * 0.3) * 0.05;
  ctx.scale(flapScale, flapScale);

  ctx.drawImage(birdImg, -bird.w/2, -bird.h/2, bird.w, bird.h);

  ctx.restore();
}

/* =========================
   DRAW PIPES (WITH CAPS)
========================= */

function drawPipes() {
  pipes.forEach((p, i) => {

    p.x -= 2.2;

    // Pipe body
    ctx.fillStyle = "#2ecc40";
    ctx.fillRect(p.x, 0, p.w, p.top);
    ctx.fillRect(p.x, p.bottom, p.w, canvas.height - p.bottom - 100);

    // Pipe caps
    ctx.fillStyle = "#27ae60";
    ctx.fillRect(p.x - 5, p.top - 25, p.w + 10, 25);
    ctx.fillRect(p.x - 5, p.bottom, p.w + 10, 25);

    // Collision
    if (
      bird.x + bird.w/2 > p.x &&
      bird.x - bird.w/2 < p.x + p.w &&
      (bird.y - bird.h/2 < p.top ||
       bird.y + bird.h/2 > p.bottom)
    ) {
      endGame();
    }

    // Score
    if (!p.passed && p.x + p.w < bird.x) {
      score++;
      p.passed = true;
    }

    // Remove offscreen pipes
    if (p.x + p.w < 0) {
      pipes.splice(i, 1);
    }
  });
}

/* =========================
   GROUND
========================= */

function drawGround() {
  ctx.fillStyle = "#ded895";
  ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
}

/* =========================
   PHYSICS
========================= */

function updateBird() {
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  if (bird.y + bird.h/2 > canvas.height - 100) {
    endGame();
  }

  if (bird.y - bird.h/2 < 0) {
    bird.y = bird.h/2;
    bird.velocity = 0;
  }
}

/* =========================
   GAME LOOP
========================= */

function loop() {
  if (!gameRunning) return;

  frame++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updateBird();
  drawBird();
  drawPipes();
  drawGround();

  ctx.fillStyle = "white";
  ctx.font = "bold 50px Arial";
  ctx.fillText(score, canvas.width / 2 - 10, 100);

  animationId = requestAnimationFrame(loop);
}

/* =========================
   END GAME
========================= */

function endGame() {
  if (!gameRunning) return;

  gameRunning = false;
  cancelAnimationFrame(animationId);

  document.getElementById("scoreText").innerHTML =
    "Score: " + score;

  document.getElementById("gameOver").classList.add("active");
}

/* =========================
   CONTROLS
========================= */

document.addEventListener("click", () => {
  if (gameRunning) {
    bird.velocity = bird.lift;
  }
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && gameRunning) {
    bird.velocity = bird.lift;
  }
});
