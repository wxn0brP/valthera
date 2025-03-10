export const COLORS = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
};
export function log(color, message, after) {
    return console.log(`${color}[Suglite] ${message}${COLORS.reset}${after ?? ""}`);
}
