window.App = window.App || {};

App.tickets = (() => {

  function getDom() {
    return App.ui.dom;
  }

  function init() {
    const {
      btnSaveTicket,
      btnCancelTicket
    } = getDom();

    if (btnSaveTicket) btnSaveTicket.onclick = saveTicket;
    if (btnCancelTicket) btnCancelTicket.onclick = () => App.ui.showSection("mainCard");
  }

  async function saveTicket() {
    const profile = App.auth.getCurrentProfile();
    if (!profile || profile.role !== "user") return;

    const { ticketTitle, ticketDesc, ticketFile } = getDom();

    const title = ticketTitle.value.trim();
    const desc = ticketDesc.value.trim();

    if (!title || !desc) {
      alert("Uzupełnij tytuł i opis zgłoszenia.");
      return;
    }

    const { data: { session } } = await App.supabase.auth.getSession();

    const { data: ticket, error } = await App.supabase
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

    if (error) {
      console.error("Błąd zapisu zgłoszenia:", error);
      alert("Nie udało się zapisać zgłoszenia.");
      return;
    }

    if (ticketFile.files.length > 0) {
      const file = ticketFile.files[0];
      const path = `${ticket.id}/${file.name}`;

      const { error: uploadError } = await App.supabase.storage
        .from("ticket_files")
        .upload(path, file);

      if (uploadError) {
        console.error("Błąd uploadu pliku:", uploadError);
      }
    }

    ticketTitle.value = "";
    ticketDesc.value = "";
    ticketFile.value = "";

    App.ui.showSection("mainCard");
    loadTicketsUser(profile.wspolnota_id);
  }

  async function loadTicketsUser(wspolnotaId) {
    const profile = App.auth.getCurrentProfile();
    if (!profile || profile.role !== "user") return;

    const { ticketList } = getDom();
    if (!ticketList) return;

    ticketList.innerHTML = "Ładowanie...";

    const { data, error } = await App.supabase
      .from("tickets")
      .select(`
        id,
        title,
        description,
        status,
        created_at
      `)
      .eq("wspolnota_id", wspolnotaId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Błąd ładowania zgłoszeń (user):", error);
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
        <small>${new Date(t.created_at).toLocaleString()}</small><br>
        Status: ${t.status}<br>
        ${t.description}
        <hr>
      `;
      ticketList.appendChild(div);
    });
  }

  async function loadWspolnotyFilter() {
    const profile = App.auth.getCurrentProfile();
    if (!profile || profile.role !== "admin") return;

    const select = document.getElementById("ticketsWspolnotaFilter");
    if (!select) return;

    select.innerHTML = "";

    const { data, error } = await App.supabase
      .from("wspolnoty")
      .select("id, nazwa")
      .order("nazwa");

    if (error) {
      console.error("Błąd ładowania wspólnot (filter):", error);
      return;
    }

    const def = document.createElement("option");
    def.value = "";
    def.textContent = "Wszystkie wspólnoty";
    select.appendChild(def);

    data.forEach(w => {
      const opt = document.createElement("option");
      opt.value = w.id;
      opt.textContent = w.nazwa;
      select.appendChild(opt);
    });

    select.onchange = () => loadTicketsAdmin(select.value);
  }

  async function loadTicketsAdmin(wspolnotaId = "") {
    const profile = App.auth.getCurrentProfile();
    if (!profile || profile.role !== "admin") return;

    const { adminTickets } = getDom();
    if (!adminTickets) return;

    adminTickets.innerHTML = "Ładowanie...";

    let query = App.supabase
      .from("tickets")
      .select(`
        id,
        title,
        description,
        status,
        created_at,
        wspolnoty (nazwa),
        profiles (fullname, email)
      `)
      .order("created_at", { ascending: false });

    if (wspolnotaId) {
      query = query.eq("wspolnota_id", wspolnotaId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Błąd ładowania zgłoszeń (admin):", error);
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
        <small>${new Date(t.created_at).toLocaleString()}</small><br>
        Wspólnota: ${t.wspolnoty?.nazwa || "—"}<br>
        Zgłaszający: ${t.profiles?.fullname || "—"} (${t.profiles?.email || "—"})<br>
        Status: ${t.status}<br><br>
        ${t.description}
        <hr>
      `;
      adminTickets.appendChild(div);
    });
  }

  return {
    init,
    saveTicket,
    loadTicketsUser,
    loadWspolnotyFilter,
    loadTicketsAdmin
  };
})();
