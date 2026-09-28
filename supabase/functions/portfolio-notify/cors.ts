export function corsForOrigin(origin: string | null, productionOrigin: string, allowLocalhost: boolean): Record<string, string> | null {
  if (!origin) return null;
  try {
    const url = new URL(origin);
    if (url.origin !== origin) return null;
    const local = allowLocalhost && url.protocol === "http:" && url.hostname === "localhost";
    const production = origin === productionOrigin && url.protocol === "https:";
    if (!local && !production) return null;
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "authorization, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Vary": "Origin",
    };
  } catch { return null; }
}
