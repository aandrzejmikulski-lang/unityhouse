// =============================================
// UNITY HOUSE — TICKETS MODULE
// Zgłoszenia użytkownika, zgłoszenia admina,
// modal, statusy, upload plików + FILTRY
// =============================================

window.App = window.App || {};
App.tickets = (() => {

  // ---------------------------------------------
  // TWORZENIE ZGŁOSZENIA (USER)
  // ---------------------------------------------
  async function createTicket() {
    const title = document.getElementById("ticketTitle")?.value.trim();
    const desc = document.getElementById("ticketDesc")?.value.trim();
    const fileInput = document.getElementById("ticketFile");

    const profile = App.auth.getCurrentProfile();
    if (!profile) return;

    if (!title || !desc) {
      alert("Uzupełnij tytuł i opis zgłoszenia.");
      return;
    }

    App.ui.showLoader();

    let fileUrl = null;

    if (fileInput?.files.length > 0) {
      const file = fileInput.files[0];
      const fileName = `${Date.now()}_${file.name}`;

      const { data, error } = await App.supabase.storage
        .from("tickets-files")
        .upload(fileName, file);

      if (!error) fileUrl = data.path;
    }

    await App.supabase.from("tickets").insert({
      title,
      description: desc,
      wspolnota_id: profile.wspolnota_id,
      user_id: profile.id,
      status: "nowe",
      file_url: fileUrl
    });

    App.ui.hideLoader();

    if (document.getElementById("ticketTitle")) document.getElementById("ticketTitle").value = "";
    if (document.getElementById("ticketDesc")) document.getElementById("ticketDesc").value = "";
    if (document.getElementById("ticketFile")) document.getElementById("ticketFile").value = "";

    loadTicketsUser();
  }

  // ---------------------------------------------
  // ŁADOWANIE ZGŁOSZEŃ UŻYTKOWNIKA
  // ---------------------------------------------
  async function loadTicketsUser() {
    const container = document.getElementById("user-tickets-list");
    if (!container) return;

    container.innerHTML = `<p class="muted">Ładowanie...</p>`;

    const profile = App.auth.getCurrentProfile();
    if (!profile) return;

    const { data, error } = await App.supabase
      .from("tickets")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) {
      container.innerHTML = `<p class="muted">Błąd ładowania</p>`;
      return;
    }

    if (!data.length) {
      container.innerHTML = `<p class="muted">Brak zgłoszeń.</p>`;
      return;
    }

    container.innerHTML = data.map(ticketItemHTML).join("");
  }

  // ---------------------------------------------
  // ŁADOWANIE ZGŁOSZEŃ ADMINA Z FILTREM STATUSU
  // ---------------------------------------------
  async function loadTicketsAdmin() {
    const container = document.getElementById("admin-tickets-list");
    if (!container) return;

    container.innerHTML = `<p class="muted">Ładowanie...</p>`;

    const statusFilter = document.getElementById("adminTicketsStatusFilter")?.value || "";

    let query = App.supabase
      .from("tickets")
      .select("*, profiles(fullname)")
      .order("created_at", { ascending: false });

    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      container.innerHTML = `<p class="muted">Błąd ładowania</p>`;
      return;
    }

    if (!data.length) {
      container.innerHTML = `<p class="muted">Brak zgłoszeń.</p>`;
      return;
    }

    container.innerHTML = data.map(ticketItemAdminHTML).join("");
  }

  // ---------------------------------------------
  // HTML ZGŁOSZENIA (USER)
  // ---------------------------------------------
  function ticketItemHTML(t) {
    const statusLabel = statusToLabel(t.status);

    return `
      <div class="announcementItem" onclick="App.tickets.openTicketModal('${t.id}')">
        <b>${t.title}</b><br>
        <small>${statusLabel}</small><br>
        <small>${new Date(t.created_at).toLocaleString()}</small>
      </div>
    `;
  }

  // ---------------------------------------------
  // HTML ZGŁOSZENIA (ADMIN)
  // ---------------------------------------------
  function ticketItemAdminHTML(t) {
    const statusLabel = statusToLabel(t.status);

    return `
      <div class="announcementItem" onclick="App.tickets.openTicketModal('${t.id}')">
        <b>${t.title}</b><br>
        <small>Użytkownik: ${t.profiles?.fullname || "—"}</small><br>
        <small>${statusLabel}</small><br>
        <small>${new Date(t.created_at).toLocaleString()}</small>
      </div>
    `;
  }

  // ---------------------------------------------
  // MAPOWANIE STATUSU NA ŁADNĄ ETYKIETĘ
  // ---------------------------------------------
  function statusToLabel(status) {
    switch (status) {
      case "nowe":
        return "🟢 Nowe";
      case "w_trakcie":
        return "🟡 W trakcie";
      case "zamkniete":
        return "🔴 Zamknięte";
      default:
        return status;
    }
  }

  // ---------------------------------------------
  // OTWIERANIE MODALA
  // ---------------------------------------------
  async function openTicketModal(ticketId) {
    const { data, error } = await App.supabase
      .from("tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    if (error) return;

    const statusLabel = statusToLabel(data.status);

    const html = `
      <h3>${data.title}</h3>
      <p>${data.description}</p>
      <p><b>Status:</b> ${statusLabel}</p>

      <h4>Załącznik:</h4>
      ${
        data.file_url
          ? `<a href="https://vswonxgsaqnhzsmzexzh.supabase.co/storage/v1/object/public/tickets-files/${data.file_url}" target="_blank" class="btn ghost">Pobierz</a>`
          : `<p class="muted">Brak załączników</p>`
      }

      <hr>

      <button class="btn" onclick="App.tickets.updateStatus('${ticketId}', 'nowe')">Nowe</button>
      <button class="btn" onclick="App.tickets.updateStatus('${ticketId}', 'w_trakcie')">W trakcie</button>
      <button class="btn" onclick="App.tickets.updateStatus('${ticketId}', 'zamkniete')">Zamknięte</button>
    `;

    App.ui.showModal(html);
  }

  // ---------------------------------------------
  // ZMIANA STATUSU
  // ---------------------------------------------
  async function updateStatus(ticketId, status) {
    await App.supabase
      .from("tickets")
      .update({ status })
      .eq("id", ticketId);

    App.ui.hideModal();
    loadTicketsAdmin();
  }

  // ---------------------------------------------
  // INIT
  // ---------------------------------------------
  function init() {
    const btn = document.getElementById("btnSaveTicket");
    if (btn) btn.onclick = createTicket;

    const statusFilter = document.getElementById("adminTicketsStatusFilter");
    if (statusFilter) {
      statusFilter.onchange = loadTicketsAdmin;
    }
  }

  return {
    init,
    createTicket,
    loadTicketsUser,
    loadTicketsAdmin,
    openTicketModal,
    updateStatus
  };

})();
