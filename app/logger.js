// logger.js

// シンプルなロガーの実装
export const logger = {
    debug: (message) => console.log(`[DEBUG] ${message}`),
    info: (message) => console.log(`[INFO] ${message}`),
    warn: (message) => console.warn(`[WARN] ${message}`),
    error: (message) => console.error(`[ERROR] ${message}`)
};
