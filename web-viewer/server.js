const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Root of the Interview Preparation repo (parent of web-viewer/)
const REPO_ROOT = path.resolve(__dirname, "..");

// Dynamic .viewerignore parser
function getIgnoredSet() {
  const defaultIgnored = [
    ".git", ".gitignore", ".viewerignore", "node_modules", "web-viewer",
    "dist", ".dist", ".vercel", "api", "vercel.json", "vite.config.js",
    "package.json", "package-lock.json", ".DS_Store", "Thumbs.db"
  ];

  const ignoreFilePath = path.join(REPO_ROOT, ".viewerignore");
  if (fs.existsSync(ignoreFilePath)) {
    try {
      const content = fs.readFileSync(ignoreFilePath, "utf-8");
      const lines = content
        .split("\n")
        .map(line => line.trim())
        .filter(line => line && !line.startsWith("#"));
      return new Set([...defaultIgnored, ...lines]);
    } catch { /* fallback */ }
  }
  return new Set(defaultIgnored);
}

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ─── API: Save file ───
app.post("/api/save", (req, res) => {
  const { path: filePath, content } = req.body;
  if (!filePath || content === undefined) {
    return res.status(400).json({ error: "Missing path or content parameter" });
  }

  const fullPath = path.join(REPO_ROOT, filePath);
  const resolved = path.resolve(fullPath);

  if (!resolved.startsWith(REPO_ROOT)) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    fs.writeFileSync(resolved, content, "utf-8");
    res.json({ success: true, path: filePath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── API: Recursive file tree ───
function buildTree(dirPath, relativeTo) {
  const ignored = getIgnoredSet();
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const tree = [];

  for (const entry of entries) {
    if (ignored.has(entry.name)) continue;
    if (entry.name.startsWith(".")) continue;

    const fullPath = path.join(dirPath, entry.name);
    const relPath = path.relative(relativeTo, fullPath).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      tree.push({
        name: entry.name,
        path: relPath,
        type: "directory",
        children: buildTree(fullPath, relativeTo),
      });
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      const stats = fs.statSync(fullPath);
      tree.push({
        name: entry.name,
        path: relPath,
        type: "file",
        extension: ext,
        size: stats.size,
        modified: stats.mtime.toISOString(),
      });
    }
  }

  // Sort: directories first, then files, both alphabetically
  tree.sort((a, b) => {
    if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { numeric: true });
  });

  return tree;
}

app.get("/api/tree", (req, res) => {
  try {
    const tree = buildTree(REPO_ROOT, REPO_ROOT);
    res.json({ root: path.basename(REPO_ROOT), tree });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── API: File content (text) ───
app.get("/api/file", (req, res) => {
  const filePath = req.query.path;
  if (!filePath) return res.status(400).json({ error: "Missing path parameter" });

  const fullPath = path.join(REPO_ROOT, filePath);
  const resolved = path.resolve(fullPath);

  // Security: prevent directory traversal
  if (!resolved.startsWith(REPO_ROOT)) {
    return res.status(403).json({ error: "Access denied" });
  }

  if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
    return res.status(404).json({ error: "File not found" });
  }

  try {
    const content = fs.readFileSync(resolved, "utf-8");
    const ext = path.extname(filePath).toLowerCase();
    res.json({ path: filePath, content, extension: ext });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── API: Raw file serving (images, binary) ───
app.get("/api/raw", (req, res) => {
  const filePath = req.query.path;
  if (!filePath) return res.status(400).json({ error: "Missing path parameter" });

  const fullPath = path.join(REPO_ROOT, filePath);
  const resolved = path.resolve(fullPath);

  if (!resolved.startsWith(REPO_ROOT)) {
    return res.status(403).json({ error: "Access denied" });
  }

  if (!fs.existsSync(resolved)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.sendFile(resolved);
});

// ─── API: Search files ───
app.get("/api/search", (req, res) => {
  const query = (req.query.q || "").toLowerCase().trim();
  if (!query) return res.json({ results: [] });

  const results = [];

  const ignored = getIgnoredSet();

  function searchDir(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (ignored.has(entry.name) || entry.name.startsWith(".")) continue;
      const fullPath = path.join(dirPath, entry.name);
      const relPath = path.relative(REPO_ROOT, fullPath).replace(/\\/g, "/");

      if (entry.isDirectory()) {
        searchDir(fullPath);
      } else {
        // Match file name
        if (entry.name.toLowerCase().includes(query)) {
          results.push({ name: entry.name, path: relPath, matchType: "filename" });
        }
        // Match inside text files
        const ext = path.extname(entry.name).toLowerCase();
        const textExts = [".js", ".ts", ".md", ".json", ".css", ".html", ".txt", ".py", ".jsx", ".tsx"];
        if (textExts.includes(ext)) {
          try {
            const content = fs.readFileSync(fullPath, "utf-8");
            if (content.toLowerCase().includes(query)) {
              // Find matching lines
              const lines = content.split("\n");
              const matchingLines = [];
              for (let i = 0; i < lines.length && matchingLines.length < 3; i++) {
                if (lines[i].toLowerCase().includes(query)) {
                  matchingLines.push({ line: i + 1, text: lines[i].trim().substring(0, 120) });
                }
              }
              if (matchingLines.length > 0) {
                results.push({ name: entry.name, path: relPath, matchType: "content", matches: matchingLines });
              }
            }
          } catch { /* skip unreadable files */ }
        }
      }

      if (results.length >= 50) return;
    }
  }

  searchDir(REPO_ROOT);
  res.json({ query, results });
});

// ─── File watcher SSE endpoint ───
app.get("/api/watch", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });

  // Serverless / Vercel deployment check: disable live watch gracefully
  if (process.env.VERCEL) {
    res.write("data: disabled-on-vercel\n\n");
    return res.end();
  }

  let chokidar;
  try {
    chokidar = require("chokidar");
  } catch {
    res.write("data: chokidar-not-available\n\n");
    return res.end();
  }

  try {
    res.write("data: connected\n\n");
    const watcher = chokidar.watch(REPO_ROOT, {
      ignored: /(^|[\/\\])(\.|node_modules|web-viewer|\.git)/,
      persistent: true,
      ignoreInitial: true,
    });

    const sendEvent = (event, filePath) => {
      const relPath = path.relative(REPO_ROOT, filePath).replace(/\\/g, "/");
      res.write(`data: ${JSON.stringify({ event, path: relPath })}\n\n`);
    };

    watcher.on("add", (p) => sendEvent("add", p));
    watcher.on("change", (p) => sendEvent("change", p));
    watcher.on("unlink", (p) => sendEvent("unlink", p));
    watcher.on("addDir", (p) => sendEvent("addDir", p));
    watcher.on("unlinkDir", (p) => sendEvent("unlinkDir", p));

    req.on("close", () => {
      watcher.close();
    });
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// ─── Fallback: serve index.html ───
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n  ✏️  Interview Prep Viewer`);
    console.log(`  ────────────────────────`);
    console.log(`  📖  Open: http://localhost:${PORT}`);
    console.log(`  📂  Watching: ${REPO_ROOT}`);
    console.log(`  🔄  Live reload enabled\n`);
  });
}

module.exports = app;
