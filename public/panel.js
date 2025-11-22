const TOKEN = localStorage.getItem("session");

if (!TOKEN) window.location.href = "index.html";

const GITHUB_USER = "phantomforgeofficial";
const REPO_NAME = "Roblox-phantomforge-Scripts";
const FILE_PATH = "public/config.json";

// ----------- LADEN -----------
async function load() {
  const r = const r = await fetch(`https://${GITHUB_USER}.github.io/${REPO_NAME}/public/config.json`);
  const json = await r.json();

  document.getElementById("places").value =
    json.allowedPlaces.join("\n");
}

load();

// ----------- OPSLAAN -----------
async function save() {
  const placeList = document.getElementById("places").value
    .split("\n")
    .map(v => parseInt(v.trim()))
    .filter(v => !isNaN(v));

  const newContent = JSON.stringify({ allowedPlaces: placeList }, null, 2);

  const sha = await getSHA();

  await fetch(`https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/contents/${FILE_PATH}`, {
    method: "PUT",
    headers: {
      "Authorization": "token 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",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Update allowed places",
      content: btoa(newContent),
      sha: sha
    })
  });

  document.getElementById("status").innerText = "Opgeslagen!";
}

async function getSHA() {
  const r = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/contents/${FILE_PATH}`);
  const d = await r.json();
  return d.sha;
}
