// Simple login script (client-side). Username + password are checked here.
const VALID_USER = "Phantom Forge";
const VALID_PASS = "IKHEETHARm";

document.getElementById("btnLogin").addEventListener("click", login);
document.addEventListener("keydown", (e) => { if (e.key === "Enter") login(); });

function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (user === VALID_USER && pass === VALID_PASS) {
    // store a session token (simple) for panel access
    localStorage.setItem("phantom_session", "1");
    window.location.href = "dashboard.html";
    return;
  }
  document.getElementById("error").textContent = "Gebruikersnaam of wachtwoord onjuist.";
}
