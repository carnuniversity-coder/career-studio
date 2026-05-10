"use server";

import { MentorshipRequestStatus, NotificationType, Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";

import type { Locale } from "@/i18n-config";
import { displayName } from "@/lib/community";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/server/services/notifications/notification-service";
import { authPath, formValue, requireUser } from "@/server/utils/action-helpers";

const mentorProfileSchema = z.object({
  bio: z.string().trim().min(20).max(3000),
  expertise: z.string().trim().min(2).max(500),
  hourlyRate: z.coerce.number().min(0).max(250000).default(0),
  maxMentees: z.coerce.number().int().min(1).max(25).default(3),
  availability: z.string().trim().max(1000).default(""),
  isActive: z.boolean(),
});

const mentorshipRequestSchema = z.object({
  mentorId: z.string().uuid(),
  message: z.string().trim().min(20).max(2000),
});

const requestResponseSchema = z.object({
  requestId: z.string().uuid(),
  decision: z.enum(["accepted", "declined"]),
});

const sessionSchema = z.object({
  requestId: z.string().uuid(),
  title: z.string().trim().min(3).max(200),
  startTime: z.string().trim().min(1),
  endTime: z.string().trim().min(1),
  meetingLink: z.string().trim().url().optional().or(z.literal("")).default(""),
  notes: z.string().trim().max(2000).default(""),
});

function parseExpertise(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export async function saveMentorProfileAction(locale: Locale, formData: FormData) {
  const user = await requireUser(locale);
  const parsed = mentorProfileSchema.parse({
    bio: formValue(formData, "bio"),
    expertise: formValue(formData, "expertise"),
    hourlyRate: formValue(formData, "hourlyRate") || 0,
    maxMentees: formValue(formData, "maxMentees") || 3,
    availability: formValue(formData, "availability"),
    isActive: formValue(formData, "isActive") === "on",
  });
  const expertise = parseExpertise(parsed.expertise) as Prisma.InputJsonValue;
  const availability = { notes: parsed.availability } as Prisma.InputJsonValue;

  await prisma.mentorProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      bio: parsed.bio,
      expertise,
      hourlyRate: parsed.hourlyRate,
      maxMentees: parsed.maxMentees,
      availability,
      isActive: parsed.isActive,
    },
    update: {
      bio: parsed.bio,
      expertise,
      hourlyRate: parsed.hourlyRate,
      maxMentees: parsed.maxMentees,
      availability,
      isActive: parsed.isActive,
    },
  });

  redirect(authPath(locale, "/mentorship"));
}

export async function requestMentorshipAction(locale: Locale, formData: FormData) {
  const user = await requireUser(locale);
  const parsed = mentorshipRequestSchema.parse({
    mentorId: formValue(formData, "mentorId"),
    message: formValue(formData, "message"),
  });
  const mentor = await prisma.mentorProfile.findFirst({
    where: {
      id: parsed.mentorId,
      isActive: true,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!mentor || mentor.userId === user.id) {
    throw new Error("Mentor is not available");
  }

  const request = await prisma.mentorshipRequest.create({
    data: {
      menteeId: user.id,
      mentorId: mentor.id,
      message: parsed.message,
    },
  });
  const mentee = await prisma.user.findUnique({
    where: { id: user.id },
    select: { firstName: true, lastName: true, email: true },
  });

  await createNotification({
    userId: mentor.userId,
    type: NotificationType.system,
    title: "New mentorship request",
    message: `${displayName(mentee ?? {})} requested mentorship.`,
    actionUrl: `/${locale}/mentorship`,
  });

  redirect(authPath(locale, "/mentorship", { request: request.id }));
}

export async function respondMentorshipRequestAction(
  locale: Locale,
  requestId: string,
  decision: "accepted" | "declined"
) {
  const user = await requireUser(locale);
  const parsed = requestResponseSchema.parse({ requestId, decision });
  const request = await prisma.mentorshipRequest.findUnique({
    where: { id: parsed.requestId },
  });

  if (!request) {
    throw new Error("Mentorship request not found");
  }

  const mentor = await prisma.mentorProfile.findUnique({
    where: { id: request.mentorId },
    select: { userId: true },
  });

  if (mentor?.userId !== user.id) {
    throw new Error("Only the mentor can update this request");
  }

  await prisma.mentorshipRequest.update({
    where: { id: request.id },
    data: { status: parsed.decision },
  });

  await createNotification({
    userId: request.menteeId,
    type: NotificationType.system,
    title: parsed.decision === "accepted" ? "Mentorship accepted" : "Mentorship declined",
    message:
      parsed.decision === "accepted"
        ? "Your mentorship request was accepted. A session can now be scheduled."
        : "Your mentorship request was declined.",
    actionUrl: `/${locale}/mentorship`,
  });

  redirect(authPath(locale, "/mentorship"));
}

export async function scheduleMentorshipSessionAction(locale: Locale, formData: FormData) {
  const user = await requireUser(locale);
  const parsed = sessionSchema.parse({
    requestId: formValue(formData, "requestId"),
    title: formValue(formData, "title"),
    startTime: formValue(formData, "startTime"),
    endTime: formValue(formData, "endTime"),
    meetingLink: formValue(formData, "meetingLink"),
    notes: formValue(formData, "notes"),
  });
  const request = await prisma.mentorshipRequest.findFirst({
    where: {
      id: parsed.requestId,
      status: MentorshipRequestStatus.accepted,
    },
  });

  if (!request) {
    throw new Error("Accepted request not found");
  }

  const mentor = await prisma.mentorProfile.findUnique({
    where: { id: request.mentorId },
    select: { userId: true },
  });

  if (mentor?.userId !== user.id) {
    throw new Error("Only the mentor can schedule this session");
  }

  const startTime = new Date(parsed.startTime);
  const endTime = new Date(parsed.endTime);

  if (Number.isNaN(startTime.valueOf()) || Number.isNaN(endTime.valueOf()) || endTime <= startTime) {
    throw new Error("Invalid session time");
  }

  await prisma.mentorshipSession.create({
    data: {
      requestId: request.id,
      title: parsed.title,
      startTime,
      endTime,
      meetingLink: parsed.meetingLink,
      notes: parsed.notes,
    },
  });

  await createNotification({
    userId: request.menteeId,
    type: NotificationType.system,
    title: "Mentorship session scheduled",
    message: `${parsed.title} has been scheduled.`,
    actionUrl: `/${locale}/mentorship`,
  });

  redirect(authPath(locale, "/mentorship"));
}
