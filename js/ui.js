window.App = window.App || {};

App.ui = (() => {
  const dom = {
    loginCard: document.getElementById("loginCard"),
    mainCard: document.getElementById("mainCard"),
    adminCard: document.getElementById("adminCard"),
    wspolnotaCard: document.getElementById("wspolnotaCard"),
    selectWspolnotaCard: document.getElementById("selectWspolnotaCard"),
    ticketForm: document.getElementById("ticketForm"),
    announcementForm: document.getElementById("announcementForm"),

    loginMessage: document.getElementById("loginMessage"),
    registerMessage: document.getElementById("registerMessage"),

    loginEmail: document.getElementById("loginEmail"),
    loginPassword: document.getElementById("loginPassword"),
    registerEmail: document.getElementById("registerEmail"),
    registerPassword: document.getElementById("registerPassword"),
    registerFullname: document.getElementById("registerFullname"),

    goToLogin: document.getElementById("goToLogin"),
    goToRegister: document.getElementById("goToRegister"),
    loginForm: document.getElementById("loginForm"),
    registerCard: document.getElementById("registerCard"),

    wspolnotaDropdown: document.getElementById("wspolnotaDropdown"),
    wspolnotaMessage: document.getElementById("wspolnotaMessage"),

    pendingUsersList: document.getElementById("pendingUsersList"),
    allUsersList: document.getElementById("allUsersList"),

    ticketTitle: document.getElementById("ticketTitle"),
    ticketDesc: document.getElementById("ticketDesc"),
    ticketFile: document.getElementById("ticketFile"),
    ticketList: document.getElementById("ticketList"),
    adminTickets: document.getElementById("adminTickets"),

    ticketModal: document.getElementById("ticketModal"),
    modalTicketTitle: document.getElementById("modalTicketTitle"),
    modalTicketDesc: document.getElementById("modalTicketDesc"),
    modalTicketStatus: document.getElementById("modalTicketStatus"),
    modalTicketFiles: document.getElementById("modalTicketFiles"),

    btnStatusNowe: document.getElementById("btnStatusNowe"),
    btnStatusWTrakcie: document.getElementById("btnStatusWTrakcie"),
    btnStatusZamkniete: document.getElementById("btnStatusZamkniete"),

    btnAddTicket: document.getElementById("btnAddTicket"),
    btnCancelTicket: document.getElementById("btnCancelTicket"),
    btnSaveTicket: document.getElementById("btnSaveTicket"),
    btnSaveWspolnota: document.getElementById("btnSaveWspolnota"),
    btnLogin: document.getElementById("btnLogin"),
    btnRegister: document.getElementById("btnRegister"),

    announcementTitle: document.getElementById("announcementTitle"),
    announcementContent: document.getElementById("announcementContent"),
    announcementGlobal: document.getElementById("announcementGlobal"),
    announcementFrom: document.getElementById("announcementFrom"),
    announcementTo: document.getElementById("announcementTo"),

    btnAddAnnouncement: document.getElementById("btnAddAnnouncement"),
    btnCancelAnnouncement: document.getElementById("btnCancelAnnouncement"),
    btnSaveAnnouncement: document.getElementById("btnSaveAnnouncement"),

    userAnnouncements: document.getElementById("userAnnouncements"),
    adminAnnouncements: document.getElementById("adminAnnouncements"),

    btnLogoutTop: document.getElementById("btnLogoutTop")
  };

  // 🔥 BLOKADA — user NIE MOŻE wejść do adminCard
  function showSection(id) {
    const profile = App.auth.getCurrentProfile();

    if (id === "adminCard" && profile?.role !== "admin") {
      console.warn("User próbował wejść do adminCard — zablokowano");
      id = "mainCard";
    }

    document.querySelectorAll("main .card").forEach(sec => sec.classList.add("hidden"));
    const el = document.getElementById(id);
    if (el) el.classList.remove("hidden");
  }

  function hideAllPanels() {
    document.querySelectorAll("main .card").forEach(sec => sec.classList.add("hidden"));
  }

  function showMessage(el, text, type = "info") {
    if (!el) return;
    el.textContent = text;
    el.className = "message " + type;
    el.classList.remove("hidden");
  }

  // 🔥 KLUCZOWA FUNKCJA — ukrywanie widoków zależnie od roli
  function setAuthView(isLoggedIn) {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;

    if (!isLoggedIn) {
      sidebar.classList.add("hidden");
      dom.btnLogoutTop.classList.add("hidden");
      return;
    }

    sidebar.classList.remove("hidden");
    dom.btnLogoutTop.classList.remove("hidden");

    const profile = App.auth.getCurrentProfile();
    const adminItem = document.querySelector("[data-target='adminCard']");
    const userItem = document.querySelector("[data-target='mainCard']");

    if (profile.role === "admin") {
      adminItem.style.display = "block";
      userItem.style.display = "block";
      dom.adminCard?.classList.remove("hidden");

    } else {
      // 🔥 TWARDY ZAKAZ ADMINA
      adminItem.style.display = "none";
      dom.adminCard?.classList.add("hidden");
      dom.adminAnnouncements?.classList.add("hidden");
      dom.announcementForm?.classList.add("hidden");
      dom.pendingUsersList?.classList.add("hidden");
      dom.allUsersList?.classList.add("hidden");
    }
  }

  function showLoginTab() {
    dom.goToLogin.classList.add("active");
    dom.goToRegister.classList.remove("active");
    dom.loginForm.classList.remove("hidden");
    dom.registerCard.classList.add("hidden");
  }

  function showRegisterTab() {
    dom.goToLogin.classList.remove("active");
    dom.goToRegister.classList.add("active");
    dom.loginForm.classList.add("hidden");
    dom.registerCard.classList.remove("hidden");
  }

  function init() {
    const closeModal = document.getElementById("closeModal");
    if (closeModal) closeModal.onclick = () => dom.ticketModal.classList.add("hidden");

    if (dom.btnAddTicket) dom.btnAddTicket.onclick = () => showSection("ticketForm");
    if (dom.btnCancelTicket) dom.btnCancelTicket.onclick = () => showSection("mainCard");
  }

  return {
    init,
    showSection,
    hideAllPanels,
    showMessage,
    setAuthView,
    showLoginTab,
    showRegisterTab,
    dom
  };
})();
