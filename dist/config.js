import { COLORS, log } from "./logger.js";
import { deepMerge } from "./utils.js";
import fs from "fs";
const configPath = "valthera.json";
const packagePath = "package.json";
const isDirectExec = process.argv[0].includes("node");
export let config = {
    cmd: "",
    args: [],
    watch: [],
    ignore: [],
    restart_cmd: "",
    events: {},
};
export const preConfigsList = fs.readdirSync(import.meta.dirname + "/../config").map((file) => file.replace(".json", ""));
const rawArgs = process.argv.slice(isDirectExec ? 2 : 1);
const doubleDashIndex = rawArgs.indexOf("--");
const scriptArgs = doubleDashIndex !== -1 ? rawArgs.slice(0, doubleDashIndex) : rawArgs;
const cmdArgs = doubleDashIndex !== -1 ? rawArgs.slice(doubleDashIndex + 1) : [];
function ifFlag(flag) {
    return scriptArgs.length > 0 && scriptArgs[0] === "-" + flag;
}
if (ifFlag("h")) {
    log(COLORS.green, "Usage: valthera [options] [command] [args...]");
    log(COLORS.yellow, "Options:");
    log(COLORS.yellow, "  -h          Show this help message");
    log(COLORS.yellow, "  -v          Show version number");
    log(COLORS.yellow, "  -p <name>   Use predefined configuration");
    log(COLORS.yellow, "  -c <cmd>    Use custom command");
    process.exit(0);
}
if (ifFlag("v")) {
    const pkg = JSON.parse(fs.readFileSync(import.meta.dirname + "/../package.json", "utf8"));
    log(COLORS.green, `Valthera version: ${pkg.version}`);
    process.exit(0);
}
if (ifFlag("p")) {
    if (scriptArgs.length < 2) {
        log(COLORS.green, "Available predefined configurations:");
        preConfigsList.forEach((key) => {
            log(COLORS.yellow, "", `${key}`);
        });
        process.exit(0);
    }
    const preConfigName = scriptArgs[1];
    if (preConfigsList.includes(preConfigName)) {
        const preConfigData = JSON.parse(fs.readFileSync(import.meta.dirname + `/../config/${preConfigName}.json`, "utf8"));
        config = deepMerge(config, preConfigData);
    }
}
if (ifFlag("c")) {
    scriptArgs.shift();
    config.cmd = scriptArgs.join(" ");
}
if (fs.existsSync(configPath)) {
    config = deepMerge(config, JSON.parse(fs.readFileSync(configPath, "utf8")));
}
if (!config.cmd && fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    if (pkg.main) {
        config.cmd = "node";
        config.args = [pkg.main];
    }
}
if (!config.cmd) {
    log(COLORS.red, "No `cmd` found in config or `package.json`. Exiting.");
    process.exit(1);
}
export const processedCmd = config.cmd +
    (config.args?.length > 0 ? " " + config.args.join(" ") : "") +
    (cmdArgs.length > 0 ? " " + cmdArgs.join(" ") : "");
