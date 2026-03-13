const chatContainer = document.getElementById("chatContainer");
const input = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const fileInput = document.getElementById("fileInput");


function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;
  chatContainer.appendChild(msg);

  chatContainer.scrollTop = chatContainer.scrollHeight;
  return msg
}


async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  const typingBubble = addMessage("Thinking...","bot" );
  const token = localStorage.getItem("token");

  try {
        // --- Sending the input to server ---
        const response = await fetch("secondbrain-demo.duckdns.org/api/chat", {
            method: "POST",
            headers: {"Content-Type": "application/json",
               "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ question: text })
        });
        // - the received output 

        const data = await response.json();
        typingBubble.innerText = data.answer;

    } catch (err) {
        typingBubble.innerText = "⚠️ Error connecting to server";
        console.error(err);
    }
}

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// File upload handler
fileInput.addEventListener("change", () => {
  sendFiles();
});


async function sendFiles(){
    const files = fileInput.files;

    const formData = new FormData();

    const token = localStorage.getItem("token");

    for (let file of files){
      formData.append("files", file);
      addMessage(`Uploading: ${file.name}`, "bot")
    }
   
    try {
    const response = await fetch("secondbrain-demo.duckdns.org/api/upload", {
      method: "POST",
      headers:{
      "Authorization": `Bearer ${token}`
      },
      body: formData   
    });


  } catch (err) {
    console.error(err);
    addMessage("⚠️ Upload failed, please try again later", "bot");
  }
}

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginModal = document.getElementById("loginModal");

const submitLogin = document.getElementById("submitLogin");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const submitAuth = document.getElementById("submitAuth");

let authMode = "login";

loginTab.addEventListener("click", () => {

  authMode = "login";

  loginTab.classList.add("active");
  registerTab.classList.remove("active");

  submitAuth.innerText = "Login";

});

registerTab.addEventListener("click", () => {

  authMode = "register";

  registerTab.classList.add("active");
  loginTab.classList.remove("active");

  submitAuth.innerText = "Register";

});





// OPEN LOGIN MODAL
loginBtn.addEventListener("click", () => {
  loginModal.style.display = "flex";
});

window.addEventListener("click", (e) => {
  if (e.target === loginModal) {
    loginModal.style.display = "none";
  }
});

// LOGIN REQUEST
submitAuth.addEventListener("click", async () => {

  const username = usernameInput.value;
  const password = passwordInput.value;

  const endpoint = authMode === "login"
    ? "https://secondbrain-demo.duckdns.org/api/login"
    : "https://secondbrain-demo.duckdns.org/api/register";

  try {

    const response = await fetch(endpoint,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: username,
        password: password
      })
    });

    const data = await response.json();

    if(authMode === "login" && data.access_token){

      localStorage.setItem("token", data.access_token);

      loginModal.style.display = "none";
      loginBtn.style.display = "none";
      logoutBtn.style.display = "block";

      addMessage("✅ Logged in successfully","bot");

    }

    if(authMode === "register"){
      loginModal.style.display = "none";
      loginBtn.style.display = "none";
      logoutBtn.style.display = "block";

      addMessage("✅ Account created! You are now logged in.","bot");
    }

  } catch(err){
    console.error(err);
  }

});


// LOGOUT
logoutBtn.addEventListener("click", () => {

  localStorage.removeItem("token");

  loginBtn.style.display = "block";
  logoutBtn.style.display = "none";

  addMessage("Logged out","bot");
});

