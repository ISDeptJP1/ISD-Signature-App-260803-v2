/**
 * Company branding + public asset URLs for the ISD Signature Application.
 *
 * Many mail filters block animated GIFs. Default logo is a static PNG
 * (settled ISD mark). Motion GIF remains optional for receptive clients.
 */

export const APP_NAME = "ISD Signature Application";
export const APP_TAGLINE =
  "Company email signature builder — personal details, shared branding";

export const MOTION_GIF_FILENAME = "isd-motion-logo.gif";
export const MOTION_GIF_PATH = `/${MOTION_GIF_FILENAME}`;

export const STATIC_LOGO_FILENAME = "isd-logo-static.png";
export const STATIC_LOGO_PATH = `/${STATIC_LOGO_FILENAME}`;

/** Optional production origin override (no trailing slash). */
export const PRODUCTION_ORIGIN = "" as string;

export type LogoMode = "static" | "motion";

export function isAbsoluteHttpUrl(url: string): boolean {
  return /^https?:\/\/.+/i.test((url || "").trim());
}

function originBase(): string {
  const origin = PRODUCTION_ORIGIN.trim();
  if (origin && isAbsoluteHttpUrl(origin)) {
    return origin.replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "";
}

export function absoluteAssetUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = originBase();
  return base ? `${base}${p}` : p;
}

export function resolveLogoUrl(
  mode: LogoMode = "static",
  override?: string,
): string {
  const trimmed = (override ?? "").trim();
  if (trimmed) {
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith("//")) return `https:${trimmed}`;
    if (trimmed.startsWith("/")) return absoluteAssetUrl(trimmed);
    return `https://${trimmed.replace(/^\/+/, "")}`;
  }
  const path = mode === "motion" ? MOTION_GIF_PATH : STATIC_LOGO_PATH;
  return absoluteAssetUrl(path);
}

export function logoUrlForExport(
  mode: LogoMode = "static",
  override?: string,
): string {
  const url = resolveLogoUrl(mode, override);
  if (isAbsoluteHttpUrl(url)) return url;
  return absoluteAssetUrl(url.startsWith("/") ? url : `/${url}`);
}

/** @deprecated prefer logoUrlForExport */
export function gifUrlForExport(override?: string): string {
  return logoUrlForExport("motion", override);
}

export function resolveGifUrl(override?: string): string {
  return resolveLogoUrl("motion", override);
}
