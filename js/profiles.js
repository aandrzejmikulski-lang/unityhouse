// ===============================
// INIT
// ===============================
function initProfiles() {
  if (btnSaveWspolnota) btnSaveWspolnota.onclick = saveWspolnota;
}


// ===============================
// ŁADOWANIE LISTY WSPÓLNOT (DLA UŻYTKOWNIKA)
// ===============================
async function loadWspolnotyDropdown() {
  if (!wspolnotaDropdown) return;

  wspolnotaDropdown.innerHTML = "";

  const { data, error } = await client
    .from("wspolnoty")
    .select("id, nazwa")
    .order("nazwa");

  if (error || !data) {
    showMessage(wspolnotaMessage, "Nie udało się załadować listy wspólnot.", "error");
    return;
  }

  const def = document.createElement("option");
  def.value = "";
  def.textContent = "Wybierz wspólnotę";
  wspolnotaDropdown.appendChild(def);

  data.forEach(w => {
    const opt = document.createElement("option");
    opt.value = w.id;
    opt.textContent = w.nazwa;
    wspolnotaDropdown.appendChild(opt);
  });
}


// ===============================
// ZAPIS WYBRANEJ WSPÓLNOTY
// ===============================
async function saveWspolnota() {
  const selectedId = wspolnotaDropdown.value;

  if (!selectedId) {
    showMessage(wspolnotaMessage, "Wybierz wspólnotę.", "error");
    return;
  }

  const { data: { session }, error: sessionError } = await client.auth.getSession();
  if (sessionError || !session?.user) {
    showMessage(wspolnotaMessage, "Brak sesji użytkownika.", "error");
    return;
  }

  await client
    .from("profiles")
    .update({ wspolnota_id: selectedId })
    .eq("id", session.user.id);

  hideAllPanels();
  mainCard.classList.remove("hidden");
  loadTicketsUser(selectedId);
}


// ===============================
// OCZEKUJĄCY UŻYTKOWNICY (ADMIN)
// ===============================
async function loadPendingUsers() {
  if (!pendingUsersList) return;

  pendingUsersList.innerHTML = "Ładowanie...";

  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("approved", false)
    .eq("role", "user");

  if (error || !data) {
    pendingUsersList.innerHTML = "<i>Błąd ładowania.</i>";
    return;
  }

  if (!data.length) {
    pendingUsersList.innerHTML = "<i>Brak oczekujących użytkowników.</i>";
    return;
  }

  pendingUsersList.innerHTML = "";

  data.forEach(u => {
    const div = document.createElement("div");
    div.className = "pendingUserItem";
    div.innerHTML = `
      <b>${u.fullname}</b> — ${u.email}<br>
      <button class="btnApproveUser" data-id="${u.id}">Zatwierdź</button>
      <button class="btnRejectUser" data-id="${u.id}">Odrzuć</button>
    `;
    pendingUsersList.appendChild(div);
  });

  document.querySelectorAll(".btnApproveUser").forEach(btn =>
    btn.onclick = () => approveUser(btn.dataset.id)
  );

  document.querySelectorAll(".btnRejectUser").forEach(btn =>
    btn.onclick = () => rejectUser(btn.dataset.id)
  );
}


// ===============================
// ZATWIERDZENIE UŻYTKOWNIKA
// ===============================
async function approveUser(id) {
  await client.from("profiles").update({ approved: true }).eq("id", id);
  loadPendingUsers();
  loadAllUsers();
}


// ===============================
// ODRZUCENIE UŻYTKOWNIKA
// ===============================
async function rejectUser(id) {
  await client.from("profiles").delete().eq("id", id);
  loadPendingUsers();
  loadAllUsers();
}


// ===============================
// WSZYSCY UŻYTKOWNICY (ADMIN)
// ===============================
async function loadAllUsers() {
  if (!allUsersList) return;

  allUsersList.innerHTML = "Ładowanie...";

  const { data, error } = await client
    .from("profiles")
    .select(`
      id,
      email,
      fullname,
      role,
      approved,
      wspolnota_id,
      wspolnoty (nazwa)
    `)
    .order("email");

  if (error || !data) {
    allUsersList.innerHTML = "<i>Błąd ładowania użytkowników.</i>";
    return;
  }

  allUsersList.innerHTML = "";

  data.forEach(u => {
    const div = document.createElement("div");
    div.className = "userItem";
    div.innerHTML = `
      <b>${u.fullname}</b> — ${u.email}
      <br>Wspólnota: ${u.wspolnoty?.nazwa || "brak"}
      <br>Status: ${u.approved ? "zatwierdzony" : "oczekujący"}
      <br>Rola: ${u.role}
      <hr>
    `;
    allUsersList.appendChild(div);
  });
}
