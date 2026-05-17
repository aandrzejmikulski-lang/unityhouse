window.App = window.App || {};

App.announcements = (() => {

  // ============================================
  // INICJALIZACJA
  // ============================================
  function init() {
    const dom = App.ui.dom;

    if (dom.btnAddAnnouncement) dom.btnAddAnnouncement.onclick = saveAnnouncement;

    // Ładowanie wspólnot do formularza ogłoszeń (admin)
    loadWspolnotyForAnnouncements();
  }

  // ============================================
  // ŁADOWANIE WSPÓLNOT DO FORMULARZA (ADMIN)
  // ============================================
  async function loadWspolnotyForAnnouncements() {
    const dom = App.ui.dom;

    const { data, error } = await App.supabase
      .from("wspolnoty")
      .select("*")
      .order("nazwa");

    if (error) {
      console.error("Błąd ładowania wspólnot:", error);
      return;
    }

    dom.announcementWspolnoty.innerHTML = `
      <option value="ALL">📢 Wszystkie wspólnoty</option>
      ${data.map(w => `<option value="${w.id}">${w.nazwa}</option>`).join("")}
    `;
  }

  // ============================================
  // ZAPIS OGŁOSZENIA (ADMIN)
  // ============================================
  async function saveAnnouncement() {
    const dom = App.ui.dom;

    const title = dom.announcementTitle.value.trim();
    const content = dom.announcementContent.value.trim();

    const selected = [...dom.announcementWspolnoty.selectedOptions].map(o => o.value);

    if (!title || !content) {
      alert("Uzupełnij tytuł i treść ogłoszenia.");
      return;
    }

    let wspolnoty_ids = null;

    // ALL = ogłoszenie globalne
    if (!(selected.length === 1 && selected[0] === "ALL")) {
      wspolnoty_ids = selected;
    }

    const { error } = await App.supabase.from("announcements").insert({
      title,
      content,
      wspolnoty_ids
    });

    if (error) {
      console.error("Błąd zapisu ogłoszenia:", error);
      alert("Nie udało się zapisać ogłoszenia.");
      return;
    }

    dom.announcementTitle.value = "";
    dom.announcementContent.value = "";
    dom.announcementWspolnoty.selectedIndex = 0;

    loadAnnouncementsAdmin();
  }

  // ============================================
  // ŁADOWANIE OGŁOSZEŃ — ADMIN
  // ============================================
  async function loadAnnouncementsAdmin() {
    const dom = App.ui.dom;

    const { data, error } = await App.supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Błąd ładowania ogłoszeń admina:", error);
      dom.adminAnnouncements.innerHTML = "<p>Błąd ładowania ogłoszeń.</p>";
      return;
    }

    if (!data || data.length === 0) {
      dom.adminAnnouncements.innerHTML = "<p>Brak ogłoszeń.</p>";
      return;
    }

    dom.adminAnnouncements.innerHTML = data.map(renderAnnouncementAdmin).join("");
  }

  function renderAnnouncementAdmin(a) {
    return `
      <div class="announcement-item">
        <h4>${a.title}</h4>
        <p>${a.content}</p>
        <p><strong>Widoczne dla:</strong> ${
          !a.wspolnoty_ids ? "📢 Wszystkie wspólnoty" :
          a.wspolnoty_ids.length === 1 ? `1 wspólnota` :
          `${a.wspolnoty_ids.length} wspólnot`
        }</p>
      </div>
    `;
  }

  // ============================================
  // ŁADOWANIE OGŁOSZEŃ — USER
  // ============================================
  async function loadAnnouncementsUser() {
    const dom = App.ui.dom;
    const profile = App.auth.getCurrentProfile();

    const wsp = profile.wspolnota_id;

    const { data, error } = await App.supabase
      .from("announcements")
      .select("*")
      .or(`wspolnoty_ids.is.null,wspolnoty_ids.cs.{${wsp}}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Błąd ładowania ogłoszeń:", error);
      dom.userAnnouncements.innerHTML = "<p>Błąd ładowania ogłoszeń.</p>";
      return;
    }

    if (!data || data.length === 0) {
      dom.userAnnouncements.innerHTML = "<p>Brak ogłoszeń.</p>";
      return;
    }

    dom.userAnnouncements.innerHTML = data.map(renderAnnouncementUser).join("");
  }

  function renderAnnouncementUser(a) {
    return `
      <div class="announcement-item">
        <h4>${a.title}</h4>
        <p>${a.content}</p>
      </div>
    `;
  }

  // ============================================
  // PUBLIC API
  // ============================================
  return {
    init,
    loadAnnouncementsAdmin,
    loadAnnouncementsUser,
    loadWspolnotyForAnnouncements
  };

})();
