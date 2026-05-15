// ELEMENTY DOM
const loginCard = document.getElementById("loginCard");
const mainCard = document.getElementById("mainCard");
const adminCard = document.getElementById("adminCard");
const wspolnotaCard = document.getElementById("wspolnotaCard");
const selectWspolnotaCard = document.getElementById("selectWspolnotaCard");
const ticketForm = document.getElementById("ticketForm");

const loginMessage = document.getElementById("loginMessage");
const registerMessage = document.getElementById("registerMessage");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");
const registerFullname = document.getElementById("registerFullname");

const btnLoginTop = document.getElementById("btnLoginTop");
const btnRegisterTop = document.getElementById("btnRegisterTop");
const btnLogoutTop = document.getElementById("btnLogoutTop");

const goToLogin = document.getElementById("goToLogin");
const goToRegister = document.getElementById("goToRegister");
const loginForm = document.getElementById("loginForm");
const registerCard = document.getElementById("registerCard");

const wspolnotaDropdown = document.getElementById("wspolnotaDropdown");
const wspolnotaMessage = document.getElementById("wspolnotaMessage");
const pendingUsersList = document.getElementById("pendingUsersList");
const allUsersList = document.getElementById("allUsersList");

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

const btnAddTicket = document.getElementById("btnAddTicket");
const btnCancelTicket = document.getElementById("btnCancelTicket");
const btnSaveTicket = document.getElementById("btnSaveTicket");
const btnSaveWspolnota = document.getElementById("btnSaveWspolnota");
const btnLogin = document.getElementById("btnLogin");
const btnRegister = document.getElementById("btnRegister");

// ===============================
// OGŁOSZENIA — GLOBALNE ELEMENTY DOM
// ===============================
const announcementForm = document.getElementById("announcementForm");
const announcementTitle = document.getElementById("announcementTitle");
const announcementContent = document.getElementById("announcementContent");
const announcementGlobal = document.getElementById("announcementGlobal");
const announcementFrom = document.getElementById("announcementFrom");
const announcementTo = document.getElementById("announcementTo");

const btnAddAnnouncement = document.getElementById("btnAddAnnouncement");
const btnCancelAnnouncement = document.getElementById("btnCancelAnnouncement");
const btnSaveAnnouncement = document.getElementById("btnSaveAnnouncement");

const userAnnouncements = document.getElementById("userAnnouncements");
const adminAnnouncements = document.getElementById("adminAnnouncements");

// ===============================
// INIT UI
// ===============================
function initUI() {
  document.getElementById("closeModal").onclick = () => {
    ticketModal.classList.add("hidden");
  };

  if (btnAddTicket) {
    btnAddTicket.onclick = () => showSection("ticketForm");
  }

  if (btnCancelTicket) {
    btnCancelTicket.onclick = () => showSection("mainCard");
  }
}

// ===============================
// NOWE hideAllPanels
// ===============================
function hideAllPanels() {
  document.querySelectorAll("main .card").forEach(sec => sec.classList.add("hidden"));
}

// ===============================
// MESSAGE
// ===============================
function showMessage(el, text, type = "info") {
  el.textContent = text;
  el.className = "message " + type;
  el.classList.remove("hidden");
}

// ===============================
// AUTH VIEW
// ===============================
function setAuthView(isLoggedIn) {
  const sidebar = document.querySelector(".sidebar");

  if (isLoggedIn) {
    sidebar.classList.remove("hidden");
    btnLogoutTop.classList.remove("hidden");
  } else {
    sidebar.classList.add("hidden");
    btnLogoutTop.classList.add("hidden");
  }
}

// ===============================
// LOGIN / REGISTER TABS
// ===============================
function showLoginTab() {
  goToLogin.classList.add("active");
  goToRegister.classList.remove("active");

  loginForm.classList.remove("hidden");
  registerCard.classList.add("hidden");
}

function showRegisterTab() {
  goToLogin.classList.remove("active");
  goToRegister.classList.add("active");

  loginForm.classList.add("hidden");
  registerCard.classList.remove("hidden");
}
