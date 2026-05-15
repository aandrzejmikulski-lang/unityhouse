// auth.js

function initAuth() {
  document.getElementById("btnLogin")?.addEventListener("click", loginUser);
  document.getElementById("btnRegister")?.addEventListener("click", registerUser);
  document.getElementById("btnLogout")?.addEventListener("click", logoutUser);
}

async function registerUser() {
  // tu wkleimy Twój kod rejestracji
}

async function loginUser() {
  // tu wkleimy logowanie
}

async function logoutUser() {
  await client.auth.signOut();
  switchPanel("loginPanel");
}
