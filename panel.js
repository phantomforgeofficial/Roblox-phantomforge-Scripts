/* panel.js — admin logic zonder GitHub token in de frontend */

const GITHUB_USER = "phantomforgeofficial";
const REPO_NAME = "Roblox-phantomforge-Scripts";
const FILE_PATH = "public/config.json";

// backend API endpoint
const API_ENDPOINT = "/api.php";

// session check
(function initAuth() {
  const s = localStorage.getItem("phantom_session");
  if (!s) location.href = "index.html";
})();

document.getElementById?.("logout")?.addEventListener("click", () => {
  localStorage.removeItem("phantom_session");
  location.href = "index.html";
});

// fetch config (direct van GitHub Pages)
async function fetchConfig() {
  const url = `https://${GITHUB_USER}.github.io/${REPO_NAME}/public/config.json`;
  const r = await fetch(url);
  return await r.json();
}

// load dashboard
async function loadDashboard() {
  const config = await fetchConfig();
  document.getElementById("places").value = (config.allowedPlaces || []).join("\n");
  document.getElementById("version").textContent = config.version || "1";
}
window.loadDashboard = loadDashboard;

// save dashboard
async function save() {
  const raw = document.getElementById("places").value;
  const list = raw.split("\n").map(x => parseInt(x.trim())).filter(x => !isNaN(x));

  const config = await fetchConfig();
  config.allowedPlaces = list;
  config.version = (config.version || 0) + 1;

  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "update_file",
      user: GITHUB_USER,
      repo: REPO_NAME,
      path: FILE_PATH,
      content: JSON.stringify(config, null, 2)
    })
  });

  const result = await response.json();
  if (!result.success) {
    alert("Kon config niet opslaan: " + result.error);
    return;
  }

  document.getElementById("status").textContent = "Opgeslagen!";
  setTimeout(() => document.getElementById("status").textContent = "", 3000);
}
window.save = save;

// ----- GAMES -----
async function loadGamesPage() {
  const config = await fetchConfig();
  const games = config.games || {};
  const container = document.getElementById("gamesList");
  container.innerHTML = "";

  Object.entries(games).forEach(([placeId, g]) => {
    const el = document.createElement("div");
    el.className = "game-card";

    const img = document.createElement("img");
    img.src = g.image || "/_placeholder.png";
    img.alt = g.name || placeId;

    const title = document.createElement("div");
    title.textContent = `${g.name || "Unknown"} (${placeId})`;

    el.appendChild(img);
    el.appendChild(title);

    el.addEventListener("click", () => {
      location.href = `game-settings.html?id=${placeId}`;
    });

    container.appendChild(el);
  });
}
window.loadGamesPage = loadGamesPage;

// GAME SETTINGS
function getQueryParam(name) {
  return new URL(location.href).searchParams.get(name);
}

async function loadGameSettings() {
  const id = getQueryParam("id");
  if (!id) return;

  const cfg = await fetchConfig();
  const game = (cfg.games || {})[id] || { name: "Unknown", image: "", scripts: {} };

  document.getElementById("gameTitle").textContent = `${game.name} (${id})`;
  document.getElementById("gameLogo").src = game.image || "/_placeholder.png";

  const list = document.getElementById("scriptsList");
  list.innerHTML = "";

  const available = game.scripts && Object.keys(game.scripts).length
    ? Object.keys(game.scripts)
    : ["AntiExploit", "MovementFix", "InventorySync"];

  available.forEach(name => {
    const wrapper = document.createElement("div");
    wrapper.className = "script-row";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "chk_" + name;
    checkbox.checked = !!(game.scripts && game.scripts[name]);

    const label = document.createElement("label");
    label.htmlFor = checkbox.id;
    label.textContent = name;

    wrapper.appendChild(checkbox);
    wrapper.appendChild(label);
    list.appendChild(wrapper);
  });
}
window.loadGameSettings = loadGameSettings;

async function saveGameConfig() {
  const id = getQueryParam("id");
  if (!id) return;

  const cfg = await fetchConfig();
  cfg.games = cfg.games || {};
  cfg.games[id] = cfg.games[id] || { name: `Game ${id}`, image: "", scripts: {} };

  document.querySelectorAll("#scriptsList input[type='checkbox']").forEach(cb => {
    const key = cb.id.replace("chk_", "");
    cfg.games[id].scripts[key] = cb.checked;
  });

  cfg.version = (cfg.version || 0) + 1;

  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "update_file",
      user: GITHUB_USER,
      repo: REPO_NAME,
      path: FILE_PATH,
      content: JSON.stringify(cfg, null, 2)
    })
  });

  const result = await response.json();
  if (!result.success) {
    alert("Kon game config niet opslaan: " + result.error);
    return;
  }

  document.getElementById("gameStatus").textContent = "Opgeslagen!";
  setTimeout(() => document.getElementById("gameStatus").textContent = "", 3000);
}
window.saveGameConfig = saveGameConfig;

// router
document.addEventListener("DOMContentLoaded", async () => {
  const path = location.pathname.split("/").pop();
  if (path === "dashboard.html") await loadDashboard();
  if (path === "games.html") await loadGamesPage();
  if (path === "game-settings.html") await loadGameSettings();
});
