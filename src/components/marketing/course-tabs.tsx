import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { courseTabs } from "@/lib/public-content";
import { cn } from "@/lib/utils";

export function CourseTabs({ locale, current }: { locale: string; current: string }) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Course directory sections">
      {courseTabs.map((tab) => {
        const isActive = tab.href === current;

        return (
          <Badge
            key={tab.href}
            asChild
            variant={isActive ? "default" : "outline"}
            className={cn("h-9 rounded-md px-3 text-sm", isActive ? "bg-teal-700 text-white" : "bg-white")}
          >
            <Link href={`/${locale}${tab.href}`}>{tab.label}</Link>
          </Badge>
        );
      })}
    </nav>
  );
}
