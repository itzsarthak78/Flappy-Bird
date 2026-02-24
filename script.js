/* ================= FIREBASE ================= */

var firebaseConfig = {
  apiKey: "AIzaSyBeOs5mpgYn4fFPJXq_m1Sb-h2D58_EKzE",
  authDomain: "flappy-leaderboard-c73c3.firebaseapp.com",
  databaseURL: "https://flappy-leaderboard-c73c3-default-rtdb.firebaseio.com",
  projectId: "flappy-leaderboard-c73c3",
  storageBucket: "flappy-leaderboard-c73c3.firebasestorage.app",
  messagingSenderId: "615022691172",
  appId: "1:615022691172:web:72817c43f3e509feee7071"
};

firebase.initializeApp(firebaseConfig);
var database = firebase.database();

/* ================= TELEGRAM ================= */

var tgUser = null;

if (window.Telegram && Telegram.WebApp) {
  Telegram.WebApp.ready();
  tgUser = Telegram.WebApp.initDataUnsafe.user;

  if (tgUser) {
    document.getElementById("telegramUserBox").innerHTML =
      "👤 " + tgUser.first_name +
      " (@" + (tgUser.username || "") + ")";
  }
}

/* ================= BUTTON EVENTS ================= */

document.getElementById("playBtn").onclick = startGame;
document.getElementById("leaderboardBtn").onclick = openLeaderboard;
document.getElementById("menuBtn").onclick = goToMenu;
document.getElementById("backBtn").onclick = goToMenu;

/* ================= GAME SETUP ================= */

var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var bird, pipes, score;
var gameRunning = false;
var animationId;

var birdImg = new Image();
birdImg.src = "assets/bird.png";

/* ================= START GAME ================= */

function startGame() {

  document.querySelectorAll(".overlay")
    .forEach(o => o.classList.remove("active"));

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

/* ================= SPAWN PIPE ================= */

function spawnPipe() {

  var gap = 220;
  var top = Math.random() * (canvas.height - gap - 200) + 100;

  pipes.push({
    x: canvas.width + 200,
    w: 85,
    top: top,
    bottom: top + gap,
    passed: false,
    capHeight: 25
  });

  if (gameRunning) {
    setTimeout(spawnPipe, 2000);
  }
}

/* ================= GAME LOOP ================= */

function loop() {

  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* ---- Bird Physics ---- */

  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  ctx.drawImage(
    birdImg,
    bird.x - bird.w / 2,
    bird.y - bird.h / 2,
    bird.w,
    bird.h
  );

  /* ---- Pipes ---- */

  pipes.forEach(function (p, i) {

    p.x -= 2.2;

    /* PIPE BODY */
    ctx.fillStyle = "#2ecc40";

    // Top pipe body
    ctx.fillRect(p.x, 0, p.w, p.top);

    // Bottom pipe body
    ctx.fillRect(
      p.x,
      p.bottom,
      p.w,
      canvas.height - p.bottom - 100
    );

    /* PIPE CAPS */
    ctx.fillStyle = "#27ae60";

    // Top cap
    ctx.fillRect(
      p.x - 5,
      p.top - p.capHeight,
      p.w + 10,
      p.capHeight
    );

    // Bottom cap
    ctx.fillRect(
      p.x - 5,
      p.bottom,
      p.w + 10,
      p.capHeight
    );

    /* COLLISION */

    if (
      bird.x + bird.w / 2 > p.x &&
      bird.x - bird.w / 2 < p.x + p.w &&
      (bird.y - bird.h / 2 < p.top ||
       bird.y + bird.h / 2 > p.bottom)
    ) {
      endGame();
    }

    /* SCORE */

    if (!p.passed && p.x + p.w < bird.x) {
      score++;
      p.passed = true;
    }

    if (p.x + p.w < 0) {
      pipes.splice(i, 1);
    }
  });

  /* ---- Score Display ---- */

  ctx.fillStyle = "white";
  ctx.font = "bold 50px Arial";
  ctx.fillText(score, canvas.width / 2 - 10, 100);

  animationId = requestAnimationFrame(loop);
}

/* ================= END GAME ================= */

function endGame() {

  if (!gameRunning) return;

  gameRunning = false;
  cancelAnimationFrame(animationId);

  if (tgUser) {

    var userRef = database.ref("scores/" + tgUser.id);

    userRef.once("value").then(function (snapshot) {

      var oldScore = snapshot.exists() ? snapshot.val().score : 0;

      if (score > oldScore) {
        userRef.set({
          name: tgUser.first_name,
          username: tgUser.username || "",
          score: score
        });
      }
    });
  }

  document.getElementById("scoreText").innerHTML =
    "Score: " + score;

  document.getElementById("gameOver")
    .classList.add("active");
}

/* ================= LEADERBOARD ================= */

function openLeaderboard() {

  document.querySelectorAll(".overlay")
    .forEach(o => o.classList.remove("active"));

  document.getElementById("leaderboard")
    .classList.add("active");

  database.ref("scores")
    .once("value")
    .then(function (snapshot) {

      var data = snapshot.val();
      if (!data) return;

      var arr = [];

      for (var id in data) {
        arr.push(data[id]);
      }

      arr.sort(function (a, b) {
        return b.score - a.score;
      });

      var html = "";

      arr.slice(0, 30).forEach(function (p, i) {

        var crown = i === 0 ? " 👑" : "";

        html +=
          "<div class='playerRow'>" +
            "<div class='playerLeft'>" +
              "<div class='rank'>" + (i + 1) + crown + "</div>" +
              "<div class='pfp'>" +
                p.name.charAt(0) +
              "</div>" +
              "<div>" + p.name + "</div>" +
            "</div>" +
            "<div class='score'>" + p.score + "</div>" +
          "</div>";
      });

      document.getElementById("leaderboardList")
        .innerHTML = html;
    });
}

/* ================= MENU ================= */

function goToMenu() {

  canvas.style.display = "none";

  document.querySelectorAll(".overlay")
    .forEach(o => o.classList.remove("active"));

  document.getElementById("menu")
    .classList.add("active");
}

/* ================= CONTROLS ================= */

document.addEventListener("click", function () {
  if (gameRunning) {
    bird.velocity = bird.lift;
  }
});
