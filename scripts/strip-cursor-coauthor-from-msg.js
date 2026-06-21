#!/usr/bin/env node
const fs = require("fs");

const msgFile = process.argv[2];
if (!msgFile || !fs.existsSync(msgFile)) process.exit(0);

const filtered = fs
  .readFileSync(msgFile, "utf8")
  .split(/\r?\n/)
  .filter((line) => !/^Co-authored-by:\s*Cursor\s*<cursoragent@cursor\.com>\s*$/i.test(line));

fs.writeFileSync(msgFile, `${filtered.join("\n").replace(/\n+$/, "")}\n`);
