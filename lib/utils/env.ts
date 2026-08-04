const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

export function readBooleanEnv(
  key: string,
  fallback: boolean = false
): boolean {
  const value = process.env[key];

  if (value === undefined || value === null || value.trim() === "") {
    return fallback;
  }

  return TRUE_VALUES.has(value.trim().toLowerCase());
}

export function isSecureCookie(): boolean {
  return readBooleanEnv("COOKIE_SECURE", process.env.NODE_ENV === "production");
}

export function getDatabaseSSLConfig() {
  return readBooleanEnv("DATABASE_SSL", false)
    ? { rejectUnauthorized: false }
    : false;
}
