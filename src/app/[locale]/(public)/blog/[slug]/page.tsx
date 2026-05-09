import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, Tag } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { defaultLocale, isLocale, locales } from "@/i18n-config";
import { blogPosts, findBlogPost } from "@/lib/public-content";

type BlogPostPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return locales.flatMap((locale) => blogPosts.map((post) => ({ locale, slug: post.slug })));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const post = findBlogPost(slug);
  const t = await getTranslations({ locale, namespace: "phase1.meta.blogPost" });

  if (!post) {
    return {
      title: t("notFoundTitle"),
    };
  }

  return {
    title: `${post.title} | Career Studio Blog`,
    description: post.excerpt,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `https://careerstudio.app/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const post = findBlogPost(slug);
  const t = await getTranslations({ locale, namespace: "phase1.blogPost" });

  if (!post) {
    notFound();
  }

  const relatedPosts = blogPosts.filter((item) => item.slug !== post.slug && item.category === post.category).slice(0, 2);

  return (
    <article className="bg-white">
      <header className="border-b bg-gradient-to-br from-white via-teal-50 to-amber-50">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <Button asChild variant="ghost" className="-ml-3 mb-6">
            <Link href={`/${locale}/blog`}>
              <ArrowLeft className="size-4" />
              {t("back")}
            </Link>
          </Button>
          <Badge variant="outline" className="rounded-md border-teal-200 bg-white text-teal-800">
            {post.category}
          </Badge>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-neutral-950 md:text-5xl">{post.title}</h1>
          <p className="mt-5 text-lg leading-8 text-neutral-600">{post.excerpt}</p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-neutral-600">
            <span>{post.author}</span>
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="size-4" />
              {post.date}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="size-4" />
              {post.readingTime}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[1fr_280px]">
        <div className="mx-auto max-w-3xl">
          {post.sections.map((section) => (
            <section key={section.heading} className="mb-10">
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">{section.heading}</h2>
              <p className="mt-4 text-base leading-8 text-neutral-700">{section.body}</p>
            </section>
          ))}
        </div>

        <aside className="space-y-4">
          <Card className="bg-neutral-50">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 font-semibold text-neutral-950">
                <Tag className="size-4 text-teal-700" />
                {t("topics")}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="rounded-md bg-white">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          {relatedPosts.length > 0 ? (
            <Card className="bg-white">
              <CardContent className="p-5">
                <div className="font-semibold text-neutral-950">{t("related")}</div>
                <div className="mt-4 grid gap-3">
                  {relatedPosts.map((item) => (
                    <Link key={item.slug} href={`/${locale}/blog/${item.slug}`} className="text-sm leading-6 text-teal-800 hover:underline">
                      {item.title}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </div>
    </article>
  );
}
