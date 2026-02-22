const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bird, pipes, score, highScore;
let gameRunning = false;
let frame = 0;

highScore = localStorage.getItem("flappyHighScore") || 0;

function startGame() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("gameOver").style.display = "none";
  canvas.style.display = "block";

  bird = {
    x: 120,
    y: canvas.height / 2,
    r: 20,
    velocity: 0,
    gravity: 0.6,
    lift: -11
  };

  pipes = [];
  score = 0;
  gameRunning = true;
  spawnPipe();
  loop();
}

function spawnPipe() {
  let gap = 190;
  let top = Math.random() * (canvas.height - gap - 200) + 80;

  pipes.push({
    x: canvas.width,
    w: 85,
    top: top,
    bottom: top + gap,
    passed: false
  });

  if (gameRunning) setTimeout(spawnPipe, 1500);
}

function drawBackground() {
  let grad = ctx.createLinearGradient(0,0,0,canvas.height);
  grad.addColorStop(0,"#4ec0ca");
  grad.addColorStop(1,"#b2e6ff");
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,canvas.width,canvas.height);
}

function drawBird() {
  ctx.save();
  ctx.translate(bird.x,bird.y);
  ctx.rotate(bird.velocity/15);

  ctx.fillStyle="yellow";
  ctx.beginPath();
  ctx.arc(0,0,bird.r,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle="orange";
  ctx.beginPath();
  ctx.ellipse(-5,Math.sin(frame*0.3)*8,15,10,0,0,Math.PI*2);
  ctx.fill();

  ctx.restore();
}

function drawPipes() {
  pipes.forEach((p,i)=>{
    p.x-=4;

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

function drawGround() {
  ctx.fillStyle="#ded895";
  ctx.fillRect(0,canvas.height-100,canvas.width,100);
}

function updateBird() {
  bird.velocity+=bird.gravity;
  bird.y+=bird.velocity;

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
