const path = require("path");
const { execSync } = require("child_process");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.production") });

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is not set. Set DATABASE_URL in the environment or create backend/.env.production with DATABASE_URL=..."
  );
  process.exit(1);
}

const backendDir = path.join(__dirname, "..");

function run(cmd, opts = {}) {
  return execSync(cmd, { cwd: backendDir, ...opts });
}

function runInherit(cmd) {
  return execSync(cmd, { stdio: "inherit", cwd: backendDir });
}

// Migrations that may be in "failed" state; clear them first so deploy can re-run or we can mark applied
const ROLLED_BACK_FIRST = [
  "20251218193000_add_fan_club",
  "20260111_add_club_event_players",
  "20260213000000_remove_crm_manager_role",
];

function tryDeploy(captureOutput = false) {
  if (captureOutput) {
    try {
      run("npx prisma migrate deploy", { encoding: "utf8" });
      return { ok: true };
    } catch (e) {
      const stderr = (e.stderr || "").toString();
      const stdout = (e.stdout || "").toString();
      if (stdout) process.stdout.write(stdout);
      if (stderr) process.stderr.write(stderr);
      return { ok: false, stderr, stdout, status: e.status };
    }
  }
  runInherit("npx prisma migrate deploy");
  return { ok: true };
}

// Extract migration name from Prisma error
// P3018: "Migration name: 20260111_add_club_event_players"
// P3009: "The `20260111_add_club_event_players` migration started at ... failed"
function getFailedMigrationName(output) {
  const m = output.match(/Migration name:\s*(\S+)/) || output.match(/The `([^`]+)` migration/);
  return m ? m[1].trim() : null;
}

function isAlreadyExistsError(output) {
  return (
    /already exists/.test(output) ||
    /42P07/.test(output) ||
    /42710/.test(output)
  );
}

function isP3009FailedMigrations(output) {
  return /P3009/.test(output) || /failed migrations in the target database/.test(output);
}

// First try: clear any known failed migrations, then deploy
for (const name of ROLLED_BACK_FIRST) {
  try {
    run("npx prisma migrate resolve --rolled-back \"" + name + "\"", { stdio: "ignore" });
  } catch (_) {}
}

let lastStderr = "";
const maxRetries = 20; // avoid infinite loop
for (let i = 0; i < maxRetries; i++) {
  const result = tryDeploy(true);
  if (result.ok) {
    runInherit("npx prisma migrate deploy"); // show final status (e.g. "Already up to date" or migrations applied)
    process.exit(0);
  }
  lastStderr = result.stderr || "";
  const output = (result.stdout || "") + (result.stderr || "");
  const migrationName = getFailedMigrationName(output);

  if (isP3009FailedMigrations(output) && migrationName) {
    console.error("\nFailed migration " + migrationName + " in DB. Resolving as rolled-back and retrying...\n");
    try {
      runInherit("npx prisma migrate resolve --rolled-back \"" + migrationName + "\"");
    } catch (_) {}
    continue;
  }

  const canMarkApplied = isAlreadyExistsError(output) && migrationName;
  if (canMarkApplied) {
    console.error("\nSchema already exists for migration " + migrationName + ". Marking as applied and retrying...\n");
    try {
      runInherit("npx prisma migrate resolve --applied \"" + migrationName + "\"");
    } catch (_) {}
    continue;
  }

  console.error(lastStderr || result.stdout || "Migration deploy failed.");
  process.exit(1);
}

console.error("Too many retries. Last error:\n" + lastStderr);
process.exit(1);
