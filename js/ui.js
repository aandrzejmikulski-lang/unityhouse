// ui.js

function initUI() {
  // np. obsługa menu, modali
}

function showMessage(element, text, type = "info") {
  element.textContent = text;
  element.className = type;
}

function switchPanel(panelId) {
  document.querySelectorAll(".panel").forEach(p => p.style.display = "none");
  document.getElementById(panelId).style.display = "block";
}
