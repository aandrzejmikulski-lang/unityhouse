// ===============================================
// UNITY HOUSE — main.js (STABLE FIXED VERSION)
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

      // 🔒 Mieszkaniec nie może wejść do admina
      if (profile.role === "user" && target === "adminCard") return;

      document.querySelectorAll(".sidebar-item").forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      App.ui.showSection(target);
    });
  });
});

// ===============================================
// AUTH STATE CHANGE — stabilna wersja
// ===============================================
App.supabase.auth.onAuthStateChange(async (event, session) => {
  console.log("AUTH STATE:", event, session);

  if (AUTH_LOCK) return;
  AUTH_LOCK = true;

  // 🔥 SIGNED_OUT → pełny reset profilu
  if (event === "SIGNED_OUT") {
    App.auth.setCurrentProfile(null);   // ← FIX
    App.ui?.hideAllPanels?.();
    App.ui?.showSection?.("loginCard");
    App.ui?.showLoginTab?.();
    App.ui?.setAuthView?.(false);
    AUTH_LOCK = false;
    return;
  }

  // 🔥 Brak sesji → reset profilu
  if (!session) {
    console.warn("Brak aktywnej sesji — reset");
    App.auth.setCurrentProfile(null);   // ← FIX
    await App.supabase.auth.signOut();
    App.ui?.hideAllPanels?.();
    App.ui?.showSection?.("loginCard");
    App.ui?.showLoginTab?.();
    App.ui?.setAuthView?.(false);
    AUTH_LOCK = false;
    return;
  }

  // 🔥 ZAWSZE czyścimy profil przed pobraniem nowego
  App.auth.setCurrentProfile(null);   // ← FIX

  // Pobranie profilu
  const { data: profile, error } = await App.supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error || !profile) {
    console.error("Błąd profilu:", error);
    App.auth.setCurrentProfile(null);
    await App.supabase.auth.signOut();
    App.ui?.hideAllPanels?.();
    App.ui?.showSection?.("loginCard");
    App.ui?.showLoginTab?.();
    App.ui?.setAuthView?.(false);
    AUTH_LOCK = false;
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
    AUTH_LOCK = false;
    return;
  }

  // User bez wspólnoty
  if (profile.role === "user" && !profile.wspolnota_id) {
    App.ui?.setAuthView?.(true);
    App.ui?.hideAllPanels?.();
    App.ui?.showSection?.("selectWspolnotaCard");
    App.profiles?.loadWspolnotyDropdown?.();
    AUTH_LOCK = false;
    return;
  }

  // FINALNE przełączenie widoku
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

      // 🔒 Ukryj elementy admina
      document.querySelector("#adminCard")?.classList.add("hidden");
      document.querySelector("#announcementForm")?.classList.add("hidden");
      document.querySelector("#adminAnnouncements")?.classList.add("hidden");
      document.querySelector("#pendingUsersList")?.classList.add("hidden");
      document.querySelector("#allUsersList")?.classList.add("hidden");
    }

    AUTH_LOCK = false;
  }, 300);
});
