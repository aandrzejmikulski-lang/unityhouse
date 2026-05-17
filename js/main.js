// =============================================
// UNITY HOUSE — MAIN MODULE
// Inicjalizacja Supabase, sesje, routing,
// start aplikacji i spinanie modułów
// =============================================

window.App = window.App || {};

window.addEventListener("DOMContentLoaded", async () => {

  // ---------------------------------------------
  // 1. INICJALIZACJA SUPABASE
  // ---------------------------------------------
  App.supabase = supabase.createClient(
    "https://YOUR-PROJECT.supabase.co",
    "YOUR-PUBLIC-ANON-KEY"
  );

  console.log("Supabase initialized");

  // ---------------------------------------------
  // 2. INICJALIZACJA MODUŁÓW (dopiero po DOM)
  // ---------------------------------------------
  if (App.ui && App.auth && App.tickets && App.announcements && App.profiles) {
    App.ui.init();
    App.auth.init();
    App.tickets.init();
    App.announcements.init();
  } else {
    console.error("❌ Niektóre moduły nie zostały załadowane.");
  }

  // ---------------------------------------------
  // 3. OBSŁUGA ZMIAN SESJI
  // ---------------------------------------------
  App.supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("Auth event:", event);

    if (event === "SIGNED_OUT") {
      App.ui.hideAllPanels();
      App.ui.showSection("loginCard");
      return;
    }

    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      await handleSession();
    }
  });

  // ---------------------------------------------
  // 4. START APLIKACJI — SPRAWDZENIE SESJI
  // ---------------------------------------------
  await handleSession();

  // ---------------------------------------------
  // FUNKCJE WEWNĘTRZNE
  // ---------------------------------------------
  async function handleSession() {
    App.ui.showLoader();

    const { data: { user } } = await App.supabase.auth.getUser();

    if (!user) {
      App.ui.hideLoader();
      App.ui.showSection("loginCard");
      return;
    }

    // Pobranie profilu
    const { data: profile } = await App.supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    App.auth.setCurrentProfile(profile);

    App.ui.hideLoader();

    route(profile);
  }

  function route(profile) {
    App.ui.hideAllPanels();

    if (!profile.approved) {
      App.ui.showSection("loginCard");
      document.getElementById("loginMessage").innerText =
        "Twoje konto czeka na zatwierdzenie.";
      return;
    }

    if (!profile.wspolnota_id) {
      App.ui.showSection("selectWspolnotaCard");
      App.profiles.loadWspolnotyDropdown();
      return;
    }

    if (profile.role === "admin") {
      App.ui.showSection("adminCard");
      App.profiles.loadPendingUsers();
      App.profiles.loadAllUsers();
      App.tickets.loadTicketsAdmin();
      App.announcements.loadAnnouncementsAdmin();
      return;
    }

    // Użytkownik
    App.ui.showSection("mainCard");
    App.tickets.loadTicketsUser(profile.wspolnota_id);
    App.announcements.loadAnnouncementsUser();
  }

});
