/*
  このアプリでは、以下の流れをJavaScriptで制御します。
  1. キーワード候補からランダムで5個選ぶ
  2. 1画面目に表示する
  3. 「次へ」で2画面目に進み、対応する入力欄を表示する
  4. 入力内容と選ばれたキーワードを localStorage に保存して保持する
*/

// 20個以上という要件に合わせて、25個の候補を用意しています。
const keywordPool = [
  "笑顔",
  "感謝",
  "希望",
  "安心",
  "成長",
  "挑戦",
  "優しさ",
  "勇気",
  "信頼",
  "達成",
  "工夫",
  "前進",
  "充実",
  "自由",
  "発見",
  "応援",
  "つながり",
  "素直",
  "喜び",
  "継続",
  "元気",
  "協力",
  "自信",
  "学び",
  "未来"
];

// localStorage に保存するときの名前です。
// ひとまとめにしておくと、管理しやすくなります。
const storageKey = "positive-keyword-app-data";

// HTML側の要素を取得して、あとで使いやすいように変数に入れます。
const screenKeywords = document.getElementById("screen-keywords");
const screenInputs = document.getElementById("screen-inputs");
const keywordList = document.getElementById("keyword-list");
const inputList = document.getElementById("input-list");
const shuffleButton = document.getElementById("shuffle-button");
const nextButton = document.getElementById("next-button");
const backButton = document.getElementById("back-button");

/*
  アプリ全体の現在の状態です。
  keywords: 今表示している5個のキーワード
  answers: 入力欄の内容を保存する配列
  currentScreen: どちらの画面を表示するか
*/
let appState = {
  keywords: [],
  answers: ["", "", "", "", ""],
  currentScreen: "keywords"
};

// ------------------------------
// 初期表示に使う処理
// ------------------------------

// ページを開いたときに一度だけ実行します。
initializeApp();

function initializeApp() {
  // 以前のデータが保存されていれば、それを読み込みます。
  const savedData = loadState();

  if (savedData) {
    appState = savedData;
  } else {
    // 初回アクセス時は、新しく5個選びます。
    appState.keywords = pickRandomKeywords(keywordPool, 5);
  }

  // 読み込んだ状態を画面に反映します。
  renderKeywords();
  renderInputs();
  showScreen(appState.currentScreen);
  attachEvents();
  saveState();
}

// ------------------------------
// イベント設定
// ------------------------------

function attachEvents() {
  shuffleButton.addEventListener("click", handleShuffle);
  nextButton.addEventListener("click", handleNext);
  backButton.addEventListener("click", handleBack);
}

function handleShuffle() {
  // 再抽選したら、入力内容はキーワードに対応しなくなるためリセットします。
  appState.keywords = pickRandomKeywords(keywordPool, 5);
  appState.answers = ["", "", "", "", ""];

  renderKeywords();
  renderInputs();
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

// ------------------------------
// 画面表示の切り替え
// ------------------------------

function showScreen(screenName) {
  const isKeywordScreen = screenName === "keywords";

  screenKeywords.classList.toggle("active", isKeywordScreen);
  screenInputs.classList.toggle("active", !isKeywordScreen);
}

// ------------------------------
// 1画面目の表示
// ------------------------------

function renderKeywords() {
  // いったん中身を空にしてから、最新の5件を描画します。
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

// ------------------------------
// 2画面目の表示
// ------------------------------

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
    input.value = appState.answers[index] || "";

    // 入力のたびに状態を更新し、保存もします。
    input.addEventListener("input", (event) => {
      appState.answers[index] = event.target.value;
      saveState();
    });

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    inputList.appendChild(wrapper);
  });
}

// ------------------------------
// ランダム抽選の処理
// ------------------------------

function pickRandomKeywords(sourceArray, count) {
  // 元の配列を壊さないため、コピーしてから並び替えます。
  const copiedArray = [...sourceArray];

  // Fisher-Yates シャッフルでランダムに並べ替えます。
  for (let i = copiedArray.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [copiedArray[i], copiedArray[randomIndex]] = [copiedArray[randomIndex], copiedArray[i]];
  }

  // 先頭から必要な数だけ取り出します。
  return copiedArray.slice(0, count);
}

// ------------------------------
// 保存と読み込み
// ------------------------------

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(appState));
}

function loadState() {
  const savedText = localStorage.getItem(storageKey);

  if (!savedText) {
    return null;
  }

  try {
    const parsedData = JSON.parse(savedText);

    // 保存データが壊れていた場合に備えて、最低限の形を確認します。
    if (!Array.isArray(parsedData.keywords) || parsedData.keywords.length !== 5) {
      return null;
    }

    return {
      keywords: parsedData.keywords,
      answers: normalizeAnswers(parsedData.answers),
      currentScreen: parsedData.currentScreen === "inputs" ? "inputs" : "keywords"
    };
  } catch (error) {
    // JSONとして読めない場合は、保存データを使わず初期状態に戻します。
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
