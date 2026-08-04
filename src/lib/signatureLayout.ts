/**
 * Email signature typography — Times New Roman throughout.
 * Name + company: bold black · Job title: italic ISD blue ·
 * Tagline: bold ISD blue · Contact labels: bold Times New Roman black.
 */

const PREV_NAME = 18;
const PREV_TITLE = 14;
const PREV_CONTACT = 12.5;
const PREV_LOGO_W = 72;
const PREV_LOGO_PAD = 16;
const PREV_LABEL_W = 88;
const PREV_BLOCK_MT = 7;
const PREV_TAG_MT = 16;
const PREV_ID_GAP = 1.5;

export const SIGNATURE_SCALE = 12 / PREV_NAME;

export const SIGNATURE_FONT = '"Times New Roman", Times, serif';

export const SIGNATURE_FONT_STYLE =
  'font-family:"Times New Roman",Times,serif;mso-fareast-font-family:"Times New Roman";mso-bidi-font-family:"Times New Roman";';

export const COLOR_TEXT = "#14141a";
export const COLOR_BLUE = "#151c94";
export const COLOR_LINK = "#151c94";

export const WEIGHT_BOLD = 700;
export const WEIGHT_REGULAR = 400;

export const NAME_PT = 12;
export const TITLE_PT =
  Math.round((PREV_TITLE / PREV_NAME) * NAME_PT * 100) / 100;
export const CONTACT_PT =
  Math.round((PREV_CONTACT / PREV_NAME) * NAME_PT * 100) / 100;

export const LOGO_WIDTH = Math.round(PREV_LOGO_W * SIGNATURE_SCALE);
export const LOGO_HEIGHT = Math.round(LOGO_WIDTH * (44 / 80));
export const LOGO_CELL_PAD = Math.round(PREV_LOGO_PAD * SIGNATURE_SCALE);
export const LABEL_WIDTH = Math.round(PREV_LABEL_W * SIGNATURE_SCALE);
export const BLOCK_MARGIN_TOP = Math.round(PREV_BLOCK_MT * SIGNATURE_SCALE);
export const TAGLINE_MARGIN_TOP = Math.round(PREV_TAG_MT * SIGNATURE_SCALE);
export const IDENTITY_GAP = Math.round(PREV_ID_GAP * SIGNATURE_SCALE * 10) / 10;

export const sig = {
  font: SIGNATURE_FONT,
  fontStyle: SIGNATURE_FONT_STYLE,
  namePt: NAME_PT,
  titlePt: TITLE_PT,
  contactPt: CONTACT_PT,
  logoW: LOGO_WIDTH,
  logoH: LOGO_HEIGHT,
  logoPad: LOGO_CELL_PAD,
  labelW: LABEL_WIDTH,
  blockMt: BLOCK_MARGIN_TOP,
  tagMt: TAGLINE_MARGIN_TOP,
  identityGap: IDENTITY_GAP,
  colorText: COLOR_TEXT,
  colorBlue: COLOR_BLUE,
  colorLink: COLOR_LINK,
  colorCompany: COLOR_TEXT,
  weightBold: WEIGHT_BOLD,
  weightRegular: WEIGHT_REGULAR,
} as const;
