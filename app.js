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

// 🔥 PANEL ADMINA
const btnAdminPanel = document.getElementById("btn-admin-panel");
const adminPanel = document.getElementById("admin-panel");
const pendingUsersList = document.getElementById("pending-users-list");

// 🔥 WSPÓLNOTY
const btnAdminWspolnoty = document.getElementById("btn-admin-wspolnoty");
const adminWspolnoty = document.getElementById("admin-wspolnoty");
const newWspolnotaName = document.getElementById("new-wspolnota-name");
const btnAddWspolnota = document.getElementById("btn-add-wspolnota");
const wspolnotyList = document.getElementById("wspolnoty-list");

// 🔥 WYBÓR WSPÓLNOTY PRZEZ MIESZKAŃCA
const selectWspolnota = document.getElementById("select-wspolnota");
const selectWspolnotaDropdown = document.getElementById("select-wspolnota-dropdown");
const btnSaveWspolnota = document.getElementById("btn-save-wspolnota");

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

  if (profile.role === "admin") {
    btnAdminPanel.classList.remove("hidden");
    btnAdminWspolnoty.classList.remove("hidden");
  } else {
    btnAdminPanel.classList.add("hidden");
    btnAdminWspolnoty.classList.add("hidden");
  }

  if (profile.role === "user" && !profile.wspolnota_id) {
    showWspolnotaSelector();
    return;
  }

  showMessage(authMessage, "Zalogowano pomyślnie.", "success");
  setAuthView(true);
  loadTickets();
});

// 🔥 PANEL ADMINA
btnAdminPanel.addEventListener("click", () => {
  adminPanel.classList.toggle("hidden");
  loadPendingUsers();
});

// 🔥 FUNKCJA: ładowanie oczekujących mieszkańców
async function loadPendingUsers() {
  pendingUsersList.innerHTML = "Ładowanie...";

  const { data, error } = await client
    .from("profiles")
    .select("id, full_name, approved, role")
    .eq("approved", false)
    .eq("role", "user");

  if (error) {
    pendingUsersList.innerHTML = "Błąd ładowania.";
    return;
  }

  if (data.length === 0) {
    pendingUsersList.innerHTML = "<p>Brak oczekujących mieszkańców.</p>";
    return;
  }

  pendingUsersList.innerHTML = "";

  data.forEach((u) => {
    const item = document.createElement("div");
    item.className = "pending-user-item";
    item.innerHTML = `
      <strong>${u.full_name || "(bez imienia)"}</strong><br>
      <small>ID: ${u.id}</small><br>
      <button class="btn-approve" data-id="${u.id}">Zatwierdź</button>
      <hr>
    `;
    pendingUsersList.appendChild(item);
  });

  document.querySelectorAll(".btn-approve").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const userId = btn.dataset.id;

      await client
        .from("profiles")
        .update({ approved: true })
        .eq("id", userId);

      loadPendingUsers();
    });
  });
});

// 🔥 PANEL WSPÓLNOT
btnAdminWspolnoty.addEventListener("click", () => {
  adminWspolnoty.classList.toggle("hidden");
  loadWspolnoty();
});

// 🔥 ŁADOWANIE WSPÓLNOT
async function loadWspolnoty() {
  wspolnotyList.innerHTML = "Ładowanie...";

  const { data, error } = await client
    .from("wspolnoty")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    wspolnotyList.innerHTML = "Błąd ładowania.";
    return;
  }

  if (data.length === 0) {
    wspolnotyList.innerHTML = "<p>Brak wspólnot.</p>";
    return;
  }

  wspolnotyList.innerHTML = "";

  data.forEach((w) => {
    const item = document.createElement("div");
    item.className = "wspolnota-item";
    item.innerHTML = `
      <strong>${w.name}</strong> <small>(ID: ${w.id})</small>
      <hr>
    `;
    wspolnotyList.appendChild(item);
  });
}

// 🔥 DODAWANIE WSPÓLNOTY
btnAddWspolnota.addEventListener("click", async () => {
  const name = newWspolnotaName.value.trim();

  if (!name) return alert("Podaj nazwę wspólnoty.");

  await client.from("wspolnoty").insert({ name });

  newWspolnotaName.value = "";
  loadWspolnoty();
});

// 🔥 WYBÓR WSPÓLNOTY PRZEZ MIESZKAŃCA
async function showWspolnotaSelector() {
  setAuthView(true);
  mainCard.classList.add("hidden");
  selectWspolnota.classList.remove("hidden");

  const { data } = await client.from("wspolnoty").select("*");

  selectWspolnotaDropdown.innerHTML = "";
  data.forEach((w) => {
    const opt = document.createElement("option");
    opt.value = w.id;
    opt.textContent = w.name;
    selectWspolnotaDropdown.appendChild(opt);
  });
}

btnSaveWspolnota.addEventListener("click", async () => {
  const wspolnotaId = selectWspolnotaDropdown.value;

  const {
    data: { session },
  } = await client.auth.getSession();

  await client
    .from("profiles")
    .update({ wspolnota_id: wspolnotaId })
    .eq("id", session.user.id);

  selectWspolnota.classList.add("hidden");
  mainCard.classList.remove("hidden");
});

// 🔥 ZAPIS ZGŁOSZENIA DO SUPABASE
btnSaveTicket.addEventListener("click", async () => {
  hideMessage(ticketFormMessage);

  const title = ticketTitle.value.trim();
  const description = ticketDescription.value.trim();
  const files = ticketAttachments.files;

  if (!title) {
    showMessage(ticketFormMessage, "Podaj tytuł zgłoszenia.", "error");
    return;
  }

  const {
    data: { session },
  } = await client.auth.getSession();

  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  let uploadedFiles = [];

  if (files.length > 0) {
    for (const file of files) {
      const filePath = `${session.user.id}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await client.storage
        .from("attachments")
        .upload(filePath, file);

      if (!uploadError) {
        uploadedFiles.push(filePath);
      }
    }
  }

  await client.from("tickets").insert({
    user_id: session.user.id,
    wspolnota_id: profile.wspolnota_id,
    title,
    description,
    attachments: uploadedFiles,
    status: "open",
  });

  ticketTitle.value = "";
  ticketDescription.value = "";
  ticketAttachments.value = "";
  ticketForm.classList.add("hidden");

  showMessage(ticketFormMessage, "Zgłoszenie zapisane.", "success");

  loadTickets();
});

// 🔥 ŁADOWANIE ZGŁOSZEŃ Z BAZY
async function loadTickets() {
  ticketsList.innerHTML = "Ładowanie...";

  const {
    data: { session },
  } = await client.auth.getSession();

  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  let query = client.from("tickets").select("*").order("created_at", { ascending: false });

  if (profile.role === "user") {
    query = query.eq("user_id", session.user.id);
  }

  if (profile.role === "admin") {
    query = query.eq("wspolnota_id", profile.wspolnota_id);
  }

  const { data, error } = await query;

  if (error) {
    ticketsList.innerHTML = "Błąd ładowania zgłoszeń.";
    return;
  }

  if (data.length === 0) {
    ticketsList.innerHTML = "<p>Brak zgłoszeń.</p>";
    return;
  }

  ticketsList.innerHTML = "";

  data.forEach((t) => {
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
    meta.textContent = `Utworzone: ${new Date(t.created_at).toLocaleString()}`;

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
    const { data: profile } = await client
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    setAuthView(true);

    if (profile.role === "admin") {
      btnAdminPanel.classList.remove("hidden");
      btnAdminWspolnoty.classList.remove("hidden");
    }

    if (profile.role === "user" && !profile.wspolnota_id) {
      showWspolnotaSelector();
      return;
    }

    loadTickets();
  } else {
    setAuthView(false);
  }
})();
