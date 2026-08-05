import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { IsdLogo } from "@/components/IsdLogo";
import { APP_NAME } from "@/lib/branding";

export const Route = createFileRoute("/motion")({
  component: MotionMarkPage,
  head: () => ({
    meta: [
      { title: "ISD Motion Mark | " + APP_NAME },
      {
        name: "description",
        content:
          "Living ISD brand mark — CSS orbit and spin animation for web. Use the static mark in email signatures.",
      },
    ],
  }),
});

function MotionMarkPage() {
  return (
    <div className="min-h-dvh bg-[var(--color-bg,#f6f5f2)] text-[var(--color-fg,#14141a)]">
      <header className="border-b border-black/10 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#151c94] hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            Signature builder
          </Link>
          <span className="text-[12px] text-black/50">ISD Motion Mark</span>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col items-center px-4 py-12 sm:py-16">
        <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[#151c94]">
          The I.S. Department
        </p>
        <h1 className="text-center text-[22px] font-semibold tracking-tight sm:text-[26px]">
          Motion Mark
        </h1>
        <p className="mt-2 max-w-md text-center text-[14px] leading-relaxed text-black/60">
          Full orbit and spin animation on the web. Your email signature uses a
          secure static mark and links here for the living brand moment.
        </p>

        <div
          className="mt-10 flex w-full max-w-lg items-center justify-center rounded-2xl border border-black/10 bg-white px-6 py-12 shadow-sm"
          style={{
            backgroundImage:
              "linear-gradient(45deg,#eee 25%,transparent 25%),linear-gradient(-45deg,#eee 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eee 75%),linear-gradient(-45deg,transparent 75%,#eee 75%)",
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0,0 10px,10px -10px,-10px 0",
          }}
        >
          <IsdLogo width={280} duration={5} showLetters={false} />
        </div>

        <p className="mt-8 max-w-md text-center text-[12.5px] leading-relaxed text-black/50">
          ...... Be the Solution ......
          <br />
          CSS animation · no GIF required on this page
        </p>
      </main>
    </div>
  );
}
