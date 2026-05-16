// ===============================================
// UNITY HOUSE — main.js (FINAL PREMIUM VERSION)
// ===============================================

window.App = window.App || {};

App.supabase = supabase.createClient(
  "https://vswonxgsaqnhzsmzexzh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzd29ueGdzYXFuaHpzbXpleHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NjQ2OTYsImV4cCI6MjA5NDI0MDY5Nn0.mBBGMqqSRQgtM9k0aOH1Nl3WdNRj3Xj9nY6TqJgsepk"
);

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM READY — Unity House Premium");

  // Inicjalizacja UI
  App.ui.init();

  // Inicjalizacja modułów
if (App.ui?.init) App.ui.init();
if (App.auth?.init) App.auth.init();
if (App.profiles?.init) App.profiles.init();
if (App.tickets?.init) App.tickets.init();
if (App.announcements?.init) App.announcements.init();


  // Sidebar — aktywne sekcje
  document.querySelectorAll(".sidebar-item").forEach(item => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".sidebar-item").forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      const target = item.dataset.target;
      App.ui.showSection(target);
    });
  });

  // Widok startowy
  App.ui.hideAllPanels();
  App.ui.showSection("loginCard");
  App.ui.showLoginTab();
});

// ===============================================
// AUTH STATE CHANGE — pełna obsługa logiki
// ===============================================

App.supabase.auth.onAuthStateChange(async (event, session) => {
  console.log("AUTH STATE:", event);

 if (!session) {
  App.ui.hideAllPanels();
  App.ui.showSection("loginCard");
  App.ui.showLoginTab();
  App.ui.setAuthView(false);
  return;
}



  const { data: profile, error } = await App.supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error) {
    console.error("Błąd pobierania profilu:", error);
    App.ui.showSection("loginCard");
    App.ui.showLoginTab();
    return;
  }

  // Zapis profilu w pamięci modułu auth
App.auth.setCurrentProfile(profile);


  // ADMIN
  if (profile.role === "admin") {
    App.ui.setAuthView(true);
    App.ui.showSection("adminCard");

    App.profiles.loadPendingUsers();
    App.profiles.loadAllUsers();
    App.tickets.loadTicketsAdmin();
    App.announcements.loadAnnouncementsAdmin();
    return;
  }

  // USER — niezatwierdzony
  if (!profile.approved) {
    App.ui.showSection("loginCard");
    App.ui.showLoginTab();
    App.ui.showMessage(App.ui.dom.loginMessage, "Twoje konto czeka na zatwierdzenie.", "error");
    App.ui.setAuthView(true);
    return;
  }

  // USER — brak wspólnoty
  if (!profile.wspolnota_id) {
    App.ui.setAuthView(true);
    App.ui.showSection("selectWspolnotaCard");
    App.profiles.loadWspolnotyDropdown();
    return;
  }

  // USER — pełny dostęp
  App.ui.setAuthView(true);
  App.ui.showSection("mainCard");

  App.tickets.loadTicketsUser(profile.wspolnota_id);
  App.announcements.loadAnnouncementsUser();
});
