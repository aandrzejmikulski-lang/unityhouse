window.App = window.App || {};
App.tickets = (() => {
  function getDom() {
    return App.ui.dom;
  }

  function init() {
    const {
      btnAddTicket,
      btnCancelTicket,
      btnSaveTicket
    } = getDom();

    if (btnAddTicket) btnAddTicket.onclick = () => App.ui.showSection("ticketForm");
    if (btnCancelTicket) btnCancelTicket.onclick = () => App.ui.showSection("mainCard");
    if (btnSaveTicket) btnSaveTicket.onclick = saveTicket;

    loadWspolnotyFilter();

    const filter = document.getElementById("filterWspolnota");
    if (filter) filter.onchange = loadTicketsAdmin;
  }

  async function loadWspolnotyFilter() {
    const sel = document.getElementById("filterWspolnota");
    if (!sel) return;

    sel.innerHTML = `<option value="">Wszystkie wspólnoty</option>`;

    const { data, error } = await App.supabase
      .from("wspolnoty")
      .select("id, nazwa")
      .order("nazwa");

    if (error || !data) return;

    data.forEach(w => {
      const opt = document.createElement("option");
      opt.value = w.id;
      opt.textContent = w.nazwa;
      sel.appendChild(opt);
    });
  }

  async function saveTicket() {
    const {
      ticketTitle,
      ticketDesc,
      ticketFile
    } = getDom();

    const title = ticketTitle.value.trim();
    const desc = ticketDesc.value.trim();

    if (!title || !desc) {
      alert("Uzupełnij tytuł i opis.");
      return;
    }

    const { data: { session }, error: sessionError } = await App.supabase.auth.getSession();
    if (sessionError || !session?.user) {
      alert("Brak sesji użytkownika.");
      return;
    }

    const { data: profile, error: profileError } = await App.supabase
      .from("profiles")
      .select("wspolnota_id")
      .eq("id", session.user.id)
      .single();

    if (profileError || !profile) {
      alert("Błąd profilu użytkownika.");
      return;
    }

    const { data: ticket, error: ticketError } = await App.supabase
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

    if (ticketError || !ticket) {
      alert("Błąd zapisu zgłoszenia.");
      return;
    }

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

  async function loadTicketsUser(wspolnota_id) {
    const { ticketList } = getDom();
    if (!ticketList) return;

    ticketList.innerHTML = "Ładowanie...";

    const { data: { session }, error: sessionError } = await App.supabase.auth.getSession();
    if (sessionError || !session?.user) {
      ticketList.innerHTML = "<i>Błąd sesji użytkownika.</i>";
      return;
    }

    const { data, error } = await App.supabase
      .from("tickets")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("wspolnota_id", wspolnota_id)
      .order("created_at", { ascending: false });

    if (error || !data) {
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
      div.className = "ticketItem";
      div.innerHTML = `
        <b>${t.title}</b><br>
        Status: ${t.status}<br>
        <button class="btnOpenTicket" data-id="${t.id}">Otwórz</button>
      `;
      ticketList.appendChild(div);
    });

    ticketList.querySelectorAll(".btnOpenTicket").forEach(btn =>
      btn.onclick = () => openTicketModal(btn.dataset.id)
    );
  }

  async function loadTicketsAdmin() {
    const { adminTickets } = getDom();
    if (!adminTickets) return;

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

    if (error || !data) {
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
      div.className = "ticketItem";
      div.innerHTML = `
        <b>${t.title}</b><br>
        Wspólnota: ${t.wspolnoty?.nazwa || "brak"}<br>
        Status: ${t.status}<br>
        <button class="btnOpenTicket" data-id="${t.id}">Otwórz</button>
      `;
      adminTickets.appendChild(div);
    });

    adminTickets.querySelectorAll(".btnOpenTicket").forEach(btn =>
      btn.onclick = () => openTicketModal(btn.dataset.id)
    );
  }

  async function openTicketModal(ticketId) {
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

    if (!ticketModal) return;

    ticketModal.classList.remove("hidden");

    const { data: ticket, error } = await App.supabase
      .from("tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    if (error || !ticket) return;

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

    const profile = App.auth.getCurrentProfile();
    const isAdmin = profile?.role === "admin";

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
    await App.supabase
      .from("tickets")
      .update({ status: newStatus })
      .eq("id", ticketId);

    const { ticketModal } = getDom();
    if (ticketModal) ticketModal.classList.add("hidden");
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
