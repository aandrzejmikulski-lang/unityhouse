// =============================================
// UNITY HOUSE — PROFILES MODULE
// Zarządza wspólnotami, użytkownikami, listami
// oczekujących i wszystkimi profilami
// =============================================

window.App = window.App || {};
App.profiles = (() => {

  // ---------------------------------------------
  // ŁADOWANIE LISTY WSPÓLNOT DO DROPDOWNU
  // ---------------------------------------------
  async function loadWspolnotyDropdown() {
    const select = document.getElementById("wspolnotaSelect");
    if (!select) return;

    select.innerHTML = `<option value="">Ładowanie...</option>`;

    const { data, error } = await App.supabase
      .from("wspolnoty")
      .select("*")
      .order("nazwa", { ascending: true });

    if (error) {
      select.innerHTML = `<option value="">Błąd ładowania</option>`;
      return;
    }

    select.innerHTML = data
      .map(w => `<option value="${w.id}">${w.nazwa}</option>`)
      .join("");
  }

  // ---------------------------------------------
  // ŁADOWANIE WSPÓLNOT DO OGŁOSZEŃ (ADMIN)
  // ---------------------------------------------
  async function loadWspolnotyForAnnouncements() {
    const select = document.getElementById("announcementWspolnoty");
    if (!select) return;

    const { data, error } = await App.supabase
      .from("wspolnoty")
      .select("*")
      .order("nazwa", { ascending: true });

    if (error) return;

    select.innerHTML = data
      .map(w => `<option value="${w.id}">${w.nazwa}</option>`)
      .join("");
  }

  // ---------------------------------------------
  // ŁADOWANIE LISTY UŻYTKOWNIKÓW OCZEKUJĄCYCH
  // ---------------------------------------------
  async function loadPendingUsers() {
    const container = document.getElementById("pendingUsersList");
    if (!container) return;

    container.innerHTML = `<p class="muted">Ładowanie...</p>`;

    const { data, error } = await App.supabase
      .from("profiles")
      .select("id, fullname, email, wspolnota_id, approved")
      .eq("approved", false);

    if (error) {
      container.innerHTML = `<p class="muted">Błąd ładowania</p>`;
      return;
    }

    if (!data.length) {
      container.innerHTML = `<p class="muted">Brak oczekujących użytkowników.</p>`;
      return;
    }

    container.innerHTML = data
      .map(u => `
        <div class="announcementItem">
          <b>${u.fullname || "Bez nazwy"}</b><br>
          <small>${u.email}</small><br>
          <button class="btn primary" onclick="App.profiles.approveUser('${u.id}')">Zatwierdź</button>
        </div>
      `)
      .join("");
  }

  // ---------------------------------------------
  // ZATWIERDZANIE UŻYTKOWNIKA
  // ---------------------------------------------
  async function approveUser(userId) {
    await App.supabase
      .from("profiles")
      .update({ approved: true })
      .eq("id", userId);

    loadPendingUsers();
    loadAllUsers();
  }

  // ---------------------------------------------
  // ŁADOWANIE WSZYSTKICH UŻYTKOWNIKÓW
  // ---------------------------------------------
  async function loadAllUsers() {
    const container = document.getElementById("allUsersList");
    if (!container) return;

    container.innerHTML = `<p class="muted">Ładowanie...</p>`;

    const { data, error } = await App.supabase
      .from("profiles")
      .select("id, fullname, email, wspolnota_id, approved, role")
      .order("fullname", { ascending: true });

    if (error) {
      container.innerHTML = `<p class="muted">Błąd ładowania</p>`;
      return;
    }

    if (!data.length) {
      container.innerHTML = `<p class="muted">Brak użytkowników.</p>`;
      return;
    }

    container.innerHTML = data
      .map(u => `
        <div class="announcementItem">
          <b>${u.fullname || "Bez nazwy"}</b> (${u.role})<br>
          <small>${u.email}</small><br>
          <small>Wspólnota: ${u.wspolnota_id || "—"}</small><br>
          <small>Status: ${u.approved ? "zatwierdzony" : "oczekujący"}</small>
        </div>
      `)
      .join("");
  }

  return {
    loadWspolnotyDropdown,
    loadWspolnotyForAnnouncements,
    loadPendingUsers,
    loadAllUsers,
    approveUser
  };

})();
