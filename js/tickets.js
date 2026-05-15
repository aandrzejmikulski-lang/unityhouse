function initTickets() {
  btnAddTicket.onclick = () => ticketForm.classList.remove("hidden");
  btnCancelTicket.onclick = () => ticketForm.classList.add("hidden");
  btnSaveTicket.onclick = saveTicket;

  // 🔥 Ładujemy listę wspólnot do filtra admina
  loadWspolnotyFilter();

  // 🔥 Reagujemy na zmianę filtra
  const filter = document.getElementById("filterWspolnota");
  if (filter) filter.onchange = loadTicketsAdmin;
}

async function loadWspolnotyFilter() {
  const sel = document.getElementById("filterWspolnota");
  if (!sel) return;

  sel.innerHTML = `<option value="">Wszystkie wspólnoty</option>`;

  const { data } = await client
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
  const title = ticketTitle.value.trim();
  const desc = ticketDesc.value.trim();

  if (!title || !desc) {
    alert("Uzupełnij tytuł i opis.");
    return;
  }

  const { data: { session } } = await client.auth.getSession();

  const { data: profile } = await client
    .from("profiles")
    .select("wspolnota_id")
    .eq("id", session.user.id)
    .single();

  const { data: ticket } = await client
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

    const { error: uploadError } = await client.storage
      .from("tickets-files")
      .upload(filePath, file);

    if (!uploadError) {
      await client.from("ticket_files").insert({
        ticket_id: ticket.id,
        file_path: filePath
      });
    }
  }

  ticketTitle.value = "";
  ticketDesc.value = "";
  ticketFile.value = "";
  ticketForm.classList.add("hidden");

  loadTicketsUser(profile.wspolnota_id);
}

async function loadTicketsUser(wspolnota_id) {
  ticketList.innerHTML = "Ładowanie...";

  const { data: { session } } = await client.auth.getSession();

  const { data } = await client
    .from("tickets")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("wspolnota_id", wspolnota_id)
    .order("created_at", { ascending: false });

  ticketList.innerHTML = "";

  if (!data.length) {
    ticketList.innerHTML = "<i>Brak zgłoszeń.</i>";
    return;
  }

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

  document.querySelectorAll(".btnOpenTicket").forEach(btn =>
    btn.onclick = () => openTicketModal(btn.dataset.id)
  );
}

async function loadTicketsAdmin() {
  adminTickets.innerHTML = "Ładowanie...";

  const wsp = document.getElementById("filterWspolnota")?.value;

  let query = client
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

  if (wsp) {
    query = query.eq("wspolnota_id", wsp);
  }

  const { data } = await query;

  adminTickets.innerHTML = "";

  if (!data.length) {
    adminTickets.innerHTML = "<i>Brak zgłoszeń.</i>";
    return;
  }

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

  document.querySelectorAll("#adminTickets .btnOpenTicket").forEach(btn =>
    btn.onclick = () => openTicketModal(btn.dataset.id)
  );
}

async function openTicketModal(ticketId) {
  ticketModal.classList.remove("hidden");

  const { data: ticket } = await client
    .from("tickets")
    .select("*")
    .eq("id", ticketId)
    .single();

  modalTicketTitle.textContent = ticket.title;
  modalTicketDesc.textContent = ticket.description;
  modalTicketStatus.textContent = "Status: " + ticket.status;

  const { data: files } = await client
    .from("ticket_files")
    .select("*")
    .eq("ticket_id", ticketId);

  modalTicketFiles.innerHTML = "";

  if (!files.length) {
    modalTicketFiles.innerHTML = "<i>Brak plików</i>";
  } else {
    for (const f of files) {
      const { data: urlData } = await client.storage
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

  const isAdmin = currentProfile?.role === "admin";
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
  await client
    .from("tickets")
    .update({ status: newStatus })
    .eq("id", ticketId);

  ticketModal.classList.add("hidden");
  loadTicketsAdmin();
}
