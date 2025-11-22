// ---------------- LOGIN CONFIG ----------------
const VALID_USER = "Phantom Forge";
const VALID_PASS = "IKHEETHARm";

// ---------------- LOGIN -----------------------
function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (user === VALID_USER && pass === VALID_PASS) {
    localStorage.setItem("session", "ACTIVE");
    window.location.href = "panel.html";
  } else {
    document.getElementById("error").textContent = "Foute login!";
  }
}
