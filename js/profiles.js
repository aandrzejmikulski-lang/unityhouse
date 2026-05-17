window.App = window.App || {};

App.profiles = (() => {

  function init() {}

  async function loadWspolnotyDropdown() {
    const dom = App.ui.dom;

    const { data, error } = await App.supabase
      .from("wspolnoty")
      .select("*")
      .order("nazwa");

    if (error) {
      console.error("Błąd ładowania wspólnot:", error);
      return;
    }

    dom.wspolnotaSelect.innerHTML = data
      .map(w => `<option value="${w.id}">${w.nazwa}</option>`)
      .join("");
  }

  async function loadPendingUsers() {
    const dom = App.ui.dom;

    const { data, error } = await App.supabase
      .from("profiles")
      .select("*")
      .eq("approved", false);

    if (error) {
      console.error("Błąd ładowania oczekujących użytkowników:", error);
      dom.pendingUsersList.innerHTML = "<p>Błąd ładowania.</p>";
      return;
    }

    if (!data || data.length === 0) {
      dom.pendingUsersList.innerHTML = "<p>Brak oczekujących użytkowników.</p>";
      return;
    }

    dom.pendingUsersList.innerHTML = data
      .map(u => `<div>${u.fullname || u.email} (${u.role})</div>`)
      .join("");
  }

  async function loadAllUsers() {
    const dom = App.ui.dom;

    const { data, error } = await App.supabase
      .from("profiles")
      .select("*");

    if (error) {
      console.error("Błąd ładowania użytkowników:", error);
      dom.allUsersList.innerHTML = "<p>Błąd ładowania.</p>";
      return;
    }

    if (!data || data.length === 0) {
      dom.allUsersList.innerHTML = "<p>Brak użytkowników.</p>";
      return;
    }

    dom.allUsersList.innerHTML = data
      .map(u => `<div>${u.fullname || u.email} (${u.role})</div>`)
      .join("");
  }

  return {
    init,
    loadWspolnotyDropdown,
    loadPendingUsers,
    loadAllUsers
  };
})();
