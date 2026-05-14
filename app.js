// =====================================
//  INIT SUPABASE
// =====================================

const client = supabase.createClient(
  "https://YOUR_PROJECT.supabase.co",
  "YOUR_PUBLIC_ANON_KEY"
);

// =====================================
//  ELEMENTY UI
// =====================================

const authCard = document.getElementById("auth-card");
const mainCard = document.getElementById("main-card");
const adminPanel = document.getElementById("admin-panel");
const adminWspolnoty = document.getElementById("admin-wspolnoty");
const selectWspolnota = document.getElementById("select-wspolnota");
const ticketForm = document.getElementById("ticket-form");

const ticketsList = document.getElementById("tickets-list");
const adminTickets = document.getElementById("admin-tickets");

const btnShowLogin = document.getElementById("btn-show-login");
const btnShowSignup = document.getElementById("btn-show-signup");
const btnLogin = document.getElementById("btn-login");
const btnSignup = document.getElementById("btn-signup");
const btnLogout = document.getElementById("btn-logout");

const btnAdminPanel = document.getElementById("btn-admin-panel");
const btnAdminWspolnoty = document.getElementById("btn-admin-wspolnoty");

const btnNewTicket = document.getElementById("btn-new-ticket");
const btnSaveTicket = document.getElementById("btn-save-ticket");
const btnCancelTicket = document.getElementById("btn-cancel-ticket");

const ticketTitle = document.getElementById("ticket-title");
const ticketDescription = document.getElementById("ticket-description");
const ticketAttachments = document.getElementById("ticket-attachments");

const ticketModal = document.getElementById("ticket-modal");
const modalClose = document.getElementById("modal-close");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const modalStatus = document.getElementById("modal-status");
const modalDate = document.getElementById("modal-date");
const modalAttachments = document.getElementById("modal-attachments");
const modalToggleStatus = document.getElementById("modal-toggle-status");

const authMessage = document.getElementById("auth-message");
const ticketFormMessage = document.getElementById("ticket-form-message");

// =====================================
//  FUNKCJE POMOCNICZE
// =====================================

function showMessage(el, text, type = "info") {
  el.textContent = text;
  el.className = `message ${type}`;
  el.classList.remove("hidden");
}

function hideAllPanels() {
  authCard.classList.add("hidden");
  mainCard.classList.add("hidden");
  adminPanel.classList.add("hidden");
  adminWspolnoty.classList.add("hidden");
  selectWspolnota.classList.add("hidden");
  ticketForm.classList.add("hidden");
}

// =====================================
//  USTAWIENIE WIDOKU
// =====================================

function setAuthView(isLoggedIn) {
  hideAllPanels();

  if (!isLoggedIn) {
    authCard.classList.remove("hidden");
    btnLogout.classList.add("hidden");
    btnAdminPanel.classList.add("hidden");
    btnAdminWspolnoty.classList.add("hidden");
    return;
  }

  btnLogout.classList.remove("hidden");
}

// =====================================
//  OBSŁUGA SESJI
// =====================================

client.auth.onAuthStateChange(async (event, session) => {
  if (!session) {
    setAuthView(false);
    return;
  }

  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (!profile.wspolnota_id) {
    hideAllPanels();
    selectWspolnota.classList.remove("hidden");
    loadWspolnotyDropdown();
    return;
  }

  if (profile.role === "admin") {
    btnAdminPanel.classList.remove("hidden");
    btnAdminWspolnoty.classList.remove("hidden");
    hideAllPanels();
    adminPanel.classList.remove("hidden");
    loadPendingUsers();
    loadTickets();
    return;
  }

  hideAllPanels();
  mainCard.classList.remove("hidden");
  loadTickets();
});

// =====================================
//  LOGOWANIE
// =====================================

btnLogin.addEventListener("click", async () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const { error } = await client.auth.signInWithPassword({ email, password });

  if (error) {
    showMessage(authMessage, "Błędne dane logowania.", "error");
    return;
  }
});

// =====================================
//  REJESTRACJA
// =====================================

btnSignup.addEventListener("click", async () => {
  const fullname = document.getElementById("signup-fullname").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  const { data, error } = await client.auth.signUp({
    email,
    password,
  });

  if (error) {
    showMessage(authMessage, "Błąd rejestracji.", "error");
    return;
  }

  await client.from("profiles").insert({
    id: data.user.id,
    fullname,
    role: "user",
  });

  showMessage(authMessage, "Konto utworzone. Możesz się zalogować.", "success");
});

// =====================================
//  WYLOGOWANIE
// =====================================

btnLogout.addEventListener("click", async () => {
  await client.auth.signOut();

  ticketModal.classList.add("hidden");
  modalTitle.textContent = "";
  modalDescription.textContent = "";
  modalStatus.textContent = "";
  modalDate.textContent = "";
  modalAttachments.innerHTML = "";

  hideAllPanels();
  setAuthView(false);
});
// =====================================
//  WSPÓLNOTY – DROPDOWN DLA UŻYTKOWNIKA
// =====================================

const selectWspolnotaDropdown = document.getElementById("select-wspolnota-dropdown");
const btnSaveWspolnota = document.getElementById("btn-save-wspolnota");
const btnAddWspolnota = document.getElementById("btn-add-wspolnota");
const newWspolnotaName = document.getElementById("new-wspolnota-name");
const wspolnotyList = document.getElementById("wspolnoty-list");
const pendingUsersList = document.getElementById("pending-users-list");

async function loadWspolnotyDropdown() {
  const { data } = await client.from("wspolnoty").select("*").order("name");
  selectWspolnotaDropdown.innerHTML = "";

  if (!data || data.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Brak wspólnot – skontaktuj się z administratorem.";
    selectWspolnotaDropdown.appendChild(opt);
    return;
  }

  data.forEach((w) => {
    const opt = document.createElement("option");
    opt.value = w.id;
    opt.textContent = w.name;
    selectWspolnotaDropdown.appendChild(opt);
  });
}

btnSaveWspolnota.addEventListener("click", async () => {
  const wspolnotaId = selectWspolnotaDropdown.value;
  const session = await client.auth.getSession();
  if (!session.data.session) return;

  await client
    .from("profiles")
    .update({ wspolnota_id: wspolnotaId })
    .eq("id", session.data.session.user.id);

  hideAllPanels();
  mainCard.classList.remove("hidden");
  loadTickets();
});

// =====================================
//  PANEL ADMINA – WSPÓLNOTY
// =====================================

btnAdminWspolnoty.addEventListener("click", () => {
  hideAllPanels();
  adminWspolnoty.classList.remove("hidden");
  loadWspolnotyList();
});

async function loadWspolnotyList() {
  const { data } = await client.from("wspolnoty").select("*").order("created_at");
  wspolnotyList.innerHTML = "";

  if (!data || data.length === 0) {
    wspolnotyList.innerHTML = "<p>Brak wspólnot.</p>";
    return;
  }

  data.forEach((w) => {
    const div = document.createElement("div");
    div.className = "wspolnota-item";
    div.textContent = w.name;
    wspolnotyList.appendChild(div);
  });
}

btnAddWspolnota.addEventListener("click", async () => {
  const name = newWspolnotaName.value.trim();
  if (!name) return;

  await client.from("wspolnoty").insert({ name });
  newWspolnotaName.value = "";
  loadWspolnotyList();
});

// =====================================
//  PANEL ADMINA – UŻYTKOWNICY OCZEKUJĄCY
// =====================================

btnAdminPanel.addEventListener("click", () => {
  hideAllPanels();
  adminPanel.classList.remove("hidden");
  loadPendingUsers();
  loadTickets();
});

async function loadPendingUsers() {
  const { data } = await client
    .from("profiles")
    .select("*")
    .is("wspolnota_id", null)
    .order("created_at", { ascending: true });

  pendingUsersList.innerHTML = "";

  if (!data || data.length === 0) {
    pendingUsersList.innerHTML = "<p>Brak użytkowników oczekujących na przypisanie.</p>";
    return;
  }

  data.forEach((u) => {
    const row = document.createElement("div");
    row.className = "pending-user-row";
    row.innerHTML = `
      <div>
        <strong>${u.fullname || "Bez nazwy"}</strong><br />
        <span class="muted">${u.id}</span>
      </div>
      <button class="btn ghost" data-user-id="${u.id}">Przypisz do wspólnoty</button>
    `;
    pendingUsersList.appendChild(row);
  });

  pendingUsersList.querySelectorAll("button[data-user-id]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const userId = btn.getAttribute("data-user-id");
      hideAllPanels();
      selectWspolnota.classList.remove("hidden");

      btnSaveWspolnota.onclick = async () => {
        const wspolnotaId = selectWspolnotaDropdown.value;
        await client
          .from("profiles")
          .update({ wspolnota_id: wspolnotaId })
          .eq("id", userId);

        hideAllPanels();
        adminPanel.classList.remove("hidden");
        loadPendingUsers();
        loadTickets();
      };

      await loadWspolnotyDropdown();
    });
  });
}

// =====================================
//  ZGŁOSZENIA – WIDOK MIESZKAŃCA I ADMINA
// =====================================

async function loadTickets() {
  const session = await client.auth.getSession();
  if (!session.data.session) return;

  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", session.data.session.user.id)
    .single();

  let query = client.from("tickets").select("*").order("created_at", { ascending: false });

  if (profile.role === "user") {
    query = query.eq("user_id", session.data.session.user.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Błąd ładowania zgłoszeń:", error);
    return;
  }

  if (profile.role === "user") {
    renderUserTickets(data || []);
  } else {
    renderAdminTickets(data || [], profile);
  }
}

function renderUserTickets(tickets) {
  ticketsList.innerHTML = "";

  if (!tickets.length) {
    ticketsList.innerHTML = "<p>Brak zgłoszeń.</p>";
    return;
  }

  tickets.forEach((t) => {
    const div = document.createElement("div");
    div.className = "ticket-item";
    div.innerHTML = `
      <div class="ticket-header">
        <div class="ticket-title">${t.title}</div>
        <span class="badge ${t.status === "open" ? "badge-open" : "badge-closed"}">
          ${t.status === "open" ? "Otwarte" : "Zamknięte"}
        </span>
      </div>
      <div class="ticket-meta">
        Utworzone: ${new Date(t.created_at).toLocaleString("pl-PL")}
      </div>
    `;

    div.addEventListener("click", () => openTicketDetails(t, "user"));
    ticketsList.appendChild(div);
  });
}

function renderAdminTickets(tickets, profile) {
  adminTickets.innerHTML = "";

  if (!tickets.length) {
    adminTickets.innerHTML = "<p>Brak zgłoszeń.</p>";
    return;
  }

  tickets.forEach((t) => {
    const div = document.createElement("div");
    div.className = "ticket-item";
    div.innerHTML = `
      <div class="ticket-header">
        <div class="ticket-title">${t.title}</div>
        <span class="badge ${t.status === "open" ? "badge-open" : "badge-closed"}">
          ${t.status === "open" ? "Otwarte" : "Zamknięte"}
        </span>
      </div>
      <div class="ticket-meta">
        Utworzone: ${new Date(t.created_at).toLocaleString("pl-PL")}
      </div>
    `;

    div.addEventListener("click", () => openTicketDetails(t, profile.role));
    adminTickets.appendChild(div);
  });
}
// =====================================
//  NOWE ZGŁOSZENIE – FORMULARZ
// =====================================

btnNewTicket.addEventListener("click", () => {
  hideAllPanels();
  ticketForm.classList.remove("hidden");
  ticketTitle.value = "";
  ticketDescription.value = "";
  ticketAttachments.value = "";
  ticketFormMessage.classList.add("hidden");
});

btnCancelTicket.addEventListener("click", () => {
  hideAllPanels();
  mainCard.classList.remove("hidden");
});

// =====================================
//  ZAPIS ZGŁOSZENIA + ZAŁĄCZNIKÓW (ticket_files)
// =====================================

btnSaveTicket.addEventListener("click", async () => {
  const title = ticketTitle.value.trim();
  const description = ticketDescription.value.trim();
  const files = ticketAttachments.files;

  if (!title || !description) {
    showMessage(ticketFormMessage, "Uzupełnij tytuł i opis.", "error");
    return;
  }

  const session = await client.auth.getSession();
  if (!session.data.session) return;

  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", session.data.session.user.id)
    .single();

  // 1. Tworzymy zgłoszenie
  const { data: newTicket, error: ticketError } = await client
    .from("tickets")
    .insert({
      user_id: session.data.session.user.id,
      wspolnota_id: profile.wspolnota_id,
      title,
      description,
      status: "open",
    })
    .select()
    .single();

  if (ticketError) {
    showMessage(ticketFormMessage, "Błąd tworzenia zgłoszenia.", "error");
    return;
  }

  // 2. Upload plików + zapis do ticket_files
  for (const file of files) {
    const filePath = `${newTicket.id}/${Date.now()}-${file.name}`;

    await client.storage.from("attachments").upload(filePath, file);

    await client.from("ticket_files").insert({
      ticket_id: newTicket.id,
      file_path: filePath,
    });
  }

  showMessage(ticketFormMessage, "Zgłoszenie zapisane.", "success");

  setTimeout(() => {
    hideAllPanels();
    mainCard.classList.remove("hidden");
    loadTickets();
  }, 600);
});

// =====================================
//  MODAL – SZCZEGÓŁY ZGŁOSZENIA
// =====================================

async function openTicketDetails(ticket, role) {
  modalTitle.textContent = ticket.title;
  modalDescription.textContent = ticket.description || "Brak opisu.";
  modalStatus.textContent = ticket.status === "open" ? "Otwarte" : "Zamknięte";
  modalDate.textContent = new Date(ticket.created_at).toLocaleString("pl-PL");

  modalToggleStatus.classList.add("hidden");
  if (role === "admin") {
    modalToggleStatus.classList.remove("hidden");
    modalToggleStatus.textContent =
      ticket.status === "open" ? "Zamknij zgłoszenie" : "Otwórz zgłoszenie";

    modalToggleStatus.onclick = () => toggleTicketStatus(ticket);
  }

  await loadTicketFiles(ticket.id);

  ticketModal.classList.remove("hidden");
}

modalClose.addEventListener("click", () => {
  ticketModal.classList.add("hidden");
});

// =====================================
//  ŁADOWANIE ZAŁĄCZNIKÓW Z ticket_files
// =====================================

async function loadTicketFiles(ticketId) {
  const { data: files } = await client
    .from("ticket_files")
    .select("*")
    .eq("ticket_id", ticketId);

  modalAttachments.innerHTML = "";

  if (!files || files.length === 0) {
    modalAttachments.innerHTML = "<p>Brak załączników.</p>";
    return;
  }

  files.forEach((f) => {
    const { data } = client.storage.from("attachments").getPublicUrl(f.file_path);
    const url = data.publicUrl;

    const img = document.createElement("img");
    img.src = url;
    img.className = "attachment-thumb";
    img.onclick = () => window.open(url, "_blank");

    modalAttachments.appendChild(img);
  });
}

// =====================================
//  ZMIANA STATUSU ZGŁOSZENIA
// =====================================

async function toggleTicketStatus(ticket) {
  const newStatus = ticket.status === "open" ? "closed" : "open";

  const { error } = await client
    .from("tickets")
    .update({ status: newStatus })
    .eq("id", ticket.id);

  if (error) {
    console.error("Błąd zmiany statusu:", error);
    return;
  }

  ticketModal.classList.add("hidden");
  loadTickets();
}
