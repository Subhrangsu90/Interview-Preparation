const { spawn } = require("child_process");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const processes = [
  spawn(process.execPath, ["web-viewer/server.js"], {
    cwd: rootDir,
    stdio: "inherit",
  }),
  spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1"], {
    cwd: rootDir,
    stdio: "inherit",
  }),
];

let stopping = false;
function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of processes) child.kill();
  process.exit(exitCode);
}

for (const child of processes) {
  child.on("error", (error) => {
    console.error(`Failed to start development server: ${error.message}`);
    stop(1);
  });
  child.on("exit", (code) => {
    if (!stopping && code !== 0) stop(code || 1);
  });
}

process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
