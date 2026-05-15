function initUI() {
  document.getElementById("closeModal").onclick = () => {
    document.getElementById("ticketModal").classList.add("hidden");
  };
}

function hideAllPanels() {
  loginCard.classList.add("hidden");
  mainCard.classList.add("hidden");
  adminCard.classList.add("hidden");
  wspolnotaCard.classList.add("hidden");
  selectWspolnotaCard.classList.add("hidden");
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
  registerCard.classList.add("hidden");
}

function showRegisterTab() {
  goToLogin.classList.remove("active");
  goToRegister.classList.add("active");

  loginForm.classList.add("hidden");
  registerCard.classList.remove("hidden");
}
