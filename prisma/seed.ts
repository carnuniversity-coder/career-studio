import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  Difficulty,
  EmploymentType,
  InterviewCategory,
  PrismaClient,
  SalaryExperienceLevel,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/career_studio_next";
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

type CostOfLivingSeed = readonly [
  city: string,
  overallIndex: number,
  housingIndex: number,
  foodIndex: number,
  transportationIndex: number,
];

type SalaryRoleSeed = readonly [
  jobTitle: string,
  jobCategory: string,
  industry: string,
  experienceLevel: SalaryExperienceLevel,
  salaryMin: number,
  salaryMax: number,
];

type CourseSeed = readonly [
  provider: string,
  title: string,
  category: string,
  level: string,
  awardType: string,
  city: string,
  district: string,
  officialUrl: string,
  summary: string,
];

type CertificationSeed = readonly [
  provider: string,
  title: string,
  category: string,
  awardType: string,
  summary: string,
  officialUrl: string,
];

type QuestionSeed = readonly [
  category: InterviewCategory,
  difficulty: Difficulty,
  questionText: string,
  sampleAnswer: string,
  tips: string,
  tags: readonly string[],
];

const costOfLivingData: CostOfLivingSeed[] = [
  ["Colombo", 100, 100, 100, 100],
  ["Dehiwala-Mount Lavinia", 92, 90, 95, 95],
  ["Sri Jayawardenepura Kotte", 95, 95, 96, 96],
  ["Negombo", 82, 78, 88, 85],
  ["Kandy", 78, 72, 85, 80],
  ["Galle", 76, 70, 85, 80],
  ["Matara", 70, 62, 80, 78],
  ["Kurunegala", 68, 60, 78, 75],
  ["Anuradhapura", 65, 55, 75, 72],
  ["Jaffna", 70, 60, 82, 78],
  ["Trincomalee", 66, 58, 78, 75],
  ["Batticaloa", 66, 57, 78, 74],
  ["Ratnapura", 67, 58, 78, 74],
  ["Badulla", 67, 58, 78, 74],
  ["Polonnaruwa", 63, 55, 74, 70],
  ["Hambantota", 65, 56, 76, 72],
  ["Nuwara Eliya", 74, 68, 82, 78],
  ["Kalutara", 80, 75, 86, 82],
  ["Gampaha", 88, 85, 92, 90],
];

const salaryRoles: SalaryRoleSeed[] = [
  ["Software Engineer (Junior)", "Engineering", "IT/Software", SalaryExperienceLevel.entry, 720000, 1440000],
  ["Software Engineer", "Engineering", "IT/Software", SalaryExperienceLevel.mid, 1440000, 3000000],
  ["Senior Software Engineer", "Engineering", "IT/Software", SalaryExperienceLevel.senior, 3000000, 5400000],
  ["Tech Lead / Engineering Manager", "Engineering", "IT/Software", SalaryExperienceLevel.lead, 5400000, 9600000],
  ["QA Engineer", "Engineering", "IT/Software", SalaryExperienceLevel.mid, 1200000, 2800000],
  ["DevOps / SRE", "Engineering", "IT/Software", SalaryExperienceLevel.mid, 1800000, 4200000],
  ["Data Engineer", "Engineering", "IT/Software", SalaryExperienceLevel.mid, 1800000, 3900000],
  ["Data Analyst", "Analytics", "IT/Software", SalaryExperienceLevel.mid, 1200000, 2800000],
  ["Product Manager", "Product", "IT/Software", SalaryExperienceLevel.mid, 2400000, 4800000],
  ["UI/UX Designer", "Design", "IT/Software", SalaryExperienceLevel.mid, 1200000, 2800000],
  ["Customer Service Associate", "Operations", "BPO", SalaryExperienceLevel.entry, 540000, 1080000],
  ["BPO Team Lead", "Operations", "BPO", SalaryExperienceLevel.senior, 1440000, 2400000],
  ["Process Trainer", "Operations", "BPO", SalaryExperienceLevel.mid, 1080000, 1800000],
  ["Production Executive", "Operations", "Apparel", SalaryExperienceLevel.mid, 900000, 1800000],
  ["Industrial Engineer", "Engineering", "Apparel", SalaryExperienceLevel.mid, 1080000, 2400000],
  ["Merchandiser", "Sales", "Apparel", SalaryExperienceLevel.mid, 1320000, 2800000],
  ["Production Manager", "Operations", "Apparel", SalaryExperienceLevel.senior, 2400000, 4800000],
  ["Front Office Executive", "Hospitality", "Tourism", SalaryExperienceLevel.entry, 540000, 900000],
  ["Restaurant Manager", "Hospitality", "Tourism", SalaryExperienceLevel.mid, 900000, 1800000],
  ["Hotel Operations Manager", "Hospitality", "Tourism", SalaryExperienceLevel.senior, 1800000, 3600000],
  ["Tour Operations Executive", "Hospitality", "Tourism", SalaryExperienceLevel.mid, 900000, 1680000],
  ["Accounts Executive", "Finance", "Finance", SalaryExperienceLevel.entry, 600000, 1080000],
  ["Senior Accountant", "Finance", "Finance", SalaryExperienceLevel.mid, 1440000, 2640000],
  ["Financial Analyst", "Finance", "Finance", SalaryExperienceLevel.mid, 1800000, 3600000],
  ["Finance Manager", "Finance", "Finance", SalaryExperienceLevel.senior, 3600000, 6000000],
  ["Internal Auditor", "Audit", "Finance", SalaryExperienceLevel.mid, 1440000, 2800000],
  ["Tax Consultant", "Tax", "Finance", SalaryExperienceLevel.mid, 1800000, 3600000],
  ["Digital Marketing Executive", "Marketing", "Marketing", SalaryExperienceLevel.mid, 900000, 1800000],
  ["Marketing Manager", "Marketing", "Marketing", SalaryExperienceLevel.senior, 2400000, 4800000],
  ["Sales Executive", "Sales", "FMCG", SalaryExperienceLevel.entry, 600000, 1200000],
  ["Key Account Manager", "Sales", "FMCG", SalaryExperienceLevel.senior, 2400000, 4800000],
  ["Banking Associate", "Banking", "Banking", SalaryExperienceLevel.entry, 720000, 1320000],
  ["Branch Manager", "Banking", "Banking", SalaryExperienceLevel.senior, 3000000, 5400000],
  ["Insurance Advisor", "Insurance", "Insurance", SalaryExperienceLevel.mid, 900000, 2400000],
  ["HR Executive", "HR", "Generalist", SalaryExperienceLevel.entry, 720000, 1320000],
  ["HR Business Partner", "HR", "Generalist", SalaryExperienceLevel.senior, 2400000, 4200000],
  ["Office Administrator", "Admin", "Generalist", SalaryExperienceLevel.entry, 480000, 840000],
];

const salaryCities = [
  ["Colombo", "Western", 1],
  ["Sri Jayawardenepura Kotte", "Western", 0.98],
  ["Dehiwala-Mount Lavinia", "Western", 0.95],
  ["Gampaha", "Western", 0.92],
  ["Kandy", "Central", 0.85],
  ["Galle", "Southern", 0.83],
  ["Negombo", "Western", 0.88],
  ["Jaffna", "Northern", 0.78],
] as const;

const categories = [
  "Computing",
  "Engineering",
  "Business",
  "Design",
  "Health Sciences",
  "Law",
  "Hospitality",
  "Sciences",
  "Finance",
  "Accounting",
  "Management",
  "Quality",
] as const;

const courses: CourseSeed[] = [
  ["University of Moratuwa", "BSc Engineering (Hons)", "Engineering", "Undergraduate", "Bachelor's Degree", "Moratuwa", "Colombo", "https://uom.lk/", "4-year accredited engineering programme across major engineering disciplines."],
  ["University of Moratuwa", "BSc (Hons) Information Technology", "Computing", "Undergraduate", "Bachelor's Degree", "Moratuwa", "Colombo", "https://uom.lk/itfaculty", "Industry-aligned IT degree from the Faculty of Information Technology."],
  ["University of Colombo School of Computing", "BSc (Hons) Computer Science", "Computing", "Undergraduate", "Bachelor's Degree", "Colombo", "Colombo", "https://ucsc.cmb.ac.lk/", "Flagship CS degree at UCSC."],
  ["University of Colombo", "Bachelor of Business Administration", "Business", "Undergraduate", "Bachelor's Degree", "Colombo", "Colombo", "https://fmf.cmb.ac.lk/", "BBA from the Faculty of Management and Finance."],
  ["University of Colombo Faculty of Law", "Bachelor of Laws (LL.B)", "Law", "Undergraduate", "Bachelor's Degree", "Colombo", "Colombo", "https://law.cmb.ac.lk/", "Recognised LL.B path for legal practice in Sri Lanka."],
  ["University of Peradeniya", "Bachelor of Medicine, Bachelor of Surgery (MBBS)", "Health Sciences", "Undergraduate", "Bachelor's Degree", "Peradeniya", "Kandy", "https://med.pdn.ac.lk/", "Five-year MBBS, among the most competitive A/L pathways in Sri Lanka."],
  ["University of Peradeniya", "Bachelor of Science (Hons)", "Sciences", "Undergraduate", "Bachelor's Degree", "Peradeniya", "Kandy", "https://sci.pdn.ac.lk/", "Faculty of Science degree across biological, physical, and statistical streams."],
  ["University of Kelaniya", "Bachelor of Business Management (Hons)", "Business", "Undergraduate", "Bachelor's Degree", "Kelaniya", "Gampaha", "https://www.kln.ac.lk/", "BBM from the Faculty of Commerce and Management."],
  ["SLIIT", "BSc (Hons) in Information Technology", "Computing", "Undergraduate", "Bachelor's Degree", "Malabe", "Colombo", "https://www.sliit.lk/", "SLIIT's flagship IT degree with software, cyber security, data science, and IT specialisations."],
  ["SLIIT", "BSc (Hons) in Engineering", "Engineering", "Undergraduate", "Bachelor's Degree", "Malabe", "Colombo", "https://www.sliit.lk/", "Civil, Mechanical, Mechatronics, and Electrical pathways."],
  ["NSBM Green University", "BSc (Hons) Computer Science", "Computing", "Undergraduate", "Bachelor's Degree", "Pitipana", "Colombo", "https://www.nsbm.ac.lk/", "Industry-led CS degree at the green campus in Pitipana, Homagama."],
  ["NSBM Green University", "BBA in Business Management", "Business", "Undergraduate", "Bachelor's Degree", "Pitipana", "Colombo", "https://www.nsbm.ac.lk/", "Awarded by NSBM with global partnerships."],
  ["NIBM", "Higher National Diploma in Information Technology", "Computing", "Diploma", "Higher National Diploma", "Colombo", "Colombo", "https://www.nibm.lk/", "HNDIT as an accelerated route into IT roles in Sri Lanka and abroad."],
  ["Informatics Institute of Technology (IIT)", "BEng (Hons) Software Engineering", "Computing", "Undergraduate", "Bachelor's Degree", "Colombo", "Colombo", "https://www.iit.ac.lk/", "University of Westminster UK degree delivered locally."],
  ["APIIT Sri Lanka", "BSc (Hons) Computing", "Computing", "Undergraduate", "Bachelor's Degree", "Colombo", "Colombo", "https://apiit.lk/", "Staffordshire University UK computing degree delivered in Sri Lanka."],
  ["ICBT Campus", "BEng (Hons) Civil Engineering", "Engineering", "Undergraduate", "Bachelor's Degree", "Colombo", "Colombo", "https://icbtcampus.edu.lk/", "Cardiff Metropolitan University programme delivered in Sri Lanka."],
  ["Curtin Sri Lanka", "Bachelor of Commerce", "Business", "Undergraduate", "Bachelor's Degree", "Colombo", "Colombo", "https://curtin.lk/", "Australian Curtin University programme delivered in Colombo."],
  ["Academy of Design (AOD)", "Bachelor of Arts (Hons) in Fashion Design", "Design", "Undergraduate", "Bachelor's Degree", "Colombo", "Colombo", "https://www.aod.lk/", "Northumbria University design degree delivered in Sri Lanka."],
];

const certifications: CertificationSeed[] = [
  ["Institute of Chartered Accountants of Sri Lanka (CA Sri Lanka)", "Chartered Accountancy (CA Sri Lanka)", "Accounting", "Professional Certification", "Premier accounting qualification in Sri Lanka and pathway to ACA SL designation.", "https://www.casrilanka.com/"],
  ["Institute of Certified Management Accountants of Sri Lanka (CMA SL)", "CMA Sri Lanka", "Management", "Professional Certification", "Local management accounting qualification with strong uptake in manufacturing and BPO.", "https://www.cma-srilanka.org/"],
  ["Association of Accounting Technicians of Sri Lanka (AAT SL)", "AAT Sri Lanka", "Accounting", "Professional Certification", "Foundation-level accounting qualification and common starting point for accounting careers.", "https://www.aatsl.lk/"],
  ["Sri Lanka Institute of Marketing (SLIM)", "SLIM Diploma in Marketing", "Management", "Professional Diploma", "Recognised marketing qualification and pathway to Chartered Marketer SL.", "https://www.slim.lk/"],
  ["Institute of Personnel Management Sri Lanka (IPM)", "IPM Diploma in HR Management", "Management", "Professional Diploma", "Standard HR qualification recognised by local employers.", "https://ipmlk.org/"],
  ["CIMA Global", "CIMA Professional Qualification", "Management", "Professional Certification", "Chartered Institute of Management Accountants, heavily recruited for finance and FP&A roles.", "https://www.cimaglobal.com/"],
  ["ACCA", "ACCA Qualification", "Accounting", "Professional Certification", "Global accounting qualification with strong mobility and Sri Lankan recognition paths.", "https://www.accaglobal.com/"],
  ["Institute of Management Accountants", "CMA (US)", "Management", "Professional Certification", "US Certified Management Accountant, common in MNC finance roles in Colombo.", "https://www.imanet.org/"],
  ["Chartered Institute for Securities & Investment", "CISI Investment Operations Certificate (IOC)", "Finance", "Professional Certification", "Entry-level CISI qualification used by banking and treasury teams.", "https://www.cisi.org/"],
  ["PMI", "Project Management Professional (PMP)", "Management", "Professional Certification", "PMI's PMP, widely listed for delivery roles in Sri Lankan IT and services.", "https://www.pmi.org/certifications/project-management-pmp"],
  ["Scrum Alliance", "Certified ScrumMaster (CSM)", "Management", "Professional Certification", "Common scrum certification across Sri Lankan software teams.", "https://www.scrumalliance.org/"],
];

const questions: QuestionSeed[] = [
  [InterviewCategory.behavioral, Difficulty.easy, "Tell me about yourself.", "Keep it 60-90 seconds. Cover present role, relevant past, and why you are interested in this role.", "Use present-past-future and end with what you are looking for next.", ["concise", "relevant", "structured"]],
  [InterviewCategory.behavioral, Difficulty.medium, "Describe a time you had to deal with a difficult coworker.", "Use STAR. Focus on actions you took and show maturity in conflict resolution.", "Do not badmouth anyone. Frame it as learning, not blame.", ["star", "conflict", "teamwork"]],
  [InterviewCategory.behavioral, Difficulty.medium, "Tell me about a time you failed and what you learned.", "Pick a real failure. Be specific about what went wrong, what you owned, and the concrete lesson.", "The lesson should connect to the role.", ["growth", "ownership"]],
  [InterviewCategory.behavioral, Difficulty.hard, "Describe a situation where you had to influence someone without authority.", "Use STAR and show how you used data, empathy, or shared goals.", "Senior roles weight this heavily, so show the mechanism.", ["influence", "leadership"]],
  [InterviewCategory.situational, Difficulty.easy, "How would you prioritise tasks if everything is urgent?", "Discuss impact vs effort, stakeholder alignment, and surfacing trade-offs early.", "Demonstrate that you push back constructively.", ["prioritisation"]],
  [InterviewCategory.situational, Difficulty.medium, "A customer is angry about a service outage. How do you respond?", "Acknowledge, apologise, clarify, commit to a next step with timeline, and follow through.", "Empathy first, fix second.", ["customer", "communication"]],
  [InterviewCategory.situational, Difficulty.hard, "Your team disagrees on a technical approach. How do you decide?", "Frame the decision, invite proposals, time-box debate, and use disagree-and-commit when needed.", "Senior interviewers want to hear that you do not always need consensus.", ["decision-making"]],
  [InterviewCategory.competency, Difficulty.easy, "What are your greatest strengths?", "Pick two or three role-relevant strengths and back each with a concrete example.", "If they do not tie to the job description, they do not count.", ["self-awareness"]],
  [InterviewCategory.competency, Difficulty.medium, "What is your biggest weakness?", "Pick a real weakness, then describe what you are actively doing about it.", "Growth signals more than the weakness itself.", ["honesty", "growth"]],
  [InterviewCategory.competency, Difficulty.medium, "Why are you leaving your current role?", "Stay positive. Frame it forward around what you want next.", "Never criticise the employer or manager.", ["motivation"]],
  [InterviewCategory.technical, Difficulty.easy, "Explain the difference between SQL and NoSQL.", "SQL is relational and ACID-oriented. NoSQL is flexible and often horizontally scalable.", "Give one concrete example of when you would choose each.", ["sql", "databases"]],
  [InterviewCategory.technical, Difficulty.medium, "How does HTTPS work at a high level?", "Explain certificate exchange, key agreement, and symmetric encryption.", "Explain why each step exists, not just the names.", ["security", "networking"]],
  [InterviewCategory.technical, Difficulty.medium, "What is the difference between processes and threads?", "Processes have isolated memory, while threads share memory and are cheaper but risk races.", "Tie it back to a real concurrency bug.", ["os", "concurrency"]],
  [InterviewCategory.technical, Difficulty.hard, "Design a URL shortener like bit.ly.", "Discuss IDs, base62, database schema, cache, analytics, custom aliases, expiry, and scale.", "Drive the conversation with estimates.", ["system-design"]],
  [InterviewCategory.industry, Difficulty.easy, "Why do you want to work in Sri Lanka's BPO/IT outsourcing sector?", "Mention global client exposure, English workflows, and the maturity of Colombo's tech ecosystem.", "Specifics beat generic enthusiasm.", ["bpo", "it-outsourcing", "sri-lanka"]],
  [InterviewCategory.industry, Difficulty.medium, "How would you handle a client time-zone gap when your team is in Colombo and the client is in the US?", "Use async-first communication, overlap windows, written status updates, and handover docs.", "Time-zone literacy is a Sri Lankan career multiplier.", ["bpo", "communication"]],
  [InterviewCategory.industry, Difficulty.medium, "What do you know about the Sri Lankan apparel industry's move into tech-enabled manufacturing?", "Mention MAS, Brandix, Hirdaramani, IoT, automation, and ERP adoption.", "Show awareness of the shift to value-add.", ["apparel", "manufacturing"]],
  [InterviewCategory.industry, Difficulty.medium, "How would you adapt a global digital marketing campaign for a Sinhala/Tamil-speaking audience?", "Discuss Sinhala Unicode, font fallbacks, local imagery, festival calendars, and channels like Facebook, Daraz, and ikman.lk.", "Translation is not localisation.", ["marketing", "localization"]],
  [InterviewCategory.industry, Difficulty.hard, "Sri Lanka's tourism is recovering after the 2019 attacks and 2022 crisis. How would you design a hospitality service that builds back trust?", "Talk about safety transparency, local partnerships, sustainable certification, pre-arrival information, and stable pricing.", "Show empathy with the sector's recent history.", ["tourism", "hospitality"]],
  [InterviewCategory.industry, Difficulty.easy, "Describe a financial product that would resonate with Sri Lankan SME owners.", "Mention digital lending, invoice factoring, multi-currency accounts, and SME-friendly KYC.", "Local banking knowledge signals seriousness.", ["finance", "sme", "sri-lanka"]],
  [InterviewCategory.technical, Difficulty.easy, "What is the difference between Git merge and rebase?", "Merge preserves history with a merge commit; rebase replays commits onto a new base.", "Mention not rebasing shared branches.", ["git"]],
  [InterviewCategory.technical, Difficulty.medium, "Explain how an HTTP cookie is different from localStorage.", "Cookies can be HttpOnly/Secure/SameSite and are sent with requests. localStorage is JS-only and larger.", "Tie this to auth token security.", ["web", "security"]],
  [InterviewCategory.technical, Difficulty.hard, "How does a JWT differ from a session cookie, and what are the trade-offs?", "JWT is stateless and hard to revoke. A server session is easy to revoke but needs a lookup.", "Senior interviewers want to hear about revocation.", ["auth", "security"]],
  [InterviewCategory.behavioral, Difficulty.easy, "Where do you see yourself in five years?", "Show ambition tied to the role's path and skills you want to grow.", "Avoid being too vague or too rigid.", ["career-path"]],
  [InterviewCategory.behavioral, Difficulty.medium, "Tell me about a time you went above and beyond for a customer.", "Use STAR and focus on judgement plus measurable result.", "Customer obsession is rewarded heavily in service roles.", ["customer"]],
  [InterviewCategory.competency, Difficulty.hard, "Walk me through how you would onboard yourself in your first 90 days here.", "30 days: learn and ship small. 60: own a project. 90: propose an improvement.", "Have a structured answer ready.", ["onboarding", "self-direction"]],
  [InterviewCategory.situational, Difficulty.medium, "You discover a serious bug just before release. What do you do?", "Assess severity, inform stakeholders, propose options, document and test the fix, then run a postmortem.", "Do not hide it or ship a data-impacting bug.", ["incident", "judgement"]],
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseBool(value: string | undefined) {
  const normalized = value?.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "t" || normalized === "y";
}

function cleanString(value: string | undefined) {
  const normalized = value?.trim();
  return !normalized || ["nan", "nat", "none"].includes(normalized.toLowerCase()) ? "" : normalized;
}

function parseDate(value: string | undefined) {
  const normalized = cleanString(value);
  return normalized ? new Date(`${normalized}T00:00:00.000Z`) : null;
}

function parseNumber(value: string | undefined) {
  const normalized = cleanString(value);
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseCsv(content: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

    if (char === '"' && next === '"' && inQuotes) {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value.length > 0)) rows.push(row);

  const [headers = [], ...dataRows] = rows;
  return dataRows.map((dataRow) =>
    Object.fromEntries(headers.map((header, index) => [header, dataRow[index] ?? ""])),
  );
}

async function upsertCategories() {
  await Promise.all(
    categories.map((name) =>
      prisma.category.upsert({
        where: { slug: slugify(name) },
        update: { name },
        create: { name, slug: slugify(name) },
      }),
    ),
  );
}

async function seedCostOfLiving() {
  for (const [city, overallIndex, housingIndex, foodIndex, transportationIndex] of costOfLivingData) {
    await prisma.costOfLivingData.upsert({
      where: { city_country: { city, country: "Sri Lanka" } },
      update: { overallIndex, housingIndex, foodIndex, transportationIndex, state: "" },
      create: { city, country: "Sri Lanka", state: "", overallIndex, housingIndex, foodIndex, transportationIndex },
    });
  }
}

async function seedSalaries() {
  for (const [jobTitle, jobCategory, industry, experienceLevel, baseMin, baseMax] of salaryRoles) {
    for (const [city, state, multiplier] of salaryCities) {
      const salaryMin = Math.round((baseMin * multiplier) / 1000) * 1000;
      const salaryMax = Math.round((baseMax * multiplier) / 1000) * 1000;
      const salaryMedian = Math.round((salaryMin + salaryMax) / 2);
      const existing = await prisma.salaryData.findFirst({
        where: { jobTitle, country: "Sri Lanka", city, experienceLevel },
      });
      const data = {
        jobTitle,
        jobCategory,
        industry,
        experienceLevel,
        country: "Sri Lanka",
        state,
        city,
        isRemote: false,
        currency: "LKR",
        salaryMin,
        salaryMax,
        salaryMedian,
        employmentType: EmploymentType.full_time,
        dataSource: "seeded:LK_estimates_2026",
        sampleSize: 25,
        confidenceScore: 60,
        isVerified: false,
      };

      if (existing) {
        await prisma.salaryData.update({ where: { id: existing.id }, data });
      } else {
        await prisma.salaryData.create({ data });
      }
    }
  }
}

async function seedCourses() {
  for (const [provider, title, categoryName, level, awardType, city, district, officialUrl, summary] of courses) {
    const category = await prisma.category.findUnique({ where: { slug: slugify(categoryName) } });
    const existing = await prisma.course.findFirst({ where: { title, provider } });
    const data = {
      title,
      provider,
      categoryId: category?.id,
      officialUrl,
      awardType,
      level,
      city,
      district,
      country: "Sri Lanka",
      currency: "LKR",
      language: "English",
      summary,
      providerVerified: true,
      isFree: false,
      priceLabel: "Visit official site for fees",
    };

    if (existing) {
      await prisma.course.update({ where: { id: existing.id }, data });
    } else {
      await prisma.course.create({ data });
    }
  }
}

async function seedCertifications() {
  for (const [provider, title, categoryName, awardType, summary, officialUrl] of certifications) {
    const category = await prisma.category.findUnique({ where: { slug: slugify(categoryName) } });
    const existing = await prisma.course.findFirst({ where: { title, provider } });
    const data = {
      title,
      provider,
      categoryId: category?.id,
      officialUrl,
      awardType,
      level: "Professional",
      country: "Sri Lanka",
      currency: "LKR",
      language: "English",
      summary,
      providerVerified: true,
      isFree: false,
      priceLabel: "Visit official site for fees",
      certificateIncluded: true,
    };

    if (existing) {
      await prisma.course.update({ where: { id: existing.id }, data });
    } else {
      await prisma.course.create({ data });
    }
  }
}

async function seedQuestions() {
  for (const [category, difficulty, questionText, sampleAnswer, tips, tags] of questions) {
    const existing = await prisma.interviewQuestion.findFirst({ where: { questionText } });
    const data = {
      questionText,
      category,
      difficulty,
      sampleAnswer,
      tips,
      tags: tags.join(","),
      isActive: true,
      isPremium: false,
    };

    if (existing) {
      await prisma.interviewQuestion.update({ where: { id: existing.id }, data });
    } else {
      await prisma.interviewQuestion.create({ data });
    }
  }
}

async function importCourseCsv() {
  const referenceRoot = process.env.CAREER_STUDIO_DJANGO_ROOT ?? path.resolve(process.cwd(), "..", "Career Studio");
  const csvPath = process.env.COURSES_SEED_CSV ?? path.join(referenceRoot, "courses_seed_batch_82.csv");
  if (!existsSync(csvPath)) return 0;

  const rows = parseCsv(readFileSync(csvPath, "utf8"));
  const data = rows.map((row) => ({
    courseId: cleanString(row.course_id) || null,
    courseSlug: cleanString(row.course_slug) || null,
    status: cleanString(row.status) || null,
    featured: parseBool(row.featured),
    providerName: cleanString(row.provider_name) || null,
    provider: cleanString(row.provider_name),
    providerVerified: parseBool(row.provider_verified),
    providerLogoUrl: cleanString(row.provider_logo_url) || null,
    providerWebsite: cleanString(row.provider_website) || null,
    officialUrl: cleanString(row.official_url) || null,
    detailsUrl: cleanString(row.details_url) || null,
    applyUrl: cleanString(row.apply_url) || null,
    syllabusUrl: cleanString(row.syllabus_url) || null,
    coverImageUrl: cleanString(row.cover_image_url) || null,
    industry: cleanString(row.industry) || null,
    industryGroup: cleanString(row.industry_group) || null,
    subcategory: cleanString(row.subcategory) || null,
    courseTitle: cleanString(row.course_title) || null,
    title: cleanString(row.course_title),
    shortTitle: cleanString(row.short_title) || null,
    description: cleanString(row.description),
    pricingModel: cleanString(row.pricing_model) || null,
    deliveryRegion: cleanString(row.delivery_region) || null,
    attendanceMode: cleanString(row.attendance_mode) || null,
    country: cleanString(row.country) || null,
    stateProvince: cleanString(row.state_province) || null,
    city: cleanString(row.city),
    venueName: cleanString(row.venue_name) || null,
    venueAddress: cleanString(row.venue_address) || null,
    timezone: cleanString(row.timezone) || null,
    language: cleanString(row.language),
    level: cleanString(row.level),
    certificateAvailable: parseBool(row.certificate_available),
    installmentsAvailable: parseBool(row.installments_available),
    financialAidAvailable: parseBool(row.financial_aid_available),
    durationValue: cleanString(row.duration_value) || null,
    durationUnit: cleanString(row.duration_unit) || null,
    scheduleType: cleanString(row.schedule_type) || null,
    scheduleNotes: cleanString(row.schedule_notes) || null,
    startDate: parseDate(row.start_date),
    admissionDeadline: parseDate(row.application_deadline),
    enrollmentStatus: cleanString(row.enrollment_status) || null,
    ratingValue: parseNumber(row.rating_value),
    ratingCount: parseNumber(row.rating_count),
    learnerCount: parseNumber(row.learner_count),
    priceAmount: parseNumber(row.price_amount),
    priceCurrency: cleanString(row.price_currency) || null,
    priceLabel: cleanString(row.price_label),
    startingFromAmount: parseNumber(row.starting_from_amount),
    startingFromCurrency: cleanString(row.starting_from_currency) || null,
    installmentFromAmount: parseNumber(row.installment_from_amount),
    feeNotes: cleanString(row.fee_notes) || null,
    mentorSupport: cleanString(row.mentor_support) || null,
    mentorResponseTime: cleanString(row.mentor_response_time) || null,
    tag1: cleanString(row.tag_1) || null,
    tag2: cleanString(row.tag_2) || null,
    tag3: cleanString(row.tag_3) || null,
    tag4: cleanString(row.tag_4) || null,
    badge1: cleanString(row.badge_1) || null,
    badge2: cleanString(row.badge_2) || null,
    badge3: cleanString(row.badge_3) || null,
    cardCtaPrimaryLabel: cleanString(row.card_cta_primary_label) || null,
    cardCtaPrimaryUrl: cleanString(row.card_cta_primary_url) || null,
    cardCtaSecondaryLabel: cleanString(row.card_cta_secondary_label) || null,
    cardCtaSecondaryUrl: cleanString(row.card_cta_secondary_url) || null,
    compareEnabled: parseBool(row.compare_enabled),
    sourceUrl: cleanString(row.source_url) || null,
    backupSourceUrl: cleanString(row.backup_source_url) || null,
    lastVerifiedAt: parseDate(row.last_verified_at),
    linkStatus: cleanString(row.link_status) || null,
    internalNotes: cleanString(row.internal_notes) || null,
    isFree: cleanString(row.pricing_model).toLowerCase() === "free",
    currency: cleanString(row.price_currency) || "LKR",
  }));

  await prisma.course.createMany({ data, skipDuplicates: true });
  return data.length;
}

type FixtureRecord = {
  model?: unknown;
  pk?: unknown;
  fields?: unknown;
};

function isFixtureRecord(value: unknown): value is FixtureRecord {
  return typeof value === "object" && value !== null;
}

function getStringField(fields: Record<string, unknown>, key: string) {
  const value = fields[key];
  return typeof value === "string" ? value : "";
}

async function importToolsFixture() {
  const referenceRoot = process.env.CAREER_STUDIO_DJANGO_ROOT ?? path.resolve(process.cwd(), "..", "Career Studio");
  const fixturePath =
    process.env.TOOLS_AND_DIPLOMAS_JSON ?? path.join(referenceRoot, "backend", "tools_and_diplomas.json");
  if (!existsSync(fixturePath)) return 0;

  const parsed: unknown = JSON.parse(readFileSync(fixturePath, "utf8"));
  if (!Array.isArray(parsed)) return 0;

  let count = 0;
  for (const item of parsed) {
    if (!isFixtureRecord(item) || item.model !== "courses.tool" || typeof item.pk !== "number") continue;
    if (typeof item.fields !== "object" || item.fields === null) continue;
    const fields = item.fields as Record<string, unknown>;

    await prisma.tool.upsert({
      where: { id: item.pk },
      update: {
        name: getStringField(fields, "name"),
        industry: getStringField(fields, "industry"),
        tags: getStringField(fields, "tags"),
        tagline: getStringField(fields, "tagline"),
        descriptionSi: getStringField(fields, "description_si"),
        content: getStringField(fields, "content"),
        link: getStringField(fields, "link"),
        icon: getStringField(fields, "icon"),
        isFree: fields.is_free === true,
        verified: fields.verified === true,
      },
      create: {
        id: item.pk,
        name: getStringField(fields, "name"),
        industry: getStringField(fields, "industry"),
        tags: getStringField(fields, "tags"),
        tagline: getStringField(fields, "tagline"),
        descriptionSi: getStringField(fields, "description_si"),
        content: getStringField(fields, "content"),
        link: getStringField(fields, "link"),
        icon: getStringField(fields, "icon"),
        isFree: fields.is_free === true,
        verified: fields.verified === true,
      },
    });
    count += 1;
  }

  return count;
}

async function main() {
  await upsertCategories();
  await seedCostOfLiving();
  await seedSalaries();
  await seedCourses();
  await seedCertifications();
  await seedQuestions();
  const importedCourses = await importCourseCsv();
  const importedTools = await importToolsFixture();

  console.log(`Seeded ${costOfLivingData.length} cost-of-living cities.`);
  console.log(`Seeded ${salaryRoles.length * salaryCities.length} Sri Lankan salary rows.`);
  console.log(`Seeded ${courses.length} university programmes and ${certifications.length} certifications.`);
  console.log(`Seeded ${questions.length} interview questions.`);
  console.log(`Imported ${importedCourses} CSV courses and ${importedTools} tools when reference files were available.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
