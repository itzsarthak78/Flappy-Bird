import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

/* FIREBASE */
const firebaseConfig = {
  apiKey: "AIzaSyBeOs5mpgYn4fFPJXq_m1Sb-h2D58_EKzE",
  authDomain: "flappy-leaderboard-c73c3.firebaseapp.com",
  databaseURL: "https://flappy-leaderboard-c73c3-default-rtdb.firebaseio.com",
  projectId: "flappy-leaderboard-c73c3",
  storageBucket: "flappy-leaderboard-c73c3.firebasestorage.app",
  messagingSenderId: "615022691172",
  appId: "1:615022691172:web:72817c43f3e509feee7071"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* TELEGRAM */
let tgUser = null;

if (window.Telegram && Telegram.WebApp) {
  Telegram.WebApp.ready();
  tgUser = Telegram.WebApp.initDataUnsafe.user;

  if (tgUser) {
    document.getElementById("telegramUserBox").innerHTML =
      `👤 ${tgUser.first_name} (@${tgUser.username || ""})`;
  }
}

/* BUTTON EVENTS */
document.getElementById("playBtn").addEventListener("click", startGame);
document.getElementById("leaderboardBtn").addEventListener("click", openLeaderboard);
document.getElementById("menuBtn").addEventListener("click", goToMenu);
document.getElementById("backBtn").addEventListener("click", goToMenu);

/* GAME */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bird, pipes, score;
let gameRunning = false;
let animationId;

const birdImg = new Image();
birdImg.src = "assets/bird.png";

function startGame() {
  document.querySelectorAll(".overlay").forEach(o=>o.classList.remove("active"));
  canvas.style.display="block";

  bird={x:120,y:canvas.height/2,w:60,h:45,velocity:0,gravity:0.25,lift:-6};
  pipes=[];
  score=0;
  gameRunning=true;

  spawnPipe();
  loop();
}

function spawnPipe(){
  let gap=220;
  let top=Math.random()*(canvas.height-gap-200)+100;
  pipes.push({x:canvas.width+200,w:85,top,bottom:top+gap,passed:false});
  if(gameRunning) setTimeout(spawnPipe,2000);
}

function loop(){
  if(!gameRunning) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);

  bird.velocity+=bird.gravity;
  bird.y+=bird.velocity;

  ctx.drawImage(birdImg,bird.x-30,bird.y-22,60,45);

  pipes.forEach((p,i)=>{
    p.x-=2.2;
    ctx.fillStyle="#2ecc40";
    ctx.fillRect(p.x,0,p.w,p.top);
    ctx.fillRect(p.x,p.bottom,p.w,canvas.height-p.bottom-100);

    if(bird.x+30>p.x&&bird.x-30<p.x+p.w&&(bird.y-22<p.top||bird.y+22>p.bottom)){
      endGame();
    }

    if(!p.passed&&p.x+p.w<bird.x){score++;p.passed=true;}
    if(p.x+p.w<0) pipes.splice(i,1);
  });

  ctx.fillStyle="white";
  ctx.font="bold 50px Arial";
  ctx.fillText(score,canvas.width/2-10,100);

  animationId=requestAnimationFrame(loop);
}

async function endGame(){
  gameRunning=false;
  cancelAnimationFrame(animationId);

  if(tgUser){
    const userRef=ref(db,"scores/"+tgUser.id);
    const snap=await get(userRef);
    const oldScore=snap.exists()?snap.val().score:0;

    if(score>oldScore){
      await set(userRef,{
        name:tgUser.first_name,
        username:tgUser.username||"",
        score
      });
    }
  }

  document.getElementById("scoreText").innerHTML="Score: "+score;
  document.getElementById("gameOver").classList.add("active");
}

/* LEADERBOARD */
async function openLeaderboard(){
  document.querySelectorAll(".overlay").forEach(o=>o.classList.remove("active"));
  document.getElementById("leaderboard").classList.add("active");

  const snap=await get(ref(db,"scores"));
  const data=snap.val();
  if(!data) return;

  let arr=[];
  for(let id in data) arr.push(data[id]);
  arr.sort((a,b)=>b.score-a.score);

  let html="";
  arr.slice(0,30).forEach((p,i)=>{
    let crown=i===0?"👑":"";
    html+=`
      <div class="playerRow">
        <div class="playerLeft">
          <div class="rank">${i+1}${crown}</div>
          <div class="pfp">${p.name.charAt(0)}</div>
          <div>${p.name}</div>
        </div>
        <div class="score">${p.score}</div>
      </div>
    `;
  });

  document.getElementById("leaderboardList").innerHTML=html;
}

function goToMenu(){
  canvas.style.display="none";
  document.querySelectorAll(".overlay").forEach(o=>o.classList.remove("active"));
  document.getElementById("menu").classList.add("active");
}

document.addEventListener("click",()=>{
  if(gameRunning) bird.velocity=bird.lift;
});
