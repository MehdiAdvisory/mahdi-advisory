import React from "react";
import {
  Document,
  Page,
  Text,
  View,
} from "@react-pdf/renderer";
import { s, colors } from "./styles";
import type { SimulationResult, EnrichedSalarie } from "../calculations";
import { formatEuro } from "../calculations";
import type { PdfConfigValues } from "../supabase/types";

// ── Helpers ──

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <View wrap={false}>
      <View style={s.sectionHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {icon && (
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 4,
                width: 22,
                height: 22,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 12 }}>{icon}</Text>
            </View>
          )}
          <Text style={s.sectionHeaderText}>{title}</Text>
        </View>
      </View>
      <View style={s.sectionBody}>{children}</View>
    </View>
  );
}

function KpiCard({
  label,
  value,
  sub,
  bg,
  textColor,
}: {
  label: string;
  value: string;
  sub: string;
  bg?: string;
  textColor?: string;
}) {
  return (
    <View
      style={[
        s.card,
        s.col,
        bg ? { backgroundColor: bg, borderColor: bg } : {},
      ]}
    >
      <Text style={[s.cardLabel, textColor ? { color: textColor } : {}]}>
        {label}
      </Text>
      <Text style={[s.cardValue, textColor ? { color: textColor } : {}]}>
        {value}
      </Text>
      <Text style={[s.cardSub, textColor ? { color: textColor } : {}]}>
        {sub}
      </Text>
    </View>
  );
}

function Badge({
  text,
  variant,
}: {
  text: string;
  variant: "green" | "orange" | "purple" | "teal" | "blue";
}) {
  const variantStyle = {
    green: s.badgeGreen,
    orange: s.badgeOrange,
    purple: s.badgePurple,
    teal: s.badgeTeal,
    blue: s.badgeBlue,
  }[variant];
  return <Text style={[s.badge, variantStyle]}>{text}</Text>;
}

function ContractBadge({ contrat }: { contrat: string }) {
  const variant =
    contrat === "CDI"
      ? "blue"
      : contrat === "CDD"
        ? "purple"
        : contrat === "Alternance"
          ? "green"
          : "orange";
  return <Badge text={contrat} variant={variant} />;
}

// ── DPE-style diagnostic (3 vertical columns) ──

const DPE_SEGMENTS = [
  { label: "A", color: "#22c55e" },
  { label: "B", color: "#84cc16" },
  { label: "C", color: "#eab308" },
  { label: "D", color: "#f97316" },
  { label: "E", color: "#ef4444" },
  { label: "F", color: "#dc2626" },
  { label: "G", color: "#991b1b" },
];

function getCostSegmentIndex(value: number, thresholds: number[]): number {
  for (let i = 0; i < thresholds.length; i++) {
    if (value <= thresholds[i]) return i;
  }
  return 6;
}

function getEconomySegmentIndex(value: number, thresholds: number[]): number {
  for (let i = 0; i < thresholds.length; i++) {
    if (value >= thresholds[i]) return i;
  }
  return 6;
}

function DpeColumn({
  title,
  activeIndex,
  activeValue,
  icon,
}: {
  title: string;
  activeIndex: number;
  activeValue: string;
  icon: string;
}) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={{ fontSize: 7, fontWeight: "bold", color: colors.GRAY_700, textAlign: "center", marginBottom: 6 }}>
        {icon} {title}
      </Text>
      {DPE_SEGMENTS.map((seg, i) => {
        const isActive = i === activeIndex;
        return (
          <View
            key={seg.label}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 2,
              width: "100%",
              paddingHorizontal: 4,
            }}
          >
            <View
              style={{
                width: 18,
                height: 14,
                backgroundColor: seg.color,
                borderRadius: 2,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 7, fontWeight: "bold", color: "#fff" }}>
                {seg.label}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                height: 14,
                marginLeft: 3,
                backgroundColor: isActive ? seg.color : colors.GRAY_100,
                borderRadius: 2,
                justifyContent: "center",
                paddingHorizontal: 4,
              }}
            >
              {isActive && (
                <Text style={{ fontSize: 6, fontWeight: "bold", color: "#fff" }}>
                  {activeValue}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function DiagnosticFinancier({
  coutActuel,
  economie100,
  economieNetteTotale,
  cfg,
}: {
  coutActuel: number;
  economie100: number;
  economieNetteTotale: number;
  cfg: PdfConfigValues;
}) {
  const idxActuel = getCostSegmentIndex(coutActuel, cfg.cost_thresholds);
  const idxEco100 = getEconomySegmentIndex(economie100, cfg.economy_thresholds);
  const idxTotal = getEconomySegmentIndex(economieNetteTotale, cfg.economy_thresholds);

  return (
    <View style={{ marginBottom: 18 }} wrap={false}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "bold",
          color: colors.GRAY_900,
          textAlign: "center",
          marginBottom: 14,
        }}
      >
        Diagnostic Financier
      </Text>

      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <DpeColumn
          title="Situation Actuelle"
          activeIndex={idxActuel}
          activeValue={formatEuro(coutActuel)}
          icon="📊"
        />
        <DpeColumn
          title={"Économie validée\n(100% éligible)"}
          activeIndex={idxEco100}
          activeValue={formatEuro(economie100)}
          icon="✅"
        />
        <DpeColumn
          title={"Économie totale estimée\n(sous réserve de validation)"}
          activeIndex={idxTotal}
          activeValue={formatEuro(economieNetteTotale)}
          icon="🎯"
        />
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: "#f97316",
            borderRadius: 6,
            padding: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 7, fontWeight: "bold", color: "#fff", textTransform: "uppercase", marginBottom: 4 }}>
            Économie validée (100%)
          </Text>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#fff" }}>
            {formatEuro(economie100)}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: "#22c55e",
            borderRadius: 6,
            padding: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 7, fontWeight: "bold", color: "#fff", textTransform: "uppercase", marginBottom: 4 }}>
            Économie totale estimée
          </Text>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#fff" }}>
            {formatEuro(economieNetteTotale)}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ── Employee table ──

function EmployeeTable({ salaries, cfg }: { salaries: EnrichedSalarie[]; cfg: PdfConfigValues }) {
  const colWidths = {
    name: "22%",
    age: "8%",
    contrat: "13%",
    salaire: "14%",
    augmentation: "16%",
    scenarios: "27%",
  };

  return (
    <View>
      <View style={s.tableHeaderRow}>
        <View style={{ width: colWidths.name }}>
          <Text style={s.tableHeaderCell}>Collaborateur</Text>
        </View>
        <View style={{ width: colWidths.age }}>
          <Text style={[s.tableHeaderCell, s.textCenter]}>Âge</Text>
        </View>
        <View style={{ width: colWidths.contrat }}>
          <Text style={[s.tableHeaderCell, s.textCenter]}>Contrat</Text>
        </View>
        <View style={{ width: colWidths.salaire }}>
          <Text style={[s.tableHeaderCell, s.textCenter]}>Salaire Brut</Text>
        </View>
        <View style={{ width: colWidths.augmentation }}>
          <Text style={[s.tableHeaderCell, s.textCenter]}>
            Augmentation opt.
          </Text>
        </View>
        <View style={{ width: colWidths.scenarios }}>
          <Text style={[s.tableHeaderCell, s.textCenter]}>
            Scénarios d&apos;économie
          </Text>
        </View>
      </View>

      {salaries.map((sal, idx) => {
        const hasAny =
          sal.scenario_100 > 0 ||
          sal.scenario_derogation > 0 ||
          sal.scenario_tuteur > 0;

        return (
          <View
            key={idx}
            style={[s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}]}
            wrap={false}
          >
            <View style={{ width: colWidths.name }}>
              <Text style={s.tableCell}>
                {sal.prenom} {sal.nom}
              </Text>
            </View>
            <View style={{ width: colWidths.age }}>
              <Text style={[s.tableCell, s.textCenter]}>
                {sal.age} ans
              </Text>
            </View>
            <View style={{ width: colWidths.contrat, alignItems: "center" }}>
              <ContractBadge contrat={sal.type_contrat} />
            </View>
            <View style={{ width: colWidths.salaire }}>
              <Text style={[s.tableCell, s.textCenter]}>
                {formatEuro(sal.salaire_brut_mensuel)}
              </Text>
            </View>
            <View
              style={{
                width: colWidths.augmentation,
                backgroundColor: "#fff7ed",
              }}
            >
              {sal.ajustement_salaire > 0 ? (
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 8,
                      fontWeight: "bold",
                      color: colors.ORANGE_800,
                    }}
                  >
                    +{formatEuro(sal.ajustement_salaire)}/mois
                  </Text>
                  <Text style={{ fontSize: 6, color: colors.ORANGE_600 }}>
                    (+{formatEuro(sal.ajustement_annuel)}/an)
                  </Text>
                </View>
              ) : (
                <Text style={[s.tableCell, s.textCenter]}>-</Text>
              )}
            </View>
            <View style={{ width: colWidths.scenarios }}>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {sal.scenario_100 > 0 && (
                  <Badge
                    text={`100%: ${formatEuro(sal.scenario_100)}`}
                    variant="green"
                  />
                )}
                {sal.scenario_derogation > 0 && (
                  <Badge
                    text={`Déroga: ${formatEuro(sal.scenario_derogation)}`}
                    variant="orange"
                  />
                )}
                {sal.scenario_tuteur > 0 && (
                  <Badge
                    text={`Tuteur: ${formatEuro(sal.scenario_tuteur)}`}
                    variant="purple"
                  />
                )}
                {!hasAny && (
                  <Text style={[s.tableCell, s.textCenter]}>-</Text>
                )}
              </View>
            </View>
          </View>
        );
      })}

      {/* Prevention Ergonomique row */}
      <View
        style={[s.tableRow, { backgroundColor: colors.TEAL_50 }]}
        wrap={false}
      >
        <View style={{ width: colWidths.name }}>
          <Text style={[s.tableCell, { fontWeight: "bold", color: colors.TEAL_800 }]}>
            Prévention Ergonomique
          </Text>
          <Text style={{ fontSize: 6, color: colors.TEAL_800 }}>
            (Pré, Diag, sensibilisation)
          </Text>
        </View>
        <View style={{ width: colWidths.age }}>
          <Text style={[s.tableCell, s.textCenter]}>-</Text>
        </View>
        <View style={{ width: colWidths.contrat }}>
          <Text style={[s.tableCell, s.textCenter]}>-</Text>
        </View>
        <View style={{ width: colWidths.salaire }}>
          <Text style={[s.tableCell, s.textCenter]}>-</Text>
        </View>
        <View
          style={{ width: colWidths.augmentation, backgroundColor: "#fff7ed" }}
        >
          <Text style={[s.tableCell, s.textCenter]}>-</Text>
        </View>
        <View style={{ width: colWidths.scenarios }}>
          <View style={{ alignItems: "center" }}>
            <Badge
              text={`100% éligible : ${formatEuro(cfg.prevention_ergonomique)}`}
              variant="teal"
            />
          </View>
        </View>
      </View>
    </View>
  );
}

// ── Impact de l'optimisation ──

function ImpactSection({
  economie100,
  nombreSalaries,
}: {
  economie100: number;
  nombreSalaries: number;
}) {
  const mensuel = economie100 / 12;
  const parSalarie = nombreSalaries > 0 ? economie100 / nombreSalaries : 0;
  const salaireMoyen = nombreSalaries > 0 ? Math.round(economie100 / 2500) : 0;

  return (
    <SectionCard icon="📊" title="Impact de l'optimisation">
      <Text style={{ fontSize: 9, color: colors.GRAY_700, marginBottom: 12 }}>
        Les montants ci-dessous illustrent ce que votre entreprise pourrait
        financer ou renforcer grâce aux économies générées.
      </Text>

      <View style={[s.row, { gap: 8, marginBottom: 14 }]}>
        <View
          style={[
            s.col,
            {
              backgroundColor: colors.NAVY,
              borderRadius: 6,
              padding: 12,
            },
          ]}
        >
          <Text style={{ fontSize: 7, color: "#94a3b8", marginBottom: 4 }}>
            📈 Économie Annuelle
          </Text>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#fff" }}>
            {formatEuro(economie100)}
          </Text>
          <Text style={{ fontSize: 7, color: "#94a3b8" }}>
            Sur les 12 prochains mois
          </Text>
        </View>
        <View
          style={[
            s.col,
            {
              backgroundColor: colors.BLUE,
              borderRadius: 6,
              padding: 12,
            },
          ]}
        >
          <Text style={{ fontSize: 7, color: "#bfdbfe", marginBottom: 4 }}>
            📊 Économie Mensuelle
          </Text>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#fff" }}>
            {formatEuro(mensuel)}
          </Text>
          <Text style={{ fontSize: 7, color: "#bfdbfe" }}>
            Trésorerie améliorée
          </Text>
        </View>
        <View
          style={[
            s.col,
            {
              backgroundColor: colors.GREEN_700,
              borderRadius: 6,
              padding: 12,
            },
          ]}
        >
          <Text style={{ fontSize: 7, color: "#bbf7d0", marginBottom: 4 }}>
            👤 Par Salarié
          </Text>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#fff" }}>
            {formatEuro(parSalarie)}
          </Text>
          <Text style={{ fontSize: 7, color: "#bbf7d0" }}>
            Économie moyenne/tête
          </Text>
        </View>
      </View>

      {/* Concrètement */}
      <View
        style={{
          backgroundColor: colors.NAVY,
          borderRadius: 6,
          padding: 14,
        }}
      >
        <Text
          style={{
            fontSize: 10,
            fontWeight: "bold",
            color: "#fff",
            marginBottom: 10,
          }}
        >
          🎯 Concrètement, cela représente :
        </Text>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <View style={{ flex: 1 }}>
            <BulletPoint
              title={`${formatEuro(mensuel)} / mois de marge supplémentaire`}
              sub="Sans hausse de chiffre d'affaires"
            />
            <BulletPoint
              title={`+${formatEuro(economie100)} / an sur EBITDA`}
              sub="Impact direct sur la rentabilité"
            />
            <BulletPoint
              title="1 recrutement finançable"
              sub="Nouveau collaborateur via l'économie"
            />
            <BulletPoint
              title={`${formatEuro(economie100)} / an d'investissement`}
              sub="Outils, IA, automatisations, amélioration des process"
            />
          </View>
          <View style={{ flex: 1 }}>
            <BulletPoint
              title={`${formatEuro(economie100)} de campagnes d'acquisition`}
              sub="Budget WebAds/Google/Réseaux"
            />
            <BulletPoint
              title={`${salaireMoyen} mois de salaire moyen`}
              sub="Équivalent économisé"
            />
            <BulletPoint
              title="3,2% d'un million d'euros"
              sub="Potentiel d'économies"
            />
            <BulletPoint
              title="ROI atteint en 1 mois"
              sub="Rentabilisé avec notre accompagnement"
            />
          </View>
        </View>
      </View>

      <Text
        style={{
          fontSize: 7,
          color: colors.GRAY_500,
          marginTop: 8,
          lineHeight: 1.4,
          fontStyle: "italic",
        }}
      >
        Les usages présentés constituent des exemples d&apos;utilisation possibles des économies
        générées. Ils relèvent exclusivement des choix du dirigeant et n&apos;engagent en aucun
        cas notre cabinet au-delà de sa mission d&apos;optimisation.
      </Text>
    </SectionCard>
  );
}

function BulletPoint({ title, sub }: { title: string; sub: string }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={{ fontSize: 8, fontWeight: "bold", color: "#fff" }}>
        • {title}
      </Text>
      <Text style={{ fontSize: 6, color: "#94a3b8", marginLeft: 8 }}>
        {sub}
      </Text>
    </View>
  );
}

// ── Timeline visual ──

function TimelineSection({ nomSociete }: { nomSociete: string }) {
  const steps = [
    { num: "1", title: "Validation du dossier", duration: "48H", color: "#22c55e", responsable: "Consultant" },
    { num: "2", title: "Collecte des documents", duration: "72H", color: "#3b82f6", responsable: nomSociete },
    { num: "3", title: "Montage et ingénierie", duration: "96H", color: "#8b5cf6", responsable: "STRATIUM ADVISORY" },
    { num: "4", title: "Activation & acceptation", duration: "22J", color: "#f97316", responsable: "Bureau d'études" },
  ];

  return (
    <SectionCard icon="📅" title="Temporalité de mise en œuvre">
      <Text style={{ fontSize: 9, color: colors.GRAY_500, marginBottom: 14 }}>
        Échéancier prévisionnel et jalons clés de déploiement
      </Text>

      {/* Circles row */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        {steps.map((step, i) => (
          <React.Fragment key={step.num}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: step.color,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "bold", color: "#fff" }}>
                {step.num}
              </Text>
            </View>
            {i < steps.length - 1 && (
              <View
                style={{
                  flex: 1,
                  height: 3,
                  backgroundColor: colors.GRAY_200,
                  marginHorizontal: 4,
                }}
              />
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Step cards */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
        {steps.map((step) => (
          <View
            key={step.num}
            style={{
              flex: 1,
              border: `1 solid ${colors.GRAY_200}`,
              borderRadius: 6,
              padding: 8,
            }}
          >
            <View style={{ height: 3, backgroundColor: step.color, borderRadius: 2, marginBottom: 6 }} />
            <Text style={{ fontSize: 8, fontWeight: "bold", color: colors.GRAY_900, marginBottom: 4 }}>
              {step.title}
            </Text>
            <View
              style={{
                backgroundColor: step.color,
                borderRadius: 4,
                paddingHorizontal: 6,
                paddingVertical: 2,
                alignSelf: "flex-start",
                marginBottom: 6,
              }}
            >
              <Text style={{ fontSize: 7, fontWeight: "bold", color: "#fff" }}>
                {step.duration}
              </Text>
            </View>
            <Text style={{ fontSize: 7, color: colors.GRAY_500 }}>Responsable</Text>
            <Text style={{ fontSize: 7, fontWeight: "bold", color: colors.GRAY_700 }}>
              {step.responsable}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 }}>
        <Text style={{ fontSize: 10, fontWeight: "bold", color: colors.GRAY_900 }}>
          Durée totale estimée
        </Text>
        <Text style={{ fontSize: 10, fontWeight: "bold", color: colors.BLUE }}>
          ≈ 4 semaines
        </Text>
      </View>
    </SectionCard>
  );
}

// ── Main document ──

interface RapportDocumentProps {
  data: SimulationResult;
}

export function RapportDocument({ data }: RapportDocumentProps) {
  const {
    entreprise,
    effectifs,
    salaries,
    coutActuel,
    coutOptimise,
    economie100,
    economieNetteTotale,
    commission,
    economieNette,
    paiementMensuel,
    date,
    config: cfg,
  } = data;

  const commissionPct = cfg.commission_rate * 100;

  return (
    <Document>
      {/* ═══════ PAGE 1: Header + Profile + Banner + Diagnostic ═══════ */}
      <Page size="A4" style={s.page}>
        {/* Header band */}
        <View style={s.headerBand}>
          <Text style={s.headerTitle}>
            Analyse Stratégique de SSM ({entreprise.nom})
          </Text>
          <Text style={s.headerSubtitle}>
            Optimisation Financière &amp; Développement
          </Text>
          <Text style={s.headerDate}>{date}</Text>
        </View>

        {/* Company profile */}
        <SectionCard icon="🏢" title={`Profil de la société : ${entreprise.nom}`}>
          <View style={[s.row, { marginBottom: 14, paddingBottom: 14, borderBottom: `1 solid ${colors.GRAY_200}` }]}>
            <View style={s.col}>
              <Text style={[s.cardLabel, { marginBottom: 2 }]}>SIRET</Text>
              <Text style={[s.textBold, { fontSize: 12 }]}>
                {entreprise.siret}
              </Text>
            </View>
            <View style={s.col}>
              <Text style={[s.cardLabel, { marginBottom: 2 }]}>EFFECTIF TOTAL</Text>
              <Text style={[s.textBold, { fontSize: 12 }]}>
                {effectifs.total} personnes
              </Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: colors.GRAY_50,
              border: `1 solid ${colors.GRAY_200}`,
              borderRadius: 4,
              padding: 12,
            }}
          >
            <Text style={[s.textBold, { fontSize: 9, marginBottom: 8, color: colors.GRAY_700 }]}>
              Répartition des effectifs
            </Text>
            <View style={s.row}>
              <View style={s.col}>
                <Text style={[s.textSmall, { marginBottom: 3 }]}>
                  CDI: <Text style={s.textBold}>{effectifs.cdi}</Text>
                </Text>
                <Text style={s.textSmall}>
                  Apprentis: <Text style={s.textBold}>{effectifs.apprentissage}</Text>
                </Text>
              </View>
              <View style={s.col}>
                <Text style={[s.textSmall, { marginBottom: 3 }]}>
                  CDD: <Text style={s.textBold}>{effectifs.cdd}</Text>
                </Text>
                <Text style={s.textSmall}>
                  Contrat Pro: <Text style={s.textBold}>{effectifs.professionnalisation}</Text>
                </Text>
              </View>
            </View>
          </View>
        </SectionCard>

        {/* Economy banner */}
        <View style={s.banner}>
          <Text style={s.bannerLabel}>
            Potentiel d&apos;optimisation identifié
          </Text>
          <Text style={s.bannerValue}>{formatEuro(economieNetteTotale)}</Text>
          <Text style={s.bannerCaption}>
            Impact direct sur la trésorerie et valorisation du capital humain
          </Text>
        </View>

        {/* Diagnostic Financier */}
        <DiagnosticFinancier
          coutActuel={coutActuel}
          economie100={economie100}
          economieNetteTotale={economieNetteTotale}
          cfg={cfg}
        />
      </Page>

      {/* ═══════ PAGE 2: Before/After + Employee table ═══════ */}
      <Page size="A4" style={s.page}>
        <View style={[s.row, { gap: 12, marginBottom: 18 }]} wrap={false}>
          <View style={s.beforeCard}>
            <Text style={{ fontSize: 12, fontWeight: "bold", color: colors.RED_800, marginBottom: 6 }}>
              Situation Actuelle
            </Text>
            <Text style={[s.cardLabel, { color: colors.GRAY_500 }]}>Coût annuel total</Text>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.RED_800, marginBottom: 8 }}>
              {formatEuro(coutActuel)}
            </Text>
            <Text style={s.textSmall}>• Rémunération fixe contractuelle</Text>
            <Text style={s.textSmall}>• Cotisations sociales (45%)</Text>
            <Text style={s.textSmall}>• Coûts non optimisés</Text>
          </View>

          <View style={s.afterCard}>
            <Text style={{ fontSize: 12, fontWeight: "bold", color: colors.GREEN_700, marginBottom: 6 }}>
              Après Optimisation
            </Text>
            <Text style={[s.cardLabel, { color: colors.GRAY_500 }]}>Nouveau coût annuel</Text>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.GREEN_700, marginBottom: 8 }}>
              {formatEuro(coutOptimise)}
            </Text>
            <Text style={s.textSmall}>• Salaire revalorisé des salariés</Text>
            <Text style={s.textSmall}>• Charges optimisées (19%)</Text>
            <Text style={s.textSmall}>• Développement des compétences</Text>
          </View>
        </View>

        <SectionCard icon="👥" title="Analyse Détaillée par Collaborateur">
          <EmployeeTable salaries={salaries} cfg={cfg} />
        </SectionCard>
      </Page>

      {/* ═══════ PAGE 3: Strategic benefits + Offerings ═══════ */}
      <Page size="A4" style={s.page}>
        <SectionCard icon="🛡️" title="Avantages stratégiques & organisationnels">
          <View style={s.row}>
            <View style={s.col}>
              <View style={s.benefitItem}>
                <View style={s.benefitDot} />
                <View style={{ flex: 1 }}>
                  <Text style={s.benefitTitle}>Fidélisation des talents</Text>
                  <Text style={s.benefitText}>
                    Développement des compétences internes, continuité
                    d&apos;activité, réduction des coûts de recrutement
                    externe, polyvalence maîtrisée
                  </Text>
                </View>
              </View>
              <View style={s.benefitItem}>
                <View style={s.benefitDot} />
                <View style={{ flex: 1 }}>
                  <Text style={s.benefitTitle}>Réduction du turnover</Text>
                  <Text style={s.benefitText}>
                    Vos salariés peuvent évoluer et se projeter durablement
                    chez {entreprise.nom}
                  </Text>
                </View>
              </View>
              <View style={s.benefitItem}>
                <View style={s.benefitDot} />
                <View style={{ flex: 1 }}>
                  <Text style={s.benefitTitle}>Attractivité employeur</Text>
                  <Text style={s.benefitText}>
                    Marque employeur renforcée : parcours évolutifs,
                    reconnaissance, différenciation sur le marché de l&apos;emploi
                  </Text>
                </View>
              </View>
            </View>
            <View style={s.col}>
              <View style={s.benefitItem}>
                <View style={s.benefitDot} />
                <View style={{ flex: 1 }}>
                  <Text style={s.benefitTitle}>Disponibilité &amp; présence</Text>
                  <Text style={s.benefitText}>
                    Salariés pleinement actifs durant toute la période d&apos;optimisation
                  </Text>
                </View>
              </View>
              <View style={s.benefitItem}>
                <View style={s.benefitDot} />
                <View style={{ flex: 1 }}>
                  <Text style={s.benefitTitle}>Valorisation salariale</Text>
                  <Text style={s.benefitText}>
                    Revalorisation des rémunérations possible : augmentation
                    du net perçu sans hausse équivalente du coût employeur,
                    tout en préservant la rentabilité et l&apos;EBITDA
                  </Text>
                </View>
              </View>
              <View style={s.benefitItem}>
                <View style={s.benefitDot} />
                <View style={{ flex: 1 }}>
                  <Text style={s.benefitTitle}>Sécurisation juridique</Text>
                  <Text style={s.benefitText}>
                    Veille réglementaire et gestion administrative complète
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </SectionCard>

        <View
          style={{
            backgroundColor: "#fef9c3",
            border: "1 solid #fbbf24",
            borderRadius: 6,
            padding: 16,
            marginTop: 8,
          }}
          wrap={false}
        >
          <Text style={{ fontSize: 11, fontWeight: "bold", color: colors.GRAY_900, textTransform: "uppercase", marginBottom: 8, textAlign: "center" }}>
            Offres des prestations &amp; recommandations
          </Text>
          <Text style={{ fontSize: 9, color: colors.GRAY_700, lineHeight: 1.5, marginBottom: 6 }}>
            Suite à notre analyse, nous recommandons la mise en place immédiate
            des leviers d&apos;optimisation identifiés pour {entreprise.nom}.
            L&apos;accompagnement comprend :
          </Text>
          <Text style={{ fontSize: 8, color: colors.GRAY_700, lineHeight: 1.5, marginBottom: 3 }}>• Audit complet des contrats et charges sociales</Text>
          <Text style={{ fontSize: 8, color: colors.GRAY_700, lineHeight: 1.5, marginBottom: 3 }}>• Montage et suivi des dossiers d&apos;optimisation</Text>
          <Text style={{ fontSize: 8, color: colors.GRAY_700, lineHeight: 1.5, marginBottom: 3 }}>• Accompagnement administratif et réglementaire</Text>
          <Text style={{ fontSize: 8, color: colors.GRAY_700, lineHeight: 1.5, marginBottom: 3 }}>• Prévention ergonomique et sensibilisation</Text>
          <Text style={{ fontSize: 8, color: colors.GRAY_700, lineHeight: 1.5 }}>• Suivi mensuel des économies réalisées</Text>
        </View>
      </Page>

      {/* ═══════ PAGE 4: Financial details ═══════ */}
      <Page size="A4" style={s.page}>
        <SectionCard icon="💰" title="Détail financier de l'accompagnement">
          <View style={[s.row, { gap: 8, marginBottom: 14 }]}>
            <KpiCard
              label="Économie nette générée"
              value={formatEuro(economie100)}
              sub="Sur les 12 prochains mois (HT)"
              bg={colors.NAVY}
              textColor="#fff"
            />
            <KpiCard
              label="Notre accompagnement"
              value={formatEuro(commission)}
              sub={`Forfait ${cfg.forfait_demarrage}€ + ${commissionPct}% HT de l'économie nette`}
              bg={colors.BLUE}
              textColor="#fff"
            />
            <KpiCard
              label="Votre économie nette"
              value={formatEuro(economieNette)}
              sub="Économie après commission"
              bg={colors.GREEN_700}
              textColor="#fff"
            />
          </View>

          <View style={[s.confidentialityBox, s.mb12]}>
            <Text style={s.confidentialityTitle}>Principe de rémunération</Text>
            <Text style={[s.confidentialityText, s.mb4]}>
              Notre rémunération est alignée sur la performance : {commissionPct}% HT
              des montants effectivement encaissés.
            </Text>
            <Text style={[s.confidentialityText, s.mb4]}>
              Pour votre sérénité, et afin que nous n&apos;engagions ce forfait que si nous
              avons concrètement avancé du dossier, le forfait de démarrage de {cfg.forfait_demarrage} € HT
              est facturé uniquement à compter de l&apos;acceptation du dossier.
            </Text>
            <Text style={s.confidentialityText}>
              Dans le cadre d&apos;un partenariat élargi ou d&apos;une mission complémentaire,
              ce forfait peut être supprimé et l&apos;intervention couverte 100% au succès.
            </Text>
          </View>

          <View style={[s.confidentialityBox, s.mb12]}>
            <Text style={s.confidentialityTitle}>Mode de calcul</Text>
            <View style={{ backgroundColor: colors.GRAY_100, borderRadius: 4, padding: 10, marginBottom: 8 }}>
              <Text style={{ fontSize: 8, color: colors.GRAY_700, marginBottom: 4 }}>
                <Text style={s.textBold}>Calcul de la commission :</Text>
              </Text>
              <Text style={{ fontSize: 8, color: colors.GRAY_700 }}>
                {cfg.forfait_demarrage} € HT (le forfait) de démarrage + {commissionPct}% HT
                du montant hors-taxe de l&apos;économie nette réalisée par cadre salarié.
              </Text>
            </View>
            <View style={{ backgroundColor: colors.GRAY_100, borderRadius: 4, padding: 10 }}>
              <Text style={{ fontSize: 8, fontWeight: "bold", color: colors.GRAY_700, marginBottom: 4 }}>
                Exemple de calcul :
              </Text>
              <Text style={{ fontSize: 8, color: colors.GRAY_700, marginBottom: 2 }}>
                Économie nette générée : <Text style={s.textBold}>{formatEuro(economie100)}</Text>
              </Text>
              <Text style={{ fontSize: 8, color: colors.GRAY_700, marginBottom: 2 }}>
                Forfait démarrage : <Text style={s.textBold}>{formatEuro(cfg.forfait_demarrage)}</Text>
              </Text>
              <Text style={{ fontSize: 8, color: colors.GRAY_700, marginBottom: 2 }}>
                Commission {commissionPct}% : <Text style={s.textBold}>{formatEuro(economie100 * cfg.commission_rate)}</Text>
              </Text>
              <Text style={{ fontSize: 8, color: colors.GRAY_700, marginBottom: 2 }}>
                Commission totale : <Text style={s.textBold}>{formatEuro(commission)}</Text>
              </Text>
              <Text style={{ fontSize: 8, fontWeight: "bold", color: colors.GREEN_700 }}>
                Vous conservez : {formatEuro(economieNette)}
              </Text>
            </View>
          </View>

          <View style={[s.confidentialityBox, s.mb12]}>
            <Text style={s.confidentialityTitle}>Modalités de facturation</Text>
            <Text style={{ fontSize: 9, fontWeight: "bold", color: colors.GRAY_900, marginBottom: 6 }}>
              Paiements échelonnés :
            </Text>
            <Text style={{ fontSize: 8, color: colors.GRAY_700, marginBottom: 3 }}>
              • <Text style={s.textBold}>{cfg.forfait_demarrage} € HT</Text> - Une fois le dossier accepté (bureau d&apos;étude)
            </Text>
            <Text style={{ fontSize: 8, color: colors.GRAY_700, marginBottom: 10 }}>
              • <Text style={s.textBold}>{commissionPct}% HT chaque mois</Text> - Après encaissement
              effectif des gains par {entreprise.nom}
            </Text>

            <View
              style={{
                backgroundColor: "#fef2f2",
                border: "1 solid #fecaca",
                borderRadius: 6,
                padding: 10,
                marginBottom: 10,
              }}
            >
              <Text style={{ fontSize: 8, color: colors.GRAY_700, marginBottom: 2 }}>
                Estimation paiement mensuel :
              </Text>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "#dc2626" }}>
                ~{formatEuro(paiementMensuel)} HT/mois
              </Text>
              <Text style={{ fontSize: 7, color: colors.GRAY_500 }}>
                Basé sur une économie nette mensuelle de {formatEuro(economie100 / 12)} HT
              </Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: colors.NAVY,
              borderRadius: 6,
              padding: 14,
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 9, fontWeight: "bold", color: "#94a3b8", marginBottom: 10 }}>
              🎯 Synthèse de votre accompagnement
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 6, padding: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: "bold", color: "#fff" }}>
                  {cfg.forfait_demarrage} € HT
                </Text>
                <Text style={{ fontSize: 7, color: "#94a3b8" }}>
                  À l&apos;acceptation du dossier
                </Text>
              </View>
              <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 6, padding: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: "bold", color: "#fff" }}>
                  {formatEuro(paiementMensuel)} HT
                </Text>
                <Text style={{ fontSize: 7, color: "#94a3b8" }}>
                  Votre encaissement des gains
                </Text>
              </View>
            </View>
          </View>

          <Text style={{ fontSize: 7, color: colors.GRAY_500, fontStyle: "italic", textAlign: "center" }}>
            Notre modèle est simple : nous ne sommes rémunérés que sur ce que nous vous faisons économiser.
            Pas d&apos;économies, pas de commission.
          </Text>
        </SectionCard>
      </Page>

      {/* ═══════ PAGE 5: Impact + Timeline ═══════ */}
      <Page size="A4" style={s.page}>
        <ImpactSection
          economie100={economie100}
          nombreSalaries={salaries.length}
        />
        <TimelineSection nomSociete={entreprise.nom} />
      </Page>

      {/* ═══════ PAGE 6: Confidentiality ═══════ */}
      <Page size="A4" style={s.page}>
        <View style={s.confidentialityBox}>
          <Text style={[s.confidentialityTitle, { fontSize: 11 }]}>
            Note d&apos;accompagnement et Confidentialité
          </Text>
          <Text style={[s.confidentialityText, s.mb8]}>
            Ce rapport synthétise les informations communiquées lors de nos
            échanges et présente des leviers d&apos;optimisation identifiés,
            avec une estimation d&apos;impact. Les résultats sont calculés sur la
            base des éléments transmis et des règles applicables au moment de
            l&apos;analyse. La mise en œuvre est conditionnée à la validation
            des données, à la complétude documentaire et aux accords des
            parties concernées.
          </Text>

          <Text style={[s.confidentialityText, s.mb8]}>
            <Text style={s.textBold}>{entreprise.nom}</Text> et{" "}
            <Text style={s.textBold}>STRATIUM ADVISORY</Text> s&apos;engagent
            réciproquement à préserver la stricte confidentialité de toute
            information, donnée, document ou échange, quel qu&apos;en soit le
            support, communiqué dans le cadre de la présente simulation/étude
            (le « Projet »).
          </Text>

          <Text style={[s.confidentialityText, s.mb4]}>
            À ce titre, chaque Partie s&apos;engage à :
          </Text>

          <Text style={[s.confidentialityText, { marginLeft: 12 }, s.mb4]}>
            • ne divulguer aucune information confidentielle à des tiers, sous
            quelque forme que ce soit ;
          </Text>
          <Text style={[s.confidentialityText, { marginLeft: 12 }, s.mb4]}>
            • n&apos;utiliser les informations confidentielles qu&apos;aux
            seules fins du Projet ;
          </Text>
          <Text style={[s.confidentialityText, { marginLeft: 12 }, s.mb4]}>
            • protéger les documents et données reçus contre tout accès,
            usage, reproduction ou diffusion non autorisés ;
          </Text>
          <Text style={[s.confidentialityText, { marginLeft: 12 }, s.mb4]}>
            • limiter l&apos;accès aux seules personnes internes strictement
            nécessaires à l&apos;exécution du Projet, lesquelles sont tenues à
            une obligation de confidentialité au moins équivalente ;
          </Text>
          <Text style={[s.confidentialityText, { marginLeft: 12 }, s.mb8]}>
            • restituer ou supprimer, sur simple demande et dans un délai
            raisonnable, tout document confidentiel transmis, sous réserve des
            obligations légales de conservation applicables.
          </Text>

          <Text style={s.confidentialityText}>
            La présente obligation de confidentialité s&apos;applique pendant
            toute la durée du Projet et demeure en vigueur pendant cinq (5) ans
            après son achèvement, quelle que soit l&apos;issue de la
            collaboration.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
