import type { CSSProperties } from "react";

type IsdLogoProps = {
  duration?: number;
  width?: number;
  showLetters?: boolean;
  className?: string;
  static?: boolean;
};

/**
 * Sharp rectangles with thin black perimeter: settled open →
 * 180° orbit → spin cleanly into final pose.
 */
export function IsdLogo({
  duration = 5,
  width = 160,
  showLetters = true,
  className = "",
  static: isStatic = false,
}: IsdLogoProps) {
  const height = Math.round(width * (50 / 92));
  const stageStyle = {
    width,
    height,
    ["--loop"]: isStatic ? "0s" : `${duration}s`,
  } as CSSProperties;

  return (
    <div
      className={`inline-flex flex-col items-stretch ${className}`}
      style={{ width }}
      data-isd-logo
      role="img"
      aria-label="ISD animated company logo"
    >
      <div className="isd-stage" style={stageStyle}>
        {isStatic ? (
          <StaticBars />
        ) : (
          <>
            <div className="isd-bar isd-bar--yellow" />
            <div className="isd-bar isd-bar--blue-upper" />
            <div className="isd-bar isd-bar--red" />
            <div className="isd-bar isd-bar--blue-lower" />
          </>
        )}
      </div>
      {showLetters ? (
        isStatic ? (
          <div
            className="mt-1.5 flex justify-between px-[6%]"
            style={{
              fontWeight: 700,
              letterSpacing: "0.32em",
              fontSize: "0.7rem",
              lineHeight: 1,
            }}
            aria-hidden
          >
            <span style={{ color: "var(--color-isd-blue)" }}>I</span>
            <span style={{ color: "var(--color-isd-red)" }}>S</span>
            <span style={{ color: "var(--color-isd-blue)" }}>D</span>
          </div>
        ) : (
          <div
            className="isd-letters"
            style={{ ["--loop"]: `${duration}s` } as CSSProperties}
            aria-hidden
          >
            <span>I</span>
            <span>S</span>
            <span>D</span>
          </div>
        )
      ) : null}
    </div>
  );
}

function StaticBars() {
  const bars = [
    {
      left: "2.17%",
      top: "2%",
      w: "27.17%",
      h: "22%",
      bg: "var(--color-isd-yellow)",
    },
    {
      left: "42.39%",
      top: "24%",
      w: "28.26%",
      h: "26%",
      bg: "var(--color-isd-blue)",
    },
    {
      left: "70.65%",
      top: "50%",
      w: "27.17%",
      h: "22%",
      bg: "var(--color-isd-red)",
    },
    {
      left: "28.26%",
      top: "72%",
      w: "28.26%",
      h: "26%",
      bg: "var(--color-isd-blue)",
    },
  ];
  return (
    <>
      {bars.map((b, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            background: b.bg,
            left: b.left,
            top: b.top,
            width: b.w,
            height: b.h,
            borderRadius: 0,
            border: "1px solid #000000",
            boxSizing: "border-box",
          }}
        />
      ))}
    </>
  );
}
