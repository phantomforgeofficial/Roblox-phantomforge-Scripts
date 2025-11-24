import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(bodyParser.json());

const { GITHUB_TOKEN, GITHUB_USER, REPO_NAME, FILE_PATH, PORT } = process.env;

// helper: get SHA of file
async function getSHA() {
  const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/contents/${FILE_PATH}`;
  const r = await fetch(apiUrl, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });
  const j = await r.json();
  return j.sha;
}

// POST /save-config
app.post("/save-config", async (req, res) => {
  try {
    const { content, message } = req.body;
    if (!content || !message) return res.status(400).send("Missing content or message");

    const sha = await getSHA();

    const r = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/contents/${FILE_PATH}`, {
      method: "PUT",
      headers: {
        "Authorization": `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message,
        content: Buffer.from(content).toString("base64"),
        sha
      })
    });

    const j = await r.json();
    res.json(j);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving config");
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
