// =============================================
// UNITY HOUSE — AUTH MODULE
// Logowanie, wylogowanie, pobieranie profilu
// =============================================

window.App = window.App || {};
App.auth = (() => {

  let currentProfile = null;

  function setCurrentProfile(p) {
    currentProfile = p;
  }

  function getDom() {
    return {
      loginEmail: document.getElementById("loginEmail"),
      loginPassword: document.getElementById("loginPassword"),
      loginMessage: document.getElementById("loginMessage"),

      wspolnotaSelect: document.getElementById("wspolnotaSelect"),
      btnSaveWspolnota: document.getElementById("btnSaveWspolnota"),

      btnLogin: document.getElementById("btnLogin"),
      btnLogout: document.getElementById("btnLogout"),
    };
  }

  // ---------------------------------------------
  // INICJALIZACJA
  // ---------------------------------------------
  function init() {
    const dom = getDom();

    if (dom.btnLogin) dom.btnLogin.onclick = loginUser;
    if (dom.btnLogout) dom.btnLogout.onclick = logoutUser;
    if (dom.btnSaveWspolnota) dom.btnSaveWspolnota.onclick = saveWspolnota;
  }

  // ---------------------------------------------
  // LOGOWANIE
  // ---------------------------------------------
  async function loginUser() {
    const { loginEmail, loginPassword, loginMessage } = getDom();

    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    if (!email || !password) {
      App.ui.showMessage(loginMessage, "Uzupełnij wszystkie pola.", "error");
      return;
    }

    App.ui.showLoader();

    const { error } = await App.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      App.ui.hideLoader();
      App.ui.showMessage(loginMessage, "Błędny e-mail lub hasło.", "error");
      return;
    }

    App.ui.showMessage(loginMessage, "Logowanie...", "success");
  }

  // ---------------------------------------------
  // WYLOGOWANIE
  // ---------------------------------------------
  async function logoutUser() {
    await App.supabase.auth.signOut();
    currentProfile = null;

    App.ui.hideAllPanels();
    App.ui.showSection("loginCard");
  }

  // ---------------------------------------------
  // ZAPIS WYBRANEJ WSPÓLNOTY
  // ---------------------------------------------
  async function saveWspolnota() {
    const dom = getDom();
    const wspolnotaId = dom.wspolnotaSelect.value;

    if (!wspolnotaId) return;

    const { data: { user } } = await App.supabase.auth.getUser();

    await App.supabase
      .from("profiles")
      .update({ wspolnota_id: wspolnotaId })
      .eq("id", user.id);

    currentProfile.wspolnota_id = wspolnotaId;
  }

  function getCurrentProfile() {
    return currentProfile;
  }

  return {
    init,
    loginUser,
    logoutUser,
    getCurrentProfile,
    setCurrentProfile,
    saveWspolnota
  };

})();
