window.App = window.App || {};

App.tickets = (() => {
  function getDom() {
    return App.ui.dom;
  }

  function init() {
    const { btnAddTicket, btnCancelTicket, btnSaveTicket } = getDom();

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

  async function loadTicketsUser(wspolnota_id) {
    const { ticketList } = getDom();

    ticketList.innerHTML = "Ładowanie...";

    const { data: { session } } = await App.supabase.auth.getSession();

