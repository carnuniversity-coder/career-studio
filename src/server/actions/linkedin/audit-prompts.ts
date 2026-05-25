export function buildLinkedInAuditPrompt(parsed: any, photoScore: number, photoAnalysisFeedback: string): string {
  const roleContext = `Target Role: ${parsed.targetRole || "General Professional"}`;
  return `
You are a LinkedIn Profile Expert and Recruiter.
Audit the following LinkedIn profile text based on best practices for visibility, authority, findability, and engagement readiness.

${roleContext}
Local-vs-Global Mode: ${parsed.audienceMode} (Optimized for: ${parsed.audienceMode === "local" ? "Sri Lanka local tech and BPO market" : "Global remote and international hiring"})
Profile Photo Present: ${parsed.hasPhoto ? "Yes" : "No"}
Custom Cover Banner: ${parsed.hasBanner ? "Yes" : "No"}
Profile Vanity URL: ${parsed.vanityUrl || "Not set / default"}
Connections Count: ${parsed.connections}
Recommendations Received: ${parsed.recsReceived}
Recommendations Given: ${parsed.recsGiven}
Featured Section Populated: ${parsed.featuredPopulated ? "Yes" : "No"}
Compliance Mode Activated: ${parsed.complianceMode ? "Yes (Regulated banking/gov employee restrictions apply)" : "No"}
Regulated Industry: ${parsed.regulatedIndustry ? "Yes" : "No"}
Diaspora Mode: ${parsed.diasporaMode ? "Yes" : "No"}
Open To Work: ${parsed.hasOpenToWork ? "Yes" : "No"}
Open To Services: ${parsed.hasOpenToServices ? "Yes" : "No"}
Last Post Date: ${parsed.lastPostDate || "Unknown"}
Posts Per Week: ${parsed.postsPerWeek}
Average Engagement Per Post: ${parsed.avgEngagement}
Hashtags Used: ${parsed.hashtags || "None"}
Top Endorsed Skills: ${parsed.topEndorsedSkills || "Unknown"}

PROFILE TEXT:
"""
${parsed.profileText.slice(0, 15000)}
"""

${parsed.jdText ? `TARGET JOB DESCRIPTION TO MATCH AGAINST:\n"""\n${parsed.jdText.slice(0, 5000)}\n"""\n` : ""}

PHOTO ANALYSIS:
Photo Score: ${photoScore}/10
Photo Feedback: ${photoAnalysisFeedback}
(Include this in the profile_media_audit section of your response)

DIMENSION SCORING INSTRUCTIONS (Out of 25 each):
- profile_strength (25 pts): photo (4), custom banner (3), headline quality and length (6), about section hook (6), clean vanity URL (3), location/connections (3).
- authority (25 pts): recommendation count and context (7), endorsements match (5), listed certifications (5), featured items quality (5), recognized employer status (3).
- findability (25 pts): keyword match against target role / JD (10), headline search optimization (5), top endorsed skills (5), company/school keywords (5).
- engagement_readiness (25 pts): clear Call to Action (CTA) in About (8), active activity signals (last post date/type mix) (7), open to work indicators (5), contact details normalization (5).

SRI LANKA SPECIFIC CHECKS:
1. Recognize if candidate's experience includes major Sri Lankan employers: MAS, Brandix, Hirdaramani, IFS, WSO2, 99x, MillenniumIT, John Keells, Dialog, Hutch, Hatton, Commercial Bank, BOC, HNB, NDB, Sampath Bank, DFCC, Cargills, CIC, Hayleys, Hemas, LOLC.
2. Recognize if education has top Sri Lankan universities: University of Moratuwa (UoM), University of Colombo (UoC), UCSC, University of Peradeniya (UoP), University of Kelaniya (UoK), SLIIT, NSBM, NIBM, IIT, APIIT, ICBT, Curtin Lanka, AOD.
3. Recognize Sri Lankan / international certifications: CA Sri Lanka, CMA SL, AAT SL, SLIM, IPM, CIMA, ACCA.
4. Detect NIC leak: check for National Identity Card numbers (e.g. 9 digits ending in V/v/X/x, or 12 digits starting with 19/20) in the profile text. Flag as a safety warning if found.
5. Normalize Sri Lankan phone numbers: extract any phone number matching Sri Lanka formats (e.g., beginning with 07, 7, 011, +94) and normalize it.
6. Local Hashtags: recommend high-impact local tech or industry hashtags (e.g. #SriLankaTech, #ColomboTech, #LKDev, #SLStartup, #SriLankaCareers).
7. Sinhala / Tamil Support: Check if Sinhala or Tamil Unicode text is used in About or summary and comment on bilingual presentation.

OUTPUT SCHEMA (JSON Only):
Provide JSON matching the required typescript structure. Make sure you return BOTH legacy scores and new SSI scores (profile_strength, authority, findability, engagement_readiness).

Return ONLY valid JSON.
`;
}

export function buildLinkedInRewritePrompt(sectionType: string, tone: string, inputText: string, targetRole: string | null): string {
  return `
You are a Professional LinkedIn Copywriter.
Rewrite the following ${sectionType} section to be optimized for engagement and professional impact.
Tone: ${tone}
Target Role: ${targetRole || "General Professional"}

ORIGINAL TEXT:
${inputText.slice(0, 5000)}

Return ONLY the rewritten text. Do not include explanations.
`;
}

export function buildLinkedInOptimizeSectionPrompt(sectionType: string, currentText: string, targetRole: string, tone: string): string {
  return `You are a Professional LinkedIn Copywriter and Recruiter.
Optimize the following "${sectionType}" section of a LinkedIn profile.
Target Role: ${targetRole}
Tone: ${tone}

Requirements:
- Emphasize measurable achievements over responsibilities.
- Ensure clarity and professional impact.
- Incorporate keywords suitable for ${targetRole}.
- If it's an About section, include a clear hook and a subtle call to action.
- If it's an Experience section, use active verbs.

ORIGINAL TEXT:
"""
${currentText}
"""

Return ONLY the optimized text, nothing else. No markdown wrappers.`;
}
