// =============================================
// UNITY HOUSE — UI MODULE
// Widoki, sidebar, przełączanie paneli, loader
// =============================================

window.App = window.App || {};
App.ui = (() => {

  // ---------------------------------------------
  // POBIERANIE ELEMENTÓW DOM
  // ---------------------------------------------
  function getDom() {
    return {
      sidebar: document.getElementById("sidebar"),
      sidebarItems: document.querySelectorAll(".sidebar-item"),

      loaderOverlay: document.getElementById("loaderOverlay"),

      modal: document.getElementById("ticketModal"),
      modalBody: document.getElementById("modalBody"),
      btnCloseModal: document.getElementById("btnCloseModal"),

      allSections: document.querySelectorAll("main section")
    };
  }

  // ---------------------------------------------
  // INICJALIZACJA UI
  // ---------------------------------------------
  function init() {
    const dom = getDom();

    // Obsługa kliknięć w sidebarze
    dom.sidebarItems.forEach(item => {
      item.onclick = () => {
        const target = item.dataset.target;
        showSection(target);
      };
    });

    // Obsługa modala
    if (dom.btnCloseModal) {
      dom.btnCloseModal.onclick = hideModal;
    }
  }

  // ---------------------------------------------
  // POKAŻ PANEL
  // ---------------------------------------------
  function showSection(sectionId) {
    const dom = getDom();

    dom.allSections.forEach(sec => sec.classList.add("hidden"));

    const target = document.getElementById(sectionId);
    if (target) target.classList.remove("hidden");
  }

  // ---------------------------------------------
  // UKRYJ WSZYSTKIE PANELE
  // ---------------------------------------------
  function hideAllPanels() {
    const dom = getDom();
    dom.allSections.forEach(sec => sec.classList.add("hidden"));
  }

  // ---------------------------------------------
  // POKAŻ SIDEBAR DLA USERA
  // ---------------------------------------------
  function showUserSidebar() {
    const dom = getDom();

    dom.sidebar.classList.remove("hidden");
    dom.sidebar.classList.add("show");

    document.querySelectorAll(".user-only").forEach(el => el.style.display = "block");
    document.querySelectorAll(".admin-only").forEach(el => el.style.display = "none");
  }

  // ---------------------------------------------
  // POKAŻ SIDEBAR DLA ADMINA
  // ---------------------------------------------
  function showAdminSidebar() {
    const dom = getDom();

    dom.sidebar.classList.remove("hidden");
    dom.sidebar.classList.add("show");

    document.querySelectorAll(".user-only").forEach(el => el.style.display = "none");
    document.querySelectorAll(".admin-only").forEach(el => el.style.display = "block");
  }

  // ---------------------------------------------
  // SCHOWAJ SIDEBAR
  // ---------------------------------------------
  function hideSidebar() {
    const dom = getDom();
    dom.sidebar.classList.remove("show");
    dom.sidebar.classList.add("hidden");
  }

  // ---------------------------------------------
  // LOADER
  // ---------------------------------------------
  function showLoader() {
    const dom = getDom();
    dom.loaderOverlay.classList.remove("hidden");
  }

  function hideLoader() {
    const dom = getDom();
    dom.loaderOverlay.classList.add("hidden");
  }

  // ---------------------------------------------
  // KOMUNIKATY
  // ---------------------------------------------
  function showMessage(element, text, type = "info") {
    if (!element) return;

    element.textContent = text;
    element.className = `muted ${type}`;

    setTimeout(() => {
      element.textContent = "";
      element.className = "muted";
    }, 3000);
  }

  // ---------------------------------------------
  // MODAL
  // ---------------------------------------------
  function showModal(htmlContent) {
    const dom = getDom();
    dom.modalBody.innerHTML = htmlContent;
    dom.modal.classList.remove("hidden");
  }

  function hideModal() {
    const dom = getDom();
    dom.modal.classList.add("hidden");
    dom.modalBody.innerHTML = "";
  }

  // ---------------------------------------------
  // EKSPORT FUNKCJI
  // ---------------------------------------------
  return {
    init,
    showSection,
    hideAllPanels,
    showUserSidebar,
    showAdminSidebar,
    hideSidebar,
    showLoader,
    hideLoader,
    showMessage,
    showModal,
    hideModal
  };

})();
