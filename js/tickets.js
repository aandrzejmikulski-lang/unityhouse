// =============================================
// UNITY HOUSE — TICKETS MODULE (FINAL)
// Zgłoszenia użytkowników + panel admina
// =============================================

window.App = window.App || {};
App.tickets = (() => {

  // ---------------------------------------------
  // TWORZENIE ZGŁOSZENIA (USER)
  // ---------------------------------------------
  async function createTicket() {
    const title = document.getElementById("ticketTitle")?.value.trim();
    const description = document.getElementById("ticketDescription")?.value.trim();
    const wspolnota = document.getElementById("ticketWspolnota")?.value;

    if (!title || !description || !wspolnota) {
      App.ui.showMessage("Uzupełnij wszystkie pola.", "error");
      return;
    }

    App.ui.showLoader();

    const user = App.auth.getCurrentProfile();
    if (!user) {
      App.ui.hideLoader();
      App.ui.showMessage("Brak profilu użytkownika.", "error");
      return;
    }

    const { error } = await App.supabase.from("tickets").insert({
      title,
      description,
      wspolnota_id: wspolnota,
      user_id: user.id,
      status: "nowe",
      created_at: new Date().toISOString()
    });

    App.ui.hideLoader();

    if (error) {
      App.ui.showMessage("Błąd podczas tworzenia zgłoszenia.", "error");
      return;
    }

    App.ui.showMessage("Zgłoszenie wysłane.", "success");
    loadUserTickets();
  }

  // ---------------------------------------------
  // ŁADOWANIE ZGŁOSZEŃ UŻYTKOWNIKA
  // ---------------------------------------------
  async function loadUserTickets() {
    const list = document.getElementById("userTicketsList");
    if (!list) return;

    list.innerHTML = `<p>Ładowanie...</p>`;

    const user = App.auth.getCurrentProfile();
    if (!user) {
      list.innerHTML = `<p>Brak profilu użytkownika.</p>`;
      return;
    }

    const { data, error } = await App.supabase
      .from("tickets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      list.innerHTML = `<p>Błąd ładowania zgłoszeń.</p>`;
      return;
    }

    if (!data.length) {
      list.innerHTML = `<p>Brak zgłoszeń.</p>`;
      return;
    }

    list.innerHTML = data
      .map(t => `
        <div class="ticketItem">
          <div><b>${t.title}</b></div>
          <div>${t.description}</div>
          <div>Status: <b>${t.status}</b></div>
          <div class="ticketDate">${new Date(t.created_at).toLocaleString()}</div>
        </div>
      `)
      .join("");
  }

  // ---------------------------------------------
  // ŁADOWANIE WSZYSTKICH ZGŁOSZEŃ (ADMIN)
  // ---------------------------------------------
  async function loadAllTickets() {
    const list = document.getElementById("adminTicketsList");
    if (!list) return;

    list.innerHTML = `<p>Ładowanie...</p>`;

    const wspolnota = document.getElementById("adminTicketsWspolnota")?.value;

    let query = App.supabase
      .from("tickets")
      .select("*, profiles(fullname), wspolnoty(nazwa)")
      .order("created_at", { ascending: false });

    if (wspolnota) {
      query = query.eq("wspolnota_id", wspolnota);
    }

    const { data, error } = await query;

    if (error) {
      list.innerHTML = `<p>Błąd ładowania zgłoszeń.</p>`;
      return;
    }

    if (!data.length) {
      list.innerHTML = `<p>Brak zgłoszeń.</p>`;
      return;
    }

    list.innerHTML = data
      .map(t => `
        <div class="ticketItem admin">
          <div><b>${t.title}</b></div>
          <div>${t.description}</div>
          <div>Użytkownik: <b>${t.profiles?.fullname || "?"}</b></div>
          <div>Wspólnota: <b>${t.wspolnoty?.nazwa || "?"}</b></div>
          <div>Status: <b>${t.status}</b></div>
          <button class="btn small" onclick="App.tickets.openStatusModal('${t.id}', '${t.status}')">Zmień status</button>
        </div>
      `)
      .join("");
  }

  // ---------------------------------------------
  // MODAL ZMIANY STATUSU
  // ---------------------------------------------
  function openStatusModal(id, current) {
    App.ui.showModal(`
      <h3>Zmień status zgłoszenia</h3>
      <select id="newStatus">
        <option value="nowe" ${current === "nowe" ? "selected" : ""}>Nowe</option>
        <option value="w trakcie" ${current === "w trakcie" ? "selected" : ""}>W trakcie</option>
        <option value="zakończone" ${current === "zakończone" ? "selected" : ""}>Zakończone</option>
      </select>
      <button class="btn" onclick="App.tickets.updateStatus('${id}')">Zapisz</button>
    `);
  }

  // ---------------------------------------------
  // AKTUALIZACJA STATUSU (ADMIN)
  // ---------------------------------------------
  async function updateStatus(id) {
    const newStatus = document.getElementById("newStatus")?.value;
    if (!newStatus) return;

    App.ui.showLoader();

    const { error } = await App.supabase
      .from("tickets")
      .update({ status: newStatus })
      .eq("id", id);

    App.ui.hideLoader();
    App.ui.hideModal();

    if (error) {
      App.ui.showMessage("Błąd aktualizacji statusu.", "error");
      return;
    }

    App.ui.showMessage("Status zaktualizowany.", "success");
    loadAllTickets();
  }

  // ---------------------------------------------
  // PUBLIC API
  // ---------------------------------------------
  return {
    createTicket,
    loadUserTickets,
    loadAllTickets,
    openStatusModal,
    updateStatus
  };

})();
