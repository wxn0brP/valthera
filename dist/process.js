import { exec, spawn } from "child_process";
import { COLORS, log } from "./logger.js";
import { config, processedCmd } from "./config.js";
export let proc = null;
export function startProcess() {
    if (proc)
        proc.kill();
    if (config.restart_cmd)
        exec(config.restart_cmd, (err, stdout) => stdout && log(COLORS.yellow, stdout.trim()));
    log(COLORS.yellow, "Restarting...");
    log(COLORS.yellow, `Running command: ${processedCmd}`);
    proc = spawn(processedCmd, {
        stdio: "inherit",
        shell: true,
    });
    proc.on("exit", (code) => {
        if (code === 0 || code === null) {
            log(COLORS.green, "Majestic exit.");
        }
        else {
            log(COLORS.red, `Process crashed with exit code ${code}.`);
        }
    });
}
;
