// =============================================
// UNITY HOUSE — ANNOUNCEMENTS MODULE
// Ogłoszenia użytkownika, ogłoszenia admina,
// multi-wspólnoty, pełna obsługa CRUD
// =============================================

window.App = window.App || {};
App.announcements = (() => {

  // ---------------------------------------------
  // DODAWANIE OGŁOSZENIA (ADMIN)
  // ---------------------------------------------
  async function addAnnouncement() {
    const title = document.getElementById("announcementTitle").value.trim();
    const content = document.getElementById("announcementContent").value.trim();
    const wspolnotySelect = document.getElementById("announcementWspolnoty");
    const validFrom = document.getElementById("announcementFrom").value || null;
    const validTo = document.getElementById("announcementTo").value || null;

    if (!title || !content) {
      alert("Uzupełnij tytuł i treść ogłoszenia.");
      return;
    }

    // Pobieramy wybrane wspólnoty
    const wspolnotyIds = Array.from(wspolnotySelect.selectedOptions).map(o => o.value);

    App.ui.showLoader();

    await App.supabase.from("announcements").insert({
      title,
      content,
      wspolnoty_ids: wspolnotyIds.length ? wspolnotyIds : null,
      valid_from: validFrom,
      valid_to: validTo
    });

    App.ui.hideLoader();

    // Reset formularza
    document.getElementById("announcementTitle").value = "";
    document.getElementById("announcementContent").value = "";
    document.getElementById("announcementFrom").value = "";
    document.getElementById("announcementTo").value = "";
    wspolnotySelect.selectedIndex = -1;

    loadAnnouncementsAdmin();
  }

  // ---------------------------------------------
  // ŁADOWANIE OGŁOSZEŃ DLA UŻYTKOWNIKA
  // ---------------------------------------------
  async function loadAnnouncementsUser() {
    const container = document.getElementById("userAnnouncements");
    if (!container) return;

    container.innerHTML = `<p class="muted">Ładowanie...</p>`;

    const profile = App.auth.getCurrentProfile();
    if (!profile) return;

    const wspolnotaId = profile.wspolnota_id;

    const { data, error } = await App.supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      container.innerHTML = `<p class="muted">Błąd ładowania</p>`;
      return;
    }

    // Filtr: ogłoszenia globalne lub przypisane do wspólnoty + aktywne wg dat
    const today = new Date().toISOString().split("T")[0];

    const filtered = data.filter(a => {
      const wspolnotaMatch = !a.wspolnoty_ids || a.wspolnoty_ids.includes(wspolnotaId);
      const fromOk = !a.valid_from || a.valid_from <= today;
      const toOk = !a.valid_to || a.valid_to >= today;
      return wspolnotaMatch && fromOk && toOk;
    });

    if (!filtered.length) {
      container.innerHTML = `<p class="muted">Brak ogłoszeń.</p>`;
      return;
    }

    container.innerHTML = filtered
      .map(a => announcementHTML(a))
      .join("");
  }

  // ---------------------------------------------
  // ŁADOWANIE OGŁOSZEŃ ADMINA
  // ---------------------------------------------
  async function loadAnnouncementsAdmin() {
    const container = document.getElementById("adminAnnouncements");
    if (!container) return;

    container.innerHTML = `<p class="muted">Ładowanie...</p>`;

    const { data, error } = await App.supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      container.innerHTML = `<p class="muted">Błąd ładowania</p>`;
      return;
    }

    if (!data.length) {
      container.innerHTML = `<p class="muted">Brak ogłoszeń.</p>`;
      return;
    }

    container.innerHTML = data
      .map(a => announcementAdminHTML(a))
      .join("");
  }

  // ---------------------------------------------
  // HTML OGŁOSZENIA (USER)
  // ---------------------------------------------
  function announcementHTML(a) {
    return `
      <div class="announcementItem">
        <b>${a.title}</b><br>
        <small>${new Date(a.created_at).toLocaleString()}</small>
        <p>${a.content}</p>
      </div>
    `;
  }

  // ---------------------------------------------
  // HTML OGŁOSZENIA (ADMIN)
  // ---------------------------------------------
  function announcementAdminHTML(a) {
    const wsp = a.wspolnoty_ids
      ? a.wspolnoty_ids.join(", ")
      : "Wszystkie wspólnoty";

    const from = a.valid_from
      ? new Date(a.valid_from).toLocaleDateString()
      : "—";
    const to = a.valid_to
      ? new Date(a.valid_to).toLocaleDateString()
      : "—";

    // Status kolorowy
    const today = new Date().toISOString().split("T")[0];
    let status = "";
    if (a.valid_from && a.valid_from > today) status = "⚪ zaplanowane";
    else if (a.valid_to && a.valid_to < today) status = "🔴 wygasłe";
    else status = "🟢 aktywne";

    return `
      <div class="announcementItem">
        <b>${a.title}</b><br>
        <small>${new Date(a.created_at).toLocaleString()}</small><br>
        <small>Wspólnoty: ${wsp}</small><br>
        <small>Wyświetlaj: ${from} → ${to}</small><br>
        <small>Status: ${status}</small>
        <p>${a.content}</p>
      </div>
    `;
  }

  // ---------------------------------------------
  // INICJALIZACJA
  // ---------------------------------------------
  function init() {
    const btn = document.getElementById("btnAddAnnouncement");
    if (btn) btn.onclick = addAnnouncement;

    // Ładowanie wspólnot do multi-select
    App.profiles.loadWspolnotyForAnnouncements();
  }

  return {
    init,
    addAnnouncement,
    loadAnnouncementsUser,
    loadAnnouncementsAdmin
  };

})();
