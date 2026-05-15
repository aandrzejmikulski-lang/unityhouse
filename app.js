// =====================================
//  SUPABASE
// =====================================

const client = supabase.createClient(
  "https://vswonxgsaqnhzsmzexzh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzd29ueGdzYXFuaHpzbXpleHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NjQ2OTYsImV4cCI6MjA5NDI0MDY5Nn0.mBBGMqqSRQgtM9k0aOH1Nl3WdNRj3Xj9nY6TqJgsepk",
  { auth: { persistSession: false } }
);

// =====================================
//  ELEMENTY UI
// =====================================

const loginCard = document.getElementById("loginCard");
const loginForm = document.getElementById("loginForm");
const registerCardInner = document.getElementById("registerCard");

const mainCard = document.getElementById("mainCard");
const adminPanel = document.getElementById("adminPanel");
const selectWspolnota = document.getElementById("selectWspolnota");
const ticketForm = document.getElementById("ticketForm");

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

const goToLogin = document.getElementById("goToLogin");
const goToRegister = document.getElementById("goToRegister");

let currentProfile = null; // zapamiętujemy profil (rola, wspólnota)

// =====================================
//  FUNKCJE UI
// =====================================

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

// =====================================
//  OBSŁUGA ZMIANY SESJI
// =====================================

client.auth.onAuthStateChange(async (event, session) => {
  if (!session) {
    currentProfile = null;
    hideAllPanels();
    loginCard.classList.remove("hidden");
    showLoginTab();
    setAuthView(false);
    return;
  }

  setAuthView(true);

  const { data: profile, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error) {
    console.error("Błąd pobierania profilu:", error);
    hideAllPanels();
    loginCard.classList.remove("hidden");
    return;
  }

  currentProfile = profile;

  // ADMIN
  if (profile.role === "admin") {
    hideAllPanels();
    adminPanel.classList.remove("hidden");
    loadPendingUsers();
    loadAllUsers();
    loadTicketsAdmin();
    return;
  }

  // USER bez wspólnoty
  if (!profile.wspolnota_id) {
    hideAllPanels();
    selectWspolnota.classList.remove("hidden");
    loadWspolnotyDropdown();
    return;
  }

  // USER ze wspólnotą
  hideAllPanels();
  mainCard.classList.remove("hidden");
  loadTicketsUser(profile.wspolnota_id);
});

// =====================================
//  LOGOWANIE
// =====================================

document.getElementById("btnLogin").onclick = async () => {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  if (!email || !password) {
    showMessage(loginMessage, "Uzupełnij wszystkie pola.", "error");
    return;
  }

  const { error } = await client.auth.signInWithPassword({ email, password });

  if (error) {
    showMessage(loginMessage, "Błędny e-mail lub hasło.", "error");
    return;
  }

  showMessage(loginMessage, "Logowanie...", "success");
};

// =====================================
//  REJESTRACJA
// =====================================

document.getElementById("btnRegister").onclick = async () => {
  const email = registerEmail.value.trim();
  const password = registerPassword.value.trim();
  const fullname = registerFullname.value.trim();

  if (!email || !password || !fullname) {
    showMessage(registerMessage, "Uzupełnij wszystkie pola.", "error");
    return;
  }

  // 1. Rejestracja w auth
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { fullname } }
  });

  if (error) {
    console.error("Błąd rejestracji:", error);
    showMessage(registerMessage, "Błąd rejestracji.", "error");
    return;
  }

  // 2. Tworzenie profilu w tabeli profiles
  if (data.user) {
    const { error: profileError } = await client
      .from("profiles")
      .insert([
        {
          id: data.user.id,
          fullname: fullname || "Nieznany użytkownik",
          role: "user",
          approved: false,
          wspolnota_id: null
        }
      ]);

    if (profileError) {
      console.error("Błąd tworzenia profilu:", profileError);
      showMessage(registerMessage, "Błąd tworzenia profilu.", "error");
      return;
    }
  }

  showMessage(registerMessage, "Sprawdź e-mail i potwierdź konto.", "success");
};


// =====================================
//  WYLOGOWANIE
// =====================================

btnLogoutTop.onclick = async () => {
  await client.auth.signOut();

  loginEmail.value = "";
  loginPassword.value = "";

  currentProfile = null;

  hideAllPanels();
  loginCard.classList.remove("hidden");
  showLoginTab();
  setAuthView(false);
};

// =====================================
//  PRZEŁĄCZANIE LOGIN ↔ REJESTRACJA
// =====================================

btnLoginTop.onclick = () => {
  hideAllPanels();
  loginCard.classList.remove("hidden");
  showLoginTab();
};

btnRegisterTop.onclick = () => {
  hideAllPanels();
  loginCard.classList.remove("hidden");
  showRegisterTab();
};

goToLogin.onclick = () => {
  showLoginTab();
};

goToRegister.onclick = () => {
  showRegisterTab();
};

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
    console.error("Błąd ładowania wspólnot:", error);
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
//  ZAPIS WYBRANEJ WSPÓLNOTY
// =====================================

document.getElementById("btnSaveWspolnota").onclick = async () => {
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
    console.error("Błąd zapisu wspólnoty:", error);
    showMessage(wspolnotaMessage, "Nie udało się zapisać wspólnoty.", "error");
    return;
  }

  showMessage(wspolnotaMessage, "Wspólnota zapisana. Ładuję zgłoszenia...", "success");

  hideAllPanels();
  mainCard.classList.remove("hidden");
  loadTicketsUser(selectedId);
};

// =====================================
//  NOWE ZGŁOSZENIE — OTWARCIE FORMULARZA
// =====================================

document.getElementById("btnAddTicket").onclick = () => {
  ticketForm.classList.remove("hidden");
};

document.getElementById("btnCancelTicket").onclick = () => {
  ticketForm.classList.add("hidden");
};

// =====================================
//  ZAPIS ZGŁOSZENIA
// =====================================

document.getElementById("btnSaveTicket").onclick = async () => {
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

  if (!session) {
    alert("Brak sesji. Zaloguj się ponownie.");
    return;
  }

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("wspolnota_id")
    .eq("id", session.user.id)
    .single();

  if (profileError || !profile?.wspolnota_id) {
    console.error("Błąd profilu przy tworzeniu zgłoszenia:", profileError);
    alert("Brak przypisanej wspólnoty.");
    return;
  }

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
    console.error("Błąd tworzenia zgłoszenia:", error);
    alert("Błąd tworzenia zgłoszenia.");
    return;
  }

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
    } else {
      console.error("Błąd uploadu pliku:", uploadError);
    }
  }

  document.getElementById("ticketTitle").value = "";
  document.getElementById("ticketDesc").value = "";
  document.getElementById("ticketFile").value = "";
  ticketForm.classList.add("hidden");

  loadTicketsUser(profile.wspolnota_id);
};

// =====================================
//  ŁADOWANIE ZGŁOSZEŃ — USER
// =====================================

async function loadTicketsUser(wspolnota_id) {
  const list = document.getElementById("ticketList");
  list.innerHTML = "Ładowanie...";

  const {
    data: { session }
  } = await client.auth.getSession();

  if (!session) {
    list.innerHTML = "Brak sesji.";
    return;
  }

  const { data, error } = await client
    .from("tickets")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("wspolnota_id", wspolnota_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Błąd ładowania zgłoszeń (user):", error);
    list.innerHTML = "Błąd ładowania zgłoszeń.";
    return;
  }

  list.innerHTML = "";

  if (!data || data.length === 0) {
    list.innerHTML = "<i>Brak zgłoszeń.</i>";
    return;
  }

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
//  ŁADOWANIE ZGŁOSZEŃ — ADMIN
// =====================================

async function loadTicketsAdmin() {
  const list = document.getElementById("adminTickets");
  if (!list) return;

  list.innerHTML = "Ładowanie...";

  const { data, error } = await client
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Błąd ładowania zgłoszeń (admin):", error);
    list.innerHTML = "Błąd ładowania zgłoszeń.";
    return;
  }

  list.innerHTML = "";

  if (!data || data.length === 0) {
    list.innerHTML = "<i>Brak zgłoszeń.</i>";
    return;
  }

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

  document.querySelectorAll("#adminTickets .btnOpenTicket").forEach(btn => {
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

  const btnStatusNowe = document.getElementById("btnStatusNowe");
  const btnStatusWTrakcie = document.getElementById("btnStatusWTrakcie");
  const btnStatusZamkniete = document.getElementById("btnStatusZamkniete");

  modal.classList.remove("hidden");

  const { data: ticket, error } = await client
    .from("tickets")
    .select("*")
    .eq("id", ticketId)
    .single();

  if (error) {
    console.error("Błąd pobierania zgłoszenia:", error);
    modalTitle.textContent = "Błąd ładowania zgłoszenia";
    return;
  }

  modalTitle.textContent = ticket.title;
  modalDesc.textContent = ticket.description || "";
  modalStatus.textContent = "Status: " + ticket.status;

  const { data: files, error: filesError } = await client
    .from("ticket_files")
    .select("*")
    .eq("ticket_id", ticketId);

  modalFiles.innerHTML = "";

  if (filesError) {
    console.error("Błąd ładowania plików:", filesError);
    modalFiles.innerHTML = "<i>Błąd ładowania plików</i>";
  } else if (!files || files.length === 0) {
    modalFiles.innerHTML = "<i>Brak plików</i>";
  } else {
    for (const f of files) {
      const { data: urlData, error: urlError } = await client.storage
        .from("ticket_files")
        .createSignedUrl(f.file_path, 3600);

      if (urlError) {
        console.error("Błąd tworzenia URL pliku:", urlError);
        continue;
      }

      const a = document.createElement("a");
      a.href = urlData.signedUrl;
      a.textContent = f.file_path.split("/")[1];
      a.target = "_blank";
      modalFiles.appendChild(a);
      modalFiles.appendChild(document.createElement("br"));
    }
  }

  // przyciski statusu tylko dla admina
  const isAdmin = currentProfile && currentProfile.role === "admin";
  btnStatusNowe.style.display = isAdmin ? "inline-block" : "none";
  btnStatusWTrakcie.style.display = isAdmin ? "inline-block" : "none";
  btnStatusZamkniete.style.display = isAdmin ? "inline-block" : "none";

  if (isAdmin) {
    btnStatusNowe.onclick = () => updateTicketStatus(ticketId, "nowe");
    btnStatusWTrakcie.onclick = () => updateTicketStatus(ticketId, "w_trakcie");
    btnStatusZamkniete.onclick = () => updateTicketStatus(ticketId, "zamkniete");
  }
}

document.getElementById("closeModal").onclick = () => {
  document.getElementById("ticketModal").classList.add("hidden");
};

// =====================================
//  ZMIANA STATUSU
// =====================================

async function updateTicketStatus(ticketId, newStatus) {
  const { error } = await client
    .from("tickets")
    .update({ status: newStatus })
    .eq("id", ticketId);

  if (error) {
    console.error("Błąd zmiany statusu:", error);
    alert("Błąd zmiany statusu.");
    return;
  }

  document.getElementById("ticketModal").classList.add("hidden");
  loadTicketsAdmin();
}

// =====================================
//  PANEL ADMINA — OCZEKUJĄCY UŻYTKOWNICY
// =====================================

async function loadPendingUsers() {
  const list = document.getElementById("pendingUsersList");
  list.innerHTML = "Ładowanie...";

  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("approved", false);

  if (error) {
    console.error("Błąd ładowania oczekujących użytkowników:", error);
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
    console.error("Błąd zatwierdzania użytkownika:", error);
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
    console.error("Błąd odrzucania użytkownika:", error);
  }

  loadPendingUsers();
  loadAllUsers();
}

// =====================================
//  PANEL ADMINA — WSZYSCY UŻYTKOWNICY
// =====================================

async function loadAllUsers() {
  const list = document.getElementById("allUsersList");
  if (!list) return;

  list.innerHTML = "Ładowanie...";

  const { data, error } = await client
    .from("profiles")
    .select("*")
    .order("email", { ascending: true });

  if (error) {
    console.error("Błąd ładowania listy użytkowników:", error);
    list.innerHTML = "Błąd ładowania listy użytkowników.";
    return;
  }

  list.innerHTML = "";

  if (!data || data.length === 0) {
    list.innerHTML = "<i>Brak użytkowników.</i>";
    return;
  }

  data.forEach(u => {
    const div = document.createElement("div");
    div.className = "userItem";
    div.innerHTML = `
      <b>${u.fullname || "(bez imienia)"}</b> — ${u.email}
      <br>Wspólnota: ${u.wspolnota_id || "brak"}
      <br>Status: ${u.approved ? "zatwierdzony" : "oczekujący"}
      <br>Rola: ${u.role}
      <hr>
    `;
    list.appendChild(div);
  });
}
