const keywordPool = [
  "安心",
  "希望",
  "達成",
  "感謝",
  "笑顔",
  "成長",
  "挑戦",
  "喜び",
  "自信",
  "前進",
  "信頼",
  "友情",
  "努力",
  "充実",
  "発見",
  "成功",
  "素直",
  "穏やか",
  "満足",
  "健康",
  "自由",
  "学び",
  "勇気",
  "感動",
  "未来",
  "幸福",
  "平和",
  "前向き",
  "優しさ",
  "活力",
  "誠実",
  "尊重",
  "協力",
  "応援",
  "祝福"
];

const storageKey = "positive-keyword-app-data";

const screenKeywords = document.getElementById("screen-keywords");
const screenInputs = document.getElementById("screen-inputs");
const screenRecall = document.getElementById("screen-recall");
const keywordList = document.getElementById("keyword-list");
const inputList = document.getElementById("input-list");
const recallList = document.getElementById("recall-list");
const shuffleButton = document.getElementById("shuffle-button");
const nextButton = document.getElementById("next-button");
const backButton = document.getElementById("back-button");
const recallButton = document.getElementById("recall-button");
const clearInputsButton = document.getElementById("clear-inputs-button");
const recallBackButton = document.getElementById("recall-back-button");
const clearRecallButton = document.getElementById("clear-recall-button");

let appState = {
  keywords: [],
  answers: ["", "", "", "", ""],
  recallAnswers: ["", "", "", "", ""],
  currentScreen: "keywords"
};

initializeApp();

function initializeApp() {
  const savedData = loadState();

  if (savedData) {
    appState = savedData;
  } else {
    appState.keywords = pickRandomKeywords(keywordPool, 5);
  }

  renderKeywords();
  renderInputs();
  renderRecallInputs();
  showScreen(appState.currentScreen);
  attachEvents();
  saveState();
}

function attachEvents() {
  shuffleButton.addEventListener("click", handleShuffle);
  nextButton.addEventListener("click", handleNext);
  backButton.addEventListener("click", handleBack);
  recallButton.addEventListener("click", handleRecallNext);
  clearInputsButton.addEventListener("click", handleClearInputs);
  recallBackButton.addEventListener("click", handleRecallBack);
  clearRecallButton.addEventListener("click", handleClearRecall);
}

function handleShuffle() {
  appState.keywords = pickRandomKeywords(keywordPool, 5);
  appState.answers = ["", "", "", "", ""];
  appState.recallAnswers = ["", "", "", "", ""];
  appState.currentScreen = "keywords";

  renderKeywords();
  renderInputs();
  renderRecallInputs();
  showScreen("keywords");
  saveState();
}

function handleNext() {
  appState.currentScreen = "inputs";
  showScreen("inputs");
  saveState();
}

function handleBack() {
  appState.currentScreen = "keywords";
  showScreen("keywords");
  saveState();
}

function handleRecallNext() {
  appState.currentScreen = "recall";
  showScreen("recall");
  saveState();
}

function handleRecallBack() {
  appState.currentScreen = "inputs";
  showScreen("inputs");
  saveState();
}

function handleClearInputs() {
  if (!confirm("Step 2 の入力内容をすべて削除しますか？")) {
    return;
  }

  appState.answers = ["", "", "", "", ""];
  renderInputs();
  resetSavedState();
}

function handleClearRecall() {
  if (!confirm("Step 3 の入力内容をすべて削除しますか？")) {
    return;
  }

  appState.recallAnswers = ["", "", "", "", ""];
  renderRecallInputs();
  resetSavedState();
}

function showScreen(screenName) {
  screenKeywords.classList.toggle("active", screenName === "keywords");
  screenInputs.classList.toggle("active", screenName === "inputs");
  screenRecall.classList.toggle("active", screenName === "recall");
}

function renderKeywords() {
  keywordList.innerHTML = "";

  appState.keywords.forEach((keyword, index) => {
    const item = document.createElement("li");
    item.className = "keyword-item";
    item.innerHTML = `
      <span class="keyword-number">${index + 1}</span>
      <span class="keyword-text">${keyword}</span>
    `;
    keywordList.appendChild(item);
  });
}

function renderInputs() {
  inputList.innerHTML = "";

  appState.keywords.forEach((keyword, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "input-card";

    const label = document.createElement("label");
    label.setAttribute("for", `answer-${index}`);
    label.textContent = `${index + 1}. ${keyword}`;

    const input = document.createElement("input");
    input.id = `answer-${index}`;
    input.type = "text";
    input.placeholder = "ここに入力してください";
    input.autocomplete = "off";
    input.value = appState.answers[index] || "";

    input.addEventListener("input", (event) => {
      appState.answers[index] = event.target.value;
      saveState();
    });

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    inputList.appendChild(wrapper);
  });
}

function renderRecallInputs() {
  recallList.innerHTML = "";

  for (let index = 0; index < 5; index += 1) {
    const wrapper = document.createElement("div");
    wrapper.className = "input-card";

    const label = document.createElement("label");
    label.setAttribute("for", `recall-${index}`);
    label.textContent = `${index + 1}. 思い出したワード`;

    const input = document.createElement("input");
    input.id = `recall-${index}`;
    input.type = "text";
    input.placeholder = "思い出した単語を入力";
    input.autocomplete = "off";
    input.value = appState.recallAnswers[index] || "";

    input.addEventListener("input", (event) => {
      appState.recallAnswers[index] = event.target.value;
      saveState();
    });

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    recallList.appendChild(wrapper);
  }
}

function pickRandomKeywords(sourceArray, count) {
  const copiedArray = [...sourceArray];

  for (let index = copiedArray.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copiedArray[index], copiedArray[randomIndex]] = [copiedArray[randomIndex], copiedArray[index]];
  }

  return copiedArray.slice(0, count);
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(appState));
}

function resetSavedState() {
  localStorage.removeItem(storageKey);
  saveState();
}

function loadState() {
  const savedText = localStorage.getItem(storageKey);

  if (!savedText) {
    return null;
  }

  try {
    const parsedData = JSON.parse(savedText);

    if (!Array.isArray(parsedData.keywords) || parsedData.keywords.length !== 5) {
      return null;
    }

    return {
      keywords: parsedData.keywords,
      answers: normalizeAnswers(parsedData.answers),
      recallAnswers: normalizeAnswers(parsedData.recallAnswers),
      currentScreen: normalizeScreen(parsedData.currentScreen)
    };
  } catch (error) {
    return null;
  }
}

function normalizeAnswers(answers) {
  const safeAnswers = Array.isArray(answers) ? answers.slice(0, 5) : [];

  while (safeAnswers.length < 5) {
    safeAnswers.push("");
  }

  return safeAnswers;
}

function normalizeScreen(screenName) {
  if (screenName === "inputs" || screenName === "recall") {
    return screenName;
  }

  return "keywords";
}
