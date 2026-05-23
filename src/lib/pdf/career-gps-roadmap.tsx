/**
 * Career GPS roadmap PDF document.
 *
 * 3-page branded report covering identity statement, pathways, skill
 * gaps, and the full week-by-week roadmap. Mirrors the styling of
 * `resume-document.tsx` and `ats-report.tsx` (teal accent, A4, 40pt
 * margins, Helvetica) so users see a consistent brand across all
 * exports.
 */

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { CareerGpsPlanResult } from "@/lib/career-gps";

export type CareerGpsPdfData = {
  title: string;
  generatedAt: Date;
  plan: CareerGpsPlanResult;
};

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", lineHeight: 1.45, color: "#171717" },
  brand: { fontSize: 9, color: "#0f766e", letterSpacing: 2, marginBottom: 4 },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 4 },
  meta: { fontSize: 9, color: "#525252", marginBottom: 18 },
  rule: { borderBottomWidth: 2, borderBottomColor: "#0f766e", marginBottom: 14 },
  hero: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 },
  score: { fontSize: 48, fontWeight: 700 },
  band: { fontSize: 11, color: "#0f766e", marginTop: 2 },
  section: { marginTop: 14 },
  heading: { fontSize: 10, fontWeight: 700, color: "#0f766e", letterSpacing: 1.5, marginBottom: 6 },
  subheading: { fontSize: 10, fontWeight: 700, marginTop: 6, marginBottom: 2 },
  muted: { color: "#525252" },
  bullet: { marginLeft: 10, marginBottom: 3 },
  pathwayCard: { borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 4, padding: 10, marginBottom: 8 },
  pathwayType: { fontSize: 8, color: "#0f766e", textTransform: "uppercase", letterSpacing: 1 },
  pathwayRole: { fontSize: 13, fontWeight: 700, marginTop: 2 },
  badge: { backgroundColor: "#f5f5f4", padding: 3, marginRight: 4, marginBottom: 4, borderRadius: 3, fontSize: 8 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap" },
  milestone: { borderLeftWidth: 3, borderLeftColor: "#0f766e", paddingLeft: 8, marginBottom: 8 },
  weekRange: { fontSize: 8, color: "#525252", marginBottom: 2 },
  milestoneTitle: { fontSize: 11, fontWeight: 700 },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, fontSize: 8, color: "#a3a3a3", textAlign: "center" },
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{title}</Text>
      {children}
    </View>
  );
}

export function CareerGpsPdfDocument({ data }: { data: CareerGpsPdfData }) {
  const { plan } = data;

  return (
    <Document>
      {/* Page 1 — Identity + pathways + skill overlap */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>CAREER GPS ROADMAP</Text>
        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.meta}>Generated {data.generatedAt.toISOString().slice(0, 10)}</Text>
        <View style={styles.rule} />

        <View style={styles.hero}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.brand}>IDENTITY STATEMENT</Text>
            <Text style={{ fontSize: 11, lineHeight: 1.5, marginTop: 4 }}>
              {plan.identity_statement || "Add more detail in your story to unlock a stronger identity statement."}
            </Text>
          </View>
          <View>
            <Text style={styles.score}>{plan.plan_strength.score}</Text>
            <Text style={styles.band}>{plan.plan_strength.label}</Text>
          </View>
        </View>

        <Section title="PATHWAYS">
          {plan.pathways.map((pathway) => (
            <View key={pathway.type} style={styles.pathwayCard}>
              <Text style={styles.pathwayType}>{pathway.type}</Text>
              <Text style={styles.pathwayRole}>{pathway.role}</Text>
              <Text style={{ ...styles.muted, fontSize: 9, marginTop: 4 }}>
                {pathway.time_to_transition_months} months · {pathway.risk}
              </Text>
              <Text style={{ fontSize: 10, marginTop: 4 }}>{pathway.summary}</Text>
            </View>
          ))}
        </Section>

        <Section title={`SKILL OVERLAP (${plan.skill_overlap.overlap_pct}%)`}>
          <Text style={styles.subheading}>Transferable ({plan.skill_overlap.transferable.length})</Text>
          <View style={styles.badgeRow}>
            {plan.skill_overlap.transferable.map((s) => (
              <Text key={s} style={styles.badge}>{s}</Text>
            ))}
          </View>
          <Text style={styles.subheading}>Gaps ({plan.skill_overlap.gaps.length})</Text>
          <View style={styles.badgeRow}>
            {plan.skill_overlap.gaps.map((s) => (
              <Text key={s} style={{ ...styles.badge, backgroundColor: "#fef2f2", color: "#991b1b" }}>{s}</Text>
            ))}
          </View>
        </Section>
      </Page>

      {/* Page 2 — Constellation + Sri Lanka context */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>CAREER GPS ROADMAP</Text>
        <Text style={styles.title}>Career constellation &amp; Sri Lanka context</Text>
        <View style={styles.rule} />

        <Section title="CAREER CONSTELLATION">
          {plan.constellation.slice(0, 12).map((node) => (
            <View key={node.id} style={{ marginBottom: 5 }}>
              <Text style={{ fontSize: 11, fontWeight: 700 }}>
                {node.role} <Text style={styles.muted}>({node.match}% match · {node.difficulty_label})</Text>
              </Text>
              <Text style={{ ...styles.muted, fontSize: 9 }}>{node.summary} · {node.salary_lkr}</Text>
            </View>
          ))}
        </Section>

        <Section title="SRI LANKA CONTEXT">
          {plan.sl_context.al_stream_pathways.length > 0 ? (
            <>
              <Text style={styles.subheading}>A/L → Degree → Role</Text>
              {plan.sl_context.al_stream_pathways.map((p) => (
                <Text key={p} style={styles.bullet}>- {p}</Text>
              ))}
            </>
          ) : null}
          {plan.sl_context.industry_ladders.length > 0 ? (
            <>
              <Text style={styles.subheading}>Industry ladders</Text>
              {plan.sl_context.industry_ladders.map((p, i) => (
                <Text key={i} style={styles.bullet}>- {p}</Text>
              ))}
            </>
          ) : null}
          {plan.sl_context.certifications.length > 0 ? (
            <>
              <Text style={styles.subheading}>Recommended certifications</Text>
              <Text style={styles.muted}>{plan.sl_context.certifications.join(", ")}</Text>
            </>
          ) : null}
          {plan.sl_context.scholarships.length > 0 ? (
            <>
              <Text style={styles.subheading}>Scholarships</Text>
              <Text style={styles.muted}>{plan.sl_context.scholarships.join(", ")}</Text>
            </>
          ) : null}
          {plan.sl_context.diaspora_bridge ? (
            <>
              <Text style={styles.subheading}>Diaspora bridge</Text>
              <Text style={{ fontSize: 10 }}>{plan.sl_context.diaspora_bridge}</Text>
            </>
          ) : null}
          {plan.sl_context.cost_of_living_note ? (
            <>
              <Text style={styles.subheading}>Cost of living</Text>
              <Text style={{ fontSize: 10 }}>{plan.sl_context.cost_of_living_note}</Text>
            </>
          ) : null}
        </Section>
      </Page>

      {/* Page 3 — Week-by-week roadmap */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>CAREER GPS ROADMAP</Text>
        <Text style={styles.title}>Week-by-week plan</Text>
        <Text style={styles.meta}>{plan.roadmap.weeks} weeks · {plan.roadmap.milestones.length} milestones</Text>
        <View style={styles.rule} />

        {plan.roadmap.milestones.map((milestone, i) => (
          <View key={i} style={styles.milestone}>
            <Text style={styles.weekRange}>Weeks {milestone.week_start} – {milestone.week_end}</Text>
            <Text style={styles.milestoneTitle}>{milestone.title}</Text>
            {milestone.description ? (
              <Text style={{ ...styles.muted, fontSize: 9, marginTop: 2 }}>{milestone.description}</Text>
            ) : null}
            {milestone.tasks.map((task, j) => (
              <Text key={j} style={{ ...styles.bullet, fontSize: 9, marginTop: 2 }}>
                - W{task.week} [{task.type}] {task.title} ({task.effort_minutes}min)
                {task.outcome ? `\n  Outcome: ${task.outcome}` : ""}
              </Text>
            ))}
          </View>
        ))}

        <Text style={styles.footer}>Generated by Career Studio · {data.generatedAt.toISOString().slice(0, 10)}</Text>
      </Page>
    </Document>
  );
}
