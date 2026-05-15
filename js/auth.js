// auth.js

function initAuth() {
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

  document.getElementById("btnLogin").onclick = loginUser;
  document.getElementById("btnRegister").onclick = registerUser;
  btnLogoutTop.onclick = logoutUser;
}

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
}

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

async function logoutUser() {
  await client.auth.signOut();
  loginEmail.value = "";
  loginPassword.value = "";
  currentProfile = null;

  hideAllPanels();
  loginCard.classList.remove("hidden");
  showLoginTab();
  setAuthView(false);
}
