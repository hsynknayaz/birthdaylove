const startButton = document.getElementById("start-button");
const puzzleContainer = document.getElementById("puzzle-container");
const startScreen = document.getElementById("start-screen");
const bgMusic = document.getElementById("bg-music");
const videoContainer = document.getElementById("video-container");
const surpriseVideo = document.getElementById("surprise-video");

let canvas = document.getElementById("puzzleCanvas");
let ctx = canvas.getContext("2d");
const ROWS = 8, COLS = 8;
let pieces = [];
let image;

startButton.addEventListener("click", () => {
  startScreen.style.display = "none";
  puzzleContainer.style.display = "block";
  bgMusic.play();
  initPuzzle();
});

function initPuzzle() {
  image = new Image();
  image.src = "media/puzzle.jpg";
  image.onload = () => {
    const pw = image.width / COLS, ph = image.height / ROWS;
    canvas.width = image.width;
    canvas.height = image.height;
    pieces = [];

    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS; x++)
        pieces.push({ x: x * pw, y: y * ph });

    shuffle(pieces);
    drawPuzzle(pw, ph);
    enableDragDrop(pw, ph);
  };
}

function drawPuzzle(pw, ph) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pieces.forEach((p, i) => {
    const dx = (i % COLS) * pw;
    const dy = Math.floor(i / COLS) * ph;

    // Hafif köşe yuvarlama efekti
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(dx + 1, dy + 1, pw - 2, ph - 2, 6);
    ctx.clip();
    ctx.drawImage(image, p.x, p.y, pw, ph, dx, dy, pw, ph);
    ctx.restore();

    // Parçaların kenarını çerçeveyle belirginleştir
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.strokeRect(dx + 1, dy + 1, pw - 2, ph - 2);
  });
}

function enableDragDrop(pw, ph) {
  let dragging = false, dragIndex = -1;

  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  }

  function handleStart(e) {
    const { x, y } = getCanvasCoords(e);
    dragIndex = getIndex(x, y, pw, ph);
    if (dragIndex !== -1) dragging = true;
  }

  function handleEnd(e) {
    if (!dragging) return;
    dragging = false;
    const { x, y } = getCanvasCoords(e);
    const dropIndex = getIndex(x, y, pw, ph);
    if (dropIndex !== -1 && dragIndex !== dropIndex) {
      [pieces[dragIndex], pieces[dropIndex]] = [pieces[dropIndex], pieces[dragIndex]];
      drawPuzzle(pw, ph);
      if (isComplete(pw, ph)) {
        puzzleContainer.style.display = "none";
        showHeartAnimation(() => {
          videoContainer.style.display = "block";
          bgMusic.pause();
          surpriseVideo.play();
        });
      }
    }
  }

  canvas.addEventListener("mousedown", handleStart);
  canvas.addEventListener("mouseup", handleEnd);
  canvas.addEventListener("touchstart", handleStart);
  canvas.addEventListener("touchend", handleEnd);
}

function getIndex(x, y, pw, ph) {
  return Math.floor(y / ph) * COLS + Math.floor(x / pw);
}

function isComplete(pw, ph) {
  return pieces.every((p, i) => {
    const cx = (i % COLS) * pw, cy = Math.floor(i / COLS) * ph;
    return Math.abs(p.x - cx) <= 1 && Math.abs(p.y - cy) <= 1;
  });
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function showHeartAnimation(callback) {
  const heart = document.createElement("div");
  heart.innerText = "❤️";
  heart.style.position = "fixed";
  heart.style.top = "50%";
  heart.style.left = "50%";
  heart.style.fontSize = "5rem";
  heart.style.transform = "translate(-50%, -50%) scale(0)";
  heart.style.opacity = "0";
  heart.style.transition = "transform 1s ease, opacity 1s ease";
  document.body.appendChild(heart);

  setTimeout(() => {
    heart.style.transform = "translate(-50%, -50%) scale(1)";
    heart.style.opacity = "1";
  }, 50);

  setTimeout(() => {
    heart.style.opacity = "0";
    heart.style.transform = "translate(-50%, -50%) scale(0.1)";
  }, 2500);

  setTimeout(() => {
    heart.remove();
    callback();
  }, 3500);
}
