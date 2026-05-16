window.App = window.App || {};
App.ui = (() => {
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

  function showSection(id) {
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

  function setAuthView(isLoggedIn) {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar || !btnLogoutTop) return;

    if (isLoggedIn) {
      sidebar.classList.remove("hidden");
      btnLogoutTop.classList.remove("hidden");
    } else {
      sidebar.classList.add("hidden");
      btnLogoutTop.classList.add("hidden");
    }
  }

  function showLoginTab() {
    if (!goToLogin || !goToRegister || !loginForm || !registerCard) return;
    goToLogin.classList.add("active");
    goToRegister.classList.remove("active");
    loginForm.classList.remove("hidden");
    registerCard.classList.add("hidden");
  }

  function showRegisterTab() {
    if (!goToLogin || !goToRegister || !loginForm || !registerCard) return;
    goToLogin.classList.remove("active");
    goToRegister.classList.add("active");
    loginForm.classList.add("hidden");
    registerCard.classList.remove("hidden");
  }

  function init() {
    const closeModal = document.getElementById("closeModal");
    if (closeModal && ticketModal) {
      closeModal.onclick = () => ticketModal.classList.add("hidden");
    }

    if (btnAddTicket) {
      btnAddTicket.onclick = () => showSection("ticketForm");
    }

    if (btnCancelTicket) {
      btnCancelTicket.onclick = () => showSection("mainCard");
    }
  }

  // eksport do globalnego App + globalne aliasy dla index.html
  window.showSection = showSection;
  window.hideAllPanels = hideAllPanels;
  window.showMessage = showMessage;
  window.showLoginTab = showLoginTab;
  window.showRegisterTab = showRegisterTab;

  return {
    init,
    showSection,
    hideAllPanels,
    showMessage,
    setAuthView,
    showLoginTab,
    showRegisterTab,
    dom: {
      loginCard,
      mainCard,
      adminCard,
      wspolnotaCard,
      selectWspolnotaCard,
      ticketForm,
      loginMessage,
      registerMessage,
      loginEmail,
      loginPassword,
      registerEmail,
      registerPassword,
      registerFullname,
      btnLoginTop,
      btnRegisterTop,
      btnLogoutTop,
      goToLogin,
      goToRegister,
      loginForm,
      registerCard,
      wspolnotaDropdown,
      wspolnotaMessage,
      pendingUsersList,
      allUsersList,
      ticketTitle,
      ticketDesc,
      ticketFile,
      ticketList,
      adminTickets,
      ticketModal,
      modalTicketTitle,
      modalTicketDesc,
      modalTicketStatus,
      modalTicketFiles,
      btnStatusNowe,
      btnStatusWTrakcie,
      btnStatusZamkniete,
      btnAddTicket,
      btnCancelTicket,
      btnSaveTicket,
      btnSaveWspolnota,
      btnLogin,
      btnRegister,
      announcementForm,
      announcementTitle,
      announcementContent,
      announcementGlobal,
      announcementFrom,
      announcementTo,
      btnAddAnnouncement,
      btnCancelAnnouncement,
      btnSaveAnnouncement,
      userAnnouncements,
      adminAnnouncements
    }
  };
})();
