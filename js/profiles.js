function initProfiles() {
  btnSaveWspolnota.onclick = saveWspolnota;
}

async function loadWspolnotyDropdown() {
  wspolnotaDropdown.innerHTML = "";

  const { data, error } = await client
    .from("wspolnoty")
    .select("id, nazwa")
    .order("nazwa");

  if (error) {
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

async function saveWspolnota() {
  const selectedId = wspolnotaDropdown.value;

  if (!selectedId) {
    showMessage(wspolnotaMessage, "Wybierz wspólnotę.", "error");
    return;
  }

  const { data: { session } } = await client.auth.getSession();

  await client
    .from("profiles")
    .update({ wspolnota_id: selectedId })
    .eq("id", session.user.id);

  hideAllPanels();
  mainCard.classList.remove("hidden");
  loadTicketsUser(selectedId);
}

async function loadPendingUsers() {
  const list = pendingUsersList;
  list.innerHTML = "Ładowanie...";

 const { data } = await client
  .from("profiles")
  .select("*")
  .eq("approved", false)
  .eq("role", "user");


  if (!data.length) {
    list.innerHTML = "<i>Brak oczekujących użytkowników.</i>";
    return;
  }

  list.innerHTML = "";

  data.forEach(u => {
    const div = document.createElement("div");
    div.className = "pendingUserItem";
    div.innerHTML = `
      <b>${u.fullname}</b> — ${u.email}<br>
      <button class="btnApproveUser" data-id="${u.id}">Zatwierdź</button>
      <button class="btnRejectUser" data-id="${u.id}">Odrzuć</button>
    `;
    list.appendChild(div);
  });

  document.querySelectorAll(".btnApproveUser").forEach(btn =>
    btn.onclick = () => approveUser(btn.dataset.id)
  );

  document.querySelectorAll(".btnRejectUser").forEach(btn =>
    btn.onclick = () => rejectUser(btn.dataset.id)
  );
}

async function approveUser(id) {
  await client.from("profiles").update({ approved: true }).eq("id", id);
  loadPendingUsers();
  loadAllUsers();
}

async function rejectUser(id) {
  await client.from("profiles").delete().eq("id", id);
  loadPendingUsers();
  loadAllUsers();
}

async function loadAllUsers() {
  const list = allUsersList;
  list.innerHTML = "Ładowanie...";

  const { data } = await client
    .from("profiles")
    .select("*")
    .order("email");

  list.innerHTML = "";

  data.forEach(u => {
    const div = document.createElement("div");
    div.className = "userItem";
    div.innerHTML = `
      <b>${u.fullname}</b> — ${u.email}
      <br>Wspólnota: ${u.wspolnota_id || "brak"}
      <br>Status: ${u.approved ? "zatwierdzony" : "oczekujący"}
      <br>Rola: ${u.role}
      <hr>
    `;
    list.appendChild(div);
  });
}
