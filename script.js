const kanaRows = [
  [
    { h: "あ", k: "ア", r: "a" },
    { h: "い", k: "イ", r: "i" },
    { h: "う", k: "ウ", r: "u" },
    { h: "え", k: "エ", r: "e" },
    { h: "お", k: "オ", r: "o" }
  ],
  [
    { h: "か", k: "カ", r: "ka" },
    { h: "き", k: "キ", r: "ki" },
    { h: "く", k: "ク", r: "ku" },
    { h: "け", k: "ケ", r: "ke" },
    { h: "こ", k: "コ", r: "ko" }
  ],
  [
    { h: "さ", k: "サ", r: "sa" },
    { h: "し", k: "シ", r: "shi" },
    { h: "す", k: "ス", r: "su" },
    { h: "せ", k: "セ", r: "se" },
    { h: "そ", k: "ソ", r: "so" }
  ],
  [
    { h: "た", k: "タ", r: "ta" },
    { h: "ち", k: "チ", r: "chi" },
    { h: "つ", k: "ツ", r: "tsu" },
    { h: "て", k: "テ", r: "te" },
    { h: "と", k: "ト", r: "to" }
  ],
  [
    { h: "な", k: "ナ", r: "na" },
    { h: "に", k: "ニ", r: "ni" },
    { h: "ぬ", k: "ヌ", r: "nu" },
    { h: "ね", k: "ネ", r: "ne" },
    { h: "の", k: "ノ", r: "no" }
  ],
  [
    { h: "は", k: "ハ", r: "ha" },
    { h: "ひ", k: "ヒ", r: "hi" },
    { h: "ふ", k: "フ", r: "fu" },
    { h: "へ", k: "ヘ", r: "he" },
    { h: "ほ", k: "ホ", r: "ho" }
  ],
  [
    { h: "ま", k: "マ", r: "ma" },
    { h: "み", k: "ミ", r: "mi" },
    { h: "む", k: "ム", r: "mu" },
    { h: "め", k: "メ", r: "me" },
    { h: "も", k: "モ", r: "mo" }
  ],
  [
    { h: "や", k: "ヤ", r: "ya" },
    { h: "ゆ", k: "ユ", r: "yu" },
    { h: "よ", k: "ヨ", r: "yo" }
  ],
  [
    { h: "ら", k: "ラ", r: "ra" },
    { h: "り", k: "リ", r: "ri" },
    { h: "る", k: "ル", r: "ru" },
    { h: "れ", k: "レ", r: "re" },
    { h: "ろ", k: "ロ", r: "ro" }
  ],
  [
    { h: "わ", k: "ワ", r: "wa" },
    { h: "を", k: "ヲ", r: "wo" },
    { h: "ん", k: "ン", r: "n" }
  ]
];

const kanaList = kanaRows.flat();
let mode = "hiragana";
let chartMode = "hiragana";
let currentQuestion = null;
let locked = false;
let score = 0;
let streak = 0;
let stars = 0;
let soundOn = true;

const kanaCard = document.querySelector("#kana-card");
const answers = document.querySelector("#answers");
const hint = document.querySelector("#hint");
const scoreEl = document.querySelector("#score");
const streakEl = document.querySelector("#streak");
const starsEl = document.querySelector("#stars");
const nextButton = document.querySelector("#next-button");
const resetButton = document.querySelector("#reset-button");
const soundToggle = document.querySelector("#sound-toggle");
const kanaGrid = document.querySelector("#kana-grid");

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function kanaFor(item) {
  if (mode === "katakana") return item.k;
  if (mode === "mixed") return Math.random() > 0.5 ? item.h : item.k;
  return item.h;
}

function playTone(success) {
  if (!soundOn) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = success ? 660 : 220;
  gain.gain.setValueAtTime(0.08, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.22);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.22);
}

function updateScore() {
  scoreEl.textContent = score;
  streakEl.textContent = streak;
  starsEl.textContent = stars;
}

function buildOptions(answer) {
  const wrong = shuffle(kanaList.filter((item) => item.r !== answer.r))
    .slice(0, 3)
    .map((item) => item.r);
  return shuffle([answer.r, ...wrong]);
}

function renderQuestion() {
  locked = false;
  currentQuestion = kanaList[Math.floor(Math.random() * kanaList.length)];
  kanaCard.textContent = kanaFor(currentQuestion);
  hint.textContent = "請選出正確羅馬字";
  hint.className = "hint";
  answers.innerHTML = "";

  buildOptions(currentQuestion).forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer";
    button.textContent = option;
    button.addEventListener("click", () => chooseAnswer(button, option));
    answers.append(button);
  });
}

function chooseAnswer(button, selected) {
  if (locked) return;
  locked = true;
  const isCorrect = selected === currentQuestion.r;

  [...answers.children].forEach((answerButton) => {
    answerButton.disabled = true;
    if (answerButton.textContent === currentQuestion.r) {
      answerButton.classList.add("correct");
    }
  });

  if (isCorrect) {
    score += 10;
    streak += 1;
    stars += streak % 3 === 0 ? 1 : 0;
    hint.textContent = `答對了！${currentQuestion.r}`;
    hint.classList.add("good");
  } else {
    streak = 0;
    button.classList.add("wrong");
    hint.textContent = `再記一次：${currentQuestion.h} / ${currentQuestion.k} = ${currentQuestion.r}`;
    hint.classList.add("bad");
  }

  playTone(isCorrect);
  updateScore();
}

function resetGame() {
  score = 0;
  streak = 0;
  stars = 0;
  updateScore();
  renderQuestion();
}

function renderChart() {
  const key = chartMode === "katakana" ? "k" : "h";
  kanaGrid.innerHTML = "";
  kanaList.forEach((item) => {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.innerHTML = `<span class="kana">${item[key]}</span><span class="romaji">${item.r}</span>`;
    kanaGrid.append(tile);
  });
}

document.querySelectorAll(".segment").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".segment").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    mode = button.dataset.mode;
    renderQuestion();
  });
});

document.querySelectorAll(".chart-tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".chart-tab").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    chartMode = button.dataset.chart;
    renderChart();
  });
});

nextButton.addEventListener("click", renderQuestion);
resetButton.addEventListener("click", resetGame);
soundToggle.addEventListener("click", () => {
  soundOn = !soundOn;
  soundToggle.setAttribute("aria-pressed", String(soundOn));
});

updateScore();
renderQuestion();
renderChart();
