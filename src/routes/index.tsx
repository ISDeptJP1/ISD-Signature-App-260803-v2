import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ExternalLink,
  Globe,
  Link2,
  Lock,
  Mail,
  Pause,
  Play,
  RotateCcw,
  Users,
} from "lucide-react";
import { IsdLogo } from "@/components/IsdLogo";
import { EmailFooter, type StaffInfo } from "@/components/EmailFooter";
import {
  APP_NAME,
  APP_TAGLINE,
  MOTION_GIF_PATH,
  STATIC_LOGO_PATH,
  MOTION_PAGE_PATH,
  type LogoMode,
  logoUrlForExport,
  motionPageUrlForExport,
  isAbsoluteHttpUrl,
} from "@/lib/branding";
import { sig } from "@/lib/signatureLayout";
import { buildHtmlLogoMarkHtml } from "@/lib/htmlLogoMark";

export const Route = createFileRoute("/")({ component: Home });

const LOCKED_TAGLINE = "...... Be the Solution ......";

const DEFAULT_STAFF: StaffInfo = {
  name: "Melvin A Casberg III",
  title: "Managing Director",
  company: "The I.S. Department Ltd.",
  website: "www.ISDept.com",
  officeLabel: "HK Office",
  office: "+852 3793 7600",
  mobileLabel: "HK Mobile",
  mobile: "+852 9230 9993",
  tagline: LOCKED_TAGLINE,
};

const EDITABLE_FIELDS = [
  ["name", "Full name"],
  ["title", "Title"],
  ["company", "Company"],
  ["website", "Website"],
  ["officeLabel", "Office label"],
  ["office", "Office phone"],
  ["mobileLabel", "Mobile label"],
  ["mobile", "Mobile phone"],
] as const;

async function logoToDataUri(url: string): Promise<string> {
  const res = await fetch(url, {
    mode: "cors",
    credentials: "omit",
    cache: "force-cache",
  });
  if (!res.ok) throw new Error("Could not load logo (" + res.status + ")");
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read logo"));
    reader.readAsDataURL(blob);
  });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/>/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;");
}

const TBL =
  'border="0" cellpadding="0" cellspacing="0" role="presentation"';
const TBL_STYLE =
  "border-collapse:collapse;border-spacing:0;border:0;mso-table-lspace:0pt;mso-table-rspace:0pt;";
const TD0 =
  "border:0;border-collapse:collapse;padding:0;margin:0;background:transparent;background-color:transparent;";

type SignatureBuildOpts = {
  /** html | static | motion */
  logoMode?: LogoMode;
  /** Image URL or data URI when logoMode is static/motion */
  logoSrc?: string;
  /** Absolute https URL of CSS motion page — wraps mark + optional "view motion" cue */
  motionUrl?: string;
};

function buildSignatureCore(
  staff: StaffInfo,
  logoSrcRaw: string,
  opts: SignatureBuildOpts = {},
) {
  const logoMode: LogoMode = opts.logoMode ?? "html";
  const motionUrl = (opts.motionUrl ?? "").trim();
  const name = escapeHtml(staff.name);
  const title = escapeHtml(staff.title);
  const company = escapeHtml(staff.company);
  const tagline = escapeHtml(LOCKED_TAGLINE);
  const officeLabel = escapeHtml(staff.officeLabel || "Office");
  const mobileLabel = escapeHtml(staff.mobileLabel || "Mobile");
  const office = escapeHtml(staff.office);
  const mobile = escapeHtml(staff.mobile);
  const logoSrc = logoSrcRaw.startsWith("data:")
    ? logoSrcRaw.replace(/"/g, "")
    : escapeHtml(logoSrcRaw);
  const siteHref = staff.website.startsWith("http")
    ? staff.website
    : "https://" + staff.website;
  const siteLabel = escapeHtml(staff.website.replace(/^https?:\/\//, ""));
  const f = "Times New Roman,Times,serif";
  const n = sig.namePt + "pt";
  const t = sig.titlePt + "pt";
  const c = sig.contactPt + "pt";
  const blue = sig.colorBlue;
  const black = sig.colorText;
  const w = String(sig.logoW);
  const h = String(sig.logoH);
  const gap = sig.identityGap;
  const mt = sig.blockMt;
  const tagMt = sig.tagMt;
  const pad = sig.logoPad;

  const titleBlock = staff.title
    ? '<div style="font-family:' +
      f +
      ";font-size:" +
      t +
      ";font-weight:bold;font-style:italic;color:" +
      blue +
      ";margin:0;margin-top:" +
      gap +
      'px;line-height:1.15;border:none">' +
      title +
      "</div>"
    : "";
  const companyBlock = staff.company
    ? '<div style="font-family:' +
      f +
      ";font-size:" +
      n +
      ";font-weight:bold;color:" +
      black +
      ";margin:0;margin-top:" +
      gap +
      'px;line-height:1.15;border:none">' +
      company +
      "</div>"
    : "";

  let contact = "";
  if (staff.website) {
    contact +=
      '<div style="font-family:' +
      f +
      ";font-size:" +
      c +
      ";line-height:1.45;color:" +
      black +
      ';margin:0;border:none"><b style="font-weight:bold">Web:</b> <a href="' +
      escapeHtml(siteHref) +
      '" style="color:' +
      blue +
      ';text-decoration:underline">' +
      siteLabel +
      "</a></div>";
  }
  if (staff.office) {
    contact +=
      '<div style="font-family:' +
      f +
      ";font-size:" +
      c +
      ";line-height:1.45;color:" +
      black +
      ';margin:0;border:none"><b style="font-weight:bold">' +
      officeLabel +
      ":</b> " +
      office +
      "</div>";
  }
  if (staff.mobile) {
    contact +=
      '<div style="font-family:' +
      f +
      ";font-size:" +
      c +
      ";line-height:1.45;color:" +
      black +
      ';margin:0;border:none"><b style="font-weight:bold">' +
      mobileLabel +
      ":</b> " +
      mobile +
      "</div>";
  }

  // Logo cell: HTML mark (default) or image, optionally linked to motion page
  let logoCell: string;
  if (logoMode === "html") {
    logoCell = buildHtmlLogoMarkHtml(
      motionUrl || undefined,
      sig.logoW,
      sig.logoH,
    );
  } else {
    const img =
      '<img src="' +
      logoSrc +
      '" width="' +
      w +
      '" height="' +
      h +
      '" alt="ISD" border="0" style="display:block;border:0;outline:none;text-decoration:none;width:' +
      w +
      "px;height:" +
      h +
      'px">';
    logoCell =
      motionUrl && /^https?:\/\//i.test(motionUrl)
        ? '<a href="' +
          escapeHtml(motionUrl) +
          '" target="_blank" style="text-decoration:none;border:0">' +
          img +
          "</a>"
        : img;
  }

  const taglineInner =
    motionUrl && /^https?:\/\//i.test(motionUrl)
      ? '<a href="' +
        escapeHtml(motionUrl) +
        '" target="_blank" style="font-family:' +
        f +
        ";font-size:" +
        n +
        ";font-weight:bold;font-style:italic;color:" +
        blue +
        ';text-decoration:none">' +
        tagline +
        "</a>"
      : tagline;

  return (
    "<table " +
    TBL +
    ' style="' +
    TBL_STYLE +
    "font-family:" +
    f +
    ";color:" +
    black +
    '">' +
    '<tr><td style="' +
    TD0 +
    '">' +
    '<div style="font-family:' +
    f +
    ";font-size:" +
    n +
    ";font-weight:bold;color:" +
    black +
    ';line-height:1.15;margin:0;border:none">' +
    name +
    "</div>" +
    titleBlock +
    companyBlock +
    "</td></tr>" +
    '<tr><td style="' +
    TD0 +
    "padding-top:" +
    mt +
    'px">' +
    "<table " +
    TBL +
    ' style="' +
    TBL_STYLE +
    '"><tr>' +
    '<td style="' +
    TD0 +
    "vertical-align:middle;padding-right:" +
    pad +
    "px;width:" +
    (Number(w) + 4) +
    'px">' +
    logoCell +
    "</td>" +
    '<td style="' +
    TD0 +
    'vertical-align:middle">' +
    contact +
    "</td></tr></table>" +
    "</td></tr>" +
    '<tr><td align="center" style="' +
    TD0 +
    "padding-top:" +
    tagMt +
    "px;text-align:center;font-family:" +
    f +
    ";font-size:" +
    n +
    ";font-weight:bold;font-style:italic;color:" +
    blue +
    ';line-height:1.25;letter-spacing:0.02em">' +
    taglineInner +
    "</td></tr>" +
    "</table>"
  );
}

function buildSignatureHtmlOwa(
  staff: StaffInfo,
  logoUrl: string,
  opts: SignatureBuildOpts = {},
) {
  if (opts.logoMode !== "html" && logoUrl.startsWith("data:")) {
    throw new Error("OWA export must use an https logo URL");
  }
  return buildSignatureCore(staff, logoUrl, opts);
}

function buildSignatureHtml(
  staff: StaffInfo,
  logoUrl: string,
  opts: SignatureBuildOpts = {},
) {
  return buildSignatureCore(staff, logoUrl, opts);
}

async function copyHtmlString(html: string, plain: string): Promise<boolean> {
  try {
    if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([plain], { type: "text/plain" }),
        }),
      ]);
      return true;
    }
  } catch {
    /* fall through */
  }
  return false;
}

function plainTextFromStaff(staff: StaffInfo): string {
  return [
    staff.name,
    staff.title,
    staff.company,
    staff.website,
    (staff.officeLabel || "Office") + ": " + staff.office,
    (staff.mobileLabel || "Mobile") + ": " + staff.mobile,
    LOCKED_TAGLINE,
  ].join("\n");
}

function Home() {
  const [duration, setDuration] = useState(5);
  const [paused, setPaused] = useState(false);
  const [staff, setStaff] = useState<StaffInfo>(DEFAULT_STAFF);
  const [gifUrlOverride, setGifUrlOverride] = useState("");
  const [logoMode, setLogoMode] = useState<LogoMode>("html");
  const [resolvedGifUrl, setResolvedGifUrl] = useState(STATIC_LOGO_PATH);
  const [motionPageUrl, setMotionPageUrl] = useState(MOTION_PAGE_PATH);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportNote, setExportNote] = useState<string | null>(null);
  const [loopKey, setLoopKey] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setStaff((s) =>
      s.tagline === LOCKED_TAGLINE ? s : { ...s, tagline: LOCKED_TAGLINE },
    );
  }, []);

  useEffect(() => {
    setResolvedGifUrl(logoUrlForExport(logoMode === "html" ? "static" : logoMode, gifUrlOverride));
    setMotionPageUrl(motionPageUrlForExport());
  }, [gifUrlOverride, logoMode]);

  const updateStaff = useCallback(
    <K extends keyof StaffInfo>(key: K, value: StaffInfo[K]) => {
      if (key === "tagline") return;
      setStaff((s) => ({ ...s, [key]: value, tagline: LOCKED_TAGLINE }));
    },
    [],
  );

  const exportStaff = useMemo(
    () => ({ ...staff, tagline: LOCKED_TAGLINE }),
    [staff],
  );

  const htmlSnippet = useMemo(() => {
    const motionUrl = motionPageUrlForExport();
    const logoSrc =
      logoMode === "html"
        ? ""
        : logoUrlForExport(logoMode, gifUrlOverride);
    return buildSignatureHtml(exportStaff, logoSrc, {
      logoMode,
      motionUrl,
      logoSrc,
    });
  }, [exportStaff, gifUrlOverride, logoMode]);

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(htmlSnippet);
      setCopied(true);
      setExportNote(
        "HTML source copied. For Outlook desktop use Open for Outlook (desktop) paste.",
      );
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setExportError("Could not copy — use an export button instead.");
    }
  };

  const requireHttpsLogo = (url: string): boolean => {
    if (!isAbsoluteHttpUrl(url) && !url.startsWith("data:")) {
      setExportError(
        "Logo URL is not a full https:// link. Open this app from your live Vercel HTTPS site.",
      );
      return false;
    }
    if (/localhost|127\.0\.0\.1/i.test(url)) {
      setExportError(
        "Logo URL points at localhost — use your live Vercel HTTPS site.",
      );
      return false;
    }
    return true;
  };

  /**
   * PRIMARY stack for Outlook desktop:
   * - Static HTML rectangle mark (no GIF/PNG fetch → survives image filters)
   * - Mark + tagline link to CSS motion page (/motion)
   * Word download still available for image modes.
   */
  const openForOutlook = async () => {
    setExportError(null);
    setExportNote(null);
    const staffNow = { ...exportStaff, tagline: LOCKED_TAGLINE };
    const motionUrl = motionPageUrlForExport();
    setMotionPageUrl(motionUrl);

    if (!isAbsoluteHttpUrl(motionUrl)) {
      setExportError(
        "Motion page needs a full https:// site URL. Open this app from your live Vercel HTTPS site.",
      );
      return;
    }

    // Build primary signature: HTML mark linked to motion page
    let logoSrc = "";
    let mode: LogoMode = logoMode;
    if (mode === "static" || mode === "motion") {
      logoSrc = logoUrlForExport(mode, gifUrlOverride);
      if (!requireHttpsLogo(logoSrc)) return;
      // Optional embed for Word path when using PNG
      if (mode === "static") {
        try {
          const data = await logoToDataUri(logoSrc);
          if (data.startsWith("data:image") && data.length < 200_000) {
            logoSrc = data;
          }
        } catch {
          /* keep https */
        }
      }
    } else {
      mode = "html";
    }

    const signatureHtml = buildSignatureHtml(staffNow, logoSrc, {
      logoMode: mode,
      motionUrl,
      logoSrc,
    });

    const ff = "font-family:Times New Roman,Times,serif;";
    const bodyStyle =
      ff + "color:" + sig.colorText + ";font-size:12pt;background:#ffffff;";
    const clipboardHtml =
      '<div style="' + bodyStyle + '">' + signatureHtml + "</div>";
    const plain = plainTextFromStaff(staffNow);
    const copiedOk = await copyHtmlString(clipboardHtml, plain);
    const sizeKb = Math.round(signatureHtml.length / 102.4) / 10;
    const modeLabel =
      mode === "html"
        ? "HTML mark + motion link"
        : mode === "static"
          ? "Static PNG + motion link"
          : "Motion GIF + motion link";

    const wordDoc =
      "<!DOCTYPE html><html><head><meta charset=utf-8><title>ISD Signature</title></head>" +
      '<body style="' +
      bodyStyle +
      '">' +
      signatureHtml +
      "</body></html>";

    const safeMotion = motionUrl
      .replace(/&/g, "\u0026amp;")
      .replace(/</g, "\u0026lt;")
      .replace(/"/g, "\u0026quot;");

    const doc =
      "<!DOCTYPE html><html><head><meta charset=utf-8>" +
      "<title>ISD Outlook desktop</title><style>" +
      "body{margin:0;padding:20px;font-family:system-ui,sans-serif;color:#14141a;background:#fff}" +
      ".chrome{font-size:13px;color:#5c5c68;max-width:660px;line-height:1.5;margin:0 0 12px}" +
      ".chrome strong{color:#14141a}.chrome ol{margin:8px 0 0 1.2em}" +
      ".ok{color:#0a7a32;font-weight:600}.warn{color:#9a3412;font-weight:600}" +
      "#isd-sig{outline:2px solid #151c94;padding:14px;background:#fff}" +
      "button,a.btn{font-family:system-ui,sans-serif;display:inline-block;margin:8px 8px 0 0;" +
      "padding:10px 14px;background:#151c94;color:#fff;border:0;border-radius:6px;cursor:pointer;" +
      "font-size:13px;text-decoration:none}a.btn.secondary{background:#5c5c68}" +
      "code{font-size:11px;word-break:break-all}</style></head><body>" +
      '<p class="chrome"><strong>Primary stack — Outlook desktop</strong> (' +
      modeLabel +
      ", ~" +
      String(sizeKb) +
      " KB)</p>" +
      '<p class="chrome">Email uses a <strong>secure static mark</strong> (HTML rectangles or PNG). ' +
      "Click the mark or tagline to open the <strong>CSS Motion Mark</strong> page (full animation in the browser).</p>" +
      '<p class="chrome"><ol>' +
      "<li>Confirm the signature looks correct in the blue box (colored mark should show without loading a GIF).</li>" +
      "<li>Click <strong>Copy for Outlook desktop</strong> (or use Word method if logo images were chosen).</li>" +
      "<li>Outlook → File → Options → Mail → <strong>Signatures…</strong> → paste (Ctrl+V).</li>" +
      '<li class="warn">Set <strong>New messages</strong> to this signature → OK → OK.</li>' +
      "<li>Optional: open motion page to preview animation: <code>" +
      safeMotion +
      "</code></li>" +
      "</ol></p>" +
      (copiedOk
        ? '<p class="chrome ok">Copied. Paste into Signatures and assign to New messages.</p>'
        : '<p class="chrome warn">Use Copy below.</p>') +
      '<button type="button" id="copy-btn">Copy for Outlook desktop</button>' +
      '<button type="button" id="dl-word" class="secondary">Download Word HTML</button>' +
      '<a class="btn secondary" href="' +
      safeMotion +
      '" target="_blank" rel="noopener">Open Motion Mark page</a>' +
      '<p class="chrome" id="status"></p>' +
      '<div id="isd-sig" contenteditable="true" spellcheck="false">' +
      signatureHtml +
      "</div>" +
      "<script>(function(){" +
      "var html=" +
      JSON.stringify(clipboardHtml) +
      ";" +
      "var plain=" +
      JSON.stringify(plain) +
      ";" +
      "var wordHtml=" +
      JSON.stringify(wordDoc) +
      ";" +
      "function status(t,ok){var el=document.getElementById('status');if(!el)return;" +
      "el.textContent=t;el.className='chrome '+(ok?'ok':'warn');}" +
      "async function doCopy(){var btn=document.getElementById('copy-btn');" +
      "try{if(window.ClipboardItem&&navigator.clipboard&&navigator.clipboard.write){" +
      "await navigator.clipboard.write([new ClipboardItem({" +
      "'text/html':new Blob([html],{type:'text/html'})," +
      "'text/plain':new Blob([plain],{type:'text/plain'})})]);" +
      "if(btn)btn.textContent='Copied — Ctrl+V in Outlook Signatures';" +
      "status('Copied. Paste in Signatures, set New messages.',true);return;}}catch(e){}" +
      "status('Copy blocked — try Download Word HTML.',false);}" +
      "document.getElementById('copy-btn').onclick=function(ev){ev.preventDefault();doCopy();};" +
      "document.getElementById('dl-word').onclick=function(ev){ev.preventDefault();" +
      "var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([wordHtml],{type:'text/html'}));" +
      "a.download='ISD-signature-for-Word.htm';a.click();" +
      "status('Downloaded Word HTML. Open in Word → Ctrl+A → Ctrl+C → paste in Outlook if needed.',true);};" +
      "setTimeout(doCopy,200);})();</script></body></html>";

    const w = window.open("", "_blank");
    if (!w) {
      setExportNote(
        copiedOk
          ? "Signature copied (HTML mark + motion link). Paste in Signatures and set New messages."
          : "Allow pop-ups for the Outlook helper.",
      );
      return;
    }
    w.document.open();
    w.document.write(doc);
    w.document.close();
    setExportNote(
      "Primary Outlook export: static mark + link to Motion Mark (" +
        motionUrl +
        "). Assign signature to New messages after paste.",
    );
  };

  const openWebExport = async (kind: "safari" | "edge") => {
    setExportError(null);
    setExportNote(null);
    const staffNow = { ...exportStaff, tagline: LOCKED_TAGLINE };
    const motionUrl = motionPageUrlForExport();
    setMotionPageUrl(motionUrl);
    if (!isAbsoluteHttpUrl(motionUrl)) {
      setExportError(
        "Open this app from your live Vercel HTTPS site so the motion page link works.",
      );
      return;
    }

    let logoSrc = "";
    let mode: LogoMode = logoMode;
    if (mode === "html") {
      logoSrc = "";
    } else {
      logoSrc = logoUrlForExport(mode, gifUrlOverride);
      setResolvedGifUrl(logoSrc);
      if (!requireHttpsLogo(logoSrc)) return;
      if (logoSrc.startsWith("data:")) {
        setExportError("Web export needs https logo URL, not embedded data.");
        return;
      }
    }

    const signatureHtml = buildSignatureHtmlOwa(staffNow, logoSrc, {
      logoMode: mode,
      motionUrl,
      logoSrc,
    });
    const clipboardHtml = signatureHtml;
    const plain = plainTextFromStaff(staffNow);
    const copiedOk = await copyHtmlString(clipboardHtml, plain);
    const sizeKb = Math.round(signatureHtml.length / 102.4) / 10;
    const safeAbs = (logoSrc || motionUrl)
      .replace(/&/g, "\u0026amp;")
      .replace(/</g, "\u0026lt;")
      .replace(/"/g, "\u0026quot;");
    const title =
      kind === "safari" ? "Safari → OWA" : "Microsoft Edge → OWA";
    const copyLabel =
      kind === "safari" ? "Copy for Safari → OWA" : "Copy compact signature";

    const doc =
      "<!DOCTYPE html><html><head><meta charset=utf-8><title>" +
      title +
      "</title><style>" +
      "body{padding:20px;font-family:system-ui,sans-serif;color:#14141a}" +
      ".chrome{font-size:13px;color:#5c5c68;max-width:620px;line-height:1.5}" +
      ".ok{color:#0a7a32;font-weight:600}.warn{color:#9a3412}" +
      "#box{outline:2px solid #151c94;padding:12px;margin-top:12px;background:#fff}" +
      "button{margin:8px 8px 0 0;padding:10px 14px;background:#151c94;color:#fff;border:0;" +
      "border-radius:6px;cursor:pointer;font-size:13px}" +
      "code{font-size:11px;word-break:break-all}</style></head><body>" +
      '<p class="chrome"><strong>' +
      title +
      "</strong> (compact ~" +
      sizeKb +
      " KB, logo: " +
      (logoMode === "html" ? "HTML mark" : logoMode === "static" ? "static PNG" : "motion GIF") +
      ")</p>" +
      '<p class="chrome">OWA: Settings → Signatures → clear old → paste → Save. ' +
      "Do not use desktop Outlook paste for OWA. Do not Ctrl+A the preview (can bloat size).</p>" +
      (copiedOk
        ? '<p class="chrome ok">Copied — paste into OWA Signatures.</p>'
        : '<p class="chrome warn">Click copy button below.</p>') +
      "<p class=\"chrome\">Logo: <code>" +
      safeAbs +
      "</code></p>" +
      '<button type="button" id="copy-btn">' +
      copyLabel +
      "</button>" +
      '<div id="box">' +
      signatureHtml +
      "</div>" +
      "<script>(function(){var html=" +
      JSON.stringify(clipboardHtml) +
      ";var plain=" +
      JSON.stringify(plain) +
      ";async function doCopy(){var b=document.getElementById('copy-btn');" +
      "try{if(window.ClipboardItem&&navigator.clipboard&&navigator.clipboard.write){" +
      "await navigator.clipboard.write([new ClipboardItem({" +
      "'text/html':new Blob([html],{type:'text/html'})," +
      "'text/plain':new Blob([plain],{type:'text/plain'})})]);" +
      "if(b)b.textContent='Copied — paste in OWA';return;}}catch(e){}" +
      "if(b)b.textContent='Copy failed — try again';}" +
      "document.getElementById('copy-btn').onclick=function(ev){ev.preventDefault();doCopy();};" +
      "doCopy();})();</script></body></html>";

    const w = window.open("", "_blank");
    if (!w) {
      setExportNote(
        copiedOk
          ? title + " signature copied (~" + sizeKb + " KB)."
          : "Allow pop-ups and try again.",
      );
      return;
    }
    w.document.open();
    w.document.write(doc);
    w.document.close();
    setExportNote(
      title +
        " ready (~" +
        sizeKb +
        " KB, " +
        (logoMode === "html" ? "HTML" : logoMode === "static" ? "PNG" : "GIF") +
        "). Paste into OWA Signatures after clearing the old one.",
    );
  };

  return (
    <div className="min-h-dvh overflow-x-hidden">
      <header className="border-b border-border bg-bg-elevated">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <IsdLogo width={64} duration={duration} showLetters={false} />
            <div className="min-w-0">
              <h1 className="truncate text-[14px] font-semibold tracking-tight text-fg sm:text-[15px]">
                {APP_NAME}
              </h1>
              <p className="truncate text-[11px] text-fg-muted sm:text-[12px]">
                {APP_TAGLINE}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-sm)] border border-border bg-bg px-2.5 text-[12px] font-medium text-fg hover:bg-bg-subtle sm:px-3"
            >
              {paused ? (
                <>
                  <Play className="size-3.5" />
                  <span className="hidden sm:inline">Play</span>
                </>
              ) : (
                <>
                  <Pause className="size-3.5" />
                  <span className="hidden sm:inline">Pause</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setLoopKey((k) => k + 1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-border bg-bg text-fg hover:bg-bg-subtle"
              title="Restart loop"
              aria-label="Restart loop"
            >
              <RotateCcw className="size-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-6 rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Users className="mt-0.5 size-4 shrink-0 text-[var(--color-isd-blue)]" />
            <div className="min-w-0">
              <h2 className="text-[13px] font-semibold text-fg">
                For staff — create your email signature
              </h2>
              <ol className="mt-2 list-decimal space-y-1 pl-4 text-[12.5px] leading-relaxed text-fg-muted">
                <li>
                  Default mark is <strong className="text-fg">HTML rectangles</strong>{" "}
                  (secure). Motion lives on the linked <strong className="text-fg">Motion Mark</strong> page.
                </li>
                <li>
                  <strong className="text-fg">Primary:</strong> Open for Outlook
                  (desktop) → paste → set for New messages.
                </li>
                <li>
                  Safari / Edge → OWA remain available as alternate paste paths.
                </li>
              </ol>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5 sm:p-8">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.14em] text-fg-subtle">
                Stage preview
              </p>
              <div className="flex min-h-[180px] items-center justify-center overflow-hidden rounded-[var(--radius-lg)] bg-bg-subtle sm:min-h-[200px]">
                <div key={loopKey} className={paused ? "isd-paused" : undefined}>
                  <style>{`
                    .isd-paused .isd-bar,
                    .isd-paused .isd-letters,
                    .isd-paused .isd-stage::after {
                      animation-play-state: paused !important;
                    }
                  `}</style>
                  <IsdLogo width={200} duration={duration} showLetters={false} />
                </div>
              </div>
              <div className="mt-5">
                <label className="flex items-center justify-between text-[12.5px] text-fg-muted">
                  <span>Loop duration</span>
                  <span className="font-mono tabular-nums text-fg">
                    {duration.toFixed(1)}s
                  </span>
                </label>
                <input
                  type="range"
                  min={3}
                  max={10}
                  step={0.5}
                  value={duration}
                  onChange={(e) => {
                    setDuration(Number(e.target.value));
                    setLoopKey((k) => k + 1);
                  }}
                  className="mt-2 w-full accent-[var(--color-isd-blue)]"
                />
              </div>
            </div>

            <div className="rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5 sm:p-8">
              <div className="mb-3 flex items-center gap-2">
                <Mail className="size-4 text-fg-muted" />
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-fg-subtle">
                  Signature preview
                </p>
              </div>
              <div className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-bg">
                <div className="border-b border-border bg-bg-subtle px-3 py-2.5">
                  <div className="text-[11px] text-fg-subtle">
                    To: customer@company.com
                  </div>
                  <div className="mt-0.5 text-[12px] font-medium text-fg">
                    Re: Project update
                  </div>
                </div>
                <div className="space-y-3 px-3 py-4 text-[13px] leading-relaxed text-fg-muted sm:px-5">
                  <p>Hi there,</p>
                  <p>Thanks for your note — I've attached the revised schedule.</p>
                  <p>Best regards,</p>
                  <div className="border-t border-border pt-4">
                    <EmailFooter
                      staff={exportStaff}
                      duration={duration}
                      compact
                      logoMode={
                        logoMode === "html"
                          ? "html"
                          : logoMode === "static"
                            ? "static"
                            : "gif"
                      }
                      gifUrl={resolvedGifUrl}
                      motionHref={motionPageUrl}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5 sm:p-6">
              <h2 className="text-[14px] font-semibold tracking-tight text-fg">
                Staff details
              </h2>
              <div className="mt-5 space-y-3">
                {EDITABLE_FIELDS.map(([key, label]) => (
                  <label key={key} className="block">
                    <span className="mb-1 block text-[11.5px] font-medium text-fg-subtle">
                      {label}
                    </span>
                    <input
                      type="text"
                      value={staff[key]}
                      onChange={(e) => updateStaff(key, e.target.value)}
                      className="h-10 w-full rounded-[var(--radius-sm)] border border-border bg-bg px-3 text-[13px] text-fg outline-none focus:border-border-strong focus:ring-2 focus:ring-[color-mix(in_oklab,var(--color-isd-blue)_22%,transparent)]"
                    />
                  </label>
                ))}
                <div className="block">
                  <span className="mb-1 flex items-center gap-1.5 text-[11.5px] font-medium text-fg-subtle">
                    <Lock className="size-3" />
                    Tagline (locked)
                  </span>
                  <div
                    className="flex h-10 w-full items-center rounded-[var(--radius-sm)] border border-border bg-bg-subtle px-3 text-[13px] font-bold italic text-[var(--color-isd-blue)]"
                    style={{ fontFamily: sig.font }}
                  >
                    {LOCKED_TAGLINE}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[var(--radius-xl)] border border-border bg-bg-elevated p-5 sm:p-6">
              <h2 className="text-[14px] font-semibold tracking-tight text-fg">
                Export for email
              </h2>
              <p className="mt-1 text-[12.5px] text-fg-muted">
                Primary path: secure static mark in email + CSS motion on the web.
                Safari/Edge buttons are alternates for OWA.
              </p>

              <fieldset className="mt-4">
                <legend className="mb-2 text-[11.5px] font-medium text-fg-subtle">
                  Logo for email (signature body)
                </legend>
                <div className="space-y-2 text-[12.5px] text-fg">
                  <label className="flex cursor-pointer items-start gap-2">
                    <input
                      type="radio"
                      name="logoMode"
                      className="mt-1 accent-[var(--color-isd-blue)]"
                      checked={logoMode === "html"}
                      onChange={() => setLogoMode("html")}
                    />
                    <span>
                      <strong className="font-medium">
                        HTML mark + Motion link (recommended)
                      </strong>
                      <span className="block text-[11.5px] text-fg-muted">
                        Static colored rectangles in the email (no image
                        download). Click opens the CSS Motion Mark page.
                      </span>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-2">
                    <input
                      type="radio"
                      name="logoMode"
                      className="mt-1 accent-[var(--color-isd-blue)]"
                      checked={logoMode === "static"}
                      onChange={() => setLogoMode("static")}
                    />
                    <span>
                      <strong className="font-medium">Static PNG + Motion link</strong>
                      <span className="block text-[11.5px] text-fg-muted">
                        Settled PNG image; still links to the motion page.
                      </span>
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-2">
                    <input
                      type="radio"
                      name="logoMode"
                      className="mt-1 accent-[var(--color-isd-blue)]"
                      checked={logoMode === "motion"}
                      onChange={() => setLogoMode("motion")}
                    />
                    <span>
                      <strong className="font-medium">Motion GIF (legacy)</strong>
                      <span className="block text-[11.5px] text-fg-muted">
                        Often blocked by filters — use only when you know
                        recipients allow GIFs.
                      </span>
                    </span>
                  </label>
                </div>
                <p className="mt-2 break-all text-[11px] text-fg-muted">
                  Motion page:{" "}
                  <code className="rounded bg-bg-subtle px-1 font-mono text-[10.5px] text-fg">
                    {motionPageUrl}
                  </code>
                </p>
              </fieldset>

              <label className="mt-4 block">
                <span className="mb-1 flex items-center gap-1.5 text-[11.5px] font-medium text-fg-subtle">
                  <Link2 className="size-3.5" />
                  Public logo URL override (optional)
                </span>
                <input
                  type="url"
                  placeholder="Auto: this site static PNG or motion GIF"
                  value={gifUrlOverride}
                  onChange={(e) => setGifUrlOverride(e.target.value)}
                  className="h-10 w-full rounded-[var(--radius-sm)] border border-border bg-bg px-3 font-mono text-[12px] text-fg outline-none focus:border-border-strong focus:ring-2 focus:ring-[color-mix(in_oklab,var(--color-isd-blue)_22%,transparent)]"
                />
                <span className="mt-1.5 block break-all text-[11px] text-fg-muted">
                  Using:{" "}
                  <code className="rounded bg-bg-subtle px-1 font-mono text-[10.5px] text-fg">
                    {resolvedGifUrl}
                  </code>
                </span>
              </label>

              <div
                className="mt-4 flex items-center justify-center rounded-[var(--radius-sm)] border border-border py-3"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg,#e8e6e0 25%,transparent 25%),linear-gradient(-45deg,#e8e6e0 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e8e6e0 75%),linear-gradient(-45deg,transparent 75%,#e8e6e0 75%)",
                  backgroundSize: "16px 16px",
                  backgroundPosition: "0 0,0 8px,8px -8px,-8px 0",
                  backgroundColor: "#f6f5f2",
                }}
              >
                {logoMode === "html" ? (
                  <div className="text-center text-[12px] text-fg-muted">
                    <span className="mb-2 block font-medium text-fg">
                      HTML mark (preview in signature above)
                    </span>
                    <a
                      href={motionPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-isd-blue)] underline"
                    >
                      Open Motion Mark page
                    </a>
                  </div>
                ) : (
                  <img
                    src={
                      (logoMode === "motion"
                        ? MOTION_GIF_PATH
                        : STATIC_LOGO_PATH) + "?v=stack"
                    }
                    alt="ISD logo"
                    width={sig.logoW * 2}
                    height={sig.logoH * 2}
                    style={{ background: "transparent" }}
                  />
                )}
              </div>

              <button
                type="button"
                onClick={openForOutlook}
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-accent text-[13px] font-medium text-accent-fg hover:opacity-90"
              >
                <ExternalLink className="size-4" />
                Open for Outlook (desktop) paste — primary
              </button>
              <button
                type="button"
                onClick={() => openWebExport("safari")}
                className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-border bg-bg text-[13px] font-medium text-fg hover:bg-bg-subtle"
              >
                <Globe className="size-4" />
                Alternate: Safari → OWA
              </button>
              <button
                type="button"
                onClick={() => openWebExport("edge")}
                className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-border bg-bg text-[13px] font-medium text-fg hover:bg-bg-subtle"
              >
                <Globe className="size-4" />
                Alternate: Edge → OWA
              </button>
              <button
                type="button"
                onClick={copyHtml}
                className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-border bg-bg text-[13px] font-medium text-fg hover:bg-bg-subtle"
              >
                {copied ? "Copied HTML source" : "Copy signature HTML source"}
              </button>

              {exportNote ? (
                <p className="mt-3 text-[12px] leading-relaxed text-fg-muted">
                  {exportNote}
                </p>
              ) : null}
              {exportError ? (
                <p className="mt-3 text-[12px] text-[var(--color-isd-red)]">
                  {exportError}
                </p>
              ) : null}

              <details className="mt-4">
                <summary className="cursor-pointer text-[12px] font-medium text-fg-muted hover:text-fg">
                  View HTML snippet
                </summary>
                <pre className="mt-2 max-h-48 overflow-auto rounded-[var(--radius-sm)] bg-bg-subtle p-3 text-[10.5px] text-fg-muted">
                  {htmlSnippet}
                </pre>
              </details>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
