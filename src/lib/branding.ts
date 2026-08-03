/**
 * Company branding + public asset URLs for the ISD Signature Application.
 *
 * Email clients (especially Outlook) require an absolute HTTPS image URL.
 * Relative paths like /isd-motion-logo.gif show an empty image box.
 */

export const APP_NAME = "ISD Signature Application";
export const APP_TAGLINE =
  "Company email signature builder — personal details, shared branding";

export const MOTION_GIF_FILENAME = "isd-motion-logo.gif";
export const MOTION_GIF_PATH = `/${MOTION_GIF_FILENAME}`;

/**
 * Optional hard-coded production GIF URL.
 * Leave empty to use: window.location.origin + /isd-motion-logo.gif
 */
export const PRODUCTION_GIF_URL = "";

/** True when URL is absolute http(s) — required for Outlook. */
export function isAbsoluteHttpUrl(url: string): boolean {
  return /^https?:\/\/.+/i.test((url || "").trim());
}

/**
 * Resolve GIF URL for signature HTML. Always prefer absolute HTTPS.
 */
export function resolveGifUrl(override?: string): string {
  const trimmed = (override ?? "").trim();

  if (trimmed) {
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith("//")) return `https:${trimmed}`;
    if (trimmed.startsWith("/")) {
      if (typeof window !== "undefined" && window.location?.origin) {
        return `${window.location.origin}${trimmed}`;
      }
      return trimmed;
    }
    // bare host/path
    return `https://${trimmed.replace(/^\/+/, "")}`;
  }

  if (PRODUCTION_GIF_URL && isAbsoluteHttpUrl(PRODUCTION_GIF_URL)) {
    return PRODUCTION_GIF_URL;
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    // Never use localhost/preview hosts for "final" copy if origin is http loopback —
    // still return absolute so at least same-machine tests work.
    return `${window.location.origin}${MOTION_GIF_PATH}`;
  }

  return MOTION_GIF_PATH;
}

/** Force absolute URL at the moment of export (Outlook-safe). */
export function gifUrlForExport(override?: string): string {
  const url = resolveGifUrl(override);
  if (isAbsoluteHttpUrl(url)) return url;
  if (typeof window !== "undefined" && window.location?.origin) {
    const path = url.startsWith("/") ? url : `/${url}`;
    return `${window.location.origin}${path}`;
  }
  return url;
}
