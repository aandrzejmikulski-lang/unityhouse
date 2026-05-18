// =============================================
// UNITY HOUSE — MAIN MODULE
// Routing, sesje, inicjalizacja modułów
// =============================================

window.App = window.App || {};

window.addEventListener("DOMContentLoaded", async () => {

  // ---------------------------------------------
  // SUPABASE — KLIENT PODSTAWOWY (bez nagłówków!)
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

    if (error) console.warn("Błąd pobierania profilu:", error);

    App.auth.setCurrentProfile(profile);

    App.ui.hideLoader();
    route(profile);
  }

  function route(profile) {
    console.log("Routing profile:", profile);

    App.ui.hideAllPanels();

    if (!profile.approved) {
      App.ui.showSection("loginCard");
      document.getElementById("loginMessage").innerText =
        "Twoje konto czeka na zatwierdzenie.";
      return;
    }

    if (!profile.wspolnota_id && profile.role !== "admin") {
      App.ui.showSection("selectWspolnotaCard");
      App.profiles.loadWspolnotyDropdown();
      return;
    }

    if (profile.role === "admin") {
      App.ui.showSection("adminCard");
      document.getElementById("adminCard")?.classList.remove("hidden");
      document.getElementById("mainCard")?.classList.add("hidden");
      document.getElementById("adminAnnouncementsCard")?.classList.remove("hidden");

      document.querySelector(".sidebar")?.classList.remove("hidden");
      document.getElementById("btnLogout")?.classList.remove("hidden");
      document.querySelector('[data-target="loginCard"]')?.classList.add("hidden");

      App.profiles.loadPendingUsers();
      App.profiles.loadAllUsers();
      App.tickets.loadTicketsAdmin();
      App.announcements.loadAnnouncementsAdmin();
      return;
    }

    App.ui.showSection("mainCard");
    document.getElementById("mainCard")?.classList.remove("hidden");
    document.getElementById("adminCard")?.classList.add("hidden");
    document.getElementById("adminAnnouncementsCard")?.classList.add("hidden");

    document.querySelector(".sidebar")?.classList.remove("hidden");
    document.getElementById("btnLogout")?.classList.remove("hidden");
    document.querySelector('[data-target="loginCard"]')?.classList.add("hidden");

    App.tickets.loadTicketsUser(profile.wspolnota_id);
    App.announcements.loadAnnouncementsUser();
  }

});
