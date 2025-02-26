import { config } from "./config";
import chokidar from "chokidar";
import { startProcess } from "./process";

// Watch for file changes
const watchList = config.watch.length > 0 ? config.watch : ["."];
const watcher = chokidar.watch(watchList, {
    ignored: config.ignore,
    ignoreInitial: true,
});

watcher.on("change", startProcess);
watcher.on("unlink", startProcess);
watcher.on("add", startProcess);