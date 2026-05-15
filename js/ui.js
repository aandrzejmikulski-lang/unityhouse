// ui.js

function initUI() {
  // np. obsługa menu, modali
}

function showMessage(element, text, type = "info") {
  element.textContent = text;
  element.className = type;
}

function switchPanel(panelId) {
  document.querySelectorAll(".panel").forEach(p => p.style.display = "none");
  document.getElementById(panelId).style.display = "block";
}
// ui.js

function initUI() {
  document.getElementById("closeModal").onclick = () => {
    document.getElementById("ticketModal").classList.add("hidden");
  };
}

function hideAllPanels() {
  loginCard.classList.add("hidden");
  mainCard.classList.add("hidden");
  adminPanel.classList.add("hidden");
  selectWspolnota.classList.add("hidden");
  ticketForm.classList.add("hidden");
}

function showMessage(el, text, type = "info") {
  el.textContent = text;
  el.className = "message " + type;
  el.classList.remove("hidden");
}

function setAuthView(isLoggedIn) {
  if (isLoggedIn) {
    btnLoginTop.classList.add("hidden");
    btnRegisterTop.classList.add("hidden");
    btnLogoutTop.classList.remove("hidden");
  } else {
    btnLoginTop.classList.remove("hidden");
    btnRegisterTop.classList.remove("hidden");
    btnLogoutTop.classList.add("hidden");
  }
}

function showLoginTab() {
  goToLogin.classList.add("active");
  goToRegister.classList.remove("active");
  loginForm.classList.remove("hidden");
  registerCardInner.classList.add("hidden");
}

function showRegisterTab() {
  goToLogin.classList.remove("active");
  goToRegister.classList.add("active");
  loginForm.classList.add("hidden");
  registerCardInner.classList.remove("hidden");
}
