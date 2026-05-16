window.App = window.App || {};

App.announcements = (() => {
  function getDom() {
    return App.ui.dom;
  }

  function init() {
    const {
      btnAddAnnouncement,
      btnCancelAnnouncement,
      btnSaveAnnouncement
    } = getDom();

    if (btnAddAnnouncement) btnAddAnnouncement.onclick = showAnnouncementForm;
    if (btnCancelAnnouncement) btnCancelAnnouncement.onclick = hideAnnouncementForm;
    if (btnSaveAnnouncement) btnSaveAnnouncement.onclick = saveAnnouncement;

    loadAnnouncementsUser();
    loadAnnouncementsAdmin();
  }

  function showAnnouncementForm() {
    const { announcementForm } = getDom();
    if (!announcementForm) return;

    announcementForm.classList.remove("hidden");
    loadAnnouncementWspolnotyCheckboxes();
  }

  function hideAnnouncementForm() {
    const {
      announcementForm,
      announcementTitle,
      announcementContent,
      announcementGlobal,
      announcementFrom,
      announcementTo
    } = getDom();

    announcementForm.classList.add("hidden");
    announcementTitle.value = "";
    announcementContent.value = "";
    announcementGlobal.checked = false;
    announcementFrom.value = "";
    announcementTo.value = "";
  }

  async function loadAnnouncementWspolnotyCheckboxes() {
    const box = document.getElementById("announcementWspolnoty");
    if (!box) return;

    box.innerHTML = "";

    const { data, error } = await App.supabase
      .from("wspolnoty")
      .select("id, nazwa")
      .order("nazwa");

    if (error) {
      box.innerHTML = "<i>Błąd ładowania wspólnot.</i>";
      return;
    }

    data.forEach(w => {
      const div = document.createElement("div");
      div.innerHTML = `
        <label>
          <input type="checkbox" class="annWspCheck" value="${w.id}">
          ${w.nazwa}
        </label>
      `;
      box.appendChild(div);
    });
  }

  async function saveAnnouncement() {
    const {
      announcementTitle,
      announcementContent,
      announcementGlobal,
      announcementFrom,
      announcementTo
    } = getDom();

    const title = announcementTitle.value.trim();
    const content = announcementContent.value.trim();
    const isGlobal = announcementGlobal.checked;

    const validFrom = announcementFrom.value || null;
    const validTo = announcementTo.value || null;

    if (!title || !content) {
      alert("Uzupełnij tytuł i treść ogłoszenia.");
      return;
    }

    const { data: { session } } = await App.supabase.auth.getSession();

    const { data: ann, error: annError } = await App.supabase
      .from("announcements")
      .insert({
        title,
        content,
        author_id: session.user.id,
        global: isGlobal,
        valid_from: validFrom,
        valid_to: validTo
      })
      .select()
      .single();

    if (annError) {
      alert("Nie udało się zapisać ogłoszenia.");
      return;
    }

    if (!isGlobal) {
      const selected = [...document.querySelectorAll(".annWspCheck:checked")].map(c => c.value);

      if (selected.length > 0) {
        const rows = selected.map(id => ({
          announcement_id: ann.id,
          wspolnota_id: id
        }));

        await App.supabase
          .from("announcement_wspolnoty")
          .insert(rows);
      }
    }

    hideAnnouncementForm();
    loadAnnouncementsAdmin();
    loadAnnouncementsUser();
  }

  async function loadAnnouncementsUser() {
    const { userAnnouncements } = getDom();
    if (!userAnnouncements) return;

    userAnnouncements.innerHTML = "Ładowanie...";

    const { data: { session } } = await App.supabase.auth.getSession();

    const { data: profile } = await App.supabase
      .from("profiles")
      .select("wspolnota_id")
      .eq("id", session.user.id)
      .single();

    const wsp = profile.wspolnota_id;

    const { data } = await App.supabase
      .from("announcements")
      .select(`
        id,
        title,
        content,
        created_at,
        global,
        valid_from,
        valid_to,
        announcement_wspolnoty (wspolnota_id)
      `)
      .order("created_at", { ascending: false });

    const today = new Date().toISOString().split("T")[0];

    const filtered = data.filter(a =>
      (a.global ||
       (a.announcement_wspolnoty &&
        a.announcement_wspolnoty.some(x => x.wspolnota_id === wsp)))
      &&
      (a.valid_from === null || a.valid_from <= today)
      &&
      (a.valid_to === null || a.valid_to >= today)
    );

    if (!filtered.length) {
      userAnnouncements.innerHTML = "<i>Brak ogłoszeń.</i>";
      return;
    }

    userAnnouncements.innerHTML = "";

    filtered.forEach(a => {
      const div = document.createElement("div");
      div.className = "announcementItem";
      div.innerHTML = `
        <b>${a.title}</b><br>
        <small>${new Date(a.created_at).toLocaleString()}</small><br>
        ${a.content}
        <hr>
      `;
      userAnnouncements.appendChild(div);
    });
  }

  async function loadAnnouncementsAdmin() {
    const { adminAnnouncements } = getDom();
    if (!adminAnnouncements) return;

    adminAnnouncements.innerHTML = "Ładowanie...";

    const { data } = await App.supabase
      .from("announcements")
      .select(`
        id,
        title,
        content,
        created_at,
        global,
        valid_from,
        valid_to,
        announcement_wspolnoty (wspolnota_id, wspolnoty (nazwa))
      `)
      .order("created_at", { ascending: false });

    if (!data.length) {
      adminAnnouncements.innerHTML = "<i>Brak ogłoszeń.</i>";
      return;
    }

    adminAnnouncements.innerHTML = "";

    data.forEach(a => {
      const wsp = a.global
        ? "Wszystkie wspólnoty"
        : (a.announcement_wspolnoty || [])
            .map(x => x.wspolnoty?.nazwa || "—")
            .join(", ");

      const div = document.createElement("div");
      div.className = "announcementItem";
      div.innerHTML = `
        <b>${a.title}</b><br>
        <small>${new Date(a.created_at).toLocaleString()}</small><br>
        <b>Wyświetlaj:</b> ${a.valid_from || "—"} → ${a.valid_to || "bez końca"}<br>
        <b>Dotyczy:</b> ${wsp}<br><br>
        ${a.content}
        <hr>
      `;
      adminAnnouncements.appendChild(div);
    });
  }

  return {
    init,
    showAnnouncementForm,
    hideAnnouncementForm,
    loadAnnouncementWspolnotyCheckboxes,
    saveAnnouncement,
    loadAnnouncementsUser,
    loadAnnouncementsAdmin
  };
})();
