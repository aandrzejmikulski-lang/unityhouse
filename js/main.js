// ===============================================
// UNITY HOUSE — main.js (FINAL STABLE VERSION)
// ===============================================

window.App = window.App || {};
App.supabase = null;

// 🔥 Usuń wszystkie stare sesje Supabase (problem: raz działa, raz nie działa)
try {
  Object.keys(localStorage)
    .filter(k => k.includes("sb-") && k.includes("-auth-token"))
    .forEach(k => localStorage.removeItem(k));
  console.log("🧹 Wyczyściłem stare sesje Supabase");
} catch (e) {
  console.warn("Nie udało się wyczyścić sesji:", e);
}

let AUTH_LOCK = false;

// ===============================================
// INICJALIZACJA SUPABASE
// ===============================================
function initSupabaseClient() {
  if (!window.supabase) {
    console.error("Supabase nie jest dostępne (supabase is not defined).");
    return;
  }

  App.supabase = supabase.createClient(
    "https://vswonxgsaqnhzsmzexzh.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzd29ueGdzYXFuaHpzbXpleHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NjQ2OTYsImV4cCI6MjA5NDI0MDY5Nn0.mBBGMqqSRQgtM9k0aOH1Nl3WdNRj3Xj9nY6TqJgsepk"
  );

  console.log("✅ Klient Supabase utworzony:", App.supabase);

  // 🔥 Jeśli sesja jest niekompletna → wymuś wylogowanie
  App.supabase.auth.getSession().then(({ data }) => {
    if (!data.session || !data.session.user) {
      console.log("⚠️ Wykryto niekompletną sesję — wylogowuję");
      App.supabase.auth.signOut();
    }
  });

  // Inicjalizacja modułów
  App.ui?.init?.();
  App.auth?.init?.();
  App.profiles?.init?.();
  App.tickets?.init?.();
  App.announcements?.init?.();

  App.ui?.hideAllPanels?.();
  App.ui?.showSection?.("loginCard");
  App.ui?.showLoginTab?.();

  // ===============================================
  // OBSŁUGA ZMIAN STANU SESJI
  // ===============================================
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

    if (!session) {
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
      }

      AUTH_LOCK = false;
    }, 300);
  });
}

// ===============================================
// START — po pełnym załadowaniu strony
// ===============================================
window.addEventListener("load", () => {
  console.log("🌐 Strona załadowana — start aplikacji");
  initSupabaseClient();

  // Sidebar
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
