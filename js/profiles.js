window.App = window.App || {};

App.profiles = (() => {
  function getDom() {
    return App.ui.dom;
  }

  function init() {
    const { btnSaveWspolnota } = getDom();
    if (btnSaveWspolnota) btnSaveWspolnota.onclick = saveWspolnota;
  }

  async function loadWspolnotyDropdown() {
    const { wspolnotaDropdown, wspolnotaMessage } = getDom();

    wspolnotaDropdown.innerHTML = "";

    const { data, error } = await App.supabase
      .from("wspolnoty")
      .select("id, nazwa")
      .order("nazwa");

    if (error) {
      App.ui.showMessage(wspolnotaMessage, "Błąd ładowania wspólnot.", "error");
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
    const { wspolnotaDropdown, wspolnotaMessage } = getDom();

    const selectedId = wspolnotaDropdown.value;
    if (!selectedId) {
      App.ui.showMessage(wspolnotaMessage, "Wybierz wspólnotę.", "error");
      return;
    }

    const { data: { session } } = await App.supabase.auth.getSession();

    await App.supabase
      .from("profiles")
      .update({ wspolnota_id: selectedId })
      .eq("id", session.user.id);

    App.ui.showSection("mainCard");
    App.tickets.loadTicketsUser(selectedId);
    App.announcements.loadAnnouncementsUser();
  }

  async function loadPendingUsers() {
    const { pendingUsersList } = getDom();

    pendingUsersList.innerHTML = "Ładowanie...";

    const { data } = await App.supabase
      .from("profiles")
      .select("*")
      .eq("approved", false)
      .eq("role", "user");

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

    pendingUsersList.querySelectorAll(".btnApproveUser").forEach(btn =>
      btn.onclick = () => approveUser(btn.dataset.id)
    );

    pendingUsersList.querySelectorAll(".btnRejectUser").forEach(btn =>
      btn.onclick = () => rejectUser(btn.dataset.id)
    );
  }

  async function approveUser(id) {
    await App.supabase.from("profiles").update({ approved: true }).eq("id", id);
    loadPendingUsers();
    loadAllUsers();
  }

  async function rejectUser(id) {
    await App.supabase.from("profiles").delete().eq("id", id);
    loadPendingUsers();
    loadAllUsers();
  }

  async function loadAllUsers() {
    const { allUsersList } = getDom();

    allUsersList.innerHTML = "Ładowanie...";

    const { data } = await App.supabase
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

  return {
    init,
    loadWspolnotyDropdown,
    saveWspolnota,
    loadPendingUsers,
    approveUser,
    rejectUser,
    loadAllUsers
  };
})();
