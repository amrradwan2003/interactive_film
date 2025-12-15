const video = document.getElementById("video");
const ui = document.getElementById("ui");
const buttons = document.querySelectorAll("#ui button");
const startBtn = document.getElementById("startBtn");
const startScreen = document.getElementById("start");

const countdown = document.getElementById("countdown");
const ring = document.querySelector(".ring");
const countText = document.getElementById("countText");

let story = {};
let currentNode = null;
let autoPickTimer = null;
let countdownInterval = null;

const RING_LENGTH = 226;

fetch("data/story.json")
  .then(res => res.json())
  .then(data => story = data);

startBtn.onclick = () => {
  startScreen.style.display = "none";
  loadNode("intro");
};

function loadNode(id) {
  currentNode = story[id];
  clearTimers();

  video.src = currentNode.video;
  video.currentTime = 0;
  video.muted = true;
  video.play();

  ui.classList.add("hidden");
  countdown.classList.add("hidden");

  if (!currentNode.choices) return;

  const [a, b] = currentNode.choices;
  buttons[0].textContent = `A — ${a.label}`;
  buttons[1].textContent = `B — ${b.label}`;

  const checkTime = () => {
    if (video.currentTime >= currentNode.choiceTime) {
      ui.classList.remove("hidden");
      startCountdown(currentNode.timeout);
      video.removeEventListener("timeupdate", checkTime);
    }
  };

  video.addEventListener("timeupdate", checkTime);
}

function startCountdown(seconds) {
  let remaining = seconds;
  countdown.classList.remove("hidden");
  countdown.classList.remove("danger");

  updateRing(remaining, seconds);

  countText.textContent = remaining;

  countdownInterval = setInterval(() => {
    remaining--;

    updateRing(remaining, seconds);
    countText.textContent = remaining;

    if (remaining <= 3) {
      countdown.classList.add("danger");
    }

    if (remaining <= 0) {
      clearTimers();
      choose(currentNode.default);
    }
  }, 1000);
}

function updateRing(remaining, total) {
  const progress = remaining / total;
  ring.style.strokeDashoffset = RING_LENGTH * (1 - progress);
}

function clearTimers() {
  clearTimeout(autoPickTimer);
  clearInterval(countdownInterval);
}

function choose(key) {
  if (!currentNode || !currentNode.choices) return;
  clearTimers();

  const choice = currentNode.choices.find(c => c.key === key);
  if (choice) loadNode(choice.next);
}

buttons.forEach(btn =>
  btn.onclick = () => choose(btn.dataset.choice)
);

document.addEventListener("keydown", e => {
  if (e.key.toLowerCase() === "a") choose("A");
  if (e.key.toLowerCase() === "b") choose("B");
});
