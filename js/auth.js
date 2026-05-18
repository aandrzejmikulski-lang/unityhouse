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

    if (dom.btnLogout) {
      dom.btnLogout.onclick = () => {
        console.log("Kliknięto WYLOGUJ");
        logoutUser();
      };
    }

    if (dom.btnSaveWspolnota) dom.btnSaveWspolnota.onclick = saveWspolnota;

    // 🔥 Nasłuchiwanie zmian sesji Supabase
    App.supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event);

      if (event === "SIGNED_IN") {
        document.querySelector(".sidebar")?.classList.remove("hidden");
        document.querySelector(".sidebar")?.classList.add("show");
        document.getElementById("btnLogout")?.classList.remove("hidden");

        if (currentProfile?.role === "admin") {
          App.ui.showSection("adminAnnouncementsCard");
        } else {
          App.ui.showSection("userAnnouncementsCard");
        }
      }

      if (event === "SIGNED_OUT") {
        document.querySelector(".sidebar")?.classList.remove("show");
        document.querySelector(".sidebar")?.classList.add("hidden");
        document.getElementById("btnLogout")?.classList.add("hidden");

        App.ui.hideAllPanels();
        App.ui.showSection("loginCard");
      }
    });
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

    const { data, error } = await App.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      App.ui.hideLoader();
      App.ui.showMessage(loginMessage, "Błędny e-mail lub hasło.", "error");
      return;
    }

    // ---------------------------------------------
    // 🔥 POBIERZ PROFIL UŻYTKOWNIKA
    // ---------------------------------------------
    const { data: { user } } = await App.supabase.auth.getUser();

    const { data: profileData } = await App.supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setCurrentProfile(profileData);

    // ---------------------------------------------
    // 🔥 POKAŻ SIDEBAR I PANEL
    // ---------------------------------------------
    document.querySelector(".sidebar")?.classList.remove("hidden");
    document.querySelector(".sidebar")?.classList.add("show");
    document.getElementById("btnLogout")?.classList.remove("hidden");

    App.ui.hideLoader();
    App.ui.showMessage(loginMessage, "Logowanie...", "success");

    // 🔥 Wybór panelu zależnie od roli
    if (profileData.role === "admin") {
      App.ui.showSection("adminAnnouncementsCard");
    } else {
      App.ui.showSection("userAnnouncementsCard");
    }
  }

  // ---------------------------------------------
  // WYLOGOWANIE
  // ---------------------------------------------
  async function logoutUser() {
    console.log("Wylogowywanie...");
    await App.supabase.auth.signOut();
    currentProfile = null;

    document.querySelector(".sidebar")?.classList.remove("show");
    document.querySelector(".sidebar")?.classList.add("hidden");
    document.getElementById("btnLogout")?.classList.add("hidden");

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

  return {
    init,
    loginUser,
    logoutUser,
    getCurrentProfile,
    setCurrentProfile,
    saveWspolnota
  };

})();
