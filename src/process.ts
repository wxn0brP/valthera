import { exec, spawn } from "child_process";
import { COLORS, log } from "./logger";
import { config, processedCmd } from "./config";

// Function to start the process
export let proc: ReturnType<typeof spawn> | null = null;
export function startProcess(){
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