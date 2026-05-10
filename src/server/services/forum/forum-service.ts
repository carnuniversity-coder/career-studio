import { prisma } from "@/lib/prisma";

const defaultForumRoles = [
  {
    name: "Software Engineers",
    slug: "software-engineers",
    description: "Engineering interviews, portfolios, stack choices, and role-specific job search support.",
  },
  {
    name: "Business & Finance",
    slug: "business-finance",
    description: "Accounting, finance, operations, banking, and analyst career discussions.",
  },
  {
    name: "Creative & Marketing",
    slug: "creative-marketing",
    description: "Brand, content, design, growth, and portfolio-led career paths.",
  },
  {
    name: "Early Career",
    slug: "early-career",
    description: "Internships, first jobs, campus hiring, and transition support for new professionals.",
  },
] as const;

export async function ensureDefaultForumRoles() {
  const count = await prisma.forumRole.count();

  if (count > 0) {
    return prisma.forumRole.findMany({ orderBy: { name: "asc" } });
  }

  await prisma.$transaction(
    defaultForumRoles.map((role) =>
      prisma.forumRole.upsert({
        where: { slug: role.slug },
        create: role,
        update: role,
      })
    )
  );

  return prisma.forumRole.findMany({ orderBy: { name: "asc" } });
}
