// ===============================
//  INIT
// ===============================
function initAnnouncements() {
  const btnAdd = document.getElementById("btnAddAnnouncement");
  const btnCancel = document.getElementById("btnCancelAnnouncement");
  const btnSave = document.getElementById("btnSaveAnnouncement");

  if (btnAdd) btnAdd.onclick = () => showAnnouncementForm();
  if (btnCancel) btnCancel.onclick = () => hideAnnouncementForm();
  if (btnSave) btnSave.onclick = saveAnnouncement;

  loadAnnouncementsUser();
  loadAnnouncementsAdmin();
}


// ===============================
//  FORMULARZ
// ===============================
function showAnnouncementForm() {
  announcementForm.classList.remove("hidden");
  loadAnnouncementWspolnotyCheckboxes();
}

function hideAnnouncementForm() {
  announcementForm.classList.add("hidden");
  announcementTitle.value = "";
  announcementContent.value = "";
  announcementGlobal.checked = false;
}


// ===============================
//  ŁADOWANIE LISTY WSPÓLNOT DO CHECKBOXÓW
// ===============================
async function loadAnnouncementWspolnotyCheckboxes() {
  const box = document.getElementById("announcementWspolnoty");
  box.innerHTML = "";

  const { data } = await client
    .from("wspolnoty")
    .select("id, nazwa")
    .order("nazwa");

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


// ===============================
//  ZAPIS OGŁOSZENIA
// ===============================
async function saveAnnouncement() {
  const title = announcementTitle.value.trim();
  const content = announcementContent.value.trim();
  const isGlobal = announcementGlobal.checked;

  if (!title || !content) {
    alert("Uzupełnij tytuł i treść ogłoszenia.");
    return;
  }

  const { data: { session } } = await client.auth.getSession();

  // 1. Zapis ogłoszenia
  const { data: ann } = await client
    .from("announcements")
    .insert({
      title,
      content,
      author_id: session.user.id,
      global: isGlobal
    })
    .select()
    .single();

  // 2. Jeśli nie globalne → zapis powiązań
  if (!isGlobal) {
    const selected = [...document.querySelectorAll(".annWspCheck:checked")]
      .map(c => c.value);

    if (selected.length > 0) {
      const rows = selected.map(id => ({
        announcement_id: ann.id,
        wspolnota_id: id
      }));

      await client.from("announcement_wspolnoty").insert(rows);
    }
  }

  hideAnnouncementForm();
  loadAnnouncementsAdmin();
  loadAnnouncementsUser();
}


// ===============================
//  OGŁOSZENIA DLA MIESZKAŃCA
// ===============================
async function loadAnnouncementsUser() {
  if (!userAnnouncements) return;

  userAnnouncements.innerHTML = "Ładowanie...";

  const { data: { session } } = await client.auth.getSession();

  const { data: profile } = await client
    .from("profiles")
    .select("wspolnota_id")
    .eq("id", session.user.id)
    .single();

  const wsp = profile.wspolnota_id;

  // Pobieramy:
  // - globalne ogłoszenia
  // - ogłoszenia przypisane do wspólnoty użytkownika
  const { data } = await client
    .from("announcements")
    .select(`
      id,
      title,
      content,
      created_at,
      global,
      announcement_wspolnoty (wspolnota_id)
    `)
    .order("created_at", { ascending: false });

  const filtered = data.filter(a =>
    a.global ||
    a.announcement_wspolnoty.some(x => x.wspolnota_id === wsp)
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


// ===============================
//  OGŁOSZENIA DLA ADMINA
// ===============================
async function loadAnnouncementsAdmin() {
  if (!adminAnnouncements) return;

  adminAnnouncements.innerHTML = "Ładowanie...";

  const { data } = await client
    .from("announcements")
    .select(`
      id,
      title,
      content,
      created_at,
      global,
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
      : a.announcement_wspolnoty.map(x => x.wspolnoty.nazwa).join(", ");

    const div = document.createElement("div");
    div.className = "announcementItem";
    div.innerHTML = `
      <b>${a.title}</b><br>
      <small>${new Date(a.created_at).toLocaleString()}</small><br>
      <b>Dotyczy:</b> ${wsp}<br><br>
      ${a.content}
      <hr>
    `;
    adminAnnouncements.appendChild(div);
  });
}
