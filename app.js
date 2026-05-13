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
const signupFullName = document.getElementById("signup-fullname");
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

// PANEL ADMINA
const btnAdminPanel = document.getElementById("btn-admin-panel");
const adminPanel = document.getElementById("admin-panel");
const pendingUsersList = document.getElementById("pending-users-list");
const adminTickets = document.getElementById("admin-tickets");

// WSPÓLNOTY
const btnAdminWspolnoty = document.getElementById("btn-admin-wspolnoty");
const adminWspolnoty = document.getElementById("admin-wspolnoty");
const newWspolnotaName = document.getElementById("new-wspolnota-name");
const btnAddWspolnota = document.getElementById("btn-add-wspolnota");
const wspolnotyList = document.getElementById("wspolnoty-list");

// WYBÓR WSPÓLNOTY
const selectWspolnota = document.getElementById("select-wspolnota");
const selectWspolnotaDropdown = document.getElementById("select-wspolnota-dropdown");
const btnSaveWspolnota = document.getElementById("btn-save-wspolnota");

// MODAL SZCZEGÓŁÓW ZGŁOSZENIA
const ticketModal = document.getElementById("ticket-modal");
const modalClose = document.getElementById("modal-close");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const modalStatus = document.getElementById("modal-status");
const modalDate = document.getElementById("modal-date");
const modalAttachments = document.getElementById("modal-attachments");
const modalToggleStatus = document.getElementById("modal-toggle-status");

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

    btnAdminPanel.classList.add("hidden");
    btnAdminWspolnoty.classList.add("hidden");
    adminPanel.classList.add("hidden");
    adminWspolnoty.classList.add("hidden");
    ticketForm.classList.add("hidden");
    btnNewTicket.classList.remove("hidden");
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

// REJESTRACJA
btnSignup.addEventListener("click", async () => {
  hideMessage(authMessage);

  const email = signupEmail.value.trim();
  const password = signupPassword.value.trim();
  const fullName = signupFullName.value.trim();

  if (!email || !password || !fullName) {
    showMessage(authMessage, "Podaj imię i nazwisko, email i hasło.", "error");
    return;
  }

  const { data, error } = await client.auth.signUp({ email, password });
  if (error) {
    showMessage(authMessage, `Błąd rejestracji: ${error.message}`, "error");
    return;
  }

  await client.from("profiles").upsert({
    id: data.user.id,
    full_name: fullName,
    role: "user",
    approved: false,
    wspolnota_id: null
  });

  showMessage(authMessage, "Konto utworzone. Sprawdź email.", "success");
});

// LOGOWANIE
btnLogin.addEventListener("click", async () => {
  hideMessage(authMessage);

  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    showMessage(authMessage, `Błąd logowania: ${error.message}`, "error");
    return;
  }

  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (!profile.approved) {
    showMessage(authMessage, "Twoje konto czeka na zatwierdzenie.", "error");
    await client.auth.signOut();
    return;
  }

  setAuthView(true);

  if (profile.role === "admin") {
    btnAdminPanel.classList.remove("hidden");
    btnAdminWspolnoty.classList.remove("hidden");
    btnNewTicket.classList.add("hidden");
    ticketForm.classList.add("hidden");
  }

  loadTickets();
});

// WYLOGOWANIE
btnLogout.addEventListener("click", async () => {
  await client.auth.signOut();
  setAuthView(false);
});

// PANEL ADMINA
btnAdminPanel.addEventListener("click", () => {
  adminPanel.classList.toggle("hidden");
  loadPendingUsers();
  loadTickets();
});

// OCZEKUJĄCY MIESZKAŃCY
async function loadPendingUsers() {
  const { data } = await client
    .from("profiles")
    .select("id, full_name")
    .eq("approved", false)
    .eq("role", "user");

  pendingUsersList.innerHTML = "";
  (data || []).forEach((u) => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${u.full_name}</strong><br>
      <button class="btn-approve" data-id="${u.id}">Zatwierdź</button><hr>`;
    pendingUsersList.appendChild(div);
  });

  document.querySelectorAll(".btn-approve").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await client.from("profiles").update({ approved: true }).eq("id", btn.dataset.id);
      loadPendingUsers();
    });
  });
}

// WSPÓLNOTY
btnAdminWspolnoty.addEventListener("click", () => {
  adminWspolnoty.classList.toggle("hidden");
  loadWspolnoty();
});

async
