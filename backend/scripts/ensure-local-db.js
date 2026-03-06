const fs = require("fs");
const net = require("net");
const path = require("path");
const { execFileSync } = require("child_process");
require("dotenv").config();

const PROJECT_ROOT = process.cwd();
const DEFAULT_PORT = 5431;
const DEFAULT_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const DATA_DIR = path.join(PROJECT_ROOT, ".pg5431data");
const LOG_FILE = path.join(PROJECT_ROOT, ".pg5431.log");

function parseDatabaseUrl(rawUrl) {
  if (!rawUrl) return null;

  try {
    const parsed = new URL(rawUrl);
    return {
      host: parsed.hostname || "localhost",
      port: Number(parsed.port || DEFAULT_PORT),
    };
  } catch {
    return null;
  }
}

function isPortReachable(host, port, timeoutMs = 1200) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    const finish = (result) => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve(result);
      }
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
    socket.connect(port, host);
  });
}

function getPgCtlPath() {
  const isWindows = process.platform === "win32";
  const candidates = isWindows
    ? [
        process.env.PG_CTL_PATH,
        "C:\\Program Files\\PostgreSQL\\18\\bin\\pg_ctl.exe",
        "C:\\Program Files\\PostgreSQL\\17\\bin\\pg_ctl.exe",
        "C:\\Program Files\\PostgreSQL\\16\\bin\\pg_ctl.exe",
        "C:\\Program Files\\PostgreSQL\\15\\bin\\pg_ctl.exe",
      ]
    : [process.env.PG_CTL_PATH, "pg_ctl"];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (candidate === "pg_ctl" || fs.existsSync(candidate)) return candidate;
  }

  return null;
}

function startLocalPostgres(pgCtlPath) {
  execFileSync(pgCtlPath, ["-D", DATA_DIR, "-l", LOG_FILE, "start"], {
    stdio: "inherit",
    shell: false,
  });
}

async function main() {
  const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL);
  if (!dbConfig) {
    console.warn("[ensure-local-db] DATABASE_URL is missing or invalid. Skipping DB bootstrap.");
    return;
  }

  const { host, port } = dbConfig;
  const isLocalHost = DEFAULT_HOSTS.has(host);

  if (!isLocalHost) {
    console.log(`[ensure-local-db] Remote DB host detected (${host}:${port}); skipping local DB startup.`);
    return;
  }

  if (await isPortReachable(host, port)) {
    console.log(`[ensure-local-db] Database already reachable at ${host}:${port}.`);
    return;
  }

  if (!fs.existsSync(DATA_DIR)) {
    throw new Error(
      `[ensure-local-db] Local DB data directory not found at ${DATA_DIR}. Initialize Postgres or update DATABASE_URL.`,
    );
  }

  const pgCtlPath = getPgCtlPath();
  if (!pgCtlPath) {
    throw new Error(
      "[ensure-local-db] Could not locate pg_ctl. Install PostgreSQL or set PG_CTL_PATH in your environment.",
    );
  }

  console.log(`[ensure-local-db] Starting local PostgreSQL for ${host}:${port}...`);
  startLocalPostgres(pgCtlPath);

  if (!(await isPortReachable(host, port, 3000))) {
    throw new Error(
      `[ensure-local-db] PostgreSQL did not become reachable at ${host}:${port}. Check ${LOG_FILE} for details.`,
    );
  }

  console.log(`[ensure-local-db] Database is now reachable at ${host}:${port}.`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
