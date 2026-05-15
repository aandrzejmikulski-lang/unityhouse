// tickets.js

// ------------------------------------------------------------
// ELEMENTY DOM
// ------------------------------------------------------------
const ticketForm = document.getElementById("ticketForm");
const ticketTitle = document.getElementById("ticketTitle");
const ticketDesc = document.getElementById("ticketDesc");
const ticketFile = document.getElementById("ticketFile");
const ticketList = document.getElementById("ticketList");

const adminTickets = document.getElementById("adminTickets");

const ticketModal = document.getElementById("ticketModal");
const modalTicketTitle = document.getElementById("modalTicketTitle");
const modalTicketDesc = document.getElementById("modalTicketDesc");
const modalTicketStatus = document.getElementById("modalTicketStatus");
const modalTicketFiles = document.getElementById("modalTicketFiles");

const btnStatusNowe = document.getElementById("btnStatusNowe");
const btnStatusWTrakcie = document.getElementById("btnStatusWTrakcie");
const btnStatusZamkniete = document.getElementById("btnStatusZamkniete");

// ------------------------------------------------------------
// INICJALIZACJA
// ------------------------------------------------------------
function initTickets() {
  document.getElementById("btnAddTicket").onclick = () =>
    ticketForm.classList.remove("hidden");

  document.getElementById("btnCancelTicket").onclick = () =>
    ticketForm.classList.add("hidden");

  document.getElementById("btnSaveTicket").onclick = saveTicket;
}

// ------------------------------------------------------------
// TWORZENIE ZGŁOSZENIA
// ------------------------------------------------------------
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

  // Upload pliku
  if (ticketFile.files.length > 0) {
    const file = ticketFile.files[0];
    const filePath = `${ticket.id}/${file.name}`;

    const { error: uploadError } = await client.storage
      .from("ticket_files")
      .upload(filePath, file);

    if (!uploadError) {
      await client.from("ticket_files").insert({
        ticket_id: ticket.id,
        file_path: filePath
      });
    }
  }

  // Reset formularza
  ticketTitle.value = "";
  ticketDesc.value = "";
  ticketFile.value = "";
  ticketForm.classList.add("hidden");

  loadTicketsUser(profile.wspolnota_id);
}

// ------------------------------------------------------------
// ZGŁOSZENIA UŻYTKOWNIKA
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// ZGŁOSZENIA ADMINA
// ------------------------------------------------------------
async function loadTicketsAdmin() {
  adminTickets.innerHTML = "Ładowanie...";

  const { data } = await client
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false });

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
      Status: ${t.status}<br>
      <button class="btnOpenTicket" data-id="${t.id}">Otwórz</button>
    `;
    adminTickets.appendChild(div);
  });

  document.querySelectorAll("#adminTickets .btnOpenTicket").forEach(btn =>
    btn.onclick = () => openTicketModal(btn.dataset.id)
  );
}

// ------------------------------------------------------------
// MODAL ZGŁOSZENIA
// ------------------------------------------------------------
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

  // Pliki
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
        .from("ticket_files")
        .createSignedUrl(f.file_path, 3600);

      const a = document.createElement("a");
      a.href = urlData.signedUrl;
      a.textContent = f.file_path.split("/")[1];
      a.target = "_blank";
      modalTicketFiles.appendChild(a);
      modalTicketFiles.appendChild(document.createElement("br"));
    }
  }

  // Przyciski statusów tylko dla admina
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

// ------------------------------------------------------------
// ZMIANA STATUSU
// ------------------------------------------------------------
async function updateTicketStatus(ticketId, newStatus) {
  await client
    .from("tickets")
    .update({ status: newStatus })
    .eq("id", ticketId);

  ticketModal.classList.add("hidden");
  loadTicketsAdmin();
}
