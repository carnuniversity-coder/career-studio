import { BadgeCheck, CreditCard, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Course } from "@/lib/public-content";

export function CourseCard({ course }: { course: Course }) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="rounded-md">
            {course.level}
          </Badge>
          {course.verified ? (
            <Badge variant="outline" className="rounded-md border-teal-200 text-teal-800">
              <BadgeCheck className="size-3" />
              Verified
            </Badge>
          ) : null}
          {course.installments ? (
            <Badge variant="outline" className="rounded-md border-amber-200 text-amber-800">
              <CreditCard className="size-3" />
              Installments
            </Badge>
          ) : null}
        </div>
        <CardTitle>{course.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600">
          <span>{course.provider}</span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" />
            {course.city}
          </span>
        </div>
        <p className="mt-4 text-sm leading-6 text-neutral-600">{course.summary}</p>
        <div className="mt-5 flex items-center justify-between gap-4">
          <span className="text-sm text-neutral-500">{course.category}</span>
          <span className="font-semibold text-neutral-950">{course.price}</span>
        </div>
      </CardContent>
    </Card>
  );
}
