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
  type LogoMode,
  logoUrlForExport,
  isAbsoluteHttpUrl,
} from "@/lib/branding";
import { sig } from "@/lib/signatureLayout";

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

function buildSignatureCore(staff: StaffInfo, logoSrcRaw: string) {
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
    'px">' +
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
    tagline +
    "</td></tr>" +
    "</table>"
  );
}

function buildSignatureHtmlOwa(staff: StaffInfo, logoUrl: string) {
  if (logoUrl.startsWith("data:")) {
    throw new Error("OWA export must use an https logo URL");
  }
  return buildSignatureCore(staff, logoUrl);
}

function buildSignatureHtml(staff: StaffInfo, logoUrl: string) {
  return buildSignatureCore(staff, logoUrl);
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
  const [logoMode, setLogoMode] = useState<LogoMode>("static");
  const [resolvedGifUrl, setResolvedGifUrl] = useState(STATIC_LOGO_PATH);
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
    setResolvedGifUrl(logoUrlForExport(logoMode, gifUrlOverride));
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

  const htmlSnippet = useMemo(
    () =>
      buildSignatureHtml(
        exportStaff,
        logoUrlForExport(logoMode, gifUrlOverride),
      ),
    [exportStaff, gifUrlOverride, logoMode],
  );

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
   * Desktop Outlook: images are the hard part.
   * - data: URIs are often stripped on browser→Outlook paste
   * - https images often show empty until "Download pictures" or never embed in the signature
   * Reliable path: Word HTML with embedded logo → open in Word → copy → paste into Signatures
   * (Word puts a real embedded picture on the clipboard that Outlook keeps.)
   */
  const openForOutlook = async () => {
    setExportError(null);
    setExportNote(null);
    const staffNow = { ...exportStaff, tagline: LOCKED_TAGLINE };
    const absLogo = logoUrlForExport(logoMode, gifUrlOverride);
    setResolvedGifUrl(absLogo);
    if (!requireHttpsLogo(absLogo)) return;

    setExportNote("Preparing logo for Outlook desktop…");

    // Always try to embed a logo Word/Outlook can keep.
    // Motion GIF base64 is large but OK for a Word .htm download; direct paste still uses a compact form.
    let dataUri = "";
    try {
      dataUri = await logoToDataUri(absLogo);
      if (!dataUri.startsWith("data:image")) dataUri = "";
    } catch {
      dataUri = "";
    }

    // Prefer embedded image for Word package; fall back to https
    const embedSrc = dataUri || absLogo;
    const signatureEmbedded = buildSignatureHtml(staffNow, embedSrc);
    const signatureLinked = buildSignatureHtml(staffNow, absLogo);

    const ff = "font-family:Times New Roman,Times,serif;";
    const bodyStyle =
      ff + "color:" + sig.colorText + ";font-size:12pt;background:#ffffff;";

    // Word document with embedded (or linked) logo — best Outlook path
    const wordDoc =
      "<!DOCTYPE html><html><head><meta charset=utf-8>" +
      "<title>ISD Signature</title></head><body style=\"" +
      bodyStyle +
      '">' +
      signatureEmbedded +
      "</body></html>";

    // Clipboard HTML: use embedded when small enough (static PNG); else https link
    const useEmbedInClipboard =
      !!dataUri &&
      (logoMode === "static" || dataUri.length < 180_000);
    const clipboardHtml =
      '<div style="' +
      bodyStyle +
      '">' +
      (useEmbedInClipboard ? signatureEmbedded : signatureLinked) +
      "</div>";
    const plain = plainTextFromStaff(staffNow);
    const copiedOk = await copyHtmlString(clipboardHtml, plain);

    const sizeKb = Math.round(signatureEmbedded.length / 102.4) / 10;
    const safeAbs = absLogo
      .replace(/&/g, "\u0026amp;")
      .replace(/</g, "\u0026lt;")
      .replace(/"/g, "\u0026quot;");
    const modeLabel =
      logoMode === "static" ? "Static PNG" : "Motion GIF";
    const logoFileName =
      logoMode === "static" ? "isd-logo-static.png" : "isd-motion-logo.gif";

    // Script strings built carefully (no messy escapes)
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
      '<p class="chrome"><strong>Outlook desktop — logo fix</strong> (' +
      modeLabel +
      ", ~" +
      String(sizeKb) +
      " KB)</p>" +
      '<p class="chrome warn">If the logo is missing after a normal paste, use the <strong>Word method</strong> below. ' +
      "Outlook often strips images pasted straight from a browser.</p>" +
      '<p class="chrome"><strong>Recommended (keeps the logo)</strong><ol>' +
      "<li>Click <strong>Download Word HTML (logo inside)</strong>.</li>" +
      "<li>Open the file with <strong>Microsoft Word</strong> (not Notepad).</li>" +
      "<li>In Word: <strong>Ctrl+A</strong> then <strong>Ctrl+C</strong>.</li>" +
      "<li>Outlook → File → Options → Mail → <strong>Signatures…</strong></li>" +
      "<li>Click in the signature box → <strong>Ctrl+V</strong>.</li>" +
      "<li>Set <strong>New messages</strong> to this signature → OK → OK.</li>" +
      "</ol></p>" +
      '<p class="chrome"><strong>Alternate</strong><ol>' +
      "<li>Click <strong>Download logo file</strong> and <strong>Copy signature text</strong>.</li>" +
      "<li>Paste text into the signature box.</li>" +
      "<li>Click where the logo should go → <strong>Insert → Pictures → This Device</strong> → choose the downloaded logo.</li>" +
      "<li>Resize the picture to about 48×26 px if needed.</li>" +
      "</ol></p>" +
      (copiedOk
        ? '<p class="chrome ok">Signature HTML is also on the clipboard (may omit logo in Outlook — use Word method if so).</p>'
        : "") +
      "<p class=\"chrome\">Hosted logo: <code>" +
      safeAbs +
      "</code></p>" +
      '<button type="button" id="dl-word">Download Word HTML (logo inside)</button>' +
      '<button type="button" id="dl-logo" class="secondary">Download logo file</button>' +
      '<button type="button" id="copy-btn" class="secondary">Copy signature text</button>' +
      '<p class="chrome" id="status"></p>' +
      '<div id="isd-sig">' +
      signatureEmbedded +
      "</div>" +
      "<script>(function(){" +
      "var wordHtml=" +
      JSON.stringify(wordDoc) +
      ";" +
      "var clipHtml=" +
      JSON.stringify(clipboardHtml) +
      ";" +
      "var plain=" +
      JSON.stringify(plain) +
      ";" +
      "var logoUrl=" +
      JSON.stringify(absLogo) +
      ";" +
      "var logoName=" +
      JSON.stringify(logoFileName) +
      ";" +
      "function status(t,ok){var el=document.getElementById('status');if(!el)return;" +
      "el.textContent=t;el.className='chrome '+(ok?'ok':'warn');}" +
      "function dl(name, blob){var a=document.createElement('a');a.href=URL.createObjectURL(blob);" +
      "a.download=name;a.click();setTimeout(function(){URL.revokeObjectURL(a.href);},2000);}" +
      "document.getElementById('dl-word').onclick=function(ev){ev.preventDefault();" +
      "dl('ISD-signature-for-Word.htm', new Blob([wordHtml],{type:'text/html;charset=utf-8'}));" +
      "status('Downloaded. Open in Microsoft Word → Ctrl+A → Ctrl+C → paste in Outlook Signatures.',true);};" +
      "document.getElementById('dl-logo').onclick=function(ev){ev.preventDefault();" +
      "fetch(logoUrl).then(function(r){return r.blob();}).then(function(b){dl(logoName,b);" +
      "status('Logo downloaded. In Outlook Signatures: Insert → Pictures → choose this file.',true);})" +
      ".catch(function(){window.open(logoUrl,'_blank');status('Opened logo in a new tab — save it, then Insert → Pictures in Outlook.',false);});};" +
      "document.getElementById('copy-btn').onclick=async function(ev){ev.preventDefault();" +
      "try{if(window.ClipboardItem&&navigator.clipboard&&navigator.clipboard.write){" +
      "await navigator.clipboard.write([new ClipboardItem({" +
      "'text/html':new Blob([clipHtml],{type:'text/html'})," +
      "'text/plain':new Blob([plain],{type:'text/plain'})})]);" +
      "status('Copied HTML. If logo is blank in Outlook, use Download Word HTML method.',true);return;}}catch(e){}" +
      "status('Copy blocked — use Download Word HTML method.',false);};" +
      "})();</script></body></html>";

    const w = window.open("", "_blank");
    if (!w) {
      // Still offer downloads from main window
      try {
        const blob = new Blob([wordDoc], {
          type: "text/html;charset=utf-8",
        });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "ISD-signature-for-Word.htm";
        a.click();
        setExportNote(
          "Pop-up blocked — Word HTML downloaded. Open it in Microsoft Word → Ctrl+A → Ctrl+C → paste into Outlook Signatures. Assign to New messages.",
        );
      } catch {
        setExportNote(
          copiedOk
            ? "Copied HTML (logo may be missing in Outlook). Allow pop-ups for the full helper with Word download."
            : "Allow pop-ups for the Outlook helper.",
        );
      }
      return;
    }
    w.document.open();
    w.document.write(doc);
    w.document.close();
    setExportNote(
      "Outlook helper open. If the logo is missing after paste, use Download Word HTML → open in Word → Ctrl+A → Ctrl+C → paste into Signatures (this embeds the logo).",
    );
  };

  const openWebExport = async (kind: "safari" | "edge") => {
    setExportError(null);
    setExportNote(null);
    const staffNow = { ...exportStaff, tagline: LOCKED_TAGLINE };
    const absLogo = logoUrlForExport(logoMode, gifUrlOverride);
    setResolvedGifUrl(absLogo);
    if (!requireHttpsLogo(absLogo)) return;
    if (absLogo.startsWith("data:")) {
      setExportError("Web export needs https logo URL, not embedded data.");
      return;
    }

    const signatureHtml = buildSignatureHtmlOwa(staffNow, absLogo);
    const clipboardHtml = signatureHtml;
    const plain = plainTextFromStaff(staffNow);
    const copiedOk = await copyHtmlString(clipboardHtml, plain);
    const sizeKb = Math.round(signatureHtml.length / 102.4) / 10;
    const safeAbs = absLogo
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
      (logoMode === "static" ? "static PNG" : "motion GIF") +
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
        (logoMode === "static" ? "PNG" : "GIF") +
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
                  Edit details. Choose <strong className="text-fg">Static PNG</strong>{" "}
                  or <strong className="text-fg">Motion GIF</strong>.
                </li>
                <li>
                  <strong className="text-fg">Desktop Outlook</strong>: Open for
                  Outlook (desktop) → paste → set for <strong className="text-fg">New messages</strong>.
                </li>
                <li>
                  <strong className="text-fg">Safari / Edge → OWA</strong>: use the
                  matching web button (compact https logo).
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
                      logoMode="gif"
                      gifUrl={resolvedGifUrl}
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
                Choose logo type, then the export for your mail client. Tables are
                borderless for PNG and GIF.
              </p>

              <fieldset className="mt-4">
                <legend className="mb-2 text-[11.5px] font-medium text-fg-subtle">
                  Logo for email
                </legend>
                <div className="space-y-2 text-[12.5px] text-fg">
                  <label className="flex cursor-pointer items-start gap-2">
                    <input
                      type="radio"
                      name="logoMode"
                      className="mt-1 accent-[var(--color-isd-blue)]"
                      checked={logoMode === "static"}
                      onChange={() => setLogoMode("static")}
                    />
                    <span>
                      <strong className="font-medium">Static PNG (recommended)</strong>
                      <span className="block text-[11.5px] text-fg-muted">
                        Best delivery when customers block GIFs. Embedded for
                        desktop Outlook.
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
                      <strong className="font-medium">Motion GIF</strong>
                      <span className="block text-[11.5px] text-fg-muted">
                        Animated when allowed. Desktop uses https link (not
                        full-file embed — avoids empty paste).
                      </span>
                    </span>
                  </label>
                </div>
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
                <img
                  src={
                    (logoMode === "motion"
                      ? MOTION_GIF_PATH
                      : STATIC_LOGO_PATH) + "?v=outlook-fix"
                  }
                  alt="ISD logo"
                  width={sig.logoW * 2}
                  height={sig.logoH * 2}
                  style={{ background: "transparent" }}
                />
              </div>

              <button
                type="button"
                onClick={openForOutlook}
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-accent text-[13px] font-medium text-accent-fg hover:opacity-90"
              >
                <ExternalLink className="size-4" />
                Open for Outlook (desktop) paste
              </button>
              <button
                type="button"
                onClick={() => openWebExport("safari")}
                className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-isd-blue)] bg-bg text-[13px] font-medium text-[var(--color-isd-blue)] hover:bg-[color-mix(in_oklab,var(--color-isd-blue)_8%,white)]"
              >
                <Globe className="size-4" />
                Open for Safari Web browser use
              </button>
              <button
                type="button"
                onClick={() => openWebExport("edge")}
                className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-isd-blue)] bg-bg text-[13px] font-medium text-[var(--color-isd-blue)] hover:bg-[color-mix(in_oklab,var(--color-isd-blue)_8%,white)]"
              >
                <Globe className="size-4" />
                Open for Edge → OWA paste
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
