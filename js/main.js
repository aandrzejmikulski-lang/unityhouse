const client = supabase.createClient(
  "https://vswonxgsaqnhzsmzexzh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzd29ueGdzYXFuaHpzbXpleHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NjQ2OTYsImV4cCI6MjA5NDI0MDY5Nn0.mBBGMqqSRQgtM9k0aOH1Nl3WdNRj3Xj9nY6TqJgsepk",
  { auth: { persistSession: false } }
);

document.addEventListener("DOMContentLoaded", () => {
  initUI();
  initAuth();
  initProfiles();
  initTickets();
  initAnnouncements();   // 🔥 dodane, ale bezpieczne
});

client.auth.onAuthStateChange(async (event, session) => {
  if (!session) {
    currentProfile = null;
    hideAllPanels();
    loginCard.classList.remove("hidden");
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
    hideAllPanels();
    loginCard.classList.remove("hidden");
    showLoginTab();
    return;
  }

  currentProfile = profile;

  // ============================
  // ADMIN
  // ============================
  if (profile.role === "admin") {
    hideAllPanels();
    adminCard.classList.remove("hidden");

    // 🔥 Bezpieczne wywołania — tylko jeśli element istnieje
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
    hideAllPanels();
    loginCard.classList.remove("hidden");
    showLoginTab();
    showMessage(loginMessage, "Twoje konto czeka na zatwierdzenie.", "error");
    return;
  }

  // ============================
  // UŻYTKOWNIK BEZ WSPÓLNOTY
  // ============================
  if (!profile.wspolnota_id) {
    hideAllPanels();
    selectWspolnotaCard.classList.remove("hidden");
    loadWspolnotyDropdown();
    return;
  }

  // ============================
  // UŻYTKOWNIK Z WSPÓLNOTĄ
  // ============================
  hideAllPanels();
  mainCard.classList.remove("hidden");

  loadTicketsUser(profile.wspolnota_id);
  loadAnnouncementsUser();   // 🔥 dodane
});
