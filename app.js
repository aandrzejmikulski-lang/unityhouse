console.log("APP START");

// =====================================
//  KONFIGURACJA SUPABASE
// =====================================

const client = supabase.createClient(
  "https://vswonxgsaqnhzsmzexzh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzd29ueGdzYXFuaHpzbXpleHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NjQ2OTYsImV4cCI6MjA5NDI0MDY5Nn0.mBBGMqqSRQgtM9k0aOH1Nl3WdNRj3Xj9nY6TqJgsepk",
  {
    auth: {
      persistSession: false
    }
  }
);

console.log("Supabase client:", client);

// =====================================
//  LOGOWANIE
// =====================================

document.getElementById("btnLogin").addEventListener("click", async () => {
  console.log("PRÓBA LOGOWANIA...");

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  console.log("EMAIL:", email);
  console.log("PASSWORD:", password);

  console.log("client.auth:", client.auth);

  const { data, error } = await client.auth.signInWithPassword({
    email: email,
    password: password
  });

  console.log("LOGIN DATA:", data);
  console.log("LOGIN ERROR:", error);

  if (error) {
    alert("Błędny email lub hasło");
    return;
  }

  alert("Zalogowano!");
});

// =====================================
//  ELEMENTY UI
// =====================================

const loginCard = document.getElementById("loginCard");
const registerCard = document.getElementById("registerCard");
const mainCard = document.getElementById("mainCard");
const adminPanel = document.getElementById("adminPanel");
const selectWspolnota = document.getElementById("selectWspolnota");

const btnLoginTop = document.getElementById("btnLoginTop");
const btnRegisterTop = document.getElementById("btnRegisterTop");
const btnLogoutTop = document.getElementById("btnLogoutTop");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginMessage = document.getElementById("loginMessage");

const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");
const registerFullname = document.getElementById("registerFullname");
const registerMessage = document.getElementById("registerMessage");

const wspolnotaDropdown = document.getElementById("wspolnotaDropdown");
const wspolnotaMessage = document.getElementById("wspolnotaMessage");

// =====================================
//  FUNKCJE UI
// =====================================

function hideAllPanels() {
  loginCard.classList.add("hidden");
  registerCard.classList.add("hidden");
  mainCard.classList.add("hidden");
  adminPanel.classList.add("hidden");
  selectWspolnota.classList.add("hidden");
}

function showMessage(el, text, type = "info") {
  el.textContent = text;
  el.className = type;
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

// =====================================
//  OBSŁUGA ZMIANY SESJI
// =====================================

client.auth.onAuthStateChange(async (event, session) => {
  if (!session) {
    hideAllPanels();
    loginCard.classList.remove("hidden");
    setAuthView(false);
    return;
  }

  setAuthView(true);

  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  // ADMIN → od razu panel admina
  if (profile.role === "admin") {
    hideAllPanels();
    adminPanel.classList.remove("hidden");
    loadPendingUsers();
    loadTickets();
    return;
  }

  // USER bez wspólnoty → wybór wspólnoty
  if (!profile.wspolnota_id) {
    hideAllPanels();
    selectWspolnota.classList.remove("hidden");
    loadWspolnotyDropdown();
    return;
  }

  // USER ze wspólnotą → panel główny
  hideAllPanels();
  mainCard.classList.remove("hidden");
  loadTickets();
});
// =====================================
//  LOGOWANIE
// =====================================

document.getElementById("btnLogin").addEventListener("click", async () => {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  if (!email || !password) {
    showMessage(loginMessage, "Uzupełnij wszystkie pola.", "error");
    return;
  }

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    showMessage(loginMessage, "Błędny e-mail lub hasło.", "error");
    return;
  }

  showMessage(loginMessage, "Logowanie...", "success");
});


// =====================================
//  REJESTRACJA
// =====================================

document.getElementById("btnRegister").addEventListener("click", async () => {
  const email = registerEmail.value.trim();
  const password = registerPassword.value.trim();
  const fullname = registerFullname.value.trim();

  if (!email || !password || !fullname) {
    showMessage(registerMessage, "Uzupełnij wszystkie pola.", "error");
    return;
  }

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: { fullname }
    }
  });

  if (error) {
    showMessage(registerMessage, "Błąd rejestracji.", "error");
    return;
  }

  showMessage(registerMessage, "Sprawdź e-mail i potwierdź konto.", "success");
});


// =====================================
//  WYLOGOWANIE
// =====================================

btnLogoutTop.addEventListener("click", async () => {
  await client.auth.signOut();
  hideAllPanels();
  loginCard.classList.remove("hidden");
  setAuthView(false);
});


// =====================================
//  PRZEŁĄCZANIE LOGIN ↔ REJESTRACJA
// =====================================

btnLoginTop.addEventListener("click", () => {
  hideAllPanels();
  loginCard.classList.remove("hidden");
});

btnRegisterTop.addEventListener("click", () => {
  hideAllPanels();
  registerCard.classList.remove("hidden");
});

document.getElementById("goToRegister").addEventListener("click", () => {
  hideAllPanels();
  registerCard.classList.remove("hidden");
});

document.getElementById("goToLogin").addEventListener("click", () => {
  hideAllPanels();
  loginCard.classList.remove("hidden");
});
// =====================================
//  ŁADOWANIE LISTY WSPÓLNOT
// =====================================

async function loadWspolnotyDropdown() {
  wspolnotaDropdown.innerHTML = "";
  const { data, error } = await client
    .from("wspolnoty")
    .select("id, nazwa")
    .order("nazwa", { ascending: true });

  if (error) {
    showMessage(wspolnotaMessage, "Nie udało się załadować listy wspólnot.", "error");
    return;
  }

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Wybierz wspólnotę";
  wspolnotaDropdown.appendChild(defaultOption);

  data.forEach(w => {
    const opt = document.createElement("option");
    opt.value = w.id;
    opt.textContent = w.nazwa;
    wspolnotaDropdown.appendChild(opt);
  });
}


// =====================================
//  ZAPIS WYBRANEJ WSPÓLNOTY DLA UŻYTKOWNIKA
// =====================================

document.getElementById("btnSaveWspolnota").addEventListener("click", async () => {
  const selectedId = wspolnotaDropdown.value;

  if (!selectedId) {
    showMessage(wspolnotaMessage, "Wybierz wspólnotę z listy.", "error");
    return;
  }

  const {
    data: { session }
  } = await client.auth.getSession();

  if (!session) {
    showMessage(wspolnotaMessage, "Brak aktywnej sesji. Zaloguj się ponownie.", "error");
    return;
  }

  const { error } = await client
    .from("profiles")
    .update({ wspolnota_id: selectedId })
    .eq("id", session.user.id);

  if (error) {
    showMessage(wspolnotaMessage, "Nie udało się zapisać wspólnoty.", "error");
    return;
  }

  showMessage(wspolnotaMessage, "Wspólnota zapisana. Ładuję zgłoszenia...", "success");

  hideAllPanels();
  mainCard.classList.remove("hidden");
  loadTickets();
});
// =====================================
//  TWORZENIE ZGŁOSZENIA
// =====================================

document.getElementById("btnAddTicket").addEventListener("click", async () => {
  const title = document.getElementById("ticketTitle").value.trim();
  const desc = document.getElementById("ticketDesc").value.trim();
  const fileInput = document.getElementById("ticketFile");

  if (!title || !desc) {
    alert("Uzupełnij tytuł i opis.");
    return;
  }

  const {
    data: { session }
  } = await client.auth.getSession();

  const { data: profile } = await client
    .from("profiles")
    .select("wspolnota_id")
    .eq("id", session.user.id)
    .single();

  const { data: ticket, error } = await client
    .from("tickets")
    .insert({
      title,
      description: desc,
      user_id: session.user.id,
      wspolnota_id: profile.wspolnota_id,
      status: "nowe"
    })
    .select()
    .single();

  if (error) {
    alert("Błąd tworzenia zgłoszenia.");
    return;
  }

  // Upload pliku jeśli jest
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const filePath = `${ticket.id}/${file.name}`;

    const { error: uploadError } = await client.storage
      .from("ticket_files")
      .upload(filePath, file);

    if (!uploadError) {
      await client.from("ticket_files").insert({
        ticket_id: ticket.id,
        file_path: filePath
      });
    }
  }

  document.getElementById("ticketTitle").value = "";
  document.getElementById("ticketDesc").value = "";
  document.getElementById("ticketFile").value = "";

  loadTickets();
});


// =====================================
//  ŁADOWANIE ZGŁOSZEŃ
// =====================================

async function loadTickets() {
  const list = document.getElementById("ticketList");
  list.innerHTML = "Ładowanie...";

  const {
    data: { session }
  } = await client.auth.getSession();

  const { data: profile } = await client
    .from("profiles")
    .select("role, wspolnota_id")
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
    list.innerHTML = "Błąd ładowania zgłoszeń.";
    return;
  }

  list.innerHTML = "";

  data.forEach(t => {
    const div = document.createElement("div");
    div.className = "ticketItem";
    div.innerHTML = `
      <b>${t.title}</b><br>
      Status: ${t.status}<br>
      <button class="btnOpenTicket" data-id="${t.id}">Otwórz</button>
    `;
    list.appendChild(div);
  });

  document.querySelectorAll(".btnOpenTicket").forEach(btn => {
    btn.addEventListener("click", () => openTicketModal(btn.dataset.id));
  });
}


// =====================================
//  MODAL — PODGLĄD ZGŁOSZENIA
// =====================================

async function openTicketModal(ticketId) {
  const modal = document.getElementById("ticketModal");
  const modalTitle = document.getElementById("modalTicketTitle");
  const modalDesc = document.getElementById("modalTicketDesc");
  const modalFiles = document.getElementById("modalTicketFiles");
  const modalStatus = document.getElementById("modalTicketStatus");

  modal.classList.remove("hidden");

  const { data: ticket } = await client
    .from("tickets")
    .select("*")
    .eq("id", ticketId)
    .single();

  modalTitle.textContent = ticket.title;
  modalDesc.textContent = ticket.description;
  modalStatus.textContent = "Status: " + ticket.status;

  // Pliki
  const { data: files } = await client
    .from("ticket_files")
    .select("*")
    .eq("ticket_id", ticketId);

  modalFiles.innerHTML = "";

  if (files.length === 0) {
    modalFiles.innerHTML = "<i>Brak plików</i>";
  } else {
    for (const f of files) {
      const { data: urlData } = await client.storage
        .from("ticket_files")
        .createSignedUrl(f.file_path, 3600);

      const a = document.createElement("a");
      a.href = urlData.signedUrl;
      a.textContent = f.file_path.split("/")[1];
      a.target = "_blank";
      modalFiles.appendChild(a);
      modalFiles.appendChild(document.createElement("br"));
    }
  }

  // Zmiana statusu (admin)
  document.getElementById("btnStatusNowe").onclick = () => updateTicketStatus(ticketId, "nowe");
  document.getElementById("btnStatusWTrakcie").onclick = () => updateTicketStatus(ticketId, "w_trakcie");
  document.getElementById("btnStatusZamkniete").onclick = () => updateTicketStatus(ticketId, "zamkniete");
}

document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("ticketModal").classList.add("hidden");
});


// =====================================
//  ZMIANA STATUSU ZGŁOSZENIA
// =====================================

async function updateTicketStatus(ticketId, newStatus) {
  const { error } = await client
    .from("tickets")
    .update({ status: newStatus })
    .eq("id", ticketId);

  if (error) {
    alert("Błąd zmiany statusu.");
    return;
  }

  document.getElementById("ticketModal").classList.add("hidden");
  loadTickets();
}
// =====================================
//  PANEL ADMINA — OCZEKUJĄCY UŻYTKOWNICY
// =====================================

async function loadPendingUsers() {
  const list = document.getElementById("pendingUsersList");
  list.innerHTML = "Ładowanie...";

  const {
    data: { session }
  } = await client.auth.getSession();

  const { data: adminProfile } = await client
    .from("profiles")
    .select("wspolnota_id")
    .eq("id", session.user.id)
    .single();

  const { data, error } = await client
    .from("profiles")
    .select("id, email, fullname, wspolnota_id, approved")
    .eq("wspolnota_id", adminProfile.wspolnota_id)
    .eq("approved", false);

  if (error) {
    list.innerHTML = "Błąd ładowania użytkowników.";
    return;
  }

  if (!data || data.length === 0) {
    list.innerHTML = "<i>Brak oczekujących użytkowników.</i>";
    return;
  }

  list.innerHTML = "";

  data.forEach(u => {
    const div = document.createElement("div");
    div.className = "pendingUserItem";
    div.innerHTML = `
      <b>${u.fullname || "(bez imienia)"}</b> — ${u.email}<br>
      <button class="btnApproveUser" data-id="${u.id}">Zatwierdź</button>
      <button class="btnRejectUser" data-id="${u.id}">Odrzuć</button>
    `;
    list.appendChild(div);
  });

  document.querySelectorAll(".btnApproveUser").forEach(btn => {
    btn.addEventListener("click", () => approveUser(btn.dataset.id));
  });

  document.querySelectorAll(".btnRejectUser").forEach(btn => {
    btn.addEventListener("click", () => rejectUser(btn.dataset.id));
  });
}

async function approveUser(userId) {
  const { error } = await client
    .from("profiles")
    .update({ approved: true })
    .eq("id", userId);

  if (error) {
    alert("Nie udało się zatwierdzić użytkownika.");
    return;
  }

  loadPendingUsers();
  loadAllUsers();
}

async function rejectUser(userId) {
  const { error } = await client
    .from("profiles")
    .delete()
    .eq("id", userId);

  if (error) {
    alert("Nie udało się odrzucić użytkownika.");
    return;
  }

  loadPendingUsers();
  loadAllUsers();
}


// =====================================
//  PANEL ADMINA — LISTA WSZYSTKICH UŻYTKOWNIKÓW WSPÓLNOTY
// =====================================

async function loadAllUsers() {
  const list = document.getElementById("allUsersList");
  if (!list) return;

  list.innerHTML = "Ładowanie...";

  const {
    data: { session }
  } = await client.auth.getSession();

  const { data: adminProfile } = await client
    .from("profiles")
    .select("wspolnota_id")
    .eq("id", session.user.id)
    .single();

  const { data, error } = await client
    .from("profiles")
    .select("email, fullname, approved, role")
    .eq("wspolnota_id", adminProfile.wspolnota_id)
    .order("approved", { ascending: false });

  if (error) {
    list.innerHTML = "Błąd ładowania listy użytkowników.";
    return;
  }

  list.innerHTML = "";

  data.forEach(u => {
    const div = document.createElement("div");
    div.className = "userItem";
    div.innerHTML = `
      <b>${u.fullname || "(bez imienia)"}</b> — ${u.email}
      <br>Status: ${u.approved ? "zatwierdzony" : "oczekujący"}
      <br>Rola: ${u.role}
      <hr>
    `;
    list.appendChild(div);
  });
}
