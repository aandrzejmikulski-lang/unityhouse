window.App = window.App || {};

// 1) Supabase – na górze, od razu
App.supabase = supabase.createClient(
  "https://vswonxgsaqnhzsmzexzh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzd29ueGdzYXFuaHpzbXpleHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NjQ2OTYsImV4cCI6MjA5NDI0MDY5Nn0.mBBGMqqSRQgtM9k0aOH1Nl3WdNRj3Xj9nY6TqJgsepk",
  { auth: { persistSession: true, autoRefreshToken: true } }
);

// 2) Start aplikacji po załadowaniu DOM
document.addEventListener("DOMContentLoaded", () => {
  App.ui.init();
  App.auth.init();
  App.profiles.init();
  App.tickets.init();
  App.announcements.init();

  // sidebar – tylko tu, bez inline scriptu w index.html
  document.querySelectorAll(".sidebar-item").forEach(item => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".sidebar-item").forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      const target = item.dataset.target;
      App.ui.showSection(target);
    });
  });

  // ekran startowy
  App.ui.hideAllPanels();
  App.ui.showSection("loginCard");
  App.ui.showLoginTab();
});

// 3) Obsługa zmian sesji
App.supabase.auth.onAuthStateChange(async (event, session) => {
  const { loginMessage } = App.ui.dom;

  if (!session) {
    App.auth.logoutUser();
    return;
  }

  App.ui.setAuthView(true);

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

  if (profile.role === "admin") {
    App.ui.showSection("adminCard");
    App.profiles.loadPendingUsers();
    App.profiles.loadAllUsers();
    App.tickets.loadTicketsAdmin();
    App.announcements.loadAnnouncementsAdmin();
    return;
  }

  if (!profile.approved) {
    App.ui.showSection("loginCard");
    App.ui.showLoginTab();
    App.ui.showMessage(loginMessage, "Twoje konto czeka na zatwierdzenie.", "error");
    return;
  }

  if (!profile.wspolnota_id) {
    App.ui.showSection("selectWspolnotaCard");
    App.profiles.loadWspolnotyDropdown();
    return;
  }

  App.ui.showSection("mainCard");
  App.tickets.loadTicketsUser(profile.wspolnota_id);
  App.announcements.loadAnnouncementsUser();
});
// Wymuszenie startowego widoku logowania
document.addEventListener("DOMContentLoaded", () => {
  App.ui.hideAllPanels();
  App.ui.showSection("loginCard");
  App.ui.showLoginTab();
});
console.log("Main.js działa – test startowy");
App.ui.showSection("loginCard");
