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
  gifUrlForExport,
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

/** Load logo as data-URI so Outlook signature paste keeps the image. */
async function logoToDataUri(url: string): Promise<string> {
  const res = await fetch(url, {
    mode: "cors",
    credentials: "omit",
    cache: "force-cache",
  });
  if (!res.ok) {
    throw new Error("Could not load logo GIF (" + res.status + ")");
  }
  const blob = await res.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read logo file"));
    reader.readAsDataURL(blob);
  });
}

function Home() {
  const [duration, setDuration] = useState(5);
  const [paused, setPaused] = useState(false);
  const [staff, setStaff] = useState<StaffInfo>(DEFAULT_STAFF);
  const [gifUrlOverride, setGifUrlOverride] = useState("");
  const [resolvedGifUrl, setResolvedGifUrl] = useState(MOTION_GIF_PATH);
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
    setResolvedGifUrl(gifUrlForExport(gifUrlOverride));
  }, [gifUrlOverride]);

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
    () => buildSignatureHtml(exportStaff, gifUrlForExport(gifUrlOverride)),
    [exportStaff, gifUrlOverride, resolvedGifUrl],
  );

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(htmlSnippet);
      setCopied(true);
      setExportNote(
        "HTML source copied (for Gmail/web). For Outlook use Open for Outlook paste.",
      );
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setExportError("Could not copy — select the HTML below instead.");
    }
  };

  const openForOutlook = async () => {
    setExportError(null);
    setExportNote(null);
    const staffNow = { ...exportStaff, tagline: LOCKED_TAGLINE };
    const absGif = gifUrlForExport(gifUrlOverride);
    setResolvedGifUrl(absGif);

    if (!isAbsoluteHttpUrl(absGif) && !absGif.startsWith("data:")) {
      setExportError(
        "Logo URL is not a full https:// link. Open this app from your live Vercel HTTPS site.",
      );
      return;
    }
    if (/localhost|127\.0\.0\.1/i.test(absGif)) {
      setExportError(
        "Logo URL points at localhost — use your live Vercel HTTPS site.",
      );
      return;
    }

    setExportNote("Preparing logo for Outlook (embedding image)…");

    let embedSrc = absGif;
    try {
      embedSrc = await logoToDataUri(absGif);
      if (!embedSrc.startsWith("data:image")) {
        throw new Error("Unexpected logo data");
      }
    } catch (err) {
      setExportError(
        (err instanceof Error ? err.message : "Logo embed failed") +
          " — falling back to linked image (Outlook may drop it).",
      );
      embedSrc = absGif;
    }

    const signatureHtml = buildSignatureHtml(staffNow, embedSrc);
    const ff = sig.fontStyle;
    const cText = sig.colorText;
    const cBlue = sig.colorBlue;

    // Force Title + Tagline: Bold + Italic + ISD Blue through Outlook/Word paste
    const accentForceCss =
      ".isd-title,.isd-title b,.isd-title i,.isd-title span," +
      ".isd-tagline,.isd-tagline b,.isd-tagline i,.isd-tagline span{" +
      'font-family:"Times New Roman",Times,serif !important;' +
      "font-weight:bold !important;" +
      "font-style:italic !important;" +
      "color:" +
      cBlue +
      " !important;}";
    const msoAccentCss =
      "<!--[if mso]><style>" +
      'table,td,div,p,b,i,a,span{font-family:"Times New Roman",Times,serif !important;}' +
      accentForceCss +
      "</style><![endif]-->";
    const accentCss =
      '<style type="text/css">' + accentForceCss + "</style>";

    const clipboardHtml =
      msoAccentCss +
      accentCss +
      '<div style="' +
      ff +
      "color:" +
      cText +
      ';background:transparent;">' +
      signatureHtml +
      "</div>";

    let copiedOk = false;
    try {
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([clipboardHtml], { type: "text/html" }),
            "text/plain": new Blob(
              [
                staffNow.name +
                  "\n" +
                  staffNow.title +
                  "\n" +
                  staffNow.company +
                  "\n" +
                  LOCKED_TAGLINE,
              ],
              { type: "text/plain" },
            ),
          }),
        ]);
        copiedOk = true;
      }
    } catch {
      copiedOk = false;
    }

    const wordDoc =
      "<!DOCTYPE html><html><head><meta charset=\"utf-8\">" +
      "<title>ISD Signature</title>" +
      msoAccentCss +
      accentCss +
      '</head><body style="' +
      ff +
      "color:" +
      cText +
      '">' +
      signatureHtml +
      "</body></html>";

    const safeAbs = absGif
      .replace(/&/g, "\u0026amp;")
      .replace(/</g, "\u0026lt;")
      .replace(/"/g, "\u0026quot;");

    const doc = [
      "<!DOCTYPE html>",
      "<html><head><meta charset=\"utf-8\"><title>ISD signature for Outlook</title>",
      "<style>",
      "body{padding:20px;" + ff + "color:" + cText + ";background:#fff;}",
      ".chrome{font-family:system-ui,sans-serif;font-size:13px;color:#5c5c68;max-width:560px;line-height:1.45;margin:0 0 12px;}",
      ".chrome strong{color:#14141a;}",
      "#isd-sig{outline:1px dashed #c8c6be;padding:10px;background:transparent;}",
      accentForceCss,
      "button,a.btn{font-family:system-ui,sans-serif;display:inline-block;margin:6px 8px 6px 0;padding:10px 14px;background:#151c94;color:#fff;border:0;border-radius:6px;cursor:pointer;font-size:13px;text-decoration:none;}",
      "a.btn.secondary{background:#5c5c68;}",
      "</style></head><body>",
      '<p class="chrome"><strong>Outlook paste</strong><br>',
      "Title & tagline: <strong>Times New Roman, Bold, Italic, ISD Blue</strong>. ",
      "Logo is embedded for paste.<br><br>",
      copiedOk
        ? "✓ Copied to clipboard — in Outlook Signatures press <strong>Ctrl+V</strong>."
        : "Click <strong>Copy signature for Outlook</strong>, then Ctrl+V in Outlook Signatures.",
      "<br><br>If logo missing: <strong>Download Word HTML</strong> → open in Word → copy → paste into Outlook.",
      "</p>",
      '<button type="button" id="copy-btn">Copy signature for Outlook</button>',
      '<a class="btn secondary" id="dl-word" href="#">Download Word HTML (embedded logo)</a>',
      '<a class="btn secondary" id="dl-gif" href="' +
        safeAbs +
        '" download="isd-motion-logo.gif" target="_blank" rel="noopener">Download logo GIF</a>',
      '<div id="isd-sig">' + signatureHtml + "</div>",
      "<script>",
      "(function(){",
      "  var html = " + JSON.stringify(clipboardHtml) + ";",
      "  var wordHtml = " + JSON.stringify(wordDoc) + ";",
      "  async function doCopy(){",
      "    var btn = document.getElementById('copy-btn');",
      "    try {",
      "      if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {",
      "        await navigator.clipboard.write([new ClipboardItem({",
      "          'text/html': new Blob([html], {type: 'text/html'}),",
      "          'text/plain': new Blob([document.getElementById('isd-sig').innerText], {type: 'text/plain'})",
      "        })]);",
      "        if (btn) btn.textContent = 'Copied — Ctrl+V in Outlook Signatures';",
      "        return;",
      "      }",
      "    } catch (e) {}",
      "    try {",
      "      var el = document.getElementById('isd-sig');",
      "      el.setAttribute('contenteditable','true');",
      "      var r = document.createRange(); r.selectNodeContents(el);",
      "      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);",
      "      document.execCommand('copy');",
      "      el.removeAttribute('contenteditable');",
      "      if (btn) btn.textContent = 'Copied — try Ctrl+V in Outlook';",
      "    } catch (e2) {",
      "      alert('Copy failed. Use Download Word HTML, open in Word, then copy into Outlook.');",
      "    }",
      "  }",
      "  document.getElementById('copy-btn').onclick = doCopy;",
      "  document.getElementById('dl-word').onclick = function(ev){",
      "    ev.preventDefault();",
      "    var blob = new Blob([wordHtml], {type: 'text/html;charset=utf-8'});",
      "    var a = document.createElement('a');",
      "    a.href = URL.createObjectURL(blob);",
      "    a.download = 'ISD-signature-for-Word.htm';",
      "    a.click();",
      "    setTimeout(function(){ URL.revokeObjectURL(a.href); }, 2000);",
      "  };",
      "  doCopy();",
      "})();",
      "</script>",
      "</body></html>",
    ].join("\n");

    const w = window.open("", "_blank");
    if (!w) {
      setExportNote(
        copiedOk
          ? "Signature copied (title/tagline bold italic blue; logo embedded). Ctrl+V in Outlook Signatures."
          : "Allow pop-ups for the Outlook helper window.",
      );
      return;
    }
    w.document.open();
    w.document.write(doc);
    w.document.close();
    setExportNote(
      "Outlook export ready: Title & tagline = Bold + Italic + ISD Blue. Logo embedded. Ctrl+V in Signatures.",
    );
  };
  /**
   * Safari → OWA: compact https-linked signature (under OWA size limits).
   * Never embeds base64 — that triggers "text you typed is too long".
   */
  const openForSafari = async () => {
    setExportError(null);
    setExportNote(null);
    const staffNow = { ...exportStaff, tagline: LOCKED_TAGLINE };
    const absGif = gifUrlForExport(gifUrlOverride);
    setResolvedGifUrl(absGif);

    if (!isAbsoluteHttpUrl(absGif)) {
      setExportError(
        "Safari → OWA needs a full https:// logo URL. Open this app from your live Vercel HTTPS site.",
      );
      return;
    }
    if (/localhost|127\.0\.0\.1/i.test(absGif)) {
      setExportError(
        "Logo URL is localhost — OWA cannot load it. Use your live Vercel HTTPS site.",
      );
      return;
    }

    const signatureHtml = buildSignatureHtmlOwa(staffNow, absGif);
    const sizeKb = Math.round(signatureHtml.length / 102.4) / 10;
    const clipboardHtml = signatureHtml;

    let copiedOk = false;
    try {
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([clipboardHtml], { type: "text/html" }),
            "text/plain": new Blob(
              [
                staffNow.name +
                  "\n" +
                  staffNow.title +
                  "\n" +
                  staffNow.company +
                  "\n" +
                  LOCKED_TAGLINE,
              ],
              { type: "text/plain" },
            ),
          }),
        ]);
        copiedOk = true;
      }
    } catch {
      copiedOk = false;
    }

    const safeAbs = absGif
      .replace(/&/g, "\u0026amp;")
      .replace(/</g, "\u0026lt;")
      .replace(/"/g, "\u0026quot;");

    const doc = [
      "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>ISD Safari → OWA</title>",
      "<style>body{padding:20px;font-family:system-ui,sans-serif;color:#14141a}",
      ".chrome{font-size:13px;color:#5c5c68;max-width:580px;line-height:1.5}",
      ".chrome strong{color:#14141a} code{font-size:11px;word-break:break-all}",
      "#isd-sig{outline:1px dashed #c8c6be;padding:10px;margin-top:12px}",
      "button{margin:8px 8px 0 0;padding:10px 14px;background:#151c94;color:#fff;border:0;border-radius:6px;cursor:pointer;font-size:13px}",
      "</style></head><body>",
      '<p class="chrome"><strong>Safari → OWA</strong> (compact signature ~' +
      String(sizeKb) +
      " KB — under OWA limits)<br>",
      "Do <strong>not</strong> use the desktop Outlook button for OWA (embedded logo is too large).<br><br>",
      (copiedOk
        ? "✓ Compact HTML copied. In OWA: Settings → Signatures → paste (Cmd+V / Ctrl+V) → Save."
        : "Click <strong>Copy for Safari → OWA</strong>, then paste in OWA Signatures.") +
      "<br>Logo URL: <code>" +
      safeAbs +
      "</code></p>",
      '<button type="button" id="copy-btn">Copy for Safari → OWA</button>',
      '<div id="isd-sig">' + signatureHtml + "</div>",
      "<script>(function(){",
      "  var html = " + JSON.stringify(clipboardHtml) + ";",
      "  async function doCopy(){",
      "    try {",
      "      if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {",
      "        await navigator.clipboard.write([new ClipboardItem({",
      "          'text/html': new Blob([html], {type:'text/html'}),",
      "          'text/plain': new Blob([document.getElementById('isd-sig').innerText], {type:'text/plain'})",
      "        })]);",
      "        document.getElementById('copy-btn').textContent = 'Copied — paste in OWA';",
      "        return;",
      "      }",
      "    } catch(e) {}",
      "    alert('Copy blocked. Select the signature box carefully and Cmd+C — if OWA says too long, use Copy button only (not full-page select).');",
      "  }",
      "  document.getElementById('copy-btn').onclick = doCopy;",
      "  doCopy();",
      "})();</script></body></html>",
    ].join("");

    const w = window.open("", "_blank");
    if (!w) {
      setExportNote(
        copiedOk
          ? "Compact OWA signature copied (~" +
              sizeKb +
              " KB). Paste in OWA Settings → Signatures."
          : "Allow pop-ups for the Safari helper.",
      );
      return;
    }
    w.document.open();
    w.document.write(doc);
    w.document.close();
    setExportNote(
      "Safari → OWA ready (compact https logo, ~" +
        sizeKb +
        " KB). Paste in OWA Signatures. Do not use desktop Outlook export for OWA.",
    );
  };

  /**
   * Edge → OWA: compact https HTML via Clipboard API (string only).
   * Avoid copying from a painted DOM — Edge turns images into huge base64 and OWA rejects it.
   */
  const openForEdge = async () => {
    setExportError(null);
    setExportNote(null);
    const staffNow = { ...exportStaff, tagline: LOCKED_TAGLINE };
    const absGif = gifUrlForExport(gifUrlOverride);
    setResolvedGifUrl(absGif);

    if (!isAbsoluteHttpUrl(absGif)) {
      setExportError(
        "Edge → OWA needs a full https:// logo URL. Open this app from your live Vercel HTTPS site.",
      );
      return;
    }
    if (/localhost|127\.0\.0\.1/i.test(absGif)) {
      setExportError(
        "Logo URL is localhost — Edge/OWA cannot load it. Use your live Vercel HTTPS site.",
      );
      return;
    }

    const signatureHtml = buildSignatureHtmlOwa(staffNow, absGif);
    const sizeKb = Math.round(signatureHtml.length / 102.4) / 10;
    // Plain string only — never re-serialize a live <img> (base64 explosion in Edge)
    const clipboardHtml = signatureHtml;

    let copiedOk = false;
    try {
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([clipboardHtml], { type: "text/html" }),
            "text/plain": new Blob(
              [
                staffNow.name +
                  "\n" +
                  staffNow.title +
                  "\n" +
                  staffNow.company +
                  "\n" +
                  LOCKED_TAGLINE,
              ],
              { type: "text/plain" },
            ),
          }),
        ]);
        copiedOk = true;
      }
    } catch {
      copiedOk = false;
    }

    const safeAbs = absGif
      .replace(/&/g, "\u0026amp;")
      .replace(/</g, "\u0026lt;")
      .replace(/"/g, "\u0026quot;");

    const doc = [
      "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>ISD Edge → OWA</title>",
      "<style>body{padding:20px;font-family:system-ui,sans-serif;color:#14141a}",
      ".chrome{font-size:13px;color:#5c5c68;max-width:620px;line-height:1.5}",
      ".chrome strong{color:#14141a}.chrome ol{margin:8px 0 0 1.2em}",
      ".ok{color:#0a7a32;font-weight:600} code{font-size:11px;word-break:break-all}",
      "#preview{outline:2px solid #151c94;padding:12px;margin-top:12px;background:#fafafa}",
      "button{margin:8px 8px 0 0;padding:10px 14px;background:#151c94;color:#fff;border:0;border-radius:6px;cursor:pointer;font-size:13px}",
      "button.secondary{background:#5c5c68}",
      ".warn{color:#9a3412;margin-top:10px}",
      "</style></head><body>",
      '<p class="chrome"><strong>Microsoft Edge → OWA</strong> (compact ~' +
      String(sizeKb) +
      " KB)<br>",
      "OWA error <em>“text you typed is too long”</em> happens when the signature includes a huge embedded image. ",
      "This export uses a short https logo link only.",
      "<ol>",
      "<li>Click <strong>Copy compact signature</strong> (uses the small HTML string, not a screenshot of the page).</li>",
      "<li>In <strong>Edge</strong>, open OWA → Settings → Signatures.</li>",
      "<li><strong>Clear</strong> any previous signature (old paste may still be oversized).</li>",
      "<li>Ctrl+V → Save.</li>",
      "<li>Do <strong>not</strong> use “Open for Outlook (desktop)” for OWA.</li>",
      "<li>Do <strong>not</strong> Ctrl+A the preview box (Edge can re-embed the GIF as megabytes of text).</li>",
      "</ol>",
      (copiedOk
        ? '<span class="ok">✓ Compact signature copied (~' +
          String(sizeKb) +
          " KB) — paste into a cleared OWA signature field.</span>"
        : "Click <strong>Copy compact signature</strong> below.") +
      "<br>Logo: <code>" +
      safeAbs +
      "</code></p>",
      '<button type="button" id="copy-btn">Copy compact signature</button>',
      '<p class="warn" id="msg"></p>',
      '<div id="preview"><p class="chrome" style="margin:0 0 8px">Preview only — do not Ctrl+A this box for OWA:</p>' +
      signatureHtml +
      "</div>",
      "<script>(function(){",
      "  var html = " + JSON.stringify(clipboardHtml) + ";",
      "  async function doCopy(){",
      "    var btn = document.getElementById('copy-btn');",
      "    var msg = document.getElementById('msg');",
      "    try {",
      "      if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {",
      "        await navigator.clipboard.write([new ClipboardItem({",
      "          'text/html': new Blob([html], {type:'text/html'}),",
      "          'text/plain': new Blob(['ISD signature'], {type:'text/plain'})",
      "        })]);",
      "        if (btn) btn.textContent = 'Copied (~' + Math.round(html.length/102.4)/10 + ' KB) — Ctrl+V in OWA';",
      "        if (msg) msg.textContent = 'Clipboard holds compact HTML with https logo (not base64). Clear old OWA signature first, then paste.';",
      "        return;",
      "      }",
      "    } catch (e) {}",
      "    if (msg) msg.textContent = 'Automatic copy blocked. In Edge allow clipboard permission, click the button again, or paste after copying from the app.';",
      "    if (btn) btn.textContent = 'Try Copy again';",
      "  }",
      "  document.getElementById('copy-btn').onclick = function(ev){ ev.preventDefault(); doCopy(); };",
      "  doCopy();",
      "})();</script></body></html>",
    ].join("");

    const w = window.open("", "_blank");
    if (!w) {
      setExportNote(
        copiedOk
          ? "Compact Edge→OWA signature copied (~" +
              sizeKb +
              " KB). Clear old OWA signature, then Ctrl+V."
          : "Allow pop-ups for the Edge helper.",
      );
      return;
    }
    w.document.open();
    w.document.write(doc);
    w.document.close();
    setExportNote(
      "Edge → OWA: compact export (~" +
        sizeKb +
        " KB). Clear any old signature in OWA first, then paste. Never use desktop Outlook export in OWA.",
    );
  };


  return (
    <div className="min-h-dvh overflow-x-hidden">
      <header className="border-b border-border bg-bg-elevated">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
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
              className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-sm)] border border-border bg-bg px-2.5 text-[12px] font-medium text-fg transition-colors hover:bg-bg-subtle sm:px-3 sm:text-[12.5px]"
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
              className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-border bg-bg text-fg transition-colors hover:bg-bg-subtle"
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
                  Edit staff details (same form for everyone). Title & tagline:{" "}
                  <strong className="font-medium text-fg">
                    Bold + Italic + ISD Blue
                  </strong>
                  .
                </li>
                <li>
                  <strong className="font-medium text-fg">Desktop Outlook</strong>
                  : Open for Outlook paste → Ctrl+V in Signatures.
                </li>
                <li>
                  <strong className="font-medium text-fg">Safari</strong>
                  : Open for Safari → OWA → Settings → Signatures → paste.
                </li>
                <li>
                  <strong className="font-medium text-fg">Microsoft Edge → OWA</strong>
                  : Open for Edge → OWA; clear old signature; paste compact HTML only.
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
              <div className="mt-5 sm:mt-6">
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
              <div className="mb-3 flex items-center gap-2 sm:mb-4">
                <Mail className="size-4 text-fg-muted" />
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-fg-subtle">
                  Signature preview
                </p>
              </div>
              <div className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-bg">
                <div className="border-b border-border bg-bg-subtle px-3 py-2.5 sm:px-4">
                  <div className="text-[11px] text-fg-subtle">
                    To: customer@company.com
                  </div>
                  <div className="mt-0.5 text-[12px] font-medium text-fg">
                    Re: Project update
                  </div>
                </div>
                <div className="space-y-3 px-3 py-4 text-[13px] leading-relaxed text-fg-muted sm:space-y-4 sm:px-5 sm:py-5">
                  <p>Hi there,</p>
                  <p>
                    Thanks for your note — I've attached the revised
                    schedule.
                  </p>
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
                    className="flex h-10 w-full items-center rounded-[var(--radius-sm)] border border-border bg-bg-subtle px-3 text-[13px] italic font-bold text-[var(--color-isd-blue)]"
                    style={{ fontFamily: sig.font }}
                    aria-readonly="true"
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
                Title & tagline: Bold + Italic + ISD Blue. OWA Safari/Edge use
                a compact https logo (avoids “text too long”). Desktop Outlook
                embeds the logo for the app only.
              </p>
              <label className="mt-4 block">
                <span className="mb-1 flex items-center gap-1.5 text-[11.5px] font-medium text-fg-subtle">
                  <Link2 className="size-3.5" />
                  Public logo GIF URL
                </span>
                <input
                  type="url"
                  placeholder="Auto: this site + /isd-motion-logo.gif"
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
                  src={MOTION_GIF_PATH + "?v=title-tag"}
                  alt="ISD"
                  width={sig.logoW * 2}
                  height={sig.logoH * 2}
                  style={{ background: "transparent" }}
                />
              </div>

              <button
                type="button"
                onClick={openForOutlook}
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-accent text-[13px] font-medium text-accent-fg hover:opacity-90 active:scale-[0.98]"
              >
                <ExternalLink className="size-4" />
                Open for Outlook (desktop) paste
              </button>
              <button
                type="button"
                onClick={openForSafari}
                className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-isd-blue)] bg-bg text-[13px] font-medium text-[var(--color-isd-blue)] hover:bg-[color-mix(in_oklab,var(--color-isd-blue)_8%,white)] active:scale-[0.98]"
              >
                <Globe className="size-4" />
                Open for Safari Web browser use
              </button>
              <button
                type="button"
                onClick={openForEdge}
                className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-isd-blue)] bg-bg text-[13px] font-medium text-[var(--color-isd-blue)] hover:bg-[color-mix(in_oklab,var(--color-isd-blue)_8%,white)] active:scale-[0.98]"
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
                <p className="mt-3 text-[12px] text-fg-muted">{exportNote}</p>
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

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/>/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;");
}


/**
 * Compact signature for OWA (Safari/Edge). https logo only; minimal markup.
 * Avoids OWA "text you typed is too long" (base64 / heavy HTML).
 */
function buildSignatureHtmlOwa(staff: StaffInfo, gifUrl: string) {
  if (gifUrl.startsWith("data:")) {
    throw new Error("OWA export must use an https logo URL, not an embedded image");
  }
  const name = escapeHtml(staff.name);
  const title = escapeHtml(staff.title);
  const company = escapeHtml(staff.company);
  const tagline = escapeHtml(LOCKED_TAGLINE);
  const officeLabel = escapeHtml(staff.officeLabel || "Office");
  const mobileLabel = escapeHtml(staff.mobileLabel || "Mobile");
  const office = escapeHtml(staff.office);
  const mobile = escapeHtml(staff.mobile);
  const gifSrc = escapeHtml(gifUrl);
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
      ";margin-top:" +
      gap +
      'px;line-height:1.15">' +
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
      ";margin-top:" +
      gap +
      'px;line-height:1.15">' +
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
      '"><b>Web:</b> <a href="' +
      escapeHtml(siteHref) +
      '" style="color:' +
      blue +
      '">' +
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
      '"><b>' +
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
      '"><b>' +
      mobileLabel +
      ":</b> " +
      mobile +
      "</div>";
  }

  return (
    '<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:' +
    f +
    ";color:" +
    black +
    '"><tr><td style="padding:0">' +
    '<div style="font-family:' +
    f +
    ";font-size:" +
    n +
    ";font-weight:bold;color:" +
    black +
    ';line-height:1.15">' +
    name +
    "</div>" +
    titleBlock +
    companyBlock +
    '<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:' +
    mt +
    'px"><tr>' +
    '<td style="vertical-align:middle;padding-right:' +
    pad +
    'px">' +
    '<img src="' +
    gifSrc +
    '" width="' +
    w +
    '" height="' +
    h +
    '" alt="ISD" border="0" style="display:block;border:0;width:' +
    w +
    "px;height:" +
    h +
    'px">' +
    "</td>" +
    '<td style="vertical-align:middle">' +
    contact +
    "</td></tr></table>" +
    '<div style="font-family:' +
    f +
    ";font-size:" +
    n +
    ";font-weight:bold;font-style:italic;color:" +
    blue +
    ";text-align:center;margin-top:" +
    tagMt +
    'px;line-height:1.25">' +
    tagline +
    "</div>" +
    "</td></tr></table>"
  );
}

function buildSignatureHtml(staff: StaffInfo, gifUrl: string) {
  const name = escapeHtml(staff.name);
  const title = escapeHtml(staff.title);
  const company = escapeHtml(staff.company);
  const tagline = escapeHtml(LOCKED_TAGLINE);
  const officeLabel = escapeHtml(staff.officeLabel || "Office");
  const mobileLabel = escapeHtml(staff.mobileLabel || "Mobile");
  const office = escapeHtml(staff.office);
  const mobile = escapeHtml(staff.mobile);
  const gifSrc = escapeHtml(gifUrl);
  const siteHref = staff.website.startsWith("http")
    ? staff.website
    : "https://" + staff.website;
  const siteLabel = escapeHtml(staff.website.replace(/^https?:\/\//, ""));

  const namePt = sig.namePt + "pt";
  const titlePt = sig.titlePt + "pt";
  const contactPt = sig.contactPt + "pt";
  const ff = sig.fontStyle;
  const idGap = sig.identityGap + "px";
  const logoW = String(sig.logoW);
  const logoH = String(sig.logoH);
  const cText = sig.colorText;
  const cBlue = sig.colorBlue;
  const cCompany = sig.colorCompany;
  const cLink = sig.colorLink;
  const transparent = "background:transparent;background-color:transparent;";
  const bold = "font-weight:bold;font-weight:700;";
  const regular = "font-weight:normal;font-weight:400;";

  // Title & tagline: Bold + Italic + ISD Blue
  const accent =
    ff + bold + "font-style:italic;color:" + cBlue + ";";

  const titleBlock = staff.title
    ? '<div class="isd-title" style="' +
      accent +
      "font-size:" +
      titlePt +
      ";margin-top:" +
      idGap +
      ";line-height:1.15;" +
      transparent +
      '"><span style="' +
      accent +
      "font-size:" +
      titlePt +
      ';"><b style="' +
      accent +
      '"><i style="' +
      accent +
      "font-weight:bold;" +
      '">' +
      title +
      "</i></b></span></div>"
    : "";

  const companyBlock = staff.company
    ? '<div style="' +
      ff +
      bold +
      "font-size:" +
      namePt +
      ";color:" +
      cCompany +
      ";margin-top:" +
      idGap +
      ";line-height:1.15;" +
      transparent +
      '"><b style="' +
      ff +
      bold +
      "color:" +
      cCompany +
      ';">' +
      company +
      "</b></div>"
    : "";

  const webRow = staff.website
    ? '<tr><td style="' +
      ff +
      bold +
      "color:" +
      cText +
      ";padding-right:8px;white-space:nowrap;vertical-align:baseline;" +
      transparent +
      '"><b style="' +
      ff +
      bold +
      "color:" +
      cText +
      ';">Web:</b></td><td style="' +
      ff +
      regular +
      "vertical-align:baseline;white-space:nowrap;" +
      transparent +
      '"><a href="' +
      escapeHtml(siteHref) +
      '" style="' +
      ff +
      regular +
      "color:" +
      cLink +
      ';text-decoration:underline;">' +
      siteLabel +
      "</a></td></tr>"
    : "";
  const officeRow = staff.office
    ? '<tr><td style="' +
      ff +
      bold +
      "color:" +
      cText +
      ";padding-right:8px;white-space:nowrap;vertical-align:baseline;" +
      transparent +
      '"><b style="' +
      ff +
      bold +
      "color:" +
      cText +
      ';">' +
      officeLabel +
      ':</b></td><td style="' +
      ff +
      regular +
      "vertical-align:baseline;white-space:nowrap;" +
      transparent +
      '"><a href="tel:' +
      staff.office.replace(/\s/g, "") +
      '" style="' +
      ff +
      regular +
      "color:" +
      cText +
      ';text-decoration:none;">' +
      office +
      "</a></td></tr>"
    : "";
  const mobileRow = staff.mobile
    ? '<tr><td style="' +
      ff +
      bold +
      "color:" +
      cText +
      ";padding-right:8px;white-space:nowrap;vertical-align:baseline;" +
      transparent +
      '"><b style="' +
      ff +
      bold +
      "color:" +
      cText +
      ';">' +
      mobileLabel +
      ':</b></td><td style="' +
      ff +
      regular +
      "vertical-align:baseline;white-space:nowrap;" +
      transparent +
      '"><a href="tel:' +
      staff.mobile.replace(/\s/g, "") +
      '" style="' +
      ff +
      regular +
      "color:" +
      cText +
      ';text-decoration:none;">' +
      mobile +
      "</a></td></tr>"
    : "";

  const taglineBlock =
    '<div class="isd-tagline" style="' +
    accent +
    "margin-top:" +
    sig.tagMt +
    "px;font-size:" +
    namePt +
    ";letter-spacing:0.02em;text-align:center;line-height:1.25;" +
    transparent +
    '"><span style="' +
    accent +
    "font-size:" +
    namePt +
    ';"><b style="' +
    accent +
    '"><i style="' +
    accent +
    "font-weight:bold;" +
    '">' +
    tagline +
    "</i></b></span></div>";

  return [
    "<!-- " +
      APP_NAME +
      " — Title/Tagline: Bold Italic ISD Blue -->",
    '<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;' +
      ff +
      "color:" +
      cText +
      ";" +
      transparent +
      '">',
    "  <tr>",
    '    <td style="padding:0;' +
      ff +
      "color:" +
      cText +
      ";" +
      transparent +
      '">',
    '      <div style="' +
      ff +
      bold +
      "font-size:" +
      namePt +
      ";color:" +
      cText +
      ";line-height:1.15;" +
      transparent +
      '"><b style="' +
      ff +
      bold +
      "color:" +
      cText +
      ';">' +
      name +
      "</b></div>",
    "      " + titleBlock,
    "      " + companyBlock,
    '      <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:' +
      sig.blockMt +
      "px;" +
      ff +
      "color:" +
      cText +
      ";" +
      transparent +
      '">',
    "        <tr>",
    '          <td style="vertical-align:middle;padding-right:' +
      sig.logoPad +
      "px;width:" +
      (sig.logoW + 4) +
      "px;" +
      transparent +
      '">',
    '            <img src="' +
      gifSrc +
      '" width="' +
      logoW +
      '" height="' +
      logoH +
      '" alt="ISD" border="0" style="display:block;width:' +
      logoW +
      "px;height:" +
      logoH +
      'px;border:0;outline:none;background:transparent;-ms-interpolation-mode:bicubic;" />',
    "          </td>",
    '          <td style="vertical-align:middle;' +
      ff +
      "color:" +
      cText +
      ";" +
      transparent +
      '">',
    '            <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:' +
      contactPt +
      ";line-height:1.55;" +
      ff +
      "color:" +
      cText +
      ";" +
      transparent +
      '">',
    "              " + webRow,
    "              " + officeRow,
    "              " + mobileRow,
    "            </table>",
    "          </td>",
    "        </tr>",
    "      </table>",
    "      " + taglineBlock,
    "    </td>",
    "  </tr>",
    "</table>",
  ].join("\n");
}
