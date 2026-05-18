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

    if (!title || !content) {
      alert("Uzupełnij tytuł i treść ogłoszenia.");
      return;
    }

    App.ui.showLoader();

    const { error } = await App.supabase
      .from("announcements")
      .insert({
        title,
        content,
        created_at: new Date().toISOString()
      });

    App.ui.hideLoader();

    if (error) {
      alert("Błąd zapisu ogłoszenia.");
      console.error(error);
      return;
    }

    // Reset
    document.getElementById("announcementTitle").value = "";
    document.getElementById("announcementContent").value = "";

    loadAnnouncementsAdmin();
  }

  // ---------------------------------------------
  // ŁADOWANIE OGŁOSZEŃ UŻYTKOWNIKA
  // ---------------------------------------------
  async function loadAnnouncementsUser() {
    const container = document.getElementById("user-announcements-list");
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

    container.innerHTML = data.map(a => announcementHTML(a)).join("");
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
      return;
    }

    if (!data.length) {
      container.innerHTML = `<p class="muted">Brak ogłoszeń.</p>`;
      return;
    }

    container.innerHTML = data.map(a => announcementAdminHTML(a)).join("");
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
    return `
      <div class="announcementItem">
        <b>${a.title}</b><br>
        <small>${new Date(a.created_at).toLocaleString()}</small>
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
  }

  return {
    init,
    addAnnouncement,
    loadAnnouncementsUser,
    loadAnnouncementsAdmin
  };

})();
