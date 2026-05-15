// main.js

// Inicjalizacja Supabase
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Start aplikacji
document.addEventListener("DOMContentLoaded", () => {
  initUI();
  initAuth();
  initTickets();
  initProfiles();
});

