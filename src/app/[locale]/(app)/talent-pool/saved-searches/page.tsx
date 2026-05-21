import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Search, MapPin, Briefcase, Trash2, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { defaultLocale, isLocale } from "@/i18n-config";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type SavedSearchesPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Saved Searches & Alerts - Recruiter Dashboard",
    description: "Manage your saved talent searches and email alerts.",
  };
}

export default async function SavedSearchesPage({ params }: SavedSearchesPageProps) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/auth/sign-in`);
  }

  const recruiter = await prisma.recruiterProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      savedSearches: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!recruiter) {
    redirect(`/${locale}/talent-pool`);
  }

  return (
    <div className="mx-auto max-w-5xl py-8 space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
          <Link href={`/${locale}/talent-pool`} className="hover:text-neutral-900 transition-colors">Talent Pool</Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium">Saved Searches</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Saved Searches & Alerts</h1>
        <p className="text-neutral-600 max-w-2xl">
          Manage your saved candidate searches. We will notify you when new candidates matching these criteria join the platform or become "Open to Work".
        </p>
      </div>

      <div className="grid gap-6">
        {recruiter.savedSearches.length === 0 ? (
          <Card className="bg-neutral-50/50 border-dashed border-neutral-200">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="size-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-neutral-100 mb-4">
                <Search className="size-5 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-1">No saved searches yet</h3>
              <p className="text-neutral-500 mb-6 max-w-sm">
                Save your frequently used searches to quickly find matching candidates and receive daily email alerts.
              </p>
              <Button asChild className="bg-teal-700 hover:bg-teal-800 text-white">
                <Link href={`/${locale}/talent-pool`}>Browse Talent Pool</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          recruiter.savedSearches.map((search) => {
            const url = `/${locale}/talent-pool?${search.filtersJson}`;
            return (
              <Card key={search.id} className="bg-white border-neutral-200 hover:border-teal-300 transition-all duration-300 group rounded-xl overflow-hidden shadow-sm">
                <CardContent className="p-6 flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h4 className="text-xl font-bold text-neutral-900">{search.name}</h4>
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200">{search.alertFrequency} alerts</Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-1 text-sm text-neutral-600">
                      <span className="flex items-center gap-1.5 bg-neutral-100 px-2 py-1 rounded-md">
                        <Search className="size-3.5 opacity-70" />
                        Query: {search.query || "Any"}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-400 font-medium pt-2">
                      Created {formatDistanceToNow(new Date(search.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="size-4" />
                    </Button>
                    <Button asChild className="bg-teal-700 hover:bg-teal-800 text-white gap-2 shadow-sm w-full sm:w-auto">
                      <Link href={url}>
                        Run Search <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
