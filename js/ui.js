// =============================================
// UNITY HOUSE — UI MODULE
// Modal, loader, sekcje, sidebar, komunikaty
// =============================================

window.App = window.App || {};
App.ui = (() => {

  // ---------------------------------------------
  // DYNAMICZNY MODAL (DZIAŁA ZAWSZE)
  // ---------------------------------------------
  function showModal(html) {
    let modal = document.getElementById("globalModal");

    if (!modal) {
      modal = document.createElement("div");
      modal.id = "globalModal";
      modal.className = "modalWrapper";

      modal.innerHTML = `
        <div class="modalOverlay"></div>
        <div class="modalBox">
          <div id="modalContent"></div>
          <button class="btn ghost closeModal">Zamknij</button>
        </div>
      `;

      document.body.appendChild(modal);

      modal.querySelector(".modalOverlay").onclick = hideModal;
      modal.querySelector(".closeModal").onclick = hideModal;
    }

    modal.querySelector("#modalContent").innerHTML = html;
    modal.style.display = "flex";
  }

  function hideModal() {
    const modal = document.getElementById("globalModal");
    if (modal) modal.style.display = "none";
  }

  // ---------------------------------------------
  // LOADER
  // ---------------------------------------------
  function showLoader() {
    let loader = document.getElementById("globalLoader");
    if (!loader) {
      loader = document.createElement("div");
      loader.id = "globalLoader";
      loader.className = "loaderOverlay";
      loader.innerHTML = `<div class="loader"></div>`;
      document.body.appendChild(loader);
    }
    loader.style.display = "flex";
  }

  function hideLoader() {
    const loader = document.getElementById("globalLoader");
    if (loader) loader.style.display = "none";
  }

  // ---------------------------------------------
  // KOMUNIKATY
  // ---------------------------------------------
  function showMessage(msg, type = "info") {
    let box = document.getElementById("globalMessage");
    if (!box) {
      box = document.createElement("div");
      box.id = "globalMessage";
      box.className = "messageBox";
      document.body.appendChild(box);
    }

    box.innerHTML = msg;
    box.className = `messageBox ${type}`;
    box.style.display = "block";

    setTimeout(() => {
      box.style.display = "none";
    }, 3000);
  }

  // ---------------------------------------------
  // POKAZYWANIE SEKCJI
  // ---------------------------------------------
  function hideAllPanels() {
    document.querySelectorAll(".panel").forEach(p => p.style.display = "none");
  }

  function showSection(id) {
    hideAllPanels();
    const el = document.getElementById(id);
    if (el) el.style.display = "block";
  }

  // ---------------------------------------------
  // SIDEBAR
  // ---------------------------------------------
  function initSidebar() {
    const btn = document.getElementById("sidebarToggle");
    const sidebar = document.getElementById("sidebar");

    if (btn && sidebar) {
      btn.onclick = () => {
        sidebar.classList.toggle("open");
      };
    }
  }

  // ---------------------------------------------
  // LOGOWANIE / REJESTRACJA
  // ---------------------------------------------
  function setAuthView(view) {
    const login = document.getElementById("loginPanel");
    const register = document.getElementById("registerPanel");

    if (!login || !register) return;

    if (view === "login") {
      login.style.display = "block";
      register.style.display = "none";
    } else {
      login.style.display = "none";
      register.style.display = "block";
    }
  }

  function showLoginTab() {
    setAuthView("login");
  }

  function showRegisterTab() {
    setAuthView("register");
  }

  // ---------------------------------------------
  // INIT
  // ---------------------------------------------
  function init() {
    initSidebar();
  }

  return {
    init,
    showModal,
    hideModal,
    showLoader,
    hideLoader,
    showMessage,
    showSection,
    hideAllPanels,
    setAuthView,
    showLoginTab,
    showRegisterTab
  };

})();
