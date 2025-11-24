/* panel.js — admin logic voor dashboard, games en per-game instellingen */

const GITHUB_USER = "phantomforgeofficial";            // JOUW GITHUB GEBRUIKSNAAM
const REPO_NAME = "Roblox-phantomforge-Scripts";      // jouw repo
const FILE_PATH = "public/config.json";

// VOER HIER JE GITHUB Personal Access Token in (tijdelijk) of gebruik server-proxy.
// ********** PLAATS NOOIT JE TOKEN IN EEN OPEN SOURCE REPO **********
const GITHUB_TOKEN = "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"; // <-- zet hier jouw token voor test (string) of gebruik proxy

// auth/session check
(function initAuth() {
  const s = localStorage.getItem("phantom_session");
  if (!s) location.href = "index.html";
})();

document.getElementById?.("logout")?.addEventListener("click", () => {
  localStorage.removeItem("phantom_session");
  location.href = "index.html";
});

// helper: fetch config from raw GitHub Pages URL
async function fetchConfig() {
  const url = `https://${GITHUB_USER}.github.io/${REPO_NAME}/public/config.json`;
  const r = await fetch(url);
  return await r.json();
}

// helper: get SHA for file (needed for GitHub PUT)
async function getSHA() {
  const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/contents/${FILE_PATH}`;
  const r = await fetch(apiUrl);
  const j = await r.json();
  return j.sha;
}

// ---------- DASHBOARD ----------
async function loadDashboard() {
  const config = await fetchConfig();
  document.getElementById("places").value = (config.allowedPlaces || []).join("\n");
  document.getElementById("version").textContent = config.version || "1";
}
window.loadDashboard = loadDashboard;

// save function used by dashboard
async function save() {
  const raw = document.getElementById("places").value;
  const list = raw.split("\n").map(x => parseInt(x.trim())).filter(x => !isNaN(x));

  const config = await fetchConfig();
  config.allowedPlaces = list;
  config.version = (config.version || 0) + 1;

  const content = JSON.stringify(config, null, 2);
  const sha = await getSHA();

  if (!GITHUB_TOKEN) {
    alert("GITHUB_TOKEN niet ingesteld in panel.js. Zet tijdelijk je token in GITHUB_TOKEN voor opslaan of maak een proxy.");
    return;
  }

  await fetch(`https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/contents/${FILE_PATH}`, {
    method: "PUT",
    headers: {
      "Authorization": `token ${GITHUB_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Update config via admin panel",
      content: btoa(content),
      sha: sha
    })
  });

  document.getElementById("status").textContent = "Opgeslagen!";
  setTimeout(() => document.getElementById("status").textContent = "", 3000);
}
window.save = save;

// ---------- GAMES LIST ----------
async function loadGamesPage() {
  const config = await fetchConfig();
  const games = config.games || {};
  const container = document.getElementById("gamesList");
  container.innerHTML = "";

  for (const placeId of Object.keys(games)) {
    const g = games[placeId];
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
  }
}
window.loadGamesPage = loadGamesPage;

// ---------- GAME SETTINGS ----------
function getQueryParam(name) {
  const u = new URL(location.href);
  return u.searchParams.get(name);
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

  // list known scripts (if none exists, show examples)
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

  // read checkboxes
  const boxes = document.querySelectorAll("#scriptsList input[type='checkbox']");
  boxes.forEach(cb => {
    const key = cb.id.replace("chk_", "");
    cfg.games[id].scripts[key] = cb.checked;
  });

  // increment version
  cfg.version = (cfg.version || 0) + 1;

  const sha = await getSHA();
  const content = JSON.stringify(cfg, null, 2);

  if (!GITHUB_TOKEN) {
    alert("GITHUB_TOKEN niet ingesteld. Voeg tijdelijk je token toe in panel.js voor opslaan.");
    return;
  }

  await fetch(`https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/contents/${FILE_PATH}`, {
    method: "PUT",
    headers: {
      "Authorization": `token ${GITHUB_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: `Update game ${id} config`,
      content: btoa(content),
      sha: sha
    })
  });

  document.getElementById("gameStatus").textContent = "Opgeslagen!";
  setTimeout(() => document.getElementById("gameStatus").textContent = "", 3000);
}
window.saveGameConfig = saveGameConfig;

// helper: init page (router)
document.addEventListener("DOMContentLoaded", async () => {
  const path = location.pathname.split("/").pop();
  if (path === "dashboard.html") await loadDashboard();
  if (path === "games.html") await loadGamesPage();
  if (path === "game-settings.html") await loadGameSettings();
});
     
