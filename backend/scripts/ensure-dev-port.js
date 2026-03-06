const { execSync } = require("child_process");
const net = require("net");
require("dotenv").config();

const DEFAULT_PORT = 4000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isPortReachable(port, host = "127.0.0.1", timeoutMs = 1000) {
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

function getListeningPidsWindows(port) {
  const ps = `$p=${port}; Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique`;
  const output = execSync(`powershell -NoProfile -Command "${ps}"`, { encoding: "utf8" }).trim();
  if (!output) return [];
  return output
    .split(/\r?\n/)
    .map((line) => Number(line.trim()))
    .filter((value) => Number.isFinite(value) && value > 0);
}

function getProcessDetailsWindows(pid) {
  const ps =
    `$p=${pid}; ` +
    `Get-CimInstance Win32_Process -Filter \\\"ProcessId = $p\\\" ` +
    `| Select-Object Name,CommandLine ` +
    `| ConvertTo-Json -Compress`;
  const output = execSync(`powershell -NoProfile -Command "${ps}"`, { encoding: "utf8" }).trim();

  if (!output) {
    return { name: "", commandLine: "" };
  }

  const parsed = JSON.parse(output);
  return {
    name: String(parsed.Name || ""),
    commandLine: String(parsed.CommandLine || ""),
  };
}

function stopProcessWindows(pid) {
  execSync(`powershell -NoProfile -Command "Stop-Process -Id ${pid} -Force"`, {
    stdio: "ignore",
  });
}

function looksLikeBackendDevProcess(details) {
  const name = details.name.toLowerCase();
  const cmd = details.commandLine.toLowerCase();
  const isNodeProcess = name.includes("node");
  const isBackendDevCommand =
    cmd.includes("ts-node-dev") ||
    cmd.includes("src\\index.ts") ||
    (cmd.includes("fcrb-feestracker-new") && cmd.includes("\\backend"));

  return isNodeProcess && isBackendDevCommand;
}

async function main() {
  const configuredPort = Number(process.env.PORT || DEFAULT_PORT);
  const port = Number.isFinite(configuredPort) && configuredPort > 0 ? configuredPort : DEFAULT_PORT;

  const inUse = await isPortReachable(port);
  if (!inUse) {
    console.log(`[ensure-dev-port] Port ${port} is free.`);
    return;
  }

  if (process.platform !== "win32") {
    throw new Error(
      `[ensure-dev-port] Port ${port} is in use. Automatic cleanup is currently configured for Windows only.`,
    );
  }

  const pids = getListeningPidsWindows(port);
  if (pids.length === 0) {
    throw new Error(`[ensure-dev-port] Port ${port} appears in use, but no listening PID could be resolved.`);
  }

  let killedAny = false;

  for (const pid of pids) {
    const details = getProcessDetailsWindows(pid);
    if (!looksLikeBackendDevProcess(details)) {
      throw new Error(
        `[ensure-dev-port] Port ${port} is used by PID ${pid} (${details.name || "unknown"}). Refusing to kill unrelated process.`,
      );
    }

    stopProcessWindows(pid);
    killedAny = true;
    console.log(`[ensure-dev-port] Stopped stale backend dev process on PID ${pid}.`);
  }

  if (!killedAny) {
    throw new Error(`[ensure-dev-port] Port ${port} is in use and no safe process could be terminated.`);
  }

  for (let i = 0; i < 10; i += 1) {
    if (!(await isPortReachable(port, "127.0.0.1", 500))) {
      console.log(`[ensure-dev-port] Port ${port} is now free.`);
      return;
    }
    await sleep(300);
  }

  throw new Error(`[ensure-dev-port] Port ${port} is still busy after stopping stale process(es).`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
