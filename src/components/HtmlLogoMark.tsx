/** Preview of the email-safe static HTML ISD mark. */
export function HtmlLogoMark({
  width = 48,
  height = 26,
  href,
}: {
  width?: number;
  height?: number;
  href?: string;
}) {
  const VIEW_W = 184;
  const VIEW_H = 100;
  const bars = [
    { color: "#fbfa1c", x: 4, y: 2, w: 50, h: 22 },
    { color: "#151c94", x: 78, y: 24, w: 52, h: 26 },
    { color: "#ae0708", x: 130, y: 50, w: 50, h: 22 },
    { color: "#151c94", x: 52, y: 72, w: 52, h: 26 },
  ];
  const sx = width / VIEW_W;
  const sy = height / VIEW_H;
  const mark = (
    <div
      style={{
        position: "relative",
        width,
        height,
        display: "inline-block",
        flexShrink: 0,
      }}
      aria-label="ISD logo"
      role="img"
    >
      {bars.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.x * sx,
            top: b.y * sy,
            width: b.w * sx,
            height: b.h * sy,
            background: b.color,
            border: "1px solid #000",
            boxSizing: "border-box",
          }}
        />
      ))}
    </div>
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" title="ISD Motion Mark">
        {mark}
      </a>
    );
  }
  return mark;
}
