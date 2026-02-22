const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let birdY, velocity, gravity, pipes, score, gameRunning, groundX, wingUp;

function startGame() {
  document.getElementById("menu").style.display = "none";
  canvas.style.display = "block";

  birdY = canvas.height / 2;
  velocity = 0;
  gravity = 0.5;
  pipes = [];
  score = 0;
  groundX = 0;
  wingUp = true;
  gameRunning = true;

  spawnPipe();
  gameLoop();
}

function restartGame() {
  document.getElementById("gameOver").style.display = "none";
  startGame();
}

function spawnPipe() {
  let gap = 180;
  let topHeight = Math.random() * (canvas.height - gap - 200) + 50;

  pipes.push({
    x: canvas.width,
    top: topHeight,
    bottom: topHeight + gap
  });

  if (gameRunning)
    setTimeout(spawnPipe, 1500);
}

function drawBackground() {
  let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#70c5ce");
  gradient.addColorStop(1, "#ffffff");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Clouds
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(200, 150, 30, 0, Math.PI * 2);
  ctx.arc(230, 150, 40, 0, Math.PI * 2);
  ctx.arc(260, 150, 30, 0, Math.PI * 2);
  ctx.fill();
}

function drawBird() {
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(100, birdY, 20, 0, Math.PI * 2);
  ctx.fill();

  // Wing animation
  ctx.fillStyle = "orange";
  ctx.beginPath();
  if (wingUp) {
    ctx.ellipse(95, birdY, 15, 8, 0, 0, Math.PI * 2);
  } else {
    ctx.ellipse(95, birdY + 10, 15, 8, 0, 0, Math.PI * 2);
  }
  ctx.fill();

  wingUp = !wingUp;
}

function drawPipes() {
  ctx.fillStyle = "green";
  pipes.forEach((pipe, index) => {
    pipe.x -= 3;

    ctx.fillRect(pipe.x, 0, 80, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, 80, canvas.height);

    // Collision
    if (
      120 > pipe.x &&
      80 < pipe.x + 80 &&
      (birdY - 20 < pipe.top || birdY + 20 > pipe.bottom)
    ) {
      endGame();
    }

    if (pipe.x + 80 < 100 && !pipe.passed) {
      score++;
      pipe.passed = true;
    }

    if (pipe.x + 80 < 0) {
      pipes.splice(index, 1);
    }
  });
}

function drawGround() {
  groundX -= 3;
  if (groundX <= -canvas.width) groundX = 0;

  ctx.fillStyle = "#ded895";
  ctx.fillRect(groundX, canvas.height - 100, canvas.width, 100);
  ctx.fillRect(groundX + canvas.width, canvas.height - 100, canvas.width, 100);
}

function gameLoop() {
  if (!gameRunning) return;

  drawBackground();

  velocity += gravity;
  birdY += velocity;

  drawBird();
  drawPipes();
  drawGround();

  ctx.fillStyle = "white";
  ctx.font = "50px Arial";
  ctx.fillText(score, canvas.width / 2, 100);

  if (birdY > canvas.height - 100 || birdY < 0) {
    endGame();
  }

  requestAnimationFrame(gameLoop);
}

function endGame() {
  gameRunning = false;
  document.getElementById("gameOver").style.display = "block";
  document.getElementById("scoreText").innerText = "Score: " + score;
}

document.addEventListener("click", () => {
  velocity = -9;
});
