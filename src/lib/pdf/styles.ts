import { StyleSheet } from "@react-pdf/renderer";

const NAVY = "#1e293b";
const NAVY_DARK = "#0f172a";
const BLUE = "#3b82f6";
const BLUE_DARK = "#1e3a8a";
const WHITE = "#ffffff";
const GRAY_50 = "#f9fafb";
const GRAY_100 = "#f3f4f6";
const GRAY_200 = "#e5e7eb";
const GRAY_500 = "#6b7280";
const GRAY_700 = "#374151";
const GRAY_900 = "#111827";
const GREEN_50 = "#f0fdf4";
const GREEN_100 = "#dcfce7";
const GREEN_700 = "#15803d";
const GREEN_800 = "#166534";
const RED_50 = "#fef2f2";
const RED_100 = "#fee2e2";
const RED_700 = "#b91c1c";
const RED_800 = "#991b1b";
const ORANGE_600 = "#ea580c";
const ORANGE_100 = "#fed7aa";
const ORANGE_800 = "#92400e";
const PURPLE_100 = "#e9d5ff";
const PURPLE_800 = "#581c87";
const TEAL_50 = "#f0fdfa";
const TEAL_800 = "#115e59";
const AMBER_200 = "#fde68a";

export const colors = {
  NAVY, NAVY_DARK, BLUE, BLUE_DARK, WHITE,
  GRAY_50, GRAY_100, GRAY_200, GRAY_500, GRAY_700, GRAY_900,
  GREEN_50, GREEN_100, GREEN_700, GREEN_800,
  RED_50, RED_100, RED_700, RED_800,
  ORANGE_600, ORANGE_100, ORANGE_800,
  PURPLE_100, PURPLE_800,
  TEAL_50, TEAL_800,
  AMBER_200,
};

export const s = StyleSheet.create({
  // ── Page ──
  page: {
    padding: 36,
    backgroundColor: WHITE,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: GRAY_900,
  },

  // ── Header ──
  headerBand: {
    backgroundColor: NAVY_DARK,
    marginHorizontal: -36,
    marginTop: -36,
    paddingHorizontal: 36,
    paddingVertical: 28,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: WHITE,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: BLUE,
    marginBottom: 10,
  },
  headerDate: {
    fontSize: 9,
    color: GRAY_500,
  },

  // ── Section titles ──
  sectionHeader: {
    backgroundColor: NAVY,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 0,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: "bold",
    color: WHITE,
  },
  sectionBody: {
    border: `1 solid ${GRAY_200}`,
    borderTop: "none",
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    padding: 16,
    marginBottom: 18,
  },

  // ── Banner ──
  banner: {
    backgroundColor: NAVY,
    borderRadius: 8,
    paddingVertical: 22,
    paddingHorizontal: 24,
    marginBottom: 18,
    alignItems: "center",
  },
  bannerLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: AMBER_200,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  bannerValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: WHITE,
    marginBottom: 6,
  },
  bannerCaption: {
    fontSize: 9,
    color: GRAY_500,
    textAlign: "center",
  },

  // ── Cards / KPI ──
  row: {
    flexDirection: "row",
    gap: 10,
  },
  col: {
    flex: 1,
  },
  card: {
    backgroundColor: GRAY_50,
    border: `1 solid ${GRAY_200}`,
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: GRAY_500,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: GRAY_900,
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 8,
    color: GRAY_500,
  },

  // ── Table ──
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: NAVY,
    paddingVertical: 7,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: "bold",
    color: WHITE,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottom: `1 solid ${GRAY_200}`,
  },
  tableRowAlt: {
    backgroundColor: GRAY_50,
  },
  tableCell: {
    fontSize: 8,
    color: GRAY_900,
  },

  // ── Badges ──
  badge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 7,
    fontWeight: "bold",
    marginRight: 3,
    marginBottom: 2,
  },
  badgeGreen: { backgroundColor: GREEN_100, color: GREEN_800 },
  badgeOrange: { backgroundColor: ORANGE_100, color: ORANGE_800 },
  badgePurple: { backgroundColor: PURPLE_100, color: PURPLE_800 },
  badgeTeal: { backgroundColor: TEAL_50, color: TEAL_800 },
  badgeBlue: { backgroundColor: "#dbeafe", color: BLUE_DARK },

  // ── Before/After ──
  beforeCard: {
    flex: 1,
    border: `2 solid ${RED_100}`,
    backgroundColor: RED_50,
    borderRadius: 6,
    padding: 14,
  },
  afterCard: {
    flex: 1,
    border: `2 solid ${GREEN_100}`,
    backgroundColor: GREEN_50,
    borderRadius: 6,
    padding: 14,
  },

  // ── Diagnostic scale ──
  scaleRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  scaleSegment: {
    height: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  scaleLabel: {
    fontSize: 7,
    fontWeight: "bold",
    color: WHITE,
  },

  // ── Benefits grid ──
  benefitItem: {
    flexDirection: "row",
    marginBottom: 10,
    gap: 8,
  },
  benefitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ORANGE_600,
    marginTop: 3,
  },
  benefitTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: ORANGE_600,
    marginBottom: 2,
  },
  benefitText: {
    fontSize: 8,
    color: GRAY_700,
    lineHeight: 1.4,
  },

  // ── Confidentiality ──
  confidentialityBox: {
    backgroundColor: "#eff6ff",
    borderLeft: `4 solid ${BLUE_DARK}`,
    padding: 14,
    marginBottom: 14,
    borderRadius: 4,
  },
  confidentialityTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: BLUE_DARK,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  confidentialityText: {
    fontSize: 8,
    color: GRAY_900,
    lineHeight: 1.6,
  },

  // ── Timeline ──
  timelineRow: {
    flexDirection: "row",
    borderBottom: `1 solid ${GRAY_200}`,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  timelineStep: {
    width: 60,
    fontSize: 9,
    fontWeight: "bold",
    color: GRAY_900,
  },
  timelineDesc: {
    flex: 1,
    fontSize: 9,
    color: GRAY_700,
  },
  timelineDuration: {
    width: 50,
    fontSize: 9,
    fontWeight: "bold",
    color: GRAY_900,
    textAlign: "right",
  },

  // ── Misc ──
  mb4: { marginBottom: 4 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  mb16: { marginBottom: 16 },
  mb20: { marginBottom: 20 },
  textCenter: { textAlign: "center" },
  textRight: { textAlign: "right" },
  textBold: { fontWeight: "bold" },
  textSmall: { fontSize: 8 },
  textXs: { fontSize: 7 },
});
