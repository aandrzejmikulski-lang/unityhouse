// app.js

// Elementy DOM
const authCard = document.getElementById("auth-card");
const mainCard = document.getElementById("main-card");

const btnShowLogin = document.getElementById("btn-show-login");
const btnShowSignup = document.getElementById("btn-show-signup");
const btnLogout = document.getElementById("btn-logout");

const tabs = document.querySelectorAll(".tab");
const tabLogin = document.getElementById("tab-login");
const tabSignup = document.getElementById("tab-signup");

const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const btnLogin = document.getElementById("btn-login");

const signupEmail = document.getElementById("signup-email");
const signupPassword = document.getElementById("signup-password");
const btnSignup = document.getElementById("btn-signup");

const authMessage = document.getElementById("auth-message");

const btnNewTicket = document.getElementById("btn-new-ticket");
const ticketForm = document.getElementById("ticket-form");
const ticketTitle = document.getElementById("ticket-title");
const ticketDescription = document.getElementById("ticket-description");
const ticketAttachments = document.getElementById("ticket-attachments");
const btnCancelTicket = document.getElementById("btn-cancel-ticket");
const btnSaveTicket = document.getElementById("btn-save-ticket");
const ticketFormMessage = document.getElementById("ticket-form-message");
const ticketsList = document.getElementById("tickets-list");

// Helpery UI
function showMessage(el, text, type = "success") {
  el.textContent = text;
  el.classList.remove("hidden", "error", "success");
  el.classList.add(type === "error" ? "error" : "success");
}

function hideMessage(el) {
  el.classList.add("hidden");
  el.textContent = "";
}

function setAuthView(isLoggedIn) {
  if (isLoggedIn) {
    authCard.classList.add("hidden");
    mainCard.classList.remove("hidden");
    btnLogout.classList.remove("hidden");
    btnShowLogin.classList.add("hidden");
    btnShowSignup.classList.add("hidden");
  } else {
    authCard.classList.remove("hidden");
    mainCard.classList.add("hidden");
    btnLogout.classList.add("hidden");
    btnShowLogin.classList.remove("hidden");
    btnShowSignup.classList.remove("hidden");
  }
}

// Przełączanie zakładek
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    const target = tab.dataset.tab;
    if (target === "login") {
      tabLogin.classList.remove("hidden");
      tabSignup.classList.add("hidden");
    } else {
      tabSignup.classList.remove("hidden");
      tabLogin.classList.add("hidden");
    }
    hideMessage(authMessage);
  });
});

btnShowLogin.addEventListener("click", () => {
  tabs.forEach((t) => t.classList.remove("active"));
  document.querySelector('.tab[data-tab="login"]').classList.add("active");
  tabLogin.classList.remove("hidden");
  tabSignup.classList.add("hidden");
  hideMessage(authMessage);
});

btnShowSignup.addEventListener("click", () => {
  tabs.forEach((t) => t.classList.remove("active"));
  document.querySelector('.tab[data-tab="signup"]').classList.add("active");
  tabSignup.classList.remove("hidden");
  tabLogin.classList.add("hidden");
  hideMessage(authMessage);
});

// Rejestracja
btnSignup.addEventListener("click", async () => {
  hideMessage(authMessage);

  const email = signupEmail.value.trim();
  const password = signupPassword.value.trim();

  if (!email || !password) {
    showMessage(authMessage, "Podaj email i hasło.", "error");
    return;
  }

  btnSignup.disabled = true;

  const { data
