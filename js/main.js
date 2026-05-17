// =============================================
// UNITY HOUSE — MAIN MODULE
// Routing, sesje, inicjalizacja modułów
// =============================================

window.App = window.App || {};

window.addEventListener("DOMContentLoaded", async () => {

  // ---------------------------------------------
  // SUPABASE
  // ---------------------------------------------
App.supabase = supabase.createClient(
  "https://vswonxgsaqnhzsmzexzh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzd29ueGdzYXFuaHpzbXpleHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NjQ2OTYsImV4cCI6MjA5NDI0MDY5Nn0.mBBGMqqSRQgtM9k0aOH1Nl3WdNRj3Xj9nY6TqJgsepk",
  {
    auth: {
      storage: window.sessionStorage,
      persistSession: true
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
  // OBSŁUGA SESJI
  // ---------------------------------------------
  App.supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("Auth event:", event);

    if (event === "SIGNED_OUT") {
      App.ui.showSection("loginCard");
      return;
    }

    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      await handleSession();
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
    console.log("Routing profile:", profile);

    // ---------------------------------------------
    // GLOBALNE UKRYCIE WSZYSTKIEGO
    // ---------------------------------------------
    App.ui.hideAllPanels();

    // ---------------------------------------------
    // 1. Konto niezatwierdzone
    // ---------------------------------------------
    if (!profile.approved) {
      App.ui.showSection("loginCard");
      document.getElementById("loginMessage").innerText =
        "Twoje konto czeka na zatwierdzenie.";
      return;
    }

    // ---------------------------------------------
    // 2. Użytkownik bez wspólnoty (ale NIE admin)
    // ---------------------------------------------
    if (!profile.wspolnota_id && profile.role !== "admin") {
      App.ui.showSection("selectWspolnotaCard");
      App.profiles.loadWspolnotyDropdown();
      return;
    }

    // ---------------------------------------------
    // 3. ADMIN
    // ---------------------------------------------
    if (profile.role === "admin") {
      App.ui.showSection("adminCard");

      document.querySelector(".sidebar")?.classList.remove("hidden");
      document.getElementById("btnLogout")?.classList.remove("hidden");

      // 🔧 DODANE: ukryj "Logowanie"
      document.querySelector('[data-target="loginCard"]')?.classList.add("hidden");

      App.profiles.loadPendingUsers();
      App.profiles.loadAllUsers();
      App.tickets.loadTicketsAdmin();
      App.announcements.loadAnnouncementsAdmin();
      return;
    }

    // ---------------------------------------------
    // 4. NORMALNY UŻYTKOWNIK
    // ---------------------------------------------
    App.ui.showSection("mainCard");

    document.querySelector(".sidebar")?.classList.remove("hidden");
    document.getElementById("btnLogout")?.classList.remove("hidden");

    // 🔧 DODANE: ukryj "Logowanie"
    document.querySelector('[data-target="loginCard"]')?.classList.add("hidden");

    App.tickets.loadTicketsUser(profile.wspolnota_id);
    App.announcements.loadAnnouncementsUser();
  }

});
