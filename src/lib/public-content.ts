export type MarketingStat = {
  value: string;
  label: string;
};

export type Feature = {
  title: string;
  description: string;
};

export type PricingPlan = {
  name: string;
  price: string;
  period: string;
  description: string;
  badge?: string;
  cta: string;
  href: string;
  highlighted?: boolean;
  disabled?: boolean;
  features: string[];
};

export type ResumeTemplateTier = {
  name: string;
  price: string;
  description: string;
};

export type ToolShowcaseItem = {
  title: string;
  description: string;
  href?: string;
  badge: string;
  status: "active" | "coming-soon";
};

export type ResourceCard = {
  title: string;
  description: string;
  count: string;
  badge: string;
  href?: string;
  disabled?: boolean;
};

export type Course = {
  title: string;
  provider: string;
  city: string;
  category: string;
  level: string;
  price: string;
  verified: boolean;
  installments: boolean;
  summary: string;
};

export type CourseTool = {
  name: string;
  tagline: string;
  industry: string;
  pricing: string;
  verified: boolean;
};

export type CourseCity = {
  name: string;
  district: string;
  focus: string;
  courseCount: number;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readingTime: string;
  featured?: boolean;
  tags: string[];
  sections: {
    heading: string;
    body: string;
  }[];
};

export const landingStats: MarketingStat[] = [
  { value: "137+", label: "resumes started in the pilot" },
  { value: "153+", label: "applications tracked by early users" },
  { value: "4.8/5", label: "early satisfaction score" },
];

export const landingFeatures: Feature[] = [
  {
    title: "ATS-ready resume builder",
    description:
      "Structured sections, role-aware writing prompts, and export flows designed for Sri Lankan recruiters and global ATS systems.",
  },
  {
    title: "Sri Lanka salary context",
    description:
      "LKR-first salary insights, city cost-of-living comparisons, and local course pathways stay close to the market users actually face.",
  },
  {
    title: "Career workflow hub",
    description:
      "Move from CV polishing to job tracking, interview practice, LinkedIn rewrites, and Career GPS plans without stitching tools together.",
  },
];

export const resumeTemplateTiers: ResumeTemplateTier[] = [
  {
    name: "Basic",
    price: "Rs. 0",
    description: "Clean starter templates for first resumes and quick applications.",
  },
  {
    name: "Pro",
    price: "Rs. 1,000",
    description: "Role-targeted layouts with stronger section controls.",
  },
  {
    name: "Premium",
    price: "Rs. 1,500",
    description: "Executive-ready templates with richer presentation options.",
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    name: "Essential",
    price: "Rs. 0",
    period: "forever",
    description: "Start with the core resume and ATS workflows.",
    badge: "Free",
    cta: "Start free",
    href: "/auth/sign-up",
    features: [
      "Basic resume builder",
      "10 ATS scans per month",
      "1 standard resume template",
      "PDF export",
      "Sri Lanka course discovery",
    ],
  },
  {
    name: "Pro",
    price: "Rs. 2,990",
    period: "per month",
    description: "For active job seekers applying across several roles.",
    badge: "Most popular",
    cta: "Join waitlist",
    href: "#",
    highlighted: true,
    disabled: true,
    features: [
      "All premium career tools",
      "Unlimited ATS scoring and fixing",
      "AI cover letters",
      "LinkedIn optimization",
      "50+ resume templates",
    ],
  },
  {
    name: "Executive",
    price: "Rs. 8,990",
    period: "per month",
    description: "High-touch support for senior and specialist searches.",
    badge: "Coming soon",
    cta: "Coming soon",
    href: "#",
    disabled: true,
    features: [
      "Expert resume review",
      "1-on-1 career consultation",
      "Custom cover letter writing",
      "Priority support",
      "Interview preparation guidance",
    ],
  },
];

export const toolShowcaseItems: ToolShowcaseItem[] = [
  {
    title: "ATS CV Writer",
    description:
      "Create ATS-optimized resumes with role-specific structure, formatting suggestions, and keyword recommendations.",
    href: "/resumes",
    badge: "Free",
    status: "active",
  },
  {
    title: "ATS Score Checker",
    description:
      "Analyze a resume against a job description, review score breakdowns, and spot missing keywords before applying.",
    href: "/ats",
    badge: "Free",
    status: "active",
  },
  {
    title: "Cover Letter Writer",
    description:
      "Generate tailored cover letters from a resume, job role, and company context, then export the final draft.",
    href: "/cover-letter",
    badge: "Free",
    status: "active",
  },
  {
    title: "LinkedIn Optimization",
    description:
      "Audit headline, about, experience, and keyword coverage for stronger recruiter discovery.",
    href: "/linkedin",
    badge: "Free",
    status: "active",
  },
  {
    title: "Course & Tool Discovery Hub",
    description:
      "Browse local degrees, diplomas, certifications, and practical AI tools tuned for Sri Lankan career paths.",
    href: "/courses",
    badge: "Active",
    status: "active",
  },
  {
    title: "Graphical CV Builder",
    description:
      "Design visual CVs for creative and portfolio-led roles with safer export controls.",
    badge: "Coming soon",
    status: "coming-soon",
  },
  {
    title: "Salary Finder",
    description:
      "Compare LKR salary bands and cost-of-living differences across Colombo, Kandy, Galle, Jaffna, and more.",
    badge: "Coming soon",
    status: "coming-soon",
  },
  {
    title: "Career GPS",
    description:
      "Generate a step-by-step roadmap with weekly milestones, course links, and interview prep tasks.",
    badge: "Coming soon",
    status: "coming-soon",
  },
  {
    title: "Job Tracker",
    description:
      "Track applications from saved to offer with reminders, notes, and interview-stage analytics.",
    badge: "Coming soon",
    status: "coming-soon",
  },
];

export const resourceCards: ResourceCard[] = [
  {
    title: "Resume Templates",
    description:
      "ATS-friendly document templates for internships, associate roles, and experienced professionals.",
    count: "10 templates",
    badge: "New & free",
    href: "/resources",
  },
  {
    title: "Ebooks & Guides",
    description:
      "Practical job-search guides covering resumes, interviews, LinkedIn, and application strategy.",
    count: "28+ ebooks",
    badge: "Free",
    href: "/resources",
  },
  {
    title: "Interview Prep Guide",
    description:
      "Structured question sets for behavioral, technical, situational, competency, and local industry interviews.",
    count: "27 questions",
    badge: "Coming soon",
    disabled: true,
  },
  {
    title: "Labour Law & Rights",
    description:
      "Plain-English resources for offers, contracts, leave, notice periods, and workplace rights in Sri Lanka.",
    count: "In review",
    badge: "Coming soon",
    disabled: true,
  },
];

export const resourceCollections: Feature[] = [
  {
    title: "Tech Careers Kit",
    description:
      "Resume phrases, project framing, interview drills, and course links for software, QA, data, and cloud roles.",
  },
  {
    title: "Career Switcher Guide",
    description:
      "A practical path for moving from service, operations, or education roles into digital and knowledge-work tracks.",
  },
  {
    title: "Fresh Graduate Pack",
    description:
      "Entry-level CV guidance, internship preparation, and first-job interview resources for Sri Lankan graduates.",
  },
];

export const courseTabs = [
  { label: "Courses", href: "/courses" },
  { label: "Diplomas", href: "/courses/diplomas" },
  { label: "Tools", href: "/courses/tools" },
  { label: "Cities", href: "/courses/cities" },
  { label: "Saved", href: "/courses/saved" },
] as const;

export const courses: Course[] = [
  {
    title: "BSc Engineering - Computer Science & Engineering",
    provider: "University of Moratuwa",
    city: "Moratuwa",
    category: "Engineering",
    level: "Degree",
    price: "Rs. 0",
    verified: true,
    installments: false,
    summary: "Highly competitive engineering pathway with strong software, systems, and research foundations.",
  },
  {
    title: "BSc in Computer Science",
    provider: "University of Colombo School of Computing",
    city: "Colombo",
    category: "Technology",
    level: "Degree",
    price: "Rs. 0",
    verified: true,
    installments: false,
    summary: "Public university computer science programme with strong industry recognition in Sri Lanka.",
  },
  {
    title: "BSc in Information Technology",
    provider: "SLIIT",
    city: "Malabe",
    category: "Technology",
    level: "Degree",
    price: "Rs. 390,000",
    verified: true,
    installments: true,
    summary: "Private-sector IT degree pathway with flexible specialization and internship exposure.",
  },
  {
    title: "BSc (Hons) Software Engineering",
    provider: "NSBM Green University",
    city: "Homagama",
    category: "Technology",
    level: "Degree",
    price: "Rs. 420,000",
    verified: true,
    installments: true,
    summary: "Software engineering programme focused on product development, teamwork, and employability.",
  },
  {
    title: "Advanced Diploma in Software Engineering",
    provider: "NIBM",
    city: "Colombo",
    category: "Technology",
    level: "Diploma",
    price: "Rs. 210,000",
    verified: true,
    installments: true,
    summary: "Practical diploma route for learners building employable programming and systems skills.",
  },
  {
    title: "Professional Certificate in Marketing",
    provider: "SLIM",
    city: "Colombo",
    category: "Business",
    level: "Certificate",
    price: "Rs. 95,000",
    verified: true,
    installments: true,
    summary: "Recognised marketing foundation for brand, sales, digital, and customer-facing career paths.",
  },
  {
    title: "Chartered Accountancy Qualification",
    provider: "CA Sri Lanka",
    city: "Colombo",
    category: "Finance",
    level: "Professional",
    price: "Rs. 120,000",
    verified: true,
    installments: true,
    summary: "Professional accounting pathway for audit, finance, taxation, and advisory careers.",
  },
  {
    title: "BA (Hons) Fashion Design",
    provider: "AOD",
    city: "Colombo",
    category: "Creative",
    level: "Degree",
    price: "Rs. 520,000",
    verified: true,
    installments: true,
    summary: "Creative degree for fashion design, visual portfolios, and design-led careers.",
  },
];

export const diplomaCourses: Course[] = courses.filter((course) => course.level === "Diploma").concat([
  {
    title: "Diploma in Human Resource Management",
    provider: "IPM Sri Lanka",
    city: "Colombo",
    category: "Business",
    level: "Diploma",
    price: "Rs. 145,000",
    verified: true,
    installments: true,
    summary: "Professional HR route covering recruitment, learning, performance, and employee relations.",
  },
  {
    title: "Higher National Diploma in Computing",
    provider: "ICBT Campus",
    city: "Colombo",
    category: "Technology",
    level: "Diploma",
    price: "Rs. 240,000",
    verified: true,
    installments: true,
    summary: "Career-focused computing diploma with progression options into degree study.",
  },
  {
    title: "Diploma in Business Management",
    provider: "APIIT Sri Lanka",
    city: "Colombo",
    category: "Business",
    level: "Diploma",
    price: "Rs. 180,000",
    verified: true,
    installments: true,
    summary: "Business pathway for operations, administration, sales, and early management careers.",
  },
]);

export const courseTools: CourseTool[] = [
  {
    name: "ChatGPT",
    tagline: "Draft resumes, interview answers, and study notes with structured prompting.",
    industry: "Productivity",
    pricing: "Free + paid",
    verified: true,
  },
  {
    name: "Canva",
    tagline: "Create portfolios, presentation decks, and simple visual CV materials.",
    industry: "Design",
    pricing: "Free + paid",
    verified: true,
  },
  {
    name: "Notion AI",
    tagline: "Organize job applications, learning plans, and weekly progress notes.",
    industry: "Productivity",
    pricing: "Paid",
    verified: true,
  },
  {
    name: "Grammarly",
    tagline: "Polish English application documents and recruiter messages.",
    industry: "Writing",
    pricing: "Free + paid",
    verified: true,
  },
  {
    name: "Figma",
    tagline: "Build UX portfolios, wireframes, and collaborative design case studies.",
    industry: "Design",
    pricing: "Free + paid",
    verified: true,
  },
  {
    name: "Google Career Certificates",
    tagline: "Entry-level pathways for data analytics, IT support, UX, and project management.",
    industry: "Learning",
    pricing: "Paid",
    verified: true,
  },
];

export const courseCities: CourseCity[] = [
  { name: "Colombo", district: "Colombo", focus: "IT, finance, marketing, management", courseCount: 42 },
  { name: "Moratuwa", district: "Colombo", focus: "Engineering, computer science", courseCount: 9 },
  { name: "Malabe", district: "Colombo", focus: "Private IT and business degrees", courseCount: 13 },
  { name: "Homagama", district: "Colombo", focus: "Technology, business, green campus programmes", courseCount: 10 },
  { name: "Kandy", district: "Kandy", focus: "Management, healthcare, language, IT", courseCount: 15 },
  { name: "Peradeniya", district: "Kandy", focus: "Science, engineering, humanities", courseCount: 8 },
  { name: "Galle", district: "Galle", focus: "Tourism, hospitality, business", courseCount: 7 },
  { name: "Jaffna", district: "Jaffna", focus: "IT, accounting, English, professional studies", courseCount: 6 },
];

export const blogCategories = [
  "Resume Strategy",
  "ATS",
  "LinkedIn",
  "Interviews",
  "Salary",
  "Career Switching",
] as const;

export const blogPosts: BlogPost[] = [
  {
    slug: "ats-resume-checklist-sri-lanka",
    title: "ATS resume checklist for Sri Lankan job seekers",
    excerpt:
      "A practical checklist for making your CV easier for applicant tracking systems and recruiters to read.",
    category: "ATS",
    author: "Career Studio Team",
    date: "2026-04-21",
    readingTime: "5 min read",
    featured: true,
    tags: ["ATS", "Resume", "Sri Lanka"],
    sections: [
      {
        heading: "Start with a plain structure",
        body:
          "Use clear headings, consistent dates, and simple section ordering. ATS tools reward clarity before visual flair, especially for roles posted through large portals.",
      },
      {
        heading: "Match the language of the vacancy",
        body:
          "Sri Lankan job descriptions often mix local titles with global skill language. Mirror the role title, tools, certifications, and industry keywords honestly where they fit your experience.",
      },
      {
        heading: "Keep evidence close to each skill",
        body:
          "Instead of listing tools alone, pair them with outcomes: reports built, customers supported, systems maintained, campaigns launched, or revenue protected.",
      },
    ],
  },
  {
    slug: "salary-negotiation-lkr-guide",
    title: "How to discuss salary in LKR with better context",
    excerpt:
      "Use salary bands, city costs, and total compensation language to negotiate without sounding vague.",
    category: "Salary",
    author: "Career Studio Team",
    date: "2026-04-12",
    readingTime: "4 min read",
    tags: ["LKR", "Negotiation", "Salary"],
    sections: [
      {
        heading: "Anchor the discussion",
        body:
          "Use a monthly LKR range backed by role, location, seniority, and your strongest evidence. A clear range is easier to discuss than a single number.",
      },
      {
        heading: "Compare more than basic pay",
        body:
          "Ask about allowances, medical cover, hybrid work, transport, annual increments, and training budgets. For many Sri Lankan roles, the package matters as much as the headline salary.",
      },
    ],
  },
  {
    slug: "linkedin-headline-colombo-recruiters",
    title: "LinkedIn headline patterns recruiters can understand quickly",
    excerpt:
      "Simple headline formulas for software, finance, operations, marketing, and graduate job seekers.",
    category: "LinkedIn",
    author: "Career Studio Team",
    date: "2026-03-30",
    readingTime: "3 min read",
    tags: ["LinkedIn", "Recruiters", "Branding"],
    sections: [
      {
        heading: "Lead with the role you want",
        body:
          "A headline should make the target role obvious in the first few words, then add proof such as tools, domain, certifications, or portfolio strength.",
      },
      {
        heading: "Avoid stuffing every skill",
        body:
          "Recruiters scan quickly. Three precise signals beat ten loosely related keywords, especially when your experience section supports them.",
      },
    ],
  },
  {
    slug: "interview-prep-bpo-it-outsourcing",
    title: "Interview prep for BPO, IT, and outsourcing roles",
    excerpt:
      "Prepare stronger examples for customer handling, shift work, escalation, delivery, and team communication.",
    category: "Interviews",
    author: "Career Studio Team",
    date: "2026-03-18",
    readingTime: "6 min read",
    tags: ["Interview", "BPO", "IT"],
    sections: [
      {
        heading: "Prepare service examples",
        body:
          "Have short examples ready for difficult customers, tight deadlines, quality checks, and handovers. These show judgment as well as communication.",
      },
      {
        heading: "Show reliability",
        body:
          "For shift and delivery roles, employers listen for consistency: attendance, documentation, escalation habits, and how you recover when a plan changes.",
      },
    ],
  },
];

export function findBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
