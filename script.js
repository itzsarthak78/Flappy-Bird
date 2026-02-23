const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bird, pipes, score;
let gameRunning = false;
let animationId;
let frame = 0;

/* SCREEN CONTROL */
function startGame() {
  document.getElementById("menu").classList.remove("active");
  document.getElementById("gameOver").classList.remove("active");
  canvas.style.display = "block";

  bird = {
    x: 120,
    y: canvas.height / 2,
    r: 20,
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
  document.getElementById("menu").classList.add("active");
}

function exitGame() {
  alert("Thanks for playing!");
}

/* PIPE SPAWN */
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

  if (gameRunning) setTimeout(spawnPipe, 2000);
}

/* BIRD DRAW */
function drawBird() {
  ctx.save();
  ctx.translate(bird.x, bird.y);

  let rotation = Math.max(Math.min(bird.velocity / 25, 0.4), -0.4);
  ctx.rotate(rotation);

  // Body
  ctx.fillStyle="yellow";
  ctx.beginPath();
  ctx.arc(0,0,bird.r,0,Math.PI*2);
  ctx.fill();

  // Wing animation
  ctx.fillStyle="orange";
  ctx.beginPath();
  ctx.ellipse(-5, Math.sin(frame*0.3)*6, 14, 8, 0, 0, Math.PI*2);
  ctx.fill();

  // Eye
  ctx.fillStyle="white";
  ctx.beginPath();
  ctx.arc(8,-5,6,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle="black";
  ctx.beginPath();
  ctx.arc(10,-5,3,0,Math.PI*2);
  ctx.fill();

  // Beak
  ctx.fillStyle="orange";
  ctx.beginPath();
  ctx.moveTo(15,0);
  ctx.lineTo(28,5);
  ctx.lineTo(15,10);
  ctx.fill();

  ctx.restore();
}

/* PIPES */
function drawPipes() {
  pipes.forEach((p,i)=>{
    p.x -= 2.2;

    ctx.fillStyle="#2ecc40";
    ctx.fillRect(p.x,0,p.w,p.top);
    ctx.fillRect(p.x,p.bottom,p.w,canvas.height-p.bottom-100);

    ctx.fillStyle="#27ae60";
    ctx.fillRect(p.x-5,p.top-25,p.w+10,25);
    ctx.fillRect(p.x-5,p.bottom,p.w+10,25);

    if(bird.x+bird.r>p.x && bird.x-bird.r<p.x+p.w &&
      (bird.y-bird.r<p.top || bird.y+bird.r>p.bottom)){
      endGame();
    }

    if(!p.passed && p.x+p.w<bird.x){
      score++;
      p.passed=true;
    }

    if(p.x+p.w<0) pipes.splice(i,1);
  });
}

/* GROUND */
function drawGround() {
  ctx.fillStyle="#ded895";
  ctx.fillRect(0,canvas.height-100,canvas.width,100);
}

/* PHYSICS */
function updateBird() {
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  if(bird.y+bird.r>canvas.height-100) endGame();
  if(bird.y-bird.r<0){
    bird.y=bird.r;
    bird.velocity=0;
  }
}

/* LOOP */
function loop(){
  if(!gameRunning) return;

  frame++;
  ctx.clearRect(0,0,canvas.width,canvas.height);

  updateBird();
  drawBird();
  drawPipes();
  drawGround();

  ctx.fillStyle="white";
  ctx.font="bold 50px Arial";
  ctx.fillText(score,canvas.width/2-10,100);

  animationId = requestAnimationFrame(loop);
}

/* END */
function endGame(){
  gameRunning=false;
  cancelAnimationFrame(animationId);

  document.getElementById("scoreText").innerHTML =
    "Score: " + score;

  document.getElementById("gameOver").classList.add("active");
}

document.addEventListener("click",()=>{
  if(gameRunning) bird.velocity=bird.lift;
});
document.addEventListener("keydown",e=>{
  if(e.code==="Space" && gameRunning) bird.velocity=bird.lift;
});
