window.App = window.App || {};

App.tickets = (() => {

  function init() {
    const dom = App.ui.dom;

    if (dom.btnSaveTicket) dom.btnSaveTicket.onclick = saveTicket;
    if (dom.btnStatusNowe) dom.btnStatusNowe.onclick = () => updateStatus("nowe");
    if (dom.btnStatusWTrakcie) dom.btnStatusWTrakcie.onclick = () => updateStatus("w_trakcie");
    if (dom.btnStatusZamkniete) dom.btnStatusZamkniete.onclick = () => updateStatus("zamkniete");

    if (dom.filterWspolnota) dom.filterWspolnota.onchange = loadTicketsAdmin;
  }

  async function saveTicket() {
    const dom = App.ui.dom;
    const profile = App.auth.getCurrentProfile();

    const title = dom.ticketTitle.value.trim();
    const desc = dom.ticketDesc.value.trim();
    const file = dom.ticketFile.files[0] || null;

    if (!title || !desc) {
      alert("Uzupełnij tytuł i opis.");
      return;
    }

    let fileUrl = null;

    if (file) {
      const fileName = `${profile.id}_${Date.now()}_${file.name}`;
      const { data: upload, error: uploadErr } = await App.supabase.storage
        .from("tickets")
        .upload(fileName, file);

      if (uploadErr) {
        console.error(uploadErr);
      } else {
        const { data: urlData } = App.supabase.storage
          .from("tickets")
          .getPublicUrl(fileName);

        fileUrl = urlData.publicUrl;
      }
    }

    const { error } = await App.supabase.from("tickets").insert({
      title,
      description: desc,
      wspolnota_id: profile.wspolnota_id,
      user_id: profile.id,
      status: "nowe",
      file_url: fileUrl
    });

    if (error) {
      console.error(error);
      alert("Błąd zapisu zgłoszenia.");
      return;
    }

    App.ui.showSection("mainCard");
    loadTicketsUser(profile.wspolnota_id);
  }

  async function loadTicketsUser(wspolnotaId) {
    const dom = App.ui.dom;

    const { data, error } = await App.supabase
      .from("tickets")
      .select("*, profiles(fullname)")
      .eq("wspolnota_id", wspolnotaId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      dom.ticketList.innerHTML = "<p>Błąd ładowania zgłoszeń.</p>";
      return;
    }

    if (!data || data.length === 0) {
      dom.ticketList.innerHTML = "<p>Brak zgłoszeń.</p>";
      return;
    }

    dom.ticketList.innerHTML = data.map(renderTicketItem).join("");
    attachTicketClickHandlers(data);
  }

  async function loadTicketsAdmin() {
    const dom = App.ui.dom;
    const wsp = dom.filterWspolnota.value;

    let query = App.supabase
      .from("tickets")
      .select("*, profiles(fullname)")
      .order("created_at", { ascending: false });

    if (wsp && wsp !== "") {
      query = query.eq("wspolnota_id", wsp);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Błąd ładowania zgłoszeń admina:", error);
      dom.adminTickets.innerHTML = "<p>Błąd ładowania zgłoszeń.</p>";
      return;
    }

    if (!data || data.length === 0) {
      dom.adminTickets.innerHTML = "<p>Brak zgłoszeń.</p>";
      return;
    }

    dom.adminTickets.innerHTML = data.map(renderTicketItem).join("");
    attachTicketClickHandlers(data);
  }

  function renderTicketItem(t) {
    return `
      <div class="ticket-item" data-id="${t.id}">
        <h4>${t.title}</h4>
        <p>${t.description}</p>
        <p><strong>Status:</strong> ${formatStatus(t.status)}</p>
        <p><strong>Autor:</strong> ${t.profiles?.fullname || "?"}</p>
        ${t.file_url ? `<a href="${t.file_url}" target="_blank">Załącznik</a>` : ""}
      </div>
    `;
  }

  function formatStatus(s) {
    switch (s) {
      case "nowe": return "🟢 Nowe";
      case "w_trakcie": return "🟡 W trakcie";
      case "zamkniete": return "🔴 Zamknięte";
      default: return s;
    }
  }

  function attachTicketClickHandlers(data) {
    data.forEach(t => {
      const el = document.querySelector(`.ticket-item[data-id="${t.id}"]`);
      if (!el) return;
      el.onclick = () => openModal(t);
    });
  }

  function openModal(ticket) {
    const dom = App.ui.dom;

    dom.modalTicketTitle.textContent = ticket.title;
    dom.modalTicketDesc.textContent = ticket.description;
    dom.modalTicketStatus.textContent = "Status: " + formatStatus(ticket.status);

    dom.modalTicketFiles.innerHTML = ticket.file_url
      ? `<a href="${ticket.file_url}" target="_blank">Pobierz załącznik</a>`
      : "<p>Brak załączników</p>";

    dom.ticketModal.dataset.id = ticket.id;
    dom.ticketModal.classList.remove("hidden");
  }

  async function updateStatus(newStatus) {
    const dom = App.ui.dom;
    const id = dom.ticketModal.dataset.id;

    const { error } = await App.supabase
      .from("tickets")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Błąd zmiany statusu.");
      return;
    }

    dom.ticketModal.classList.add("hidden");
    loadTicketsAdmin();
  }

  async function loadWspolnotyFilter() {
    const dom = App.ui.dom;

    const { data, error } = await App.supabase
      .from("wspolnoty")
      .select("*")
      .order("nazwa");

    if (error) {
      console.error("Błąd ładowania wspólnot:", error);
      return;
    }

    dom.filterWspolnota.innerHTML = `
      <option value="">Wszystkie wspólnoty</option>
      ${data.map(w => `<option value="${w.id}">${w.nazwa}</option>`).join("")}
    `;
  }

  return {
    init,
    loadTicketsUser,
    loadTicketsAdmin,
    loadWspolnotyFilter
  };
})();
