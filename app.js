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
const signupFullName = document.getElementById("signup-fullname"); // 🔥 NOWE
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

// 🔥 REJESTRACJA
btnSignup.addEventListener("click", async () => {
  hideMessage(authMessage);

  const email = signupEmail.value.trim();
  const password = signupPassword.value.trim();
  const fullName = signupFullName.value.trim();

  if (!email || !password || !fullName) {
    showMessage(authMessage, "Podaj imię i nazwisko, email i hasło.", "error");
    return;
  }

  btnSignup.disabled = true;

  const { data, error } = await client.auth.signUp({
    email,
    password,
  });

  btnSignup.disabled = false;

  if (error) {
    console.error(error);
    showMessage(authMessage, `Błąd rejestracji: ${error.message}`, "error");
    return;
  }

  // 🔥 KROK 7 — uzupełnienie profilu
  await client
    .from("profiles")
    .update({
      full_name: fullName
    })
    .eq("id", data.user.id);

  if (data.user && !data.session) {
    showMessage(
      authMessage,
      "Konto utworzone. Sprawdź email i potwierdź rejestrację.",
      "success"
    );
  } else {
    showMessage(authMessage, "Konto utworzone i zalogowane.", "success");
    setAuthView(true);
    loadTickets();
  }
});

// 🔥 LOGOWANIE
btnLogin.addEventListener("click", async () => {
  hideMessage(authMessage);

  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  if (!email || !password) {
    showMessage(authMessage, "Podaj email i hasło.", "error");
    return;
  }

  btnLogin.disabled = true;

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  btnLogin.disabled = false;

  if (error) {
    console.error(error);
    showMessage(authMessage, `Błąd logowania: ${error.message}`, "error");
    return;
  }

  // 🔥 BLOKADA NIEZATWIERDZONYCH
  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (!profile.approved) {
    showMessage(authMessage, "Twoje konto czeka na zatwierdzenie przez administratora.", "error");
    await client.auth.signOut();
    return;
  }

  showMessage(authMessage, "Zalogowano pomyślnie.", "success");
  setAuthView(true);
  loadTickets();
});

// Wylogowanie
btnLogout.addEventListener("click", async () => {
  await client.auth.signOut();
  setAuthView(false);
});

// Formularz zgłoszenia
btnNewTicket.addEventListener("click", () => {
  ticketForm.classList.remove("hidden");
  hideMessage(ticketFormMessage);
});

btnCancelTicket.addEventListener("click", () => {
  ticketForm.classList.add("hidden");
  ticketTitle.value = "";
  ticketDescription.value = "";
  ticketAttachments.value = "";
  hideMessage(ticketFormMessage);
});

btnSaveTicket.addEventListener("click", async () => {
  hideMessage(ticketFormMessage);

  const title = ticketTitle.value.trim();
  const description = ticketDescription.value.trim();

  if (!title) {
    showMessage(ticketFormMessage, "Podaj tytuł zgłoszenia.", "error");
    return;
  }

  showMessage(ticketFormMessage, "Zgłoszenie zostanie zapisane (logika później).", "success");
});

// Ładowanie zgłoszeń
async function loadTickets() {
  ticketsList.innerHTML = "";

  const demoTickets = [
    {
      id: 1,
      title: "Uszkodzona klamka w drzwiach wejściowych",
      status: "open",
      created_at: "2026-05-13 10:15",
    },
    {
      id: 2,
      title: "Przepalona żarówka na klatce 3B",
      status: "closed",
      created_at: "2026-05-12 18:40",
    },
  ];

  demoTickets.forEach((t) => {
    const item = document.createElement("div");
    item.className = "ticket-item";

    const header = document.createElement("div");
    header.className = "ticket-header";

    const title = document.createElement("div");
    title.className = "ticket-title";
    title.textContent = t.title;

    const badge = document.createElement("span");
    badge.className =
      "badge " + (t.status === "open" ? "badge-open" : "badge-closed");
    badge.textContent = t.status === "open" ? "Otwarte" : "Zamknięte";

    header.appendChild(title);
    header.appendChild(badge);

    const meta = document.createElement("div");
    meta.className = "ticket-meta";
    meta.textContent = `Utworzone: ${t.created_at}`;

    item.appendChild(header);
    item.appendChild(meta);

    ticketsList.appendChild(item);
  });
}

// Sprawdzenie sesji przy starcie
(async () => {
  const {
    data: { session },
  } = await client.auth.getSession();

  if (session) {
    setAuthView(true);
    loadTickets();
  } else {
    setAuthView(false);
  }
})();
