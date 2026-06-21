#!/usr/bin/env node
let data = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  data += chunk;
});
process.stdin.on("end", () => {
  const filtered = data
    .split(/\r?\n/)
    .filter((line) => !/^Co-authored-by:\s*Cursor\s*<cursoragent@cursor\.com>\s*$/i.test(line))
    .join("\n")
    .replace(/\n+$/, "");
  process.stdout.write(filtered ? `${filtered}\n` : "");
});
