import { IsdLogo } from "./IsdLogo";
import { HtmlLogoMark } from "./HtmlLogoMark";
import { sig } from "@/lib/signatureLayout";

export type StaffInfo = {
  name: string;
  title: string;
  company: string;
  website: string;
  officeLabel: string;
  office: string;
  mobileLabel: string;
  mobile: string;
  tagline: string;
};

type EmailFooterProps = {
  staff: StaffInfo;
  duration: number;
  compact?: boolean;
  className?: string;
  /** css = stage animation; html = static email rectangles; gif/png = image */
  logoMode?: "css" | "html" | "gif" | "static";
  gifUrl?: string;
  motionHref?: string;
};

/**
 * Times New Roman signature.
 * Name: bold black · Job title: italic ISD blue · Company: bold ISD blue ·
 * Tagline: italic ISD blue · Contact labels: bold black.
 */
export function EmailFooter({
  staff,
  duration,
  compact = true,
  className = "",
  logoMode = "css",
  gifUrl,
  motionHref,
}: EmailFooterProps) {
  void compact;
  const logoW = sig.logoW;
  const logoH = sig.logoH;
  const nameSize = `${sig.namePt}pt`;
  const titleSize = `${sig.titlePt}pt`;
  const contactSize = `${sig.contactPt}pt`;
  const fontFamily = sig.font;

  const siteHref = staff.website.startsWith("http")
    ? staff.website
    : `https://${staff.website}`;
  const siteLabel = staff.website.replace(/^https?:\/\//, "");

  return (
    <div
      className={className}
      style={{
        display: "inline-block",
        width: "fit-content",
        maxWidth: "100%",
        padding: "2px 1px",
        fontFamily,
        color: sig.colorText,
        background: "transparent",
        backgroundColor: "transparent",
      }}
    >
      <div
        style={{
          fontFamily,
          fontSize: nameSize,
          fontWeight: sig.weightBold,
          color: sig.colorText,
          lineHeight: 1.15,
          letterSpacing: "-0.01em",
          wordBreak: "break-word",
          background: "transparent",
        }}
      >
        <b style={{ fontWeight: sig.weightBold, fontFamily, color: sig.colorText }}>
          {staff.name}
        </b>
      </div>
      {staff.title ? (
        <div
          style={{
            fontFamily,
            fontSize: titleSize,
            fontStyle: "italic",
            fontWeight: sig.weightBold,
            color: sig.colorBlue,
            marginTop: sig.identityGap,
            lineHeight: 1.15,
            wordBreak: "break-word",
            background: "transparent",
          }}
        >
          <b
            style={{
              fontFamily,
              fontWeight: sig.weightBold,
              fontStyle: "italic",
              color: sig.colorBlue,
            }}
          >
            <i
              style={{
                fontFamily,
                fontWeight: sig.weightBold,
                fontStyle: "italic",
                color: sig.colorBlue,
              }}
            >
              {staff.title}
            </i>
          </b>
        </div>
      ) : null}
      {staff.company ? (
        <div
          style={{
            fontFamily,
            fontSize: nameSize,
            fontWeight: sig.weightBold,
            color: sig.colorCompany,
            marginTop: sig.identityGap,
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
            wordBreak: "break-word",
            background: "transparent",
          }}
        >
          <b
            style={{
              fontWeight: sig.weightBold,
              fontFamily,
              color: sig.colorCompany,
            }}
          >
            {staff.company}
          </b>
        </div>
      ) : null}

      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        style={{
          borderCollapse: "collapse",
          marginTop: sig.blockMt,
          background: "transparent",
          backgroundColor: "transparent",
          fontFamily,
          color: sig.colorText,
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                verticalAlign: "middle",
                paddingRight: sig.logoPad,
                width: logoW + 4,
                background: "transparent",
                backgroundColor: "transparent",
              }}
            >
              {logoMode === "html" ? (
                <HtmlLogoMark
                  width={logoW}
                  height={logoH}
                  href={motionHref}
                />
              ) : logoMode === "gif" || logoMode === "static" ? (
                gifUrl ? (
                  <a
                    href={motionHref || undefined}
                    target={motionHref ? "_blank" : undefined}
                    rel={motionHref ? "noopener noreferrer" : undefined}
                    style={{ display: "inline-block", border: 0 }}
                  >
                    <img
                      src={gifUrl}
                      width={logoW}
                      height={logoH}
                      alt="ISD"
                      style={{
                        display: "block",
                        border: 0,
                        background: "transparent",
                      }}
                    />
                  </a>
                ) : (
                  <HtmlLogoMark width={logoW} height={logoH} href={motionHref} />
                )
              ) : (
                <IsdLogo
                  width={logoW}
                  duration={duration}
                  showLetters={false}
                />
              )}
            </td>
            <td
              style={{
                verticalAlign: "middle",
                background: "transparent",
                backgroundColor: "transparent",
                fontFamily,
                color: sig.colorText,
              }}
            >
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                style={{
                  borderCollapse: "collapse",
                  fontSize: contactSize,
                  lineHeight: 1.55,
                  fontFamily,
                  color: sig.colorText,
                  background: "transparent",
                  backgroundColor: "transparent",
                }}
              >
                <tbody>
                  {staff.website ? (
                    <tr>
                      <td
                        style={{
                          fontFamily,
                          fontWeight: sig.weightBold,
                          color: sig.colorText,
                          paddingRight: 8,
                          whiteSpace: "nowrap",
                          verticalAlign: "baseline",
                          width: sig.labelW,
                          background: "transparent",
                        }}
                      >
                        <b
                          style={{
                            fontFamily,
                            fontWeight: sig.weightBold,
                            color: sig.colorText,
                          }}
                        >
                          Web:
                        </b>
                      </td>
                      <td
                        style={{
                          fontFamily,
                          fontWeight: sig.weightRegular,
                          verticalAlign: "baseline",
                          whiteSpace: "nowrap",
                          background: "transparent",
                        }}
                      >
                        <a
                          href={siteHref}
                          style={{
                            fontFamily,
                            fontWeight: sig.weightRegular,
                            color: sig.colorLink,
                            textDecoration: "underline",
                          }}
                        >
                          {siteLabel}
                        </a>
                      </td>
                    </tr>
                  ) : null}
                  {staff.office ? (
                    <tr>
                      <td
                        style={{
                          fontFamily,
                          fontWeight: sig.weightBold,
                          color: sig.colorText,
                          paddingRight: 8,
                          whiteSpace: "nowrap",
                          verticalAlign: "baseline",
                          background: "transparent",
                        }}
                      >
                        <b
                          style={{
                            fontFamily,
                            fontWeight: sig.weightBold,
                            color: sig.colorText,
                          }}
                        >
                          {staff.officeLabel || "Office"}:
                        </b>
                      </td>
                      <td
                        style={{
                          fontFamily,
                          fontWeight: sig.weightRegular,
                          color: sig.colorText,
                          verticalAlign: "baseline",
                          whiteSpace: "nowrap",
                          background: "transparent",
                        }}
                      >
                        <a
                          href={`tel:${staff.office.replace(/\s/g, "")}`}
                          style={{
                            fontFamily,
                            fontWeight: sig.weightRegular,
                            color: sig.colorText,
                            textDecoration: "none",
                          }}
                        >
                          {staff.office}
                        </a>
                      </td>
                    </tr>
                  ) : null}
                  {staff.mobile ? (
                    <tr>
                      <td
                        style={{
                          fontFamily,
                          fontWeight: sig.weightBold,
                          color: sig.colorText,
                          paddingRight: 8,
                          whiteSpace: "nowrap",
                          verticalAlign: "baseline",
                          background: "transparent",
                        }}
                      >
                        <b
                          style={{
                            fontFamily,
                            fontWeight: sig.weightBold,
                            color: sig.colorText,
                          }}
                        >
                          {staff.mobileLabel || "Mobile"}:
                        </b>
                      </td>
                      <td
                        style={{
                          fontFamily,
                          fontWeight: sig.weightRegular,
                          color: sig.colorText,
                          verticalAlign: "baseline",
                          whiteSpace: "nowrap",
                          background: "transparent",
                        }}
                      >
                        <a
                          href={`tel:${staff.mobile.replace(/\s/g, "")}`}
                          style={{
                            fontFamily,
                            fontWeight: sig.weightRegular,
                            color: sig.colorText,
                            textDecoration: "none",
                          }}
                        >
                          {staff.mobile}
                        </a>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      {staff.tagline ? (
        <table
          role="presentation"
          cellPadding={0}
          cellSpacing={0}
          style={{
            borderCollapse: "collapse",
            border: 0,
            width: "100%",
            marginTop: sig.tagMt,
            background: "transparent",
          }}
        >
          <tbody>
            <tr>
              <td
                align="center"
                style={{
                  border: 0,
                  padding: 0,
                  textAlign: "center",
                  fontFamily,
                  fontSize: nameSize,
                  fontStyle: "italic",
                  fontWeight: sig.weightBold,
                  color: sig.colorBlue,
                  letterSpacing: "0.02em",
                  lineHeight: 1.25,
                  background: "transparent",
                }}
              >
                {staff.tagline}
              </td>
            </tr>
          </tbody>
        </table>
      ) : null}
    </div>
  );
}
