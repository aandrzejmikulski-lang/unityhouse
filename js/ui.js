window.App = window.App || {};

App.ui = (() => {
  const dom = {
    loginCard: document.querySelector("#loginCard"),
    selectWspolnotaCard: document.querySelector("#selectWspolnotaCard"),
    mainCard: document.querySelector("#mainCard"),
    adminCard: document.querySelector("#adminCard"),
    userAnnouncementsCard: document.querySelector("#userAnnouncementsCard"),
    adminTicketsCard: document.querySelector("#adminTicketsCard"),
    adminAnnouncementsCard: document.querySelector("#adminAnnouncementsCard"),
    adminUsersCard: document.querySelector("#adminUsersCard"),

    loginMessage: document.querySelector("#loginMessage"),
    loginEmail: document.querySelector("#loginEmail"),
    loginPassword: document.querySelector("#loginPassword"),
    btnLogin: document.querySelector("#btnLogin"),

    wspolnotaSelect: document.querySelector("#wspolnotaSelect"),
    btnSaveWspolnota: document.querySelector("#btnSaveWspolnota"),

    ticketList: document.querySelector("#ticketList"),
    ticketTitle: document.querySelector("#ticketTitle"),
    ticketDesc: document.querySelector("#ticketDesc"),
    ticketFile: document.querySelector("#ticketFile"),
    btnSaveTicket: document.querySelector("#btnSaveTicket"),

    filterWspolnota: document.querySelector("#filterWspolnota"),
    adminTickets: document.querySelector("#adminTickets"),

    announcementTitle: document.querySelector("#announcementTitle"),
    announcementContent: document.querySelector("#announcementContent"),
    announcementWspolnoty: document.querySelector("#announcementWspolnoty"),
    btnAddAnnouncement: document.querySelector("#btnAddAnnouncement"),
    adminAnnouncements: document.querySelector("#adminAnnouncements"),
    userAnnouncements: document.querySelector("#userAnnouncements"),

    pendingUsersList: document.querySelector("#pendingUsersList"),
    allUsersList: document.querySelector("#allUsersList"),

    ticketModal: document.querySelector("#ticketModal"),
    modalTicketTitle: document.querySelector("#modalTicketTitle"),
    modalTicketDesc: document.querySelector("#modalTicketDesc"),
    modalTicketStatus: document.querySelector("#modalTicketStatus"),
    modalTicketFiles: document.querySelector("#modalTicketFiles"),
    btnStatusNowe: document.querySelector("#btnStatusNowe"),
    btnStatusWTrakcie: document.querySelector("#btnStatusWTrakcie"),
    btnStatusZamkniete: document.querySelector("#btnStatusZamkniete"),
    btnCloseModal: document.querySelector("#btnCloseModal"),

    loaderOverlay: document.querySelector("#loaderOverlay")
  };

  function init() {
    if (dom.btnCloseModal) {
      dom.btnCloseModal.onclick = () => dom.ticketModal.classList.add("hidden");
    }
  }

  function showSection(id) {
    [
      dom.loginCard,
      dom.selectWspolnotaCard,
      dom.mainCard,
      dom.adminCard,
      dom.userAnnouncementsCard,
      dom.adminTicketsCard,
      dom.adminAnnouncementsCard,
      dom.adminUsersCard
    ].forEach(el => el && el.classList.add("hidden"));

    const el = document.querySelector(`#${id}`);
    if (el) el.classList.remove("hidden");
  }

  function hideAllPanels() {
    [dom.mainCard, dom.adminCard, dom.userAnnouncementsCard].forEach(el => el && el.classList.add("hidden"));
  }

  function showLoginTab() {
    showSection("loginCard");
  }

  function setAuthView(isAuth) {
    if (!isAuth) {
      showSection("loginCard");
    }
  }

  function showMessage(container, text, type = "info") {
    if (!container) return;
    container.textContent = text;
    container.className = type;
  }

  function showLoader() {
    dom.loaderOverlay?.classList.remove("hidden");
  }

  function hideLoader() {
    dom.loaderOverlay?.classList.add("hidden");
  }

  return {
    dom,
    init,
    showSection,
    hideAllPanels,
    showLoginTab,
    setAuthView,
    showMessage,
    showLoader,
    hideLoader
  };
})();
