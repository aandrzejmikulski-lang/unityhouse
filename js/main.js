alert("MAIN START");

window.App = window.App || {};

App.supabase = supabase.createClient(
  "https://vswonxgsaqnhzsmzexzh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzd29ueGdzYXFuaHpzbXpleHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NjQ2OTYsImV4cCI6MjA5NDI0MDY5Nn0.mBBGMqqSRQgtM9k0aOH1Nl3WdNRj3Xj9nY6TqJgsepk"
);

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM READY");

  App.ui.init();
  App.auth.init();
  App.profiles.init();
  App.tickets.init();
  App.announcements.init();

  App.ui.hideAllPanels();
  App.ui.showSection("loginCard");
  App.ui.showLoginTab();
});
