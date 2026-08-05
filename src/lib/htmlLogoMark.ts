/**
 * Static HTML ISD mark — four colored rectangles (no image request).
 * Survives GIF/image blocking. Optional href links to the CSS motion page.
 */

import { sig } from "@/lib/signatureLayout";

const YELLOW = "#fbfa1c";
const BLUE = "#151c94";
const RED = "#ae0708";
const BLACK = "#000000";

const BARS = [
  { color: YELLOW, x: 4, y: 2, w: 50, h: 22 },
  { color: BLUE, x: 78, y: 24, w: 52, h: 26 },
  { color: RED, x: 130, y: 50, w: 50, h: 22 },
  { color: BLUE, x: 52, y: 72, w: 52, h: 26 },
] as const;

const VIEW_W = 184;
const VIEW_H = 100;

function escAttr(s: string): string {
  return s
    .replace(/&/g, "\u0026amp;")
    .replace(/"/g, "\u0026quot;")
    .replace(/</g, "\u0026lt;");
}

export function buildHtmlLogoMarkHtml(
  href?: string,
  width = sig.logoW,
  height = sig.logoH,
): string {
  const sx = width / VIEW_W;
  const sy = height / VIEW_H;
  const parts: string[] = [];

  parts.push(
    '<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="' +
      width +
      '" height="' +
      height +
      '" style="border-collapse:collapse;border-spacing:0;border:0;width:' +
      width +
      "px;height:" +
      height +
      'px;mso-table-lspace:0pt;mso-table-rspace:0pt;">',
  );
  parts.push(
    '<tr><td width="' +
      width +
      '" height="' +
      height +
      '" valign="top" style="border:0;padding:0;margin:0;font-size:0;line-height:0;width:' +
      width +
      "px;height:" +
      height +
      'px;">',
  );

  for (const b of BARS) {
    const bw = Math.max(2, Math.round(b.w * sx));
    const bh = Math.max(2, Math.round(b.h * sy));
    const ml = Math.max(0, Math.round(b.x * sx));
    const mt = Math.max(0, Math.round(b.y * sy));
    parts.push(
      '<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="' +
        bw +
        '" height="' +
        bh +
        '" align="left" style="border-collapse:collapse;border:0;margin:0;margin-left:' +
        ml +
        "px;margin-top:" +
        mt +
        "px;width:" +
        bw +
        "px;height:" +
        bh +
        'px;">',
    );
    parts.push(
      '<tr><td width="' +
        bw +
        '" height="' +
        bh +
        '" bgcolor="' +
        b.color +
        '" style="border:1px solid ' +
        BLACK +
        ";background-color:" +
        b.color +
        ";width:" +
        bw +
        "px;height:" +
        bh +
        'px;font-size:0;line-height:0;mso-line-height-rule:exactly;">&nbsp;</td></tr></table>',
    );
  }

  parts.push(
    '<div style="clear:both;font-size:0;line-height:0;height:0;">&nbsp;</div>',
  );
  parts.push("</td></tr></table>");

  const inner = parts.join("");
  if (href && /^https?:\/\//i.test(href)) {
    return (
      '<a href="' +
      escAttr(href) +
      '" target="_blank" style="text-decoration:none;border:0;color:inherit;">' +
      inner +
      "</a>"
    );
  }
  return inner;
}
