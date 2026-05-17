// ===============================================
// UNITY HOUSE — main.js (SAFE INIT VERSION)
// ===============================================

window.App = window.App || {};

let AUTH_LOCK = false;

function initSupabaseClient() {
  if (!window.supabase) {
    console.error("Supabase nie jest dostępne (supabase is not defined). Sprawdź <script> w index.html.");
    return;
  }

  App.supabase = supabase.createClient(
    "https://vswonxgsaqnhzsmzexzh.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzd29ueGdzYXFuaHpzbXpleHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NjQ2OTYsImV4cCI6MjA5NDI0MDY5Nn0.mBBGMqqSRQgtM9k0aOH1Nl3WdNRj3Xj9nY6TqJgsepk"
  );

  App.supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("AUTH STATE:", event, session);

    if (AUTH_LOCK) return;
    AUTH_LOCK = true;

    if (event === "SIGNED_OUT") {
      App.auth.setCurrentProfile(null);
      App.ui?.hideAllPanels?.();
      App.ui?.showSection?.("loginCard");
      App.ui?.showLoginTab?.();
      App.ui?.setAuthView?.(false);
      AUTH_LOCK = false;
      return;
    }

    if (!session && event !== "SIGNED_OUT") {
      AUTH_LOCK = false;
      return;
    }

    App.auth.setCurrentProfile(null);

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

    if (profile.role === "user" && !profile.wspolnota_id) {
      App.ui?.setAuthView?.(true);
      App.ui?.hideAllPanels?.();
      App.ui?.showSection?.("selectWspolnotaCard");
      App.profiles?.loadWspolnotyDropdown?.();
      AUTH_LOCK = false;
      return;
    }

    setTimeout(() => {
      App.ui?.setAuthView?.(true);
      App.ui?.hideAllPanels?.();

      if (profile.role === "admin") {
        console.log("ADMIN VIEW aktywny");
        App.ui?.showSection?.("adminCard");

        App.profiles?.loadPendingUsers?.();
        App.profiles?.loadAllUsers?.();

        App.tickets?.loadWspolnotyFilter?.();
        App.tickets?.loadTicketsAdmin?.();

        App.announcements?.loadAnnouncementsAdmin?.();

      } else {
        console.log("USER VIEW aktywny");
        App.ui?.showSection?.("mainCard");

        App.tickets?.loadTicketsUser?.(profile.wspolnota_id);
        App.announcements?.loadAnnouncementsUser?.();

        document.querySelector("#adminCard")?.classList.add("hidden");
        document.querySelector("#announcementForm")?.classList.add("hidden");
        document.querySelector("#adminAnnouncements")?.classList.add("hidden");
        document.querySelector("#pendingUsersList")?.classList.add("hidden");
        document.querySelector("#allUsersList")?.classList.add("hidden");
      }

      AUTH_LOCK = false;
    }, 300);
  });
}

// DOM READY
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM READY — Unity House Premium");

  // 1. Najpierw bezpiecznie inicjalizujemy Supabase
  initSupabaseClient();

  // 2. Potem UI / auth / reszta modułów
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

  // 3. Sidebar
  document.querySelectorAll(".sidebar-item").forEach(item => {
    item.addEventListener("click", () => {
      const profile = App.auth.getCurrentProfile();
      if (!profile) return;

      const target = item.dataset.target;

      if (profile.role === "user" && target === "adminCard") return;

      document.querySelectorAll(".sidebar-item").forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      App.ui.showSection(target);
    });
  });
});
