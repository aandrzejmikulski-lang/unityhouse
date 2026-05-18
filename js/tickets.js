// =============================================
// UNITY HOUSE — TICKETS MODULE
// Zgłoszenia użytkownika, zgłoszenia admina,
// modal, statusy, upload plików
// =============================================

window.App = window.App || {};
App.tickets = (() => {

  // ---------------------------------------------
  // TWORZENIE ZGŁOSZENIA
  // ---------------------------------------------
  async function createTicket() {
    const title = document.getElementById("ticketTitle").value.trim();
    const desc = document.getElementById("ticketDesc").value.trim();
    const fileInput = document.getElementById("ticketFile");

    const profile = App.auth.getCurrentProfile();
    if (!profile || !profile.wspolnota_id) return;

    if (!title || !desc) {
      alert("Uzupełnij tytuł i opis zgłoszenia.");
      return;
    }

    App.ui.showLoader();

    let fileUrl = null;

    // Upload pliku jeśli istnieje
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const fileName = `${Date.now()}_${file.name}`;

      const { data, error } = await App.supabase.storage
        .from("tickets-files")
        .upload(fileName, file);

      if (error) {
        console.error("Upload error:", error);
      } else {
        fileUrl = data.path;
      }
    }

    // Zapis zgłoszenia
    await App.supabase.from("tickets").insert({
      title,
      description: desc,
      wspolnota_id: profile.wspolnota_id,
      user_id: profile.id,
      status: "nowe",
      file_url: fileUrl
    });

    App.ui.hideLoader();

    // Reset formularza
    document.getElementById("ticketTitle").value = "";
    document.getElementById("ticketDesc").value = "";
    document.getElementById("ticketFile").value = "";

    loadTicketsUser(profile.wspolnota_id);
  }

  // ---------------------------------------------
  // ŁADOWANIE ZGŁOSZEŃ UŻYTKOWNIKA
  // ---------------------------------------------
  async function loadTicketsUser(wspolnotaId) {
    const container = document.getElementById("ticketList");
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

    container.innerHTML = data
      .map(t => ticketItemHTML(t))
      .join("");
  }

  // ---------------------------------------------
  // ŁADOWANIE ZGŁOSZEŃ ADMINA
  // ---------------------------------------------
  async function loadTicketsAdmin() {
    const container = document.getElementById("adminTickets");
    if (!container) return;

    container.innerHTML = `<p class="muted">Ładowanie...</p>`;

    const wspolnotaFilter = document.getElementById("filterWspolnota").value;

    let query = App.supabase
      .from("tickets")
      .select("*, profiles(fullname)")
      .order("created_at", { ascending: false });

    if (wspolnotaFilter) {
      query = query.eq("wspolnota_id", wspolnotaFilter);
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

    container.innerHTML = data
      .map(t => ticketItemAdminHTML(t))
      .join("");
  }

  // ---------------------------------------------
  // HTML ZGŁOSZENIA (USER)
  // ---------------------------------------------
  function ticketItemHTML(t) {
    return `
      <div class="announcementItem" onclick="App.tickets.openTicketModal('${t.id}')">
        <b>${t.title}</b><br>
        <small>Status: ${t.status}</small><br>
        <small>${new Date(t.created_at).toLocaleString()}</small>
      </div>
    `;
  }

  // ---------------------------------------------
  // HTML ZGŁOSZENIA (ADMIN)
  // ---------------------------------------------
  function ticketItemAdminHTML(t) {
    return `
      <div class="announcementItem" onclick="App.tickets.openTicketModal('${t.id}')">
        <b>${t.title}</b><br>
        <small>Użytkownik: ${t.profiles?.fullname || "—"}</small><br>
        <small>Status: ${t.status}</small><br>
        <small>${new Date(t.created_at).toLocaleString()}</small>
      </div>
    `;
  }

  // ---------------------------------------------
  // OTWIERANIE MODALA ZGŁOSZENIA
  // ---------------------------------------------
  async function openTicketModal(ticketId) {
    App.ui.openModal();

    const { data, error } = await App.supabase
      .from("tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    if (error) return;

    document.getElementById("modalTicketTitle").innerText = data.title;
    document.getElementById("modalTicketDesc").innerText = data.description;
    document.getElementById("modalTicketStatus").innerText = "Status: " + data.status;

    const filesContainer = document.getElementById("modalTicketFiles");
    filesContainer.innerHTML = data.file_url
   filesContainer.innerHTML = data.file_url
  ? `<a href="https://vswonxsgqanhzsmzexzh.supabase.co/storage/v1/object/public/tickets-files/${data.file_url}" target="_blank" class="btn ghost">Pobierz załącznik</a>`
  : `<p class="muted">Brak załączników</p>`;


    // Podpinamy statusy
    document.getElementById("btnStatusNowe").onclick = () => updateStatus(ticketId, "nowe");
    document.getElementById("btnStatusWTrakcie").onclick = () => updateStatus(ticketId, "w_trakcie");
    document.getElementById("btnStatusZamkniete").onclick = () => updateStatus(ticketId, "zamkniete");
  }

  // ---------------------------------------------
  // ZMIANA STATUSU
  // ---------------------------------------------
  async function updateStatus(ticketId, status) {
    await App.supabase
      .from("tickets")
      .update({ status })
      .eq("id", ticketId);

    App.ui.closeModal();
    loadTicketsAdmin();
  }

  // ---------------------------------------------
  // INICJALIZACJA
  // ---------------------------------------------
  function init() {
    const btn = document.getElementById("btnSaveTicket");
    if (btn) btn.onclick = createTicket;
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
