// =============================================
// UNITY HOUSE — UI MODULE
// Widoki, sidebar, przełączanie paneli, loader
// =============================================

window.App = window.App || {};
App.ui = (() => {

  function getDom() {
    return {
      sidebar: document.querySelector(".sidebar"),
      sidebarItems: document.querySelectorAll(".sidebar-item"),

      loaderOverlay: document.getElementById("loaderOverlay"),

      modal: document.getElementById("ticketModal"),
      modalBody: document.getElementById("modalBody"),
      btnCloseModal: document.getElementById("btnCloseModal"),

      allSections: document.querySelectorAll("main section")
    };
  }

  // ---------------------------------------------
  // INIT
  // ---------------------------------------------
  function init() {
    const dom = getDom();

    dom.sidebarItems.forEach(item => {
      item.onclick = () => {
        const target = item.dataset.target;
        showSection(target);
      };
    });

    if (dom.btnCloseModal) {
      dom.btnCloseModal.onclick = hideModal;
    }
  }

  // ---------------------------------------------
  // SHOW SECTION
  // ---------------------------------------------
  function showSection(sectionId) {
    const dom = getDom();

    dom.allSections.forEach(sec => sec.classList.add("hidden"));

    const target = document.getElementById(sectionId);
    if (target) target.classList.remove("hidden");
  }

  // ---------------------------------------------
  // HIDE ALL PANELS
  // ---------------------------------------------
  function hideAllPanels() {
    const dom = getDom();
    dom.allSections.forEach(sec => sec.classList.add("hidden"));
  }

  // ---------------------------------------------
  // SIDEBAR — USER
  // ---------------------------------------------
  function showUserSidebar() {
    const dom = getDom();

    dom.sidebar.classList.remove("hidden");
    dom.sidebar.classList.add("show");

    document.querySelectorAll(".sidebar-item").forEach(el => el.style.display = "none");

    document.querySelector('[data-target="userAnnouncementsCard"]').style.display = "block";
    document.querySelector('[data-target="userTicketsCard"]').style.display = "block";
  }

  // ---------------------------------------------
  // SIDEBAR — ADMIN
  // ---------------------------------------------
  function showAdminSidebar() {
    const dom = getDom();

    dom.sidebar.classList.remove("hidden");
    dom.sidebar.classList.add("show");

    document.querySelectorAll(".sidebar-item").forEach(el => el.style.display = "none");

    document.querySelector('[data-target="adminAnnouncementsCard"]').style.display = "block";
    document.querySelector('[data-target="adminTicketsCard"]').style.display = "block";
    document.querySelector('[data-target="adminUsersCard"]').style.display = "block";
    document.querySelector('[data-target="adminCommunitiesCard"]').style.display = "block";
  }

  // ---------------------------------------------
  // HIDE SIDEBAR
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
  // MESSAGE
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
  function showModal(html) {
    const dom = getDom();
    dom.modalBody.innerHTML = html;
    dom.modal.classList.remove("hidden");
  }

  function hideModal() {
    const dom = getDom();
    dom.modal.classList.add("hidden");
    dom.modalBody.innerHTML = "";
  }

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
