/**
 * Starts Expo dev server: frees port 8081, skips login prompt, passes through CLI flags.
 */
const { spawn } = require("child_process");
const path = require("path");

require("./free-port.js");

const userArgs = process.argv.slice(2);
const port = process.env.EXPO_PORT || "8081";
const wantsTunnel = userArgs.includes("--tunnel");
const expoArgs = ["expo", "start", "--port", port];

// Skip the "Log in / Proceed anonymously" prompt (triggered when Expo Go connects).
if (!wantsTunnel) {
  expoArgs.push("--offline");
}

expoArgs.push(...userArgs);

const child = spawn("npx", expoArgs, {
  stdio: "inherit",
  cwd: path.join(__dirname, ".."),
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 1));
