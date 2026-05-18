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

  function getCurrentProfile() {
    return currentProfile;
  }

  function getDom() {
    return {
      loginEmail: document.getElementById("loginEmail"),
      loginPassword: document.getElementById("loginPassword"),
      loginMessage: document.getElementById("loginMessage"),

      btnLogin: document.getElementById("btnLogin"),
      btnLogout: document.getElementById("btnLogout"),
    };
  }

  // ---------------------------------------------
  // INIT
  // ---------------------------------------------
  function init() {
    const dom = getDom();

    if (dom.btnLogin) dom.btnLogin.onclick = loginUser;

    if (dom.btnLogout) {
      dom.btnLogout.onclick = () => {
        logoutUser();
      };
    }

    App.supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        if (currentProfile?.role === "admin") {
          App.ui.showAdminSidebar();
          App.ui.showSection("adminAnnouncementsCard");
        } else {
          App.ui.showUserSidebar();
          App.ui.showSection("userAnnouncementsCard");
        }
      }

      if (event === "SIGNED_OUT") {
        App.ui.hideSidebar();
        App.ui.hideAllPanels();
        App.ui.showSection("loginCard");
      }
    });
  }

  // ---------------------------------------------
  // LOGIN
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

    const { data, error } = await App.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      App.ui.hideLoader();
      App.ui.showMessage(loginMessage, "Błędny e-mail lub hasło.", "error");
      return;
    }

    const { data: { user } } = await App.supabase.auth.getUser();

    const { data: profileData } = await App.supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setCurrentProfile(profileData);

    if (profileData.role === "admin") {
      App.ui.showAdminSidebar();
      App.ui.showSection("adminAnnouncementsCard");
    } else {
      App.ui.showUserSidebar();
      App.ui.showSection("userAnnouncementsCard");
    }

    App.ui.hideLoader();
    App.ui.showMessage(loginMessage, "Logowanie...", "success");
  }

  // ---------------------------------------------
  // LOGOUT
  // ---------------------------------------------
  async function logoutUser() {
    await App.supabase.auth.signOut();
    currentProfile = null;

    App.ui.hideSidebar();
    App.ui.hideAllPanels();
    App.ui.showSection("loginCard");
  }

  return {
    init,
    loginUser,
    logoutUser,
    getCurrentProfile,
    setCurrentProfile
  };

})();
