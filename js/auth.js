let currentProfile = null;

// ===============================
// INIT AUTH
// ===============================
function initAuth() {

  // zabezpieczenie — jeśli elementów nie ma, nie inicjujemy
  if (!btnLoginTop || !btnRegisterTop || !btnLogoutTop) return;

  // przełączanie widoków logowania/rejestracji
  btnLoginTop.onclick = () => {
    hideAllPanels();
    loginCard.classList.remove("hidden");
    showLoginTab();
  };

  btnRegisterTop.onclick = () => {
    hideAllPanels();
    loginCard.classList.remove("hidden");
    showRegisterTab();
  };

  goToLogin.onclick = showLoginTab;
  goToRegister.onclick = showRegisterTab;

  btnLogin.onclick = loginUser;
  btnRegister.onclick = registerUser;
  btnLogoutTop.onclick = logoutUser;
}


// ===============================
// LOGOWANIE
// ===============================
async function loginUser() {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  if (!email || !password) {
    showMessage(loginMessage, "Uzupełnij wszystkie pola.", "error");
    return;
  }

  const { error } = await client.auth.signInWithPassword({ email, password });

  if (error) {
    showMessage(loginMessage, "Błędny e-mail lub hasło.", "error");
    return;
  }

  showMessage(loginMessage, "Logowanie...", "success");

  const { data: { user } } = await client.auth.getUser();

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    showMessage(loginMessage, "Błąd pobierania profilu.", "error");
    return;
  }

  currentProfile = profile;
  hideAllPanels();

  // ADMIN
  if (profile.role === "admin") {
    showSection("adminCard");
    loadPendingUsers();
    loadAllUsers();
    loadTicketsAdmin();
    loadAnnouncementsAdmin();
    setAuthView(true);
    return;
  }

  // NIEZATWIERDZONY
  if (!profile.approved) {
    showSection("loginCard");
    showLoginTab();
    showMessage(loginMessage, "Twoje konto czeka na zatwierdzenie.", "error");
    setAuthView(true);
    return;
  }

  // BEZ WSPÓLNOTY
  if (!profile.wspolnota_id) {
    showSection("selectWspolnotaCard");
    loadWspolnotyDropdown();
    setAuthView(true);
    return;
  }

  // UŻYTKOWNIK Z WSPÓLNOTĄ
  showSection("mainCard");
  loadTicketsUser(profile.wspolnota_id);
  loadAnnouncementsUser();
  setAuthView(true);
}


// ===============================
// REJESTRACJA
// ===============================
async function registerUser() {
  const email = registerEmail.value.trim();
  const password = registerPassword.value.trim();
  const fullname = registerFullname.value.trim();

  if (!email || !password || !fullname) {
    showMessage(registerMessage, "Uzupełnij wszystkie pola.", "error");
    return;
  }

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { fullname } }
  });

  if (error) {
    showMessage(registerMessage, "Błąd rejestracji.", "error");
    return;
  }

  if (data.user) {
    await client.from("profiles").insert({
      id: data.user.id,
      fullname,
      email: data.user.email,
      role: "user",
      approved: false,
      wspolnota_id: null
    });

    showMessage(registerMessage, "Sprawdź e-mail i potwierdź konto.", "success");
  }
}


// ===============================
// WYLOGOWANIE
// ===============================
async function logoutUser() {
  await client.auth.signOut();

  loginEmail.value = "";
  loginPassword.value = "";
  currentProfile = null;

  hideAllPanels();
  showSection("loginCard");
  showLoginTab();
  setAuthView(false);
}
