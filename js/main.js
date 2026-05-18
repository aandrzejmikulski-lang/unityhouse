// =============================================
// UNITY HOUSE — MAIN MODULE
// Inicjalizacja Supabase + modułów
// =============================================

window.App = window.App || {};

window.addEventListener("DOMContentLoaded", async () => {

  // ---------------------------------------------
  // SUPABASE — KLIENT
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
  // SPRAWDZENIE SESJI NA START
  // ---------------------------------------------
  await restoreSession();

  // ---------------------------------------------
  // FUNKCJE
  // ---------------------------------------------
  async function restoreSession() {
    App.ui.showLoader();

    const { data: { user } } = await App.supabase.auth.getUser();

    if (!user) {
      App.ui.hideLoader();
      App.ui.showSection("loginCard");
      return;
    }

    // pobierz profil
    const { data: profile, error } = await App.supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !profile) {
      console.warn("Błąd pobierania profilu:", error);
      App.ui.hideLoader();
      App.ui.showSection("loginCard");
      return;
    }

    App.auth.setCurrentProfile(profile);

    // routing zależnie od roli
    if (profile.role === "admin") {
      App.ui.showAdminSidebar();
      App.ui.showSection("adminAnnouncementsCard");

      App.profiles.loadPendingUsers?.();
      App.profiles.loadAllUsers?.();
      App.tickets.loadTicketsAdmin?.();
      App.announcements.loadAnnouncementsAdmin?.();

    } else {
      App.ui.showUserSidebar();
      App.ui.showSection("userAnnouncementsCard");

      App.tickets.loadTicketsUser?.(profile.wspolnota_id);
      App.announcements.loadAnnouncementsUser?.();
    }

    App.ui.hideLoader();
  }

});
