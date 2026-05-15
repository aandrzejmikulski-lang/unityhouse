// main.js

// =====================================
//  SUPABASE
// =====================================

const client = supabase.createClient(
  "https://vswonxgsaqnhzsmzexzh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzd29ueGdzYXFuaHpzbXpleHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NjQ2OTYsImV4cCI6MjA5NDI0MDY5Nn0.mBBGMqqSRQgtM9k0aOH1Nl3WdNRj3Xj9nY6TqJgsepk",
  { auth: { persistSession: false } }
);

let currentProfile = null;

// =====================================
//  START APLIKACJI
// =====================================

document.addEventListener("DOMContentLoaded", () => {
  initUI();
  initAuth();
  initProfiles();
  initTickets();
});

// =====================================
//  OBSŁUGA SESJI
// =====================================

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
    return;
  }

  currentProfile = profile;

  // ADMIN
  if (profile.role === "admin") {
    hideAllPanels();
    adminPanel.classList.remove("hidden");
    loadPendingUsers();
    loadAllUsers();
    loadTicketsAdmin();
    return;
  }

  // UŻYTKOWNIK BEZ WYBRANEJ WSPÓLNOTY
  if (!profile.wspolnota_id) {
    hideAllPanels();
    selectWspolnota.classList.remove("hidden");
    loadWspolnotyDropdown();
    return;
  }

  // UŻYTKOWNIK Z WSPÓLNOTĄ
  hideAllPanels();
  mainCard.classList.remove("hidden");
  loadTicketsUser(profile.wspolnota_id);
});
