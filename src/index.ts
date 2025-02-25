#!/usr/bin/env node

import { spawn, exec } from "child_process";
import chokidar from "chokidar";
import fs from "fs";
import readline from "readline";

// Color codes for terminal output
const COLORS = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
};

// Function to print colored logs
const log = (color: string, message: string, after?: string) => console.log(`${color}[Valthera] ${message}${COLORS.reset}${after ?? ""}`);

// Determine if executed with `node valthera.js` or as `./valthera`
const isDirectExec = process.argv[0].includes("node");

// Paths to configuration files
const configPath = "valthera.json";
const packagePath = "package.json";

// Configuration interface
interface ValtheraConfig {
    cmd?: string;
    args?: string[];
    watch?: string[];
    ignore?: string[];
    restart_cmd?: string;
    events?: Record<string, string>;
}

// Default configuration
let config: ValtheraConfig = {
    cmd: "",
    args: [],
    watch: [],
    ignore: [],
    restart_cmd: "",
    events: {},
};

// Predefined configurations
const preConfigs: Record<string, ValtheraConfig> = {
    ts: {
        cmd: "yarn build",
        args: [],
        watch: ["src"],
        restart_cmd: "clear",
        events: {
            clean: "rm -rf dist",
        }
    }
}

// Parse arguments
const rawArgs = process.argv.slice(isDirectExec ? 2 : 1);
const doubleDashIndex = rawArgs.indexOf("--");

const scriptArgs = doubleDashIndex !== -1 ? rawArgs.slice(0, doubleDashIndex) : rawArgs;
const cmdArgs = doubleDashIndex !== -1 ? rawArgs.slice(doubleDashIndex + 1) : [];

if (scriptArgs.length > 0 && scriptArgs[0] === "-h") {
    log(COLORS.green, "Usage: valthera [options] [command] [args...]");
    log(COLORS.yellow, "Options:");
    log(COLORS.yellow, "  -h          Show this help message");
    log(COLORS.yellow, "  -v          Show version number");
    log(COLORS.yellow, "  -p <name>   Use predefined configuration");
    log(COLORS.yellow, "  -c <cmd>    Use custom command");
    process.exit(0);
}

if (scriptArgs.length > 0 && scriptArgs[0] === "-v") {
    console.log("Valthera version: 0.0.2");
    process.exit(0);
}

if (scriptArgs.length > 0 && scriptArgs[0] === "-p") {
    if(scriptArgs.length < 2) {
        log(COLORS.green, "Available predefined configurations:");
        Object.keys(preConfigs).forEach((key) => {
            log(COLORS.yellow, "", `${key}`);
        })
        process.exit(0);
    }
    const preConfig = scriptArgs[1];
    if (preConfigs[preConfig]) {
        config = deepMerge(config, preConfigs[preConfig]);
    }
}

if (scriptArgs.length > 0 && scriptArgs[0] === "-c") {
    scriptArgs.shift();
    config.cmd = scriptArgs.join(" ");
}

// Load `valthera.json` if exists
if (fs.existsSync(configPath)) {
    config = deepMerge(config, JSON.parse(fs.readFileSync(configPath, "utf8")));
}

// If no custom command, check `package.json`
if (!config.cmd && fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    if (pkg.main) {
        config.cmd = "node";
        config.args = [pkg.main];
    }
}

// If still no `cmd`, exit with error
if (!config.cmd) {
    log(COLORS.red, "No `cmd` found in config or `package.json`. Exiting.");
    process.exit(1);
}

const processedCmd =
    config.cmd +
    (config.args?.length > 0 ? " " + config.args.join(" ") : "") +
    (cmdArgs.length > 0 ? " " + cmdArgs.join(" ") : "");

// Function to start the process
let proc: ReturnType<typeof spawn> | null = null;
const startProcess = () => {
    if (proc) proc.kill();
    if (config.restart_cmd) exec(config.restart_cmd, (err, stdout) => stdout && log(COLORS.yellow, stdout.trim()));

    log(COLORS.yellow, "Restarting...");
    log(COLORS.yellow, `Running command: ${processedCmd}`);

    // If command contains spaces, use shell execution
    proc = spawn(processedCmd, {
        stdio: "inherit",
        shell: true,
    });

    proc.on("exit", (code) => {
        if (code === 0 || code === null) {
            log(COLORS.green, "Majestic exit.");
        } else {
            log(COLORS.red, `Process crashed with exit code ${code}.`);
        }
    });
};

startProcess();

// Watch for file changes
const watchList = config.watch.length > 0 ? config.watch : ["."];
const watcher = chokidar.watch(watchList, {
    ignored: config.ignore,
    ignoreInitial: true,
});

watcher.on("change", startProcess);
watcher.on("unlink", startProcess);
watcher.on("add", startProcess);

// Handle terminal input events
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.on("line", (input) => {
    const trim = input.trim();
    const cmd = config.events[trim];
    if (cmd) {
        exec(cmd, (err, stdout) => {
            if (!stdout) return;
            log(COLORS.green, "[stdout] ", stdout.trim());
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
                log(COLORS.green, "", `${key} - ${value}`);
            }
            break;
        case "config":
            log(COLORS.green, "Current config:");
            console.log(JSON.stringify(config, null, 2));
            break;
    }
});

// Ensure Ctrl+C exits immediately
rl.on("SIGINT", () => {
    log(COLORS.green, "Process interrupted. Exiting...");
    rl.close();
    if (proc) proc.kill(); // Kill the running process
    process.exit(0);
});

// For merge config
function deepMerge(target: any, source: any) {
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                if (!target[key]) {
                    target[key] = {};
                }
                deepMerge(target[key], source[key]);
            } else if (Array.isArray(source[key])) {
                target[key] = (target[key] || []).concat(source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
    return target;
}