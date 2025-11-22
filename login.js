const VALID_USER = "Phantom Forge";
const VALID_PASS = "IKHEETHARm";

function login() {
  const u = document.getElementById("user").value.trim();
  const p = document.getElementById("pass").value.trim();

  if (u === VALID_USER && p === VALID_PASS) {
    localStorage.setItem("session", "ACTIVE");
    window.location.href = "panel.html";
  } else {
    alert("Foute login!");
  }
}
