/**
 * Company branding + public asset URLs for the ISD Signature Application.
 *
 * Recommended stack:
 * - Signature: static HTML rectangle mark (or PNG) — image-filter resilient
 * - Motion: CSS-animated page at /motion (linked from the mark)
 * - GIF: optional legacy for receptive clients only
 */

export const APP_NAME = "ISD Signature Application";
export const APP_TAGLINE =
  "Company email signature builder — secure mark + living brand motion";

export const MOTION_GIF_FILENAME = "isd-motion-logo.gif";
export const MOTION_GIF_PATH = `/${MOTION_GIF_FILENAME}`;

export const STATIC_LOGO_FILENAME = "isd-logo-static.png";
export const STATIC_LOGO_PATH = `/${STATIC_LOGO_FILENAME}`;

/** Public CSS motion mark page (not an email asset). */
export const MOTION_PAGE_PATH = "/motion";

/** Optional production origin override (no trailing slash). */
export const PRODUCTION_ORIGIN = "" as string;

/**
 * html   — static HTML rectangles (recommended; no image fetch)
 * static — settled PNG
 * motion — animated GIF (often blocked)
 */
export type LogoMode = "html" | "static" | "motion";

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

export function motionPageUrlForExport(): string {
  return absoluteAssetUrl(MOTION_PAGE_PATH);
}

export function resolveLogoUrl(
  mode: LogoMode = "html",
  override?: string,
): string {
  const trimmed = (override ?? "").trim();
  if (trimmed) {
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith("//")) return `https:${trimmed}`;
    if (trimmed.startsWith("/")) return absoluteAssetUrl(trimmed);
    return `https://${trimmed.replace(/^\/+/, "")}`;
  }
  if (mode === "motion") return absoluteAssetUrl(MOTION_GIF_PATH);
  if (mode === "static") return absoluteAssetUrl(STATIC_LOGO_PATH);
  return absoluteAssetUrl(STATIC_LOGO_PATH);
}

export function logoUrlForExport(
  mode: LogoMode = "html",
  override?: string,
): string {
  const url = resolveLogoUrl(mode, override);
  if (isAbsoluteHttpUrl(url)) return url;
  return absoluteAssetUrl(url.startsWith("/") ? url : `/${url}`);
}

export function gifUrlForExport(override?: string): string {
  return logoUrlForExport("motion", override);
}

export function resolveGifUrl(override?: string): string {
  return resolveLogoUrl("motion", override);
}
