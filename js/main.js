const client = supabase.createClient(
  "https://vswonxgsaqnhzsmzexzh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzd29ueGdzYXFuaHpzbXpleHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NjQ2OTYsImV4cCI6MjA5NDI0MDY5Nn0.mBBGMqqSRQgtM9k0aOH1Nl3WdNRj3Xj9nY6TqJgsepk",
  { auth: { persistSession: false } }
);

// =======================================
// GLOBALNE PRZEŁĄCZANIE WIDOKÓW (SIDEBAR)
// =======================================
function showSection(id) {
  document.querySelectorAll("main .card").forEach(sec => sec.classList.add("hidden"));
  const el = document.getElementById(id);
  if (el) el.classList.remove("hidden");
}

// =======================================
// INICJALIZACJE — MUSZĄ BYĆ TU
// (żeby onclick w auth.js działały)
// =======================================
initUI();
initAuth();
initProfiles();
initTickets();
initAnnouncements();

// =======================================
// SIDEBAR — aktywacja modułów
// =======================================
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".sidebar-item").forEach(item => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".sidebar-item").forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      const target = item.dataset.target;
      showSection(target);
    });
  });
});

// =======================================
// AUTH STATE CHANGE
// =======================================
client.auth.onAuthStateChange(async (event, session) => {
  if (!session) {
    currentProfile = null;

    showSection("loginCard");
    showLoginTab();
    setAuthView(false);
    return;
  }

  setAuthView(true);

  const { data: profile, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error) {
    console.error("Błąd pobierania profilu:", error);
    showSection("loginCard");
    showLoginTab();
    return;
  }

  currentProfile = profile;

  // ============================
  // ADMIN
  // ============================
  if (profile.role === "admin") {
    showSection("adminCard");

    if (pendingUsersList) loadPendingUsers();
    if (allUsersList) loadAllUsers();
    if (adminTickets) loadTicketsAdmin();
    if (adminAnnouncements) loadAnnouncementsAdmin();

    return;
  }

  // ============================
  // UŻYTKOWNIK NIEZATWIERDZONY
  // ============================
  if (!profile.approved) {
    showSection("loginCard");
    showLoginTab();
    showMessage(loginMessage, "Twoje konto czeka na zatwierdzenie.", "error");
    return;
  }

  // ============================
  // UŻYTKOWNIK BEZ WSPÓLNOTY
  // ============================
  if (!profile.wspolnota_id) {
    showSection("selectWspolnotaCard");
    loadWspolnotyDropdown();
    return;
  }

  // ============================
  // UŻYTKOWNIK Z WSPÓLNOTĄ
  // ============================
  showSection("mainCard");

  loadTicketsUser(profile.wspolnota_id);
  loadAnnouncementsUser();
});
