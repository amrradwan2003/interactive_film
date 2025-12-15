const video = document.getElementById("video");
const ui = document.getElementById("ui");
const buttons = document.querySelectorAll("#ui button");
const startBtn = document.getElementById("startBtn");
const startScreen = document.getElementById("start");

let story = {};
let currentNode = null;
let autoPickTimer = null;

fetch("data/story.json")
  .then(res => res.json())
  .then(data => story = data);

startBtn.onclick = () => {
  startScreen.style.display = "none";
  loadNode("intro");
};

function loadNode(id) {
  currentNode = story[id];
  clearTimeout(autoPickTimer);

  video.src = currentNode.video;
  video.currentTime = 0;
  video.play();
  ui.classList.add("hidden");

  if (!currentNode.choices) return;

  const [a, b] = currentNode.choices;
  buttons[0].textContent = `A — ${a.label}`;
  buttons[1].textContent = `B — ${b.label}`;

  const checkTime = () => {
    if (video.currentTime >= currentNode.choiceTime) {
      ui.classList.remove("hidden");
      startAutoPick();
      video.removeEventListener("timeupdate", checkTime);
    }
  };

  video.addEventListener("timeupdate", checkTime);
}

function startAutoPick() {
  if (!currentNode.timeout || !currentNode.default) return;

  autoPickTimer = setTimeout(() => {
    choose(currentNode.default);
  }, currentNode.timeout * 1000);
}

function choose(key) {
  if (!currentNode || !currentNode.choices) return;
  clearTimeout(autoPickTimer);

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


