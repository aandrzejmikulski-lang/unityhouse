// =============================================
// UNITY HOUSE — ANNOUNCEMENTS MODULE
// Ogłoszenia użytkownika i admina
// =============================================

window.App = window.App || {};
App.announcements = (() => {

  // ---------------------------------------------
  // DODAWANIE OGŁOSZENIA (ADMIN)
  // ---------------------------------------------
  async function addAnnouncement() {
    const title = document.getElementById("announcementTitle")?.value.trim();
    const content = document.getElementById("announcementContent")?.value.trim();
    const wspolnotaSelect = document.getElementById("announcementWspolnota");
    const validFrom = document.getElementById("announcementFrom")?.value || null;
    const validTo = document.getElementById("announcementTo")?.value || null;

    if (!title || !content) {
      alert("Uzupełnij tytuł i treść ogłoszenia.");
      return;
    }

    const wspolnotaId = wspolnotaSelect?.value || null;

    App.ui.showLoader();

    const { error } = await App.supabase
      .from("announcements")
      .insert({
        title,
        content,
        wspolnota_id: wspolnotaId,
        valid_from: validFrom,
        valid_to: validTo,
        created_at: new Date().toISOString()
      });

    App.ui.hideLoader();

    if (error) {
      alert("Błąd zapisu ogłoszenia.");
      console.error(error);
      return;
    }

    document.getElementById("announcementTitle").value = "";
    document.getElementById("announcementContent").value = "";
    if (document.getElementById("announcementFrom")) document.getElementById("announcementFrom").value = "";
    if (document.getElementById("announcementTo")) document.getElementById("announcementTo").value = "";
    if (wspolnotaSelect) wspolnotaSelect.value = "";

    loadAnnouncementsAdmin();
  }

  // ---------------------------------------------
  // ŁADOWANIE OGŁOSZEŃ UŻYTKOWNIKA
  // ---------------------------------------------
  async function loadAnnouncementsUser() {
    const container = document.getElementById("user-announcements-list");
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
      console.error(error);
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    const filtered = data.filter(a => {
      const wspMatch = !a.wspolnota_id || a.wspolnota_id === wspolnotaId;
      const fromOk = !a.valid_from || a.valid_from <= today;
      const toOk = !a.valid_to || a.valid_to >= today;
      return wspMatch && fromOk && toOk;
    });

    if (!filtered.length) {
      container.innerHTML = `<p class="muted">Brak ogłoszeń.</p>`;
      return;
    }

    container.innerHTML = filtered.map(announcementHTML).join("");
  }

  // ---------------------------------------------
  // ŁADOWANIE OGŁOSZEŃ ADMINA
  // ---------------------------------------------
  async function loadAnnouncementsAdmin() {
    const container = document.getElementById("admin-announcements-list");
    if (!container) return;

    container.innerHTML = `<p class="muted">Ładowanie...</p>`;

    const { data, error } = await App.supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      container.innerHTML = `<p class="muted">Błąd ładowania</p>`;
      console.error(error);
      return;
    }

    if (!data.length) {
      container.innerHTML = `<p class="muted">Brak ogłoszeń.</p>`;
      return;
    }

    container.innerHTML = data.map(announcementAdminHTML).join("");
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
    const from = a.valid_from ? new Date(a.valid_from).toLocaleDateString() : "—";
    const to = a.valid_to ? new Date(a.valid_to).toLocaleDateString() : "—";

    const today = new Date().toISOString().split("T")[0];
    let status = "";
    if (a.valid_from && a.valid_from > today) status = "⚪ zaplanowane";
    else if (a.valid_to && a.valid_to < today) status = "🔴 wygasłe";
    else status = "🟢 aktywne";

    return `
      <div class="announcementItem">
        <b>${a.title}</b><br>
        <small>${new Date(a.created_at).toLocaleString()}</small><br>
        <small>Wspólnota: ${a.wspolnota_id || "wszystkie"}</small><br>
        <small>Wyświetlaj: ${from} → ${to}</small><br>
        <small>Status: ${status}</small>
        <p>${a.content}</p>
      </div>
    `;
  }

  // ---------------------------------------------
  // INIT
  // ---------------------------------------------
  function init() {
    const btn = document.getElementById("btnAddAnnouncement");
    if (btn) btn.onclick = addAnnouncement;

    App.profiles.loadWspolnotyForAnnouncements();
  }

  return {
    init,
    addAnnouncement,
    loadAnnouncementsUser,
    loadAnnouncementsAdmin
  };

})();
