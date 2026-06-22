/**
 * Frees the Expo dev port before start (avoids 8081/8082 mismatch with Expo Go).
 */
const { execSync } = require("child_process");

const PORT = process.env.EXPO_PORT || "8081";

function killPortUnix(port) {
  try {
    const pids = execSync(`lsof -ti :${port}`, { encoding: "utf8" })
      .trim()
      .split("\n")
      .filter(Boolean);
    for (const pid of pids) {
      try {
        execSync(`kill -9 ${pid}`, { stdio: "ignore" });
        console.log(`Freed port ${port} (stopped PID ${pid})`);
      } catch {
        /* already gone */
      }
    }
  } catch {
    /* port free */
  }
}

function killPortWindows(port) {
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" });
    const pids = new Set();
    for (const line of out.split("\n")) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid) && pid !== "0") pids.add(pid);
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
        console.log(`Freed port ${port} (stopped PID ${pid})`);
      } catch {
        /* already gone */
      }
    }
  } catch {
    /* port free */
  }
}

if (process.platform === "win32") {
  killPortWindows(PORT);
} else {
  killPortUnix(PORT);
}
