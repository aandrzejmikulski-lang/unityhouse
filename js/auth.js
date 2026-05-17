window.App = window.App || {};

App.auth = (() => {
  let currentProfile = null;

  function init() {
    const dom = App.ui.dom;
    if (dom.btnLogin) dom.btnLogin.onclick = loginUser;
    if (dom.btnSaveWspolnota) dom.btnSaveWspolnota.onclick = saveWspolnotaForUser;
  }

  function setCurrentProfile(profile) {
    currentProfile = profile;
  }

  function getCurrentProfile() {
    return currentProfile;
  }

  async function loginUser() {
    const dom = App.ui.dom;
    const email = dom.loginEmail.value.trim();
    const password = dom.loginPassword.value.trim();

    if (!email || !password) {
      App.ui.showMessage(dom.loginMessage, "Podaj e-mail i hasło.", "error");
      return;
    }

    App.ui.showLoader();
    App.ui.showMessage(dom.loginMessage, "Logowanie…", "info");

    const { data, error } = await App.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error("Błąd logowania:", error);
      App.ui.showMessage(dom.loginMessage, "Błędny e-mail lub hasło.", "error");
      App.ui.hideLoader();
      return;
    }

    App.ui.showMessage(dom.loginMessage, "Logowanie pomyślne — trwa wczytywanie profilu…", "info");
  }

  async function saveWspolnotaForUser() {
    const dom = App.ui.dom;
    const profile = getCurrentProfile();
    const wsp = dom.wspolnotaSelect.value;

    if (!profile || !wsp) return;

    const { error } = await App.supabase
      .from("profiles")
      .update({ wspolnota_id: wsp })
      .eq("id", profile.id);

    if (error) {
      console.error("Błąd zapisu wspólnoty:", error);
      return;
    }

    currentProfile = { ...profile, wspolnota_id: wsp };
    App.ui.showSection("mainCard");
    App.tickets.loadTicketsUser(wsp);
    App.announcements.loadAnnouncementsUser();
  }

  return {
    init,
    setCurrentProfile,
    getCurrentProfile
  };
})();
