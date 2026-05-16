window.App = window.App || {};

App.auth = (() => {
  let currentProfile = null;

  function setCurrentProfile(p) {
    currentProfile = p;
  }

  function getDom() {
    return App.ui?.dom || {};
  }

  function init() {
    const {
      goToLogin,
      goToRegister,
      btnLogin,
      btnRegister,
      btnLogoutTop
    } = getDom();

    if (goToLogin) goToLogin.onclick = () => App.ui?.showLoginTab?.();
    if (goToRegister) goToRegister.onclick = () => App.ui?.showRegisterTab?.();

    if (btnLogin) btnLogin.onclick = loginUser;
    if (btnRegister) btnRegister.onclick = registerUser;
    if (btnLogoutTop) btnLogoutTop.onclick = logoutUser;

    // ❌ USUNIĘTO OBSŁUGĘ onAuthStateChange — robi to main.js
  }

  async function loginUser() {
    const { loginEmail, loginPassword, loginMessage } = getDom();

    const email = loginEmail?.value.trim();
    const password = loginPassword?.value.trim();

    if (!email || !password) {
      App.ui?.showMessage?.(loginMessage, "Uzupełnij wszystkie pola.", "error");
      return;
    }

    const { error } = await App.supabase.auth.signInWithPassword({ email, password });

    if (error) {
      App.ui?.showMessage?.(loginMessage, "Błędny e-mail lub hasło.", "error");
      return;
    }

    App.ui?.showMessage?.(loginMessage, "Logowanie...", "success");
  }

  async function registerUser() {
    const { registerEmail, registerPassword, registerFullname, registerMessage } = getDom();

    const email = registerEmail?.value.trim();
    const password = registerPassword?.value.trim();
    const fullname = registerFullname?.value.trim();

    if (!email || !password || !fullname) {
      App.ui?.showMessage?.(registerMessage, "Uzupełnij wszystkie pola.", "error");
      return;
    }

    const { data, error } = await App.supabase.auth.signUp({
      email,
      password,
      options: { data: { fullname } }
    });

    if (error) {
      App.ui?.showMessage?.(registerMessage, "Błąd rejestracji.", "error");
      return;
    }

    if (data.user) {
      await App.supabase.from("profiles").insert({
        id: data.user.id,
        fullname,
        email: data.user.email,
        role: "user",
        approved: false,
        wspolnota_id: null
      });

      App.ui?.showMessage?.(registerMessage, "Sprawdź e-mail i potwierdź konto.", "success");
    }
  }

  // ✅ JEDYNA ZMIANA — usunięto UI, bo robi to main.js
  async function logoutUser() {
    await App.supabase.auth.signOut();
    currentProfile = null;
  }

  function getCurrentProfile() {
    return currentProfile;
  }

  return {
    init,
    loginUser,
    registerUser,
    logoutUser,
    getCurrentProfile,
    setCurrentProfile
  };
})();
