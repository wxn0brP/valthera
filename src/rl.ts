import { exec, spawn } from "child_process";
import { config } from "./config";
import { COLORS, log } from "./logger";
import Readline from "readline";
import { startProcess, stopProcess } from "./process";

// Handle terminal input events
const rl = Readline.createInterface({ input: process.stdin, output: process.stdout });
rl.on("line", (input) => {
    const trim = input.trim();
    const cmd = config.events[trim];
    if (cmd) {
        exec(cmd, (err, stdout) => {
            if (!stdout) return;
            log(COLORS.green, "[stdout] ", stdout.trim());
        });
    }

    if (trim.startsWith("$")) {
        console.log(`Running command: ${trim.slice(1)}`);
        const proc = spawn(trim.slice(1), {
            stdio: "inherit",
            shell: true
        });
        proc.on("exit", (code) => {
            if (code === 0 || code === null) {
                log(COLORS.green, "Majestic exit from custom command.");
            }
            else {
                log(COLORS.red, `Custom command crashed with exit code ${code}.`);
            }
        });
    }

    switch (trim) {
        case "rs":
            startProcess();
            break;
        case "quit":
            log(COLORS.green, "Shutting down...");
            process.exit(0);
        case "help":
            log(COLORS.green, "Available commands:");
            for (const [key, value] of Object.entries(config.events)) {
                log(COLORS.green, "", `${key} -> ${value}`);
            }
            break;
        case "config":
            log(COLORS.green, "Current config:");
            console.log(JSON.stringify(config, null, 2));
            break;
        case "cls":
            console.clear();
            break;
    }
});

async function exitEvent() {
    log(COLORS.green, "Process interrupted. Exiting...");
    rl.close();
    await stopProcess();
    process.exit(0);
}

// Ensure Ctrl+C exits immediately
rl.on("SIGINT", exitEvent);
rl.on("SIGTERM", exitEvent);