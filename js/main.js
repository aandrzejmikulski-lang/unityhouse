// ===============================================
// UNITY HOUSE — main.js (FINAL FIXED VERSION)
// ===============================================

window.App = window.App || {};

// 🔥 Blokada podwójnego wywołania Supabase
let AUTH_LOCK = false;

App.supabase = supabase.createClient(
  "https://vswonxgsaqnhzsmzexzh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzd29ueGdzYXFuaHpzbXpleHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NjQ2OTYsImV4cCI6MjA5NDI0MDY5Nn0.mBBGMqqSRQgtM9k0aOH1Nl3WdNRj3Xj9nY6TqJgsepk"
);

// ===============================================
// DOM READY
// ===============================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM READY — Unity House Premium");

  setTimeout(() => {
    App.ui?.init?.();
    App.auth?.init?.();
    App.profiles?.init?.();
    App.tickets?.init?.();
    App.announcements?.init?.();

    App.ui?.hideAllPanels?.();
    App.ui?.showSection?.("loginCard");
    App.ui?.showLoginTab?.();
  }, 300);

  // Sidebar z kontrolą roli
  document.querySelectorAll(".sidebar-item").forEach(item => {
    item.addEventListener("click", () => {
      const profile = App.auth.getCurrentProfile();
      if (!profile) return;

      const target = item.dataset.target;

      if (profile.role === "admin" && target !== "adminCard") return;
      if (profile.role === "user" && target === "adminCard") return;

      document.querySelectorAll(".sidebar-item").forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      App.ui.showSection(target);
    });
  });
});

// ===============================================
// AUTH STATE CHANGE
// ===============================================
App.supabase.auth.onAuthStateChange(async (event, session) => {
  console.log("AUTH STATE:", event);

  // 🔥 Blokada podwójnego wywołania Supabase
  if (AUTH_LOCK) return;
  AUTH_LOCK = true;

  if (!session) {
    App.ui?.hideAllPanels?.();
    App.ui?.showSection?.("loginCard");
    App.ui?.showLoginTab?.();
    App.ui?.setAuthView?.(false);
    setTimeout(() => AUTH_LOCK = false, 300);
    return;
  }

  const { data: profile, error } = await App.supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error) {
    console.error("Błąd pobierania profilu:", error);
    App.ui?.hideAllPanels?.();
    App.ui?.showSection?.("loginCard");
    App.ui?.showLoginTab?.();
    setTimeout(() => AUTH_LOCK = false, 300);
    return;
  }

  App.auth.setCurrentProfile(profile);

  // Konto niezatwierdzone
  if (!profile.approved) {
    App.ui?.hideAllPanels?.();
    App.ui?.showSection?.("loginCard");
    App.ui?.showLoginTab?.();
    App.ui?.showMessage?.(
      App.ui.dom.loginMessage,
      "Twoje konto czeka na zatwierdzenie.",
      "error"
    );
    setTimeout(() => AUTH_LOCK = false, 300);
    return;
  }

  // User bez wspólnoty
  if (profile.role === "user" && !profile.wspolnota_id) {
    App.ui?.setAuthView?.(true);
    App.ui?.hideAllPanels?.();
    App.ui?.showSection?.("selectWspolnotaCard");
    App.profiles?.loadWspolnotyDropdown?.();
    setTimeout(() => AUTH_LOCK = false, 300);
    return;
  }

  // FINALNE przełączenie widoku — z opóźnieniem
  setTimeout(() => {
    App.ui?.setAuthView?.(true);
    App.ui?.hideAllPanels?.();

    if (profile.role === "admin") {
      console.log("ADMIN VIEW aktywny");
      App.ui?.showSection?.("adminCard");

      App.profiles?.loadPendingUsers?.();
      App.profiles?.loadAllUsers?.();
      App.tickets?.loadTicketsAdmin?.();
      App.announcements?.loadAnnouncementsAdmin?.();
    } else {
      console.log("USER VIEW aktywny");
      App.ui?.showSection?.("mainCard");

      App.tickets?.loadTicketsUser?.(profile.wspolnota_id);
      App.announcements?.loadAnnouncementsUser?.();
    }

    AUTH_LOCK = false;
  }, 500);
});
