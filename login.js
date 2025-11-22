
// SHA256 hash van wachtwoord "admin"
const PASSWORD_HASH = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";

async function login() {
  const password = document.getElementById("password").value;
  const hashed = await sha256(password);

  if (hashed === PASSWORD_HASH) {
    localStorage.setItem("session", hashed);
    window.location.href = "panel.html";
  } else {
    document.getElementById("error").innerText = "Fout wachtwoord!";
  }
}

async function sha256(str) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}
