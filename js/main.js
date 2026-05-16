// ===============================================
// UNITY HOUSE — main.js (FINAL CLEAN VERSION)
// ===============================================

window.App = window.App || {};

App.supabase = supabase.createClient(
  "https://vswonxgsaqnhzsmzexzh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzd29ueGdzYXFuaHpzbXpleHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NjQ2OTYsImV4cCI6MjA5NDI0MDY5Nn0.mBBGMqqSRQgtM9k0aOH1Nl3WdNRj3Xj9nY6TqJgsepk"
);

// ===============================================
// DOM READY
// ===============================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM READY — Unity House Premium");

  // 🔥 opóźnienie na załadowanie ui.js
  setTimeout(() => {
    App.ui?.init?.();
    App.auth?.init?.();
    App.profiles?.init?.();
    App.tickets?.init?.();
    App.announcements?.init?.();
  }, 300);

  // ===============================================
// Sidebar — aktywne sekcje z kontrolą roli
// ===============================================
document.querySelectorAll(".sidebar-item").forEach(item => {
  item.addEventListener("click", () => {

    const profile = App.auth.getCurrentProfile();
    if (!profile) return;

    const target = item.dataset.target;

    // ADMIN może widzieć tylko adminCard
    if (profile.role === "admin") {
      if (target !== "adminCard") return;
    }

    // USER nie może widzieć adminCard
    if (profile.role === "user") {
      if (target === "adminCard") return;
    }

    document.querySelectorAll(".sidebar-item").forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    App.ui.showSection(target);
  });
});


  // Widok startowy
  App.ui?.hideAllPanels?.();
  App.ui?.showSection?.("loginCard");
  App.ui?.showLoginTab?.();
});

// ===============================================
// AUTH STATE CHANGE
// ===============================================
App.supabase.auth.onAuthStateChange(async (event, session) => {
  console.log("AUTH STATE:", event);

  if (!session) {
    App.ui?.hideAllPanels?.();
    App.ui?.showSection?.("loginCard");
    App.ui?.showLoginTab?.();
    App.ui?.setAuthView?.(false);
    return;
  }

  const { data: profile, error } = await App.supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error) {
    console.error("Błąd pobierania profilu:", error);
    App.ui?.showSection?.("loginCard");
    App.ui?.showLoginTab?.();
    return;
  }

  App.auth.setCurrentProfile(profile);

  // ADMIN
  if (profile.role === "admin") {
    App.ui?.setAuthView?.(true);
    App.ui?.showSection?.("adminCard");

    App.profiles?.loadPendingUsers?.();
    App.profiles?.loadAllUsers?.();
    App.tickets?.loadTicketsAdmin?.();
    App.announcements?.loadAnnouncementsAdmin?.();
    return;
  }

  // USER — niezatwierdzony
  if (!profile.approved) {
    App.ui?.showSection?.("loginCard");
    App.ui?.showLoginTab?.();
    App.ui?.showMessage?.(App.ui.dom.loginMessage, "Twoje konto czeka na zatwierdzenie.", "error");
    App.ui?.setAuthView?.(true);
    return;
  }

  // USER — brak wspólnoty
  if (!profile.wspolnota_id) {
    App.ui?.setAuthView?.(true);
    App.ui?.showSection?.("selectWspolnotaCard");
    App.profiles?.loadWspolnotyDropdown?.();
    return;
  }
// Ustawienie widoku po zalogowaniu
App.ui?.hideAllPanels?.();
App.ui?.setAuthView?.(true);

if (profile.role === "admin") {
  App.ui?.showSection?.("adminCard");
  console.log("ADMIN VIEW aktywny");

  App.profiles?.loadPendingUsers?.();
  App.profiles?.loadAllUsers?.();
  App.tickets?.loadTicketsAdmin?.();
  App.announcements?.loadAnnouncementsAdmin?.();
} else {
  App.ui?.showSection?.("mainCard");
  console.log("USER VIEW aktywny");

  App.tickets?.loadTicketsUser?.(profile.wspolnota_id);
  App.announcements?.loadAnnouncementsUser?.();
}
});
