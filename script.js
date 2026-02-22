const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bird, pipes, score, highScore;
let gameRunning = false;
let frame = 0;

highScore = localStorage.getItem("flappyHighScore") || 0;

// ===== START GAME =====
function startGame() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("gameOver").style.display = "none";
  canvas.style.display = "block";

  bird = {
    x: 120,
    y: canvas.height / 2,
    r: 20,
    velocity: 0,
    gravity: 0.35,   // 🔥 Slower fall
    lift: -8         // 🔥 Softer jump
  };

  pipes = [];
  score = 0;
  gameRunning = true;

  // First pipe instantly
  spawnPipe();

  loop();
}

// ===== PIPE SPAWN (WITH MINIMUM DISTANCE GAP) =====
function spawnPipe() {

  const gapHeight = 200;
  const pipeWidth = 90;

  let topHeight = Math.random() * 
      (canvas.height - gapHeight - 200) + 80;

  pipes.push({
    x: canvas.width + 300, // 🔥 Spawn far right (minimum 2 pipe gap distance)
    w: pipeWidth,
    top: topHeight,
    bottom: topHeight + gapHeight,
    passed: false
  });

  if (gameRunning)
    setTimeout(spawnPipe, 2200); // 🔥 More time gap between pipes
}

// ===== BACKGROUND =====
function drawBackground() {
  let grad = ctx.createLinearGradient(0,0,0,canvas.height);
  grad.addColorStop(0,"#4ec0ca");
  grad.addColorStop(1,"#b2e6ff");
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,canvas.width,canvas.height);
}

// ===== BIRD =====
function drawBird() {
  ctx.save();
  ctx.translate(bird.x,bird.y);
  ctx.rotate(bird.velocity/18); // smoother rotation

  ctx.fillStyle="yellow";
  ctx.beginPath();
  ctx.arc(0,0,bird.r,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle="orange";
  ctx.beginPath();
  ctx.ellipse(-5,Math.sin(frame*0.25)*6,15,8,0,0,Math.PI*2);
  ctx.fill();

  ctx.restore();
}

// ===== PIPES =====
function drawPipes() {
  pipes.forEach((p,i)=>{
    p.x -= 3; // slightly slower movement

    // Body
    ctx.fillStyle="#2ecc40";
    ctx.fillRect(p.x,0,p.w,p.top);
    ctx.fillRect(p.x,p.bottom,p.w,canvas.height-p.bottom-100);

    // Caps
    ctx.fillStyle="#27ae60";
    ctx.fillRect(p.x-5,p.top-25,p.w+10,25);
    ctx.fillRect(p.x-5,p.bottom,p.w+10,25);

    // Collision
    if(bird.x+bird.r>p.x && bird.x-bird.r<p.x+p.w &&
      (bird.y-bird.r<p.top || bird.y+bird.r>p.bottom)){
      endGame();
    }

    // Score
    if(!p.passed && p.x+p.w<bird.x){
      score++;
      p.passed=true;
    }

    if(p.x+p.w<0) pipes.splice(i,1);
  });
}

// ===== GROUND =====
function drawGround() {
  ctx.fillStyle="#ded895";
  ctx.fillRect(0,canvas.height-100,canvas.width,100);
}

// ===== PHYSICS =====
function updateBird() {
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  if(bird.y+bird.r>canvas.height-100) endGame();

  if(bird.y-bird.r<0){
    bird.y=bird.r;
    bird.velocity=0;
  }
}

// ===== LOOP =====
function loop(){
  if(!gameRunning) return;

  frame++;
  drawBackground();
  updateBird();
  drawBird();
  drawPipes();
  drawGround();

  ctx.fillStyle="white";
  ctx.font="bold 50px Arial";
  ctx.fillText(score,canvas.width/2-10,100);

  requestAnimationFrame(loop);
}

// ===== END GAME =====
function endGame(){
  gameRunning=false;

  if(score>highScore){
    highScore=score;
    localStorage.setItem("flappyHighScore",highScore);
  }

  let medal="None";
  if(score>=10) medal="🥉 Bronze";
  if(score>=20) medal="🥈 Silver";
  if(score>=30) medal="🥇 Gold";
  if(score>=50) medal="💎 Platinum";

  document.getElementById("gameOver").style.display="block";
  document.getElementById("scoreText").innerHTML=
  "Score: "+score+"<br>High Score: "+highScore;
  document.getElementById("medalText").innerText="Medal: "+medal;
}

// ===== CONTROLS =====
document.addEventListener("click",()=>{
  if(gameRunning) bird.velocity=bird.lift;
});
document.addEventListener("keydown",e=>{
  if(e.code==="Space" && gameRunning) bird.velocity=bird.lift;
});
  if(bird.y+bird.r>canvas.height-100) endGame();
  if(bird.y-bird.r<0){
    bird.y=bird.r;
    bird.velocity=0;
  }
}

function loop(){
  if(!gameRunning) return;
  frame++;
  drawBackground();
  updateBird();
  drawBird();
  drawPipes();
  drawGround();

  ctx.fillStyle="white";
  ctx.font="bold 50px Arial";
  ctx.fillText(score,canvas.width/2-10,100);

  requestAnimationFrame(loop);
}

function endGame(){
  gameRunning=false;

  if(score>highScore){
    highScore=score;
    localStorage.setItem("flappyHighScore",highScore);
  }

  let medal="None";
  if(score>=10) medal="🥉 Bronze";
  if(score>=20) medal="🥈 Silver";
  if(score>=30) medal="🥇 Gold";
  if(score>=50) medal="💎 Platinum";

  document.getElementById("gameOver").style.display="block";
  document.getElementById("scoreText").innerHTML=
  "Score: "+score+"<br>High Score: "+highScore;
  document.getElementById("medalText").innerText="Medal: "+medal;
}

document.addEventListener("click",()=>{
  if(gameRunning) bird.velocity=bird.lift;
});
document.addEventListener("keydown",e=>{
  if(e.code==="Space" && gameRunning) bird.velocity=bird.lift;
});
