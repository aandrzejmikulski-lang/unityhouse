const client = supabase.createClient(
  "https://vswonxgsaqnhzsmzexzh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzd29ueGdzYXFuaHpzbXpleHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NjQ2OTYsImV4cCI6MjA5NDI0MDY5Nn0.mBBGMqqSRQgtM9k0aOH1Nl3WdNRj3Xj9nY6TqJgsepk"
);

// =========================
// ELEMENTY DOM
// =========================

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

// ADMIN
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

// MODAL
const ticketModal = document.getElementById("ticket-modal");
const modalClose = document.getElementById("modal-close");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const modalStatus = document.getElementById("modal-status");
const modalDate = document.getElementById("modal-date");
const modalAttachments = document.getElementById("modal-attachments");
const modalToggleStatus = document.getElementById("modal-toggle-status");


// =========================
// HELPERY UI
// =========================

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


// =========================
// PRZEŁĄCZANIE ZAKŁADEK
// =========================

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


// =========================
// REJESTRACJA
// =========================

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


// =========================
// LOGOWANIE
// =========================

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


// =========================
// WYLOGOWANIE
// =========================

btnLogout.addEventListener("click", async () => {
  await client.auth.signOut();
  setAuthView(false);
});


// =========================
// PANEL ADMINA
// =========================

btnAdminPanel.addEventListener("click", () => {
  adminPanel.classList.toggle("hidden");
  loadPendingUsers();
  loadTickets();
});


// =========================
// OCZEKUJĄCY MIESZKAŃCY
// =========================

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


// =========================
// PANEL WSPÓLNOT
// =========================

btnAdminWspolnoty.addEventListener("click", () => {
  adminWspolnoty.classList.toggle("hidden");
  loadWspolnoty();
});

async function loadWspolnoty() {
  const { data } = await client.from("wspolnoty").select("*");
  wspolnotyList.innerHTML = "";
  (data || []).forEach((w) => {
    wspolnotyList.innerHTML += `<div><strong>${w.name}</strong><hr></div>`;
  });
}

btnAddWspolnota.addEventListener("click", async () => {
  const name = newWspolnotaName.value.trim();
  if (!name) return;
  await client.from("wspolnoty").insert({ name });
  newWspolnotaName.value = "";
  loadWspolnoty();
});


// =========================
// WYBÓR WSPÓLNOTY
// =========================

async function showWspolnotaSelector() {
  setAuthView(true);
  mainCard.classList.add("hidden");
  selectWspolnota.classList.remove("hidden");

  const { data } = await client.from("wspolnoty").select("*");
  selectWspolnotaDropdown.innerHTML = "";
  (data || []).forEach((w) => {
    const opt = document.createElement("option");
    opt.value = w.id;
    opt.textContent = w.name;
    selectWspolnotaDropdown.appendChild(opt);
  });
}

btnSaveWspolnota.addEventListener("click", async () => {
  const wspolnotaId = selectWspolnotaDropdown.value;
  const { data: session } = await client.auth.getSession();

  if (!session.session) return;

  await client
    .from("profiles")
    .update({ wspolnota_id: wspolnotaId })
    .eq("id", session.session.user.id);

  selectWspolnota.classList.add("hidden");
  mainCard.classList.remove("hidden");
  loadTickets();
});


// =========================
// ZAPIS ZGŁOSZENIA
// =========================

btnSaveTicket.addEventListener("click", async () => {
  const title = ticketTitle.value.trim();
  const description = ticketDescription.value.trim();
  const files = ticketAttachments.files;

  if (!title) {
    showMessage(ticketFormMessage, "Podaj tytuł zgłoszenia.", "error");
    return;
  }

  const { data: session } = await client.auth.getSession();
  if (!session.session) {
    showMessage(ticketFormMessage, "Brak sesji użytkownika.", "error");
    return;
  }

  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", session.session.user.id)
    .single();

  let uploadedFiles = [];

  for (const file of files) {
    const filePath = `${session.session.user.id}/${Date.now()}-${file.name}`;
    await client.storage.from("attachments").upload(filePath, file);
    uploadedFiles.push(filePath);
  }

  await client.from("tickets").insert({
    user_id: session.session.user.id,
    wspolnota_id: profile.wspolnota_id,
    title,
    description,
    attachments: uploadedFiles,
    status: "open",
  });

  ticketForm.classList.add("hidden");
  ticketTitle.value = "";
  ticketDescription.value = "";
  ticketAttachments.value = "";
  hideMessage(ticketFormMessage);
  loadTickets();
});

btnNewTicket.addEventListener("click", () => {
  ticketForm.classList.toggle("hidden");
  hideMessage(ticketFormMessage);
});

btnCancelTicket.addEventListener("click", () => {
  ticketForm.classList.add("hidden");
  hideMessage(ticketFormMessage);
});


// =========================
// ŁADOWANIE ZGŁOSZEŃ
// =========================

async function loadTickets(filter = "all") {
  ticketsList.innerHTML = "";
  adminTickets.innerHTML = "";

  const { data: session } = await client.auth.getSession();
  if (!session.session) return;

  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", session.session.user.id)
    .single();

  let query = client.from("tickets").select("*").order("created_at", { ascending: false });

  if (profile.role === "user") {
    query = query.eq("user_id", profile.id);
  }

  if (filter === "open") query = query.eq("status", "open");
  if (filter === "closed") query = query.eq("status", "closed");

  const { data } = await query;

  // ADMIN – FILTRY
  if (profile.role === "admin") {
    adminTickets.innerHTML = `
      <div style="margin-bottom:10px;">
        <span class="filter-link" data-filter="all">Wszystkie</span> |
        <span class="filter-link" data-filter="open">Otwarte</span> |
        <span class="filter-link" data-filter="closed">Zamknięte</span>
      </div>
    `;

    document.querySelectorAll(".filter-link").forEach((el) => {
      el.style.cursor = "pointer";
      el.addEventListener("click", () => loadTickets(el.dataset.filter));
    });

    (data || []).forEach((t) => {
      const div = document.createElement("div");
      div.className = "ticket-item";
      div.innerHTML = `
        <div class="ticket-header">
          <div class="ticket-title">${t.title}</div>
          <span class="badge ${t.status === "open" ? "badge-open" : "badge-closed"}">
            ${t.status === "open" ? "Otwarte" : "Zamknięte"}
          </span>
        </div>
        <div class="ticket-meta">Utworzone: ${new Date(t.created_at).toLocaleString()}</div>
      `;
      div.addEventListener("click", () => openTicketDetails(t, profile.role));
      adminTickets.appendChild(div);
    });

    return;
  }

  // MIESZKANIEC
  (data || []).forEach((t) => {
    const div = document.createElement("div");
    div.className = "ticket-item";
    div.innerHTML = `
      <div class="ticket-header">
        <div class="ticket-title">${t.title}</div>
        <span class="badge ${t.status === "open" ? "badge-open" : "badge-closed"}">
          ${t.status === "open" ? "Otwarte" : "Zamknięte"}
        </span>
      </div>
      <div class="ticket-meta">Utworzone: ${new Date(t.created_at).toLocaleString()}</div>
    `;
    div.addEventListener("click", () => openTicketDetails(t, profile.role));
    ticketsList.appendChild(div);
  });
}


// =========================
// MODAL SZCZEGÓŁÓW
// =========================

function openTicketDetails(ticket, role) {
  modalTitle.textContent = ticket.title;
  modalDescription.textContent = ticket.description || "Brak opisu.";
  modalStatus.textContent = ticket.status === "open" ? "Otwarte" : "Zamknięte";
  modalDate.textContent = new Date(ticket.created_at).toLocaleString();

  renderAttachments(ticket.attachments || []);

  if (role === "admin") {
    modalToggleStatus.classList.remove("hidden");
    modalToggleStatus.textContent =
      ticket.status === "open" ? "Oznacz jako zamknięte" : "Oznacz jako otwarte";

    modalToggleStatus.onclick = () => toggleTicketStatus(ticket);
  } else {
    modalToggleStatus.classList.add("hidden");
  }

  ticketModal.classList.remove("hidden");
}

function renderAttachments(attachments) {
  modalAttachments.innerHTML = "";

  if (!attachments.length) {
    modalAttachments.innerHTML = "<p>Brak załączników.</p>";
    return;
  }

  attachments.forEach((path) => {
    const { data } = client.storage.from("attachments").getPublicUrl(path);
    const url = data.publicUrl;

    const img = document.createElement("img");
    img.src = url;
    img.className = "attachment-thumb";
    img.onclick = () => window.open(url, "_blank");

    modalAttachments.appendChild(img);
  });
}


// =========================
// ZMIANA STATUSU
// =========================

async function toggleTicketStatus(ticket) {
  const newStatus = ticket.status === "open" ? "closed" : "open";

  await client.from("tickets").update({ status: newStatus }).eq("id", ticket.id);

  ticket.status = newStatus;

  modalStatus.textContent = newStatus === "open" ? "Otwarte" : "Zamknięte";
  modalToggleStatus.textContent =
    newStatus === "open" ? "Oznacz jako zamknięte" : "Oznacz jako otwarte";

  loadTickets();
}


// =========================
// ZAMYKANIE MODALA
// =========================

modalClose.addEventListener("click", () => ticketModal.classList.add("hidden"));
ticketModal.addEventListener("click", (e) => {
  if (e.target === ticketModal) ticketModal.classList.add("hidden");
});
// =========================
// AUTO-LOGIN NA START
// =========================

(async () => {
  const { data: session } = await client.auth.getSession();

  if (!session.session) {
    setAuthView(false);
    return;
  }

  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", session.session.user.id)
    .single();

  // jeśli konto niezatwierdzone – traktuj jak wylogowanego
  if (!profile || !profile.approved) {
    await client.auth.signOut();
    setAuthView(false);
    return;
  }

  // użytkownik zalogowany
  setAuthView(true);

  if (profile.role === "admin") {
    btnAdminPanel.classList.remove("hidden");
    btnAdminWspolnoty.classList.remove("hidden");
    btnNewTicket.classList.add("hidden");
    ticketForm.classList.add("hidden");
  }

  // jeśli brak wspólnoty – pokaż wybór
  if (!profile.wspolnota_id) {
    mainCard.classList.add("hidden");
    selectWspolnota.classList.remove("hidden");
    const { data: wsp } = await client.from("wspolnoty").select("*");
    selectWspolnotaDropdown.innerHTML = "";
    (wsp || []).forEach((w) => {
      const opt = document.createElement("option");
      opt.value = w.id;
      opt.textContent = w.name;
      selectWspolnotaDropdown.appendChild(opt);
    });
    return;
  }

  // normalne ładowanie zgłoszeń
  loadTickets();
})();



