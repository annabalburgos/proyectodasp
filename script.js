const chat = document.getElementById("chat");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const quickBtns = document.querySelectorAll(".quick-btn");
addMessage(
  "¡Hola! Soy el asistente de esta tienda de informática. Puedo ayudarte a elegir portátiles, PCs, componentes y periféricos. ¿Qué estás buscando?",
  "bot"
);
sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

quickBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    userInput.value = btn.textContent;
    sendMessage();
  });
});

function addMessage(text, type) {
  const msg = document.createElement("div");
  msg.classList.add("msg", type, "fade-in");
  msg.textContent = text;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}
function addTyping() {
  const wrap = document.createElement("div");
  wrap.classList.add("msg", "bot", "typing", "fade-in");
  wrap.id = "typingBubble";

  wrap.innerHTML = `
    <span class="dot"></span>
    <span class="dot"></span>
    <span class="dot"></span>
  `;

  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;
}

function removeTyping() {
  const typing = document.getElementById("typingBubble");
  if (typing) typing.remove();
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  userInput.value = "";
  sendBtn.disabled = true;

  addTyping();

  try {
    const answer = await askRapidApi(text);
    removeTyping();
    addMessage(answer, "bot");
  } catch (err) {
    removeTyping();
    const errorMsg = document.createElement("div");
    errorMsg.classList.add("msg", "bot", "shake");
    errorMsg.textContent =
      "Ups, ahora mismo no puedo responder. Inténtalo de nuevo en unos segundos.";
    chat.appendChild(errorMsg);
    chat.scrollTop = chat.scrollHeight;

    console.error(err);
  } finally {
    sendBtn.disabled = false;
    userInput.focus();
  }
}
async function askRapidApi(question) {
  const url = "https://chatgpt-42.p.rapidapi.com/chat";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-rapidapi-key": "3d1bc399d1mshbf8f969b2829beep16c01cjsn3b2d7358b492",
      "x-rapidapi-host": "chatgpt-42.p.rapidapi.com",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente de una tienda de informática. Recomienda productos según presupuesto y uso (estudio, oficina, gaming). Explica de forma sencilla. Si falta información, haz 1-2 preguntas. Responde en español y con tono amable.",
        },
        { role: "user", content: question },
      ],
    }),
  });

  const rawText = await response.text();

  if (!response.ok) {
    console.error("STATUS:", response.status);
    console.error("RESPUESTA API:", rawText);
    throw new Error(`API Error ${response.status}: ${rawText}`);
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error("La API no devolvió JSON válido: " + rawText);
  }

  return (
    data?.choices?.[0]?.message?.content ||
    data?.result ||
    data?.answer ||
    "No he podido generar la respuesta."
  );
}
