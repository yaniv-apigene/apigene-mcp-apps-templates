#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const templatesRoot = path.join(repoRoot, "templates");
const labDir = path.join(repoRoot, "tools", "template-lab");
const mcpMain = path.join(repoRoot, "tools", "template-mcp-server", "main.ts");

function help() {
  console.log(`mcp-app-playground

Usage:
  mcp-app-playground start
  mcp-app-playground list
  mcp-app-playground lab
  mcp-app-playground mcp [http|stdio]
  mcp-app-playground help

Commands:
  start         Run Template Lab + MCP demo server (HTTP) together
  list          List available templates in templates/
  lab           Run web preview server (Template Lab)
  mcp http      Run MCP demo server over HTTP
  mcp stdio     Run MCP demo server over stdio
`);
}

function run(command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  child.on("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    process.exit(code ?? 1);
  });
}

function runDev() {
  const procs = [];

  function spawnNamed(name, command, args, cwd) {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("exit", (code) => {
      if (code && code !== 0) {
        console.error(`${name} exited with code ${code}`);
      }
      shutdown();
    });

    procs.push(child);
  }

  function shutdown() {
    while (procs.length) {
      const p = procs.pop();
      if (p && !p.killed) p.kill("SIGTERM");
    }
  }

  process.on("SIGINT", () => {
    shutdown();
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    shutdown();
    process.exit(0);
  });

  spawnNamed("Template Lab", "node", ["server.mjs"], labDir);
  spawnNamed("MCP HTTP Server", "node", ["--import", "tsx", mcpMain], repoRoot);
}

function listTemplates() {
  if (!fs.existsSync(templatesRoot)) {
    console.error("templates/ directory not found");
    process.exit(1);
  }

  const items = fs
    .readdirSync(templatesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .filter((entry) => fs.existsSync(path.join(templatesRoot, entry.name, "mcp-app.html")))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  if (!items.length) {
    console.log("No templates found.");
    return;
  }

  for (const name of items) {
    console.log(name);
  }
}

const [, , cmd, sub] = process.argv;

if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") {
  help();
  process.exit(0);
}

if (cmd === "list") {
  listTemplates();
  process.exit(0);
} else if (cmd === "start" || cmd === "dev") {
  runDev();
} else if (cmd === "lab") {
  run("node", ["server.mjs"], labDir);
} else if (cmd === "mcp") {
  if (sub === "stdio") {
    run("node", ["--import", "tsx", mcpMain, "--stdio"], repoRoot);
  } else {
    run("node", ["--import", "tsx", mcpMain], repoRoot);
  }
} else {
  console.error(`Unknown command: ${cmd}`);
  help();
  process.exit(1);
}
