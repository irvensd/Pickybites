#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const gitDir = path.join(root, ".git");

if (!fs.existsSync(gitDir)) {
  process.exit(0);
}

const hooksDir = path.join(gitDir, "hooks");
const source = path.join(__dirname, "git-hooks", "prepare-commit-msg");
const target = path.join(hooksDir, "prepare-commit-msg");

fs.mkdirSync(hooksDir, { recursive: true });
fs.copyFileSync(source, target);

if (process.platform !== "win32") {
  fs.chmodSync(target, 0o755);
}
