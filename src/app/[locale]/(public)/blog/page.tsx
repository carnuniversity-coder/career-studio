import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Search, Tag } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { SectionHeading } from "@/components/marketing/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { defaultLocale, isLocale } from "@/i18n-config";
import { blogCategories, blogPosts } from "@/lib/public-content";

type BlogPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: "phase1.meta.blog" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const query = await searchParams;
  const t = await getTranslations({ locale, namespace: "phase1.blog" });
  const q = firstParam(query.q).toLowerCase();
  const category = firstParam(query.category);
  const sort = firstParam(query.sort) || "latest";
  const filteredPosts = blogPosts
    .filter((post) => {
      const haystack = `${post.title} ${post.excerpt} ${post.tags.join(" ")}`.toLowerCase();

      return (!q || haystack.includes(q)) && (!category || post.category === category);
    })
    .sort((a, b) => {
      if (sort === "oldest") {
        return a.date.localeCompare(b.date);
      }

      return b.date.localeCompare(a.date);
    });
  const featuredPost = filteredPosts.find((post) => post.featured) ?? filteredPosts[0];
  const gridPosts = filteredPosts.filter((post) => post.slug !== featuredPost?.slug);

  return (
    <div className="bg-white">
      <section className="border-b bg-gradient-to-br from-teal-50 via-white to-amber-50">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <form action={`/${locale}/blog`} className="rounded-xl border bg-neutral-50 p-4">
          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_auto]">
            <div>
              <Label htmlFor="q">{t("searchLabel")}</Label>
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                <Input id="q" name="q" defaultValue={firstParam(query.q)} className="pl-9" />
              </div>
            </div>
            <div>
              <Label htmlFor="category">{t("categoryLabel")}</Label>
              <select
                id="category"
                name="category"
                defaultValue={category}
                className="mt-2 h-9 w-full rounded-md border bg-white px-3 text-sm"
              >
                <option value="">{t("allTopics")}</option>
                {blogCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="sort">{t("sortLabel")}</Label>
              <select id="sort" name="sort" defaultValue={sort} className="mt-2 h-9 w-full rounded-md border bg-white px-3 text-sm">
                <option value="latest">{t("latest")}</option>
                <option value="oldest">{t("oldest")}</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full bg-teal-700 text-white hover:bg-teal-800">
                {t("filter")}
              </Button>
            </div>
          </div>
        </form>

        {featuredPost ? (
          <Card className="mt-8 border-teal-200 bg-white">
            <CardContent className="grid gap-6 p-6 lg:grid-cols-[0.75fr_1.25fr]">
              <div className="rounded-lg bg-neutral-950 p-6 text-white">
                <Badge variant="secondary" className="rounded-md">
                  {t("featured")}
                </Badge>
                <h2 className="mt-6 text-3xl font-semibold tracking-tight">{featuredPost.title}</h2>
                <p className="mt-4 text-sm leading-6 text-neutral-300">{featuredPost.excerpt}</p>
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap gap-3 text-sm text-neutral-600">
                    <span className="inline-flex items-center gap-2">
                      <Tag className="size-4" />
                      {featuredPost.category}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="size-4" />
                      {featuredPost.date}
                    </span>
                    <span>{featuredPost.readingTime}</span>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {featuredPost.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="rounded-md">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button asChild className="mt-6 w-fit bg-teal-700 text-white hover:bg-teal-800">
                  <Link href={`/${locale}/blog/${featuredPost.slug}`}>
                    {t("readArticle")}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {gridPosts.map((post) => (
            <Card key={post.slug} className="bg-white">
              <CardHeader>
                <Badge variant="outline" className="w-fit rounded-md">
                  {post.category}
                </Badge>
                <CardTitle>{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-neutral-600">{post.excerpt}</p>
                <div className="mt-5 flex items-center justify-between gap-4 text-sm text-neutral-500">
                  <span>{post.date}</span>
                  <span>{post.readingTime}</span>
                </div>
                <Button asChild variant="outline" className="mt-5 w-full">
                  <Link href={`/${locale}/blog/${post.slug}`}>{t("readArticle")}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPosts.length === 0 ? (
          <div className="mt-8 rounded-xl border bg-neutral-50 p-8 text-center text-sm text-neutral-600">{t("empty")}</div>
        ) : null}
      </section>
    </div>
  );
}
