// =============================================
// UNITY HOUSE — MAIN MODULE
// Routing, sesje, inicjalizacja modułów
// =============================================

window.App = window.App || {};

window.addEventListener("DOMContentLoaded", async () => {

  // ---------------------------------------------
  // SUPABASE — KLIENT PODSTAWOWY
  // ---------------------------------------------
  App.supabase = supabase.createClient(
    "https://vswonxgsaqnhzsmzexzh.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzd29ueGdzYXFuaHpzbXpleHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NjQ2OTYsImV4cCI6MjA5NDI0MDY5Nn0.mBBGMqqSRQgtM9k0aOH1Nl3WdNRj3Xj9nY6TqJgsepk",
    {
      auth: {
        storage: window.sessionStorage,
        persistSession: true,
        autoRefreshToken: true
      }
    }
  );

  console.log("Supabase initialized");

  // ---------------------------------------------
  // INICJALIZACJA MODUŁÓW
  // ---------------------------------------------
  App.ui.init();
  App.auth.init();
  App.profiles.init?.();
  App.tickets.init?.();
  App.announcements.init?.();

  // ---------------------------------------------
  // LOGOUT
  // ---------------------------------------------
  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
      try {
        await App.supabase.auth.signOut();
        window.sessionStorage.clear();

        App.ui.hideAllPanels();
        document.querySelector(".sidebar")?.classList.add("hidden");
        document.getElementById("btnLogout")?.classList.add("hidden");
        App.ui.showSection("loginCard");
      } catch (e) {
        console.warn("Błąd wylogowania:", e);
      }
    });
  }

  // ---------------------------------------------
  // OBSŁUGA SESJI
  // ---------------------------------------------
  App.supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("Auth event:", event);

    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      await handleSession();
    }

    if (event === "SIGNED_OUT") {
      App.ui.hideAllPanels();
      document.querySelector(".sidebar")?.classList.add("hidden");
      document.getElementById("btnLogout")?.classList.add("hidden");
      App.ui.showSection("loginCard");
    }
  });

  // ---------------------------------------------
  // START
  // ---------------------------------------------
  await handleSession();

  // ---------------------------------------------
  // FUNKCJE
  // ---------------------------------------------
  async function handleSession() {
    App.ui.showLoader();

    const { data: { user } } = await App.supabase.auth.getUser();

    if (!user) {
      App.ui.hideLoader();
      App.ui.showSection("loginCard");
      return;
    }

    const { data: profile, error } = await App.supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !profile) {
      console.warn("Błąd pobierania profilu:", error);
      App.ui.hideLoader();
      App.ui.showSection("loginCard");
      document.getElementById("loginMessage").innerText =
        "Błąd profilu użytkownika. Skontaktuj się z administratorem.";
      return;
    }

    App.auth.setCurrentProfile(profile);
    App.ui.hideLoader();
    route(profile);
  }

  // ---------------------------------------------
  // ROUTING
  // ---------------------------------------------
  function route(profile) {
    console.log("Routing profile:", profile);

    App.ui.hideAllPanels();

    // ukryj login
    document.querySelector('[data-target="loginCard"]')?.classList.add("hidden");

    // pokaż sidebar
    document.querySelector(".sidebar")?.classList.remove("hidden");

    // pokaż wylogowanie
    document.getElementById("btnLogout")?.classList.remove("hidden");

    // konto niezatwierdzone
    if (!profile.approved) {
      App.ui.showSection("loginCard");
      document.getElementById("loginMessage").innerText =
        "Twoje konto czeka na zatwierdzenie.";
      return;
    }

    // brak wspólnoty (user)
    if (!profile.wspolnota_id && profile.role !== "admin") {
      App.ui.showSection("selectWspolnotaCard");
      App.profiles.loadWspolnotyDropdown();
      return;
    }

    // ADMIN
    if (profile.role === "admin") {
      App.ui.showSection("adminCard");

      // admin widzi tylko Administrację
      document.querySelector('[data-target="adminCard"]')?.classList.remove("hidden");

      // admin NIE widzi zgłoszeń użytkownika
      document.querySelector('[data-target="mainCard"]')?.classList.add("hidden");

      // admin NIE widzi ogłoszeń użytkownika
      document.querySelector('[data-target="announcementsCard"]')?.classList.add("hidden");

      App.profiles.loadPendingUsers();
      App.profiles.loadAllUsers();
      App.tickets.loadTicketsAdmin();
      App.announcements.loadAnnouncementsAdmin();
      return;
    }

    // USER
    App.ui.showSection("mainCard");

    // user NIE widzi administracji
    document.querySelector('[data-target="adminCard"]')?.classList.add("hidden");

    App.tickets.loadTicketsUser(profile.wspolnota_id);
    App.announcements.loadAnnouncementsUser();
  }

});
