// DOM references
const chat = document.getElementById("chat");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const langSelect = document.getElementById("langSelect");
const clearBtn = document.getElementById("clearBtn");
const clearInputBtn = document.getElementById("clearInputBtn");

function showToast(message) {
  const container = document.querySelector(".app-container") || document.body;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => toast.classList.add("toast-show"), 10);
  setTimeout(() => toast.classList.add("toast-hide"), 1300);
  setTimeout(() => toast.remove(), 1600);
}

function getSpeechLangFromCode(code) {
  if (!code) return "en-US";
  code = code.toLowerCase();

  if (code.startsWith("es")) return "es-ES";
  if (code.startsWith("zh")) return "zh-CN";
  if (code.startsWith("ja")) return "ja-JP";
  if (code.startsWith("ko")) return "ko-KR";
  if (code.startsWith("fr")) return "fr-FR";
  if (code.startsWith("de")) return "de-DE";

  return "en-US";
}

function guessLanguageLabel(text) {
  if (/[ㄱ-ㅎ가-힣]/.test(text)) return "Guessed: Korean input";
  if (/[\u3040-\u30ff\u31f0-\u31ff]/.test(text)) return "Guessed: Japanese input";
  if (/[\u4e00-\u9fff]/.test(text)) return "Guessed: Chinese/CJK input";

  if (/^[A-Za-z0-9\s,'".!?-]+$/.test(text)) {
    return "Guessed: English (en)";
  }

  return "Guessed: Latin-based input";
}

function addMessage(text, who, options = {}) {
  const div = document.createElement("div");
  div.className = `msg ${who}`;
  if (options.type) div.classList.add(options.type);
  if (options.langCode) div.dataset.langCode = options.langCode;

  const main = document.createElement("span");
  main.className = "msg-text";
  main.textContent = text;
  div.appendChild(main);

  if (options.meta) {
    const meta = document.createElement("div");
    meta.className = "msg-meta";
    meta.textContent = options.meta;
    div.appendChild(meta);
  }

  if (who === "bot" && options.enableTools) {
    const tools = document.createElement("div");
    tools.className = "msg-tools";

    const speakBtn = document.createElement("button");
    speakBtn.type = "button";
    speakBtn.className = "icon-btn speak-btn";
    speakBtn.textContent = "🔊";

    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "icon-btn copy-btn";
    copyBtn.textContent = "📋";

    tools.appendChild(speakBtn);
    tools.appendChild(copyBtn);
    div.appendChild(tools);
  }

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div;
}

async function translateText(textArray, targetLang) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      target_lang: targetLang,
      text: textArray
    });

    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        try {
          const result = JSON.parse(xhr.responseText);
          console.log("Raw API result:", result);

          if (result && result.error) {
            reject(result.error);
            return;
          }

          let arr;
          if (Array.isArray(result)) arr = result;
          else if (Array.isArray(result.translatedTexts)) arr = result.translatedTexts;
          else arr = [String(result)];

          resolve(arr[0]);
        } catch (err) {
          reject(err);
        }
      }
    };

    xhr.open("POST", "https://openl-translate.p.rapidapi.com/translate/bulk");
    xhr.setRequestHeader("x-rapidapi-host", "openl-translate.p.rapidapi.com");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("X-RapidAPI-Key", "b394e4aad7msh14722feb18aba6ep123122jsn37fa9250e41f");

    xhr.send(data);
  });
}

async function handleSend() {
  const text = userInput.value.trim();
  if (!text) return;

  const targetLang = langSelect.value;
  const selectedLabel = langSelect.options[langSelect.selectedIndex].text;

  addMessage(text, "user", {
    meta: guessLanguageLabel(text)
  });

  userInput.value = "";
  clearInputBtn.style.display = "none";

  const loadingBubble = addMessage("Translating...", "bot", {
    type: "loading"
  });

  try {
    const translated = await translateText([text], targetLang);
    loadingBubble.remove();

    addMessage(translated, "bot", {
      meta: `To ${selectedLabel}`,
      enableTools: true,
      langCode: targetLang
    });
  } catch (err) {
    console.error("API error:", err);
    loadingBubble.remove();

    const friendly =
      typeof err === "string"
        ? err
        : "Translation failed. Please try again or check your key / quota.";

    addMessage(friendly, "bot", { type: "error" });
  }
}

sendBtn.addEventListener("click", handleSend);

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSend();
});

clearBtn.addEventListener("click", () => {
  chat.innerHTML = "";
});

userInput.addEventListener("input", () => {
  clearInputBtn.style.display = userInput.value ? "inline-flex" : "none";
});

clearInputBtn.addEventListener("click", () => {
  userInput.value = "";
  clearInputBtn.style.display = "none";
  userInput.focus();
});

chat.addEventListener("click", (e) => {
  const bubble = e.target.closest(".msg.bot");
  if (!bubble) return;

  const textEl = bubble.querySelector(".msg-text");
  const text = textEl ? textEl.textContent : "";

  if (e.target.classList.contains("speak-btn")) {
    if (!("speechSynthesis" in window)) {
      showToast("Speech not supported in this browser");
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const code = bubble.dataset.langCode || "";
      utterance.lang = getSpeechLangFromCode(code);
      speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("TTS error:", err);
      showToast("Could not play audio");
    }
  }

  if (e.target.classList.contains("copy-btn")) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => showToast("Copied!"))
        .catch((err) => {
          console.error("Copy failed:", err);
          showToast("Copy failed");
        });
    } else {
      console.log("Clipboard API not available.");
      showToast("Copy not available");
    }
  }
});
