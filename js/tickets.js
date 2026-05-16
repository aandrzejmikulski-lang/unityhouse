window.App = window.App || {};

App.tickets = (() => {

  function getDom() {
    return App.ui.dom;
  }

  function init() {
    const profile = App.auth.getCurrentProfile();
    const { btnAddTicket, btnCancelTicket, btnSaveTicket } = getDom();

    if (btnAddTicket) btnAddTicket.onclick = () => App.ui.showSection("ticketForm");
    if (btnCancelTicket) btnCancelTicket.onclick = () => App.ui.showSection("mainCard");
    if (btnSaveTicket) btnSaveTicket.onclick = saveTicket;

    // 🔥 Filtr wspólnot tylko dla admina
    if (profile?.role === "admin") {
      loadWspolnotyFilter();
      const filter = document.getElementById("filterWspolnota");
      if (filter) filter.onchange = loadTicketsAdmin;
    }
  }

  // ============================
  // ADMIN — filtr wspólnot
  // ============================
  async function loadWspolnotyFilter() {
    const profile = App.auth.getCurrentProfile();
    if (!profile || profile.role !== "admin") return;

    const sel = document.getElementById("filterWspolnota");
    if (!sel) return;

    sel.innerHTML = `<option value="">Wszystkie wspólnoty</option>`;

    const { data } = await App.supabase
      .from("wspolnoty")
      .select("id, nazwa")
      .order("nazwa");

    data.forEach(w => {
      const opt = document.createElement("option");
      opt.value = w.id;
      opt.textContent = w.nazwa;
      sel.appendChild(opt);
    });
  }

  // ============================
  // ZAPIS ZGŁOSZENIA — mieszkaniec
  // ============================
  async function saveTicket() {
    const { ticketTitle, ticketDesc, ticketFile } = getDom();

    const title = ticketTitle.value.trim();
    const desc = ticketDesc.value.trim();

    if (!title || !desc) {
      alert("Uzupełnij tytuł i opis.");
      return;
    }

    const { data: { session } } = await App.supabase.auth.getSession();

    const { data: profile } = await App.supabase
      .from("profiles")
      .select("wspolnota_id")
      .eq("id", session.user.id)
      .single();

    const { data: ticket } = await App.supabase
      .from("tickets")
      .insert({
        title,
        description: desc,
        user_id: session.user.id,
        wspolnota_id: profile.wspolnota_id,
        status: "nowe"
      })
      .select()
      .single();

    if (ticketFile.files.length > 0) {
      const file = ticketFile.files[0];
      const filePath = `${ticket.id}/${file.name}`;

      const { error: uploadError } = await App.supabase.storage
        .from("tickets-files")
        .upload(filePath, file);

      if (!uploadError) {
        await App.supabase.from("ticket_files").insert({
          ticket_id: ticket.id,
          file_path: filePath
        });
      }
    }

    ticketTitle.value = "";
    ticketDesc.value = "";
    ticketFile.value = "";

    App.ui.showSection("mainCard");
    loadTicketsUser(profile.wspolnota_id);
  }

  // ============================
  // ZGŁOSZENIA — mieszkaniec
  // ============================
  async function loadTicketsUser(wspolnota_id) {
    const profile = App.auth.getCurrentProfile();
    if (!profile || profile.role !== "user") return;

    const { ticketList } = getDom();

    ticketList.innerHTML = "Ładowanie...";

    const { data: { session } } = await App.supabase.auth.getSession();

    const { data, error } = await App.supabase
      .from("tickets")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("wspolnota_id", wspolnota_id)
      .order("created_at", { ascending: false });

    if (error) {
      ticketList.innerHTML = "<i>Błąd ładowania zgłoszeń.</i>";
      return;
    }

    if (!data.length) {
      ticketList.innerHTML = "<i>Brak zgłoszeń.</i>";
      return;
    }

    ticketList.innerHTML = "";

    data.forEach(t => {
      const div = document.createElement("div");
      div.className = "ticketItem announcementItem";
      div.innerHTML = `
        <b>${t.title}</b><br>
        Status: ${t.status}<br>
        <button class="btnOpenTicket btn ghost" data-id="${t.id}">Otwórz</button>
      `;
      ticketList.appendChild(div);
    });

    ticketList.querySelectorAll(".btnOpenTicket").forEach(btn =>
      btn.onclick = () => openTicketModal(btn.dataset.id)
    );
  }

  // ============================
  // ZGŁOSZENIA — admin
  // ============================
  async function loadTicketsAdmin() {
    const profile = App.auth.getCurrentProfile();
    if (!profile || profile.role !== "admin") return;

    const { adminTickets } = getDom();
    adminTickets.innerHTML = "Ładowanie...";

    const wsp = document.getElementById("filterWspolnota")?.value;

    let query = App.supabase
      .from("tickets")
      .select(`
        id,
        title,
        description,
        status,
        created_at,
        wspolnota_id,
        wspolnoty (nazwa)
      `)
      .order("created_at", { ascending: false });

    if (wsp) query = query.eq("wspolnota_id", wsp);

    const { data, error } = await query;

    if (error) {
      adminTickets.innerHTML = "<i>Błąd ładowania zgłoszeń.</i>";
      return;
    }

    if (!data.length) {
      adminTickets.innerHTML = "<i>Brak zgłoszeń.</i>";
      return;
    }

    adminTickets.innerHTML = "";

    data.forEach(t => {
      const div = document.createElement("div");
      div.className = "ticketItem announcementItem";
      div.innerHTML = `
        <b>${t.title}</b><br>
        Wspólnota: ${t.wspolnoty?.nazwa || "brak"}<br>
        Status: ${t.status}<br>
        <button class="btnOpenTicket btn ghost" data-id="${t.id}">Otwórz</button>
      `;
      adminTickets.appendChild(div);
    });

    adminTickets.querySelectorAll(".btnOpenTicket").forEach(btn =>
      btn.onclick = () => openTicketModal(btn.dataset.id)
    );
  }

  // ============================
  // MODAL — admin + mieszkaniec
  // ============================
  async function openTicketModal(ticketId) {
    const profile = App.auth.getCurrentProfile();
    const isAdmin = profile?.role === "admin";

    const {
      ticketModal,
      modalTicketTitle,
      modalTicketDesc,
      modalTicketStatus,
      modalTicketFiles,
      btnStatusNowe,
      btnStatusWTrakcie,
      btnStatusZamkniete
    } = getDom();

    ticketModal.classList.remove("hidden");

    const { data: ticket } = await App.supabase
      .from("tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    // 🔥 Mieszkaniec może otworzyć TYLKO swoje zgłoszenia
    if (!isAdmin && ticket.user_id !== profile.id) {
      ticketModal.classList.add("hidden");
      alert("Nie masz dostępu do tego zgłoszenia.");
      return;
    }

    modalTicketTitle.textContent = ticket.title;
    modalTicketDesc.textContent = ticket.description;
    modalTicketStatus.textContent = "Status: " + ticket.status;

    const { data: files } = await App.supabase
      .from("ticket_files")
      .select("*")
      .eq("ticket_id", ticketId);

    modalTicketFiles.innerHTML = "";

    if (!files || !files.length) {
      modalTicketFiles.innerHTML = "<i>Brak plików</i>";
    } else {
      for (const f of files) {
        const { data: urlData } = await App.supabase.storage
          .from("tickets-files")
          .createSignedUrl(f.file_path, 3600);

        const a = document.createElement("a");
        a.href = urlData.signedUrl;
        a.textContent = f.file_path.split("/")[1];
        a.target = "_blank";
        modalTicketFiles.appendChild(a);
        modalTicketFiles.appendChild(document.createElement("br"));
      }
    }

    // 🔥 Przyciski statusu tylko dla admina
    btnStatusNowe.style.display = isAdmin ? "inline-block" : "none";
    btnStatusWTrakcie.style.display = isAdmin ? "inline-block" : "none";
    btnStatusZamkniete.style.display = isAdmin ? "inline-block" : "none";

    if (isAdmin) {
      btnStatusNowe.onclick = () => updateTicketStatus(ticketId, "nowe");
      btnStatusWTrakcie.onclick = () => updateTicketStatus(ticketId, "w_trakcie");
      btnStatusZamkniete.onclick = () => updateTicketStatus(ticketId, "zamkniete");
    }
  }

  async function updateTicketStatus(ticketId, newStatus) {
    const profile = App.auth.getCurrentProfile();
    if (!profile || profile.role !== "admin") return;

    await App.supabase
      .from("tickets")
      .update({ status: newStatus })
      .eq("id", ticketId);

    const { ticketModal } = getDom();
    ticketModal.classList.add("hidden");

    loadTicketsAdmin();
  }

  return {
    init,
    loadWspolnotyFilter,
    saveTicket,
    loadTicketsUser,
    loadTicketsAdmin,
    openTicketModal,
    updateTicketStatus
  };
})();
