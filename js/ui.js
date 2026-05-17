// =============================================
// UNITY HOUSE — UI MODULE
// Zarządza widokami, loaderem, modalami, sidebarami
// =============================================

window.App = window.App || {};
App.ui = {};

// ---------------------------------------------
// REFERENCJE DO ELEMENTÓW
// ---------------------------------------------
App.ui.refs = {
  loader: document.getElementById("loaderOverlay"),
  modal: document.getElementById("ticketModal"),
  modalClose: document.getElementById("btnCloseModal"),
  sidebarItems: document.querySelectorAll(".sidebar-item"),
};

// ---------------------------------------------
// LOADER
// ---------------------------------------------
App.ui.showLoader = function () {
  App.ui.refs.loader.classList.remove("hidden");
};

App.ui.hideLoader = function () {
  App.ui.refs.loader.classList.add("hidden");
};

// ---------------------------------------------
// UKRYWANIE WSZYSTKICH PANELI
// (POPRAWIONE — USUNIĘTO .card)
// ---------------------------------------------
App.ui.hideAllPanels = function () {
  const sections = document.querySelectorAll("section, .modal");
  sections.forEach((el) => el.classList.add("hidden"));
};

// ---------------------------------------------
// POKAZYWANIE KONKRETNEGO PANELU
// ---------------------------------------------
App.ui.showSection = function (id) {
  App.ui.hideAllPanels();
  const el = document.getElementById(id);
  if (el) el.classList.remove("hidden");
};

// ---------------------------------------------
// SIDEBAR — AKTYWNY ELEMENT
// ---------------------------------------------
App.ui.setActiveSidebar = function (targetId) {
  App.ui.refs.sidebarItems.forEach((item) => {
    if (item.dataset.target === targetId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
};

// ---------------------------------------------
// SIDEBAR — OBSŁUGA KLIKNIĘĆ
// ---------------------------------------------
App.ui.initSidebar = function () {
  App.ui.refs.sidebarItems.forEach((item) => {
    item.addEventListener("click", () => {
      const target = item.dataset.target;
      App.ui.setActiveSidebar(target);
      App.ui.showSection(target);
    });
  });
};

// ---------------------------------------------
// MODAL — OTWIERANIE
// ---------------------------------------------
App.ui.openModal = function () {
  App.ui.refs.modal.classList.remove("hidden");
};

// ---------------------------------------------
// MODAL — ZAMYKANIE
// ---------------------------------------------
App.ui.closeModal = function () {
  App.ui.refs.modal.classList.add("hidden");
};

// ---------------------------------------------
// MODAL — OBSŁUGA PRZYCISKU X
// ---------------------------------------------
App.ui.refs.modalClose.addEventListener("click", () => {
  App.ui.closeModal();
});

// ---------------------------------------------
// KLIKNIĘCIE POZA MODALEM
// ---------------------------------------------
window.addEventListener("click", (e) => {
  if (e.target === App.ui.refs.modal) {
    App.ui.closeModal();
  }
});

// ---------------------------------------------
// INICJALIZACJA UI
// ---------------------------------------------
App.ui.init = function () {
  App.ui.initSidebar();
  App.ui.hideAllPanels();
  App.ui.showSection("loginCard");
};

console.log("UI module loaded");
