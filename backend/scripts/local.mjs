#!/usr/bin/env node
/**
 * Local development helper for the Medusa backend.
 *
 *   node scripts/local.mjs setup   # create database, run migrations, create admin user
 *   node scripts/local.mjs dev     # start PostgreSQL + Medusa (http://localhost:9000/app)
 *
 * PostgreSQL runs from the `embedded-postgres` package with its data in `.local/`,
 * so no system database is needed. Secrets are generated once into
 * `.local/config.json` (git-ignored) and written to `.env`.
 *
 * When run as root (e.g. in a cloud container), PostgreSQL must run as the
 * `postgres` user, so the data and socket directories are handed over to it.
 */
import { execSync, spawn } from "node:child_process"
import { randomBytes } from "node:crypto"
import { chmodSync, chownSync, existsSync, mkdirSync } from "node:fs"
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import EmbeddedPostgres from "embedded-postgres"
import pg from "pg"

const backend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const local = path.join(backend, ".local")
const dataDir = path.join(local, "postgres")
const configFile = path.join(local, "config.json")
const command = process.argv[2] ?? "dev"
const isRoot = process.getuid?.() === 0

let database
let child
let shuttingDown = false

async function configuration() {
  mkdirSync(local, { recursive: true, mode: 0o700 })
  if (!existsSync(configFile)) {
    const secret = () => randomBytes(24).toString("hex")
    const value = {
      host: "127.0.0.1",
      port: 55433,
      database: "freshshop_medusa",
      user: "freshshop",
      password: secret(),
      jwtSecret: secret(),
      cookieSecret: secret(),
      adminEmail: "admin@freshshop.local",
      adminPassword: secret(),
    }
    await writeFile(configFile, JSON.stringify(value, null, 2) + "\n", { mode: 0o600, flag: "wx" })
  }
  return JSON.parse(await readFile(configFile, "utf8"))
}

const databaseUrl = (c, name = c.database) => {
  const url = new URL(`postgresql://${c.host}:${c.port}/${name}`)
  url.username = c.user
  url.password = c.password
  return url.href
}

async function connect(c, name = c.database) {
  const client = new pg.Client({ connectionString: databaseUrl(c, name) })
  await client.connect()
  return client
}

/** As root, PostgreSQL runs as `postgres`: it needs to own its data dir and to write its socket into `.local`. */
function prepareDirectoriesForRoot() {
  if (!isRoot) return
  try {
    execSync("id -u postgres", { stdio: "ignore" })
  } catch {
    execSync("groupadd -f postgres && useradd -g postgres postgres", { stdio: "inherit" })
  }
  const uid = Number(execSync("id -u postgres").toString().trim())
  const gid = Number(execSync("id -g postgres").toString().trim())
  mkdirSync(dataDir, { recursive: true, mode: 0o700 })
  chownSync(dataDir, uid, gid)
  chmodSync(dataDir, 0o700)
  // owner postgres (socket file), others may only traverse; config.json stays root-only (0600)
  chownSync(local, uid, 0)
  chmodSync(local, 0o711)
}

async function ensureDatabase(c) {
  let running = false
  try {
    const client = await connect(c, "postgres")
    await client.end()
    running = true
    console.log(`Using PostgreSQL already running at ${c.host}:${c.port}`)
  } catch (error) {
    if (error.code !== "ECONNREFUSED") throw new Error(`PostgreSQL port ${c.port} is occupied or inaccessible`, { cause: error })
  }

  if (!running) {
    prepareDirectoriesForRoot()
    database = new EmbeddedPostgres({
      databaseDir: dataDir,
      user: c.user,
      password: c.password,
      port: c.port,
      persistent: true,
      authMethod: "scram-sha-256",
      initdbFlags: ["--encoding=UTF8", "--locale=C"],
      postgresFlags: ["-h", c.host, "-k", local, "-c", "max_connections=200"],
      onLog: () => {},
      onError: (message) => console.error("[postgres]", String(message).trim()),
    })
    if (!existsSync(path.join(dataDir, "PG_VERSION"))) await database.initialise()
    await database.start()
  }

  // Always make sure the application database exists, even when PostgreSQL was already running.
  const admin = await connect(c, "postgres")
  try {
    const { rows } = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [c.database])
    if (!rows.length) await admin.query(`CREATE DATABASE "${c.database}"`)
  } finally {
    await admin.end()
  }
  console.log(`PostgreSQL ready at ${c.host}:${c.port}/${c.database}`)
}

function medusa(args) {
  return new Promise((resolve, reject) => {
    child = spawn("pnpm", ["exec", "medusa", ...args], {
      cwd: backend,
      stdio: "inherit",
      env: { ...process.env, MEDUSA_DISABLE_TELEMETRY: "true" },
    })
    child.on("error", reject)
    child.on("exit", (code, signal) => {
      child = undefined
      if (code === 0 || shuttingDown) resolve()
      else reject(new Error(`medusa ${args[0]} failed (${signal ?? code})`))
    })
  })
}

async function writeEnv(c) {
  const env = [
    `DATABASE_URL=${databaseUrl(c)}`,
    // storefront (Next.js) runs on :3000
    "STORE_CORS=http://localhost:3000,http://127.0.0.1:3000",
    "ADMIN_CORS=http://localhost:9000,http://127.0.0.1:9000",
    "AUTH_CORS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:9000,http://127.0.0.1:9000",
    `JWT_SECRET=${c.jwtSecret}`,
    `COOKIE_SECRET=${c.cookieSecret}`,
    "",
  ].join("\n")
  await writeFile(path.join(backend, ".env"), env, { mode: 0o600 })
}

async function setup(c) {
  await writeEnv(c)
  await ensureDatabase(c)
  await medusa(["db:migrate"])
  const client = await connect(c)
  try {
    const { rows } = await client.query('SELECT id FROM "user" WHERE email = $1 AND deleted_at IS NULL', [c.adminEmail])
    if (!rows.length) await medusa(["user", "-e", c.adminEmail, "-p", c.adminPassword])
    const { rows: keys } = await client.query(
      "SELECT token FROM api_key WHERE type = 'publishable' AND revoked_at IS NULL AND deleted_at IS NULL ORDER BY created_at LIMIT 1",
    )
    if (keys[0]?.token) {
      await writeFile(path.join(local, "publishable-key"), keys[0].token + "\n", { mode: 0o644 })
    }
  } finally {
    await client.end()
  }
  console.log("Setup complete. Admin login is in .local/config.json (not tracked by Git).")
}

async function shutdown(code = 0) {
  if (shuttingDown) return
  shuttingDown = true
  child?.kill("SIGTERM")
  if (database) await database.stop()
  process.exitCode = code
}
for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => void shutdown())

try {
  const c = await configuration()
  if (command === "setup") await setup(c)
  else if (command === "dev") {
    if (!existsSync(path.join(backend, ".env"))) throw new Error("Run `pnpm setup:local` first.")
    await ensureDatabase(c)
    console.log("Admin: http://localhost:9000/app")
    await medusa(["develop"])
  } else throw new Error("Usage: node scripts/local.mjs setup|dev")
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  if (database) await database.stop()
}
