const ENV_KEY = /^[A-Za-z_][A-Za-z0-9_]*$/;
const BLOCKED_ENV_KEYS = new Set(["__proto__", "prototype", "constructor"]);

export function isValidEnvKey(key: string): boolean {
  return ENV_KEY.test(key) && !BLOCKED_ENV_KEYS.has(key);
}
