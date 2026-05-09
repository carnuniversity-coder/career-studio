-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('basic', 'pro', 'premium');

-- CreateEnum
CREATE TYPE "TemplateTier" AS ENUM ('basic', 'pro', 'premium');

-- CreateEnum
CREATE TYPE "JobApplicationStatus" AS ENUM ('bookmarked', 'applied', 'screening', 'interview', 'offer', 'accepted', 'rejected', 'withdrew');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "InterviewCategory" AS ENUM ('behavioral', 'technical', 'situational', 'competency', 'industry');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('easy', 'medium', 'hard');

-- CreateEnum
CREATE TYPE "SalaryExperienceLevel" AS ENUM ('entry', 'mid', 'senior', 'lead', 'executive');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('full_time', 'contract', 'part_time');

-- CreateEnum
CREATE TYPE "CareerTaskType" AS ENUM ('LEARN', 'BUILD', 'APPLY', 'NETWORK', 'INTERVIEW');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ats_complete', 'resume_export', 'application_reminder', 'interview_feedback', 'subscription', 'system', 'message', 'forum_reply');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('bug', 'feature', 'improvement', 'other');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('new', 'in_review', 'planned', 'completed', 'wont_fix');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired');

-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('month', 'year');

-- CreateEnum
CREATE TYPE "BlogPostStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "MentorshipRequestStatus" AS ENUM ('pending', 'accepted', 'declined', 'cancelled');

-- CreateEnum
CREATE TYPE "MentorshipSessionStatus" AS ENUM ('scheduled', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "ForumVoteType" AS ENUM ('up', 'down');

-- CreateEnum
CREATE TYPE "ConnectionRequestStatus" AS ENUM ('pending', 'accepted', 'declined', 'cancelled');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('article', 'ebook', 'template', 'video', 'checklist', 'other');

-- CreateEnum
CREATE TYPE "AnnotationType" AS ENUM ('highlight', 'note');

-- CreateEnum
CREATE TYPE "AIUsageStatus" AS ENUM ('success', 'error', 'timeout', 'quota_exceeded');

-- CreateEnum
CREATE TYPE "MessageAttachmentKind" AS ENUM ('image', 'document', 'text', 'csv', 'other');

-- CreateTable
CREATE TABLE "django_users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "username" TEXT,
    "firstName" TEXT NOT NULL DEFAULT '',
    "lastName" TEXT NOT NULL DEFAULT '',
    "supabaseUserId" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isStaff" BOOLEAN NOT NULL DEFAULT false,
    "isSuperuser" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" TEXT,
    "dateJoined" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "django_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Authenticator" (
    "credentialID" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "credentialPublicKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "credentialDeviceType" TEXT NOT NULL,
    "credentialBackedUp" BOOLEAN NOT NULL,
    "transports" TEXT,

    CONSTRAINT "Authenticator_pkey" PRIMARY KEY ("userId","credentialID")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "referralCode" TEXT NOT NULL,
    "referredById" UUID,
    "phone" TEXT NOT NULL DEFAULT '',
    "linkedinUrl" TEXT NOT NULL DEFAULT '',
    "profileImage" TEXT,
    "totalReferrals" INTEGER NOT NULL DEFAULT 0,
    "proTemplatesEarned" INTEGER NOT NULL DEFAULT 0,
    "planTier" "PlanTier" NOT NULL DEFAULT 'basic',
    "dailyExportsCount" INTEGER NOT NULL DEFAULT 0,
    "lastExportDate" DATE,
    "monthlyAtsChecks" INTEGER NOT NULL DEFAULT 0,
    "lastAtsCheckReset" DATE,
    "purchasedProTemplates" JSONB NOT NULL DEFAULT '[]',
    "purchasedPremiumTemplates" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resumes" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL DEFAULT 'classic',
    "theme" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_contents" (
    "id" UUID NOT NULL,
    "resumeId" UUID NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "sectionOrder" JSONB NOT NULL DEFAULT '[]',
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resume_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_versions" (
    "id" UUID NOT NULL,
    "resumeId" UUID NOT NULL,
    "contentSnapshot" JSONB NOT NULL DEFAULT '{}',
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "changeSummary" TEXT NOT NULL DEFAULT '',
    "createdBy" TEXT NOT NULL DEFAULT 'System',
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resume_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_targets" (
    "id" UUID NOT NULL,
    "resumeId" UUID NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "jobDescription" TEXT,
    "keywords" JSONB NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_categories" (
    "id" SERIAL NOT NULL,
    "name" "TemplateTier" NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceLkr" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "colorSchemesCount" INTEGER NOT NULL DEFAULT 1,
    "includesCoverLetter" BOOLEAN NOT NULL DEFAULT false,
    "includesLinkedinTemplate" BOOLEAN NOT NULL DEFAULT false,
    "prioritySupport" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "template_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_role_templates" (
    "id" UUID NOT NULL,
    "roleName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconName" TEXT NOT NULL,
    "category" "TemplateTier" NOT NULL,
    "templateHtml" TEXT NOT NULL DEFAULT '',
    "templateCss" TEXT NOT NULL DEFAULT '',
    "defaultContent" JSONB NOT NULL DEFAULT '{}',
    "previewImage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_role_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cv_documents" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "sessionKey" TEXT,
    "filePath" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "extractedText" TEXT NOT NULL DEFAULT '',
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cv_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ats_check_results" (
    "id" UUID NOT NULL,
    "cvDocumentId" UUID NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "formatScore" INTEGER NOT NULL DEFAULT 0,
    "contentScore" INTEGER NOT NULL DEFAULT 0,
    "keywordsScore" INTEGER NOT NULL DEFAULT 0,
    "lengthScore" INTEGER NOT NULL DEFAULT 0,
    "jdKeywordMatchPct" INTEGER,
    "jdTopKeywords" JSONB NOT NULL DEFAULT '[]',
    "scores" JSONB NOT NULL,
    "issues" JSONB NOT NULL DEFAULT '[]',
    "suggestions" JSONB NOT NULL DEFAULT '[]',
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "unlockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ats_check_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoverLetter" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "resumeId" UUID,
    "title" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL DEFAULT '',
    "companyName" TEXT NOT NULL DEFAULT '',
    "jobDescription" TEXT NOT NULL DEFAULT '',
    "tone" TEXT NOT NULL DEFAULT 'PROFESSIONAL',
    "content" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoverLetter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoverLetterDraft" (
    "id" UUID NOT NULL,
    "coverLetterId" UUID NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoverLetterDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoverLetterVersion" (
    "id" UUID NOT NULL,
    "coverLetterId" UUID NOT NULL,
    "content" JSONB NOT NULL DEFAULT '{}',
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoverLetterVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoverLetterExport" (
    "id" UUID NOT NULL,
    "coverLetterId" UUID NOT NULL,
    "format" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoverLetterExport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GCVResume" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "templateId" UUID,
    "title" TEXT NOT NULL,
    "contentJson" JSONB NOT NULL DEFAULT '{}',
    "themeJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GCVResume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GCVTemplate" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT '',
    "configJson" JSONB NOT NULL DEFAULT '{}',
    "previewUrl" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GCVTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GCVExport" (
    "id" UUID NOT NULL,
    "resumeId" UUID NOT NULL,
    "format" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GCVExport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_applications" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "companyName" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "jobUrl" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "salaryRange" TEXT NOT NULL DEFAULT '',
    "status" "JobApplicationStatus" NOT NULL DEFAULT 'bookmarked',
    "priority" "Priority" NOT NULL DEFAULT 'medium',
    "resumeUsedId" UUID,
    "appliedDate" DATE,
    "responseDate" DATE,
    "followUpDate" DATE,
    "recruiterName" TEXT NOT NULL DEFAULT '',
    "recruiterEmail" TEXT NOT NULL DEFAULT '',
    "recruiterPhone" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_notes" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_up_reminders" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "reminderDate" DATE NOT NULL,
    "message" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follow_up_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_questions" (
    "id" UUID NOT NULL,
    "questionText" TEXT NOT NULL,
    "category" "InterviewCategory" NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'medium',
    "sampleAnswer" TEXT NOT NULL DEFAULT '',
    "tips" TEXT NOT NULL DEFAULT '',
    "keyPoints" JSONB NOT NULL DEFAULT '[]',
    "tags" TEXT NOT NULL DEFAULT '',
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "timesPracticed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice_sessions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "category" TEXT NOT NULL DEFAULT '',
    "difficulty" TEXT NOT NULL DEFAULT '',
    "numQuestions" INTEGER NOT NULL DEFAULT 5,
    "questionsAnswered" INTEGER NOT NULL DEFAULT 0,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "practice_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_responses" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "userAnswer" TEXT NOT NULL,
    "timeTaken" INTEGER NOT NULL,
    "aiFeedback" TEXT NOT NULL DEFAULT '',
    "aiScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_questions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_data" (
    "id" UUID NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "jobCategory" TEXT NOT NULL DEFAULT '',
    "experienceLevel" "SalaryExperienceLevel" NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "currency" TEXT NOT NULL DEFAULT 'LKR',
    "salaryMin" DECIMAL(12,2) NOT NULL,
    "salaryMax" DECIMAL(12,2) NOT NULL,
    "salaryMedian" DECIMAL(12,2),
    "employmentType" "EmploymentType" NOT NULL DEFAULT 'full_time',
    "companySize" TEXT NOT NULL DEFAULT '',
    "industry" TEXT NOT NULL DEFAULT '',
    "dataSource" TEXT NOT NULL DEFAULT 'seed',
    "sampleSize" INTEGER NOT NULL DEFAULT 1,
    "confidenceScore" INTEGER NOT NULL DEFAULT 50,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "salary_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_submissions" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "jobTitle" TEXT NOT NULL,
    "jobCategory" TEXT NOT NULL DEFAULT '',
    "yearsExperience" INTEGER NOT NULL,
    "yearsAtCompany" INTEGER NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "baseSalary" DECIMAL(12,2) NOT NULL,
    "bonus" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "stockValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "otherCompensation" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'LKR',
    "companySize" TEXT NOT NULL DEFAULT '',
    "industry" TEXT NOT NULL DEFAULT '',
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "flaggedReason" TEXT NOT NULL DEFAULT '',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "salary_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_calculations" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "jobTitle" TEXT NOT NULL,
    "experienceLevel" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "salaryMin" DECIMAL(12,2) NOT NULL,
    "salaryMax" DECIMAL(12,2) NOT NULL,
    "salaryMedian" DECIMAL(12,2) NOT NULL,
    "percentile25" DECIMAL(12,2),
    "percentile75" DECIMAL(12,2),
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "salary_calculations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_of_living" (
    "id" UUID NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT '',
    "country" TEXT NOT NULL,
    "overallIndex" DOUBLE PRECISION NOT NULL,
    "housingIndex" DOUBLE PRECISION NOT NULL,
    "foodIndex" DOUBLE PRECISION NOT NULL,
    "transportationIndex" DOUBLE PRECISION NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_of_living_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerGPSSession" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerGPSSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerGPSCV" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "filePath" TEXT,
    "text" TEXT NOT NULL DEFAULT '',
    "dataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareerGPSCV_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerGPSQuestionnaire" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "answers" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerGPSQuestionnaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerGPSGoal" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "targetRole" TEXT NOT NULL,
    "timeframe" TEXT NOT NULL DEFAULT '',
    "goalsJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareerGPSGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerGPSPlan" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "planJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerGPSPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerGPSMilestone" (
    "id" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "weekStart" INTEGER NOT NULL,
    "weekEnd" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CareerGPSMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerGPSTask" (
    "id" UUID NOT NULL,
    "milestoneId" UUID NOT NULL,
    "week" INTEGER NOT NULL,
    "type" "CareerTaskType" NOT NULL,
    "title" TEXT NOT NULL,
    "effortMinutes" INTEGER NOT NULL DEFAULT 60,
    "outcome" TEXT NOT NULL DEFAULT '',
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CareerGPSTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerGPSResourceLink" (
    "id" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "objectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "CareerGPSResourceLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkedInAudit" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "targetRole" TEXT NOT NULL DEFAULT '',
    "inputText" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkedInAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkedInInputFile" (
    "id" UUID NOT NULL,
    "auditId" UUID NOT NULL,
    "filePath" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkedInInputFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkedInExtractedProfile" (
    "id" UUID NOT NULL,
    "auditId" UUID NOT NULL,
    "dataJson" JSONB NOT NULL DEFAULT '{}',
    "text" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkedInExtractedProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkedInAuditResult" (
    "id" UUID NOT NULL,
    "auditId" UUID NOT NULL,
    "scoreBreakdown" JSONB NOT NULL DEFAULT '{}',
    "missingKeywords" JSONB NOT NULL DEFAULT '[]',
    "sectionScores" JSONB NOT NULL DEFAULT '{}',
    "checklistItems" JSONB NOT NULL DEFAULT '[]',
    "summaryFeedback" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkedInAuditResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkedInRewriteSuggestion" (
    "id" UUID NOT NULL,
    "auditId" UUID NOT NULL,
    "sectionType" TEXT NOT NULL,
    "original" TEXT NOT NULL,
    "rewritten" TEXT NOT NULL,
    "tone" TEXT NOT NULL DEFAULT 'STANDARD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkedInRewriteSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkedInExport" (
    "id" UUID NOT NULL,
    "auditId" UUID NOT NULL,
    "format" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkedInExport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "categoryId" INTEGER,
    "officialUrl" TEXT,
    "awardType" TEXT NOT NULL DEFAULT '',
    "deliveryMode" TEXT NOT NULL DEFAULT '',
    "level" TEXT NOT NULL DEFAULT '',
    "language" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "district" TEXT NOT NULL DEFAULT '',
    "venue" TEXT NOT NULL DEFAULT '',
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "price" DECIMAL(10,2),
    "priceLabel" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT '',
    "installmentAvailable" BOOLEAN NOT NULL DEFAULT false,
    "scholarshipAvailable" BOOLEAN NOT NULL DEFAULT false,
    "durationLabel" TEXT NOT NULL DEFAULT '',
    "nextBatch" TEXT NOT NULL DEFAULT '',
    "admissionDeadline" DATE,
    "summary" TEXT NOT NULL DEFAULT '',
    "overview" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "curriculum" TEXT NOT NULL DEFAULT '',
    "learningOutcomes" TEXT NOT NULL DEFAULT '',
    "requirements" TEXT NOT NULL DEFAULT '',
    "provider" TEXT NOT NULL DEFAULT '',
    "providerVerified" BOOLEAN NOT NULL DEFAULT false,
    "certificateIncluded" BOOLEAN NOT NULL DEFAULT false,
    "providerContactEmail" TEXT NOT NULL DEFAULT '',
    "providerContactPhone" TEXT NOT NULL DEFAULT '',
    "courseId" TEXT,
    "courseSlug" TEXT,
    "status" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "providerName" TEXT,
    "providerLogoUrl" TEXT,
    "providerWebsite" TEXT,
    "detailsUrl" TEXT,
    "applyUrl" TEXT,
    "syllabusUrl" TEXT,
    "coverImageUrl" TEXT,
    "industry" TEXT,
    "industryGroup" TEXT,
    "subcategory" TEXT,
    "courseTitle" TEXT,
    "shortTitle" TEXT,
    "pricingModel" TEXT,
    "deliveryRegion" TEXT,
    "attendanceMode" TEXT,
    "country" TEXT,
    "stateProvince" TEXT,
    "venueName" TEXT,
    "venueAddress" TEXT,
    "timezone" TEXT,
    "certificateAvailable" BOOLEAN DEFAULT false,
    "installmentsAvailable" BOOLEAN DEFAULT false,
    "financialAidAvailable" BOOLEAN DEFAULT false,
    "durationValue" TEXT,
    "durationUnit" TEXT,
    "scheduleType" TEXT,
    "scheduleNotes" TEXT,
    "startDate" DATE,
    "enrollmentStatus" TEXT,
    "ratingValue" DECIMAL(4,2),
    "ratingCount" INTEGER,
    "learnerCount" INTEGER,
    "priceAmount" DECIMAL(12,2),
    "priceCurrency" TEXT,
    "startingFromAmount" DECIMAL(12,2),
    "startingFromCurrency" TEXT,
    "installmentFromAmount" DECIMAL(12,2),
    "feeNotes" TEXT,
    "mentorSupport" TEXT,
    "mentorResponseTime" TEXT,
    "tag1" TEXT,
    "tag2" TEXT,
    "tag3" TEXT,
    "tag4" TEXT,
    "badge1" TEXT,
    "badge2" TEXT,
    "badge3" TEXT,
    "cardCtaPrimaryLabel" TEXT,
    "cardCtaPrimaryUrl" TEXT,
    "cardCtaSecondaryLabel" TEXT,
    "cardCtaSecondaryUrl" TEXT,
    "compareEnabled" BOOLEAN DEFAULT false,
    "sourceUrl" TEXT,
    "backupSourceUrl" TEXT,
    "lastVerifiedAt" DATE,
    "linkStatus" TEXT,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tool" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '',
    "tagline" TEXT NOT NULL DEFAULT '',
    "descriptionSi" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "link" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT '',
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedCourse" (
    "id" SERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "courseId" INTEGER NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedTool" (
    "id" SERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "toolId" INTEGER NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedTool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceCategory" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResourceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" UUID NOT NULL,
    "categoryId" UUID,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL DEFAULT 'article',
    "description" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "fileUrl" TEXT NOT NULL DEFAULT '',
    "coverImage" TEXT,
    "tags" TEXT NOT NULL DEFAULT '',
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceDownload" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "resourceId" UUID NOT NULL,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResourceDownload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedResource" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "resourceId" UUID NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookAnnotation" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "bookSlug" TEXT NOT NULL,
    "annotationType" "AnnotationType" NOT NULL,
    "selectedText" TEXT NOT NULL,
    "noteText" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT '#fef08a',
    "pageIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookAnnotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogCategory" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT 'folder',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "authorId" UUID,
    "authorName" TEXT NOT NULL DEFAULT 'Career Studio Team',
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "categoryId" UUID,
    "tags" TEXT NOT NULL DEFAULT '',
    "featuredImage" TEXT,
    "featuredImageUrl" TEXT NOT NULL DEFAULT '',
    "status" "BlogPostStatus" NOT NULL DEFAULT 'draft',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "metaTitle" TEXT NOT NULL DEFAULT '',
    "metaDescription" TEXT NOT NULL DEFAULT '',
    "metaKeywords" TEXT NOT NULL DEFAULT '',
    "readingTime" INTEGER NOT NULL DEFAULT 5,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogComment" (
    "id" UUID NOT NULL,
    "postId" UUID NOT NULL,
    "authorId" UUID,
    "authorName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogLike" (
    "id" UUID NOT NULL,
    "postId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogView" (
    "id" UUID NOT NULL,
    "postId" UUID NOT NULL,
    "userId" UUID,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuccessStory" (
    "id" UUID NOT NULL,
    "authorId" UUID,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuccessStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" UUID NOT NULL,
    "authorId" UUID,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "authorId" UUID,
    "body" TEXT NOT NULL,
    "isAccepted" BOOLEAN NOT NULL DEFAULT false,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" UUID NOT NULL,
    "organizerId" UUID,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "bio" TEXT NOT NULL,
    "expertise" JSONB NOT NULL DEFAULT '[]',
    "hourlyRate" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "maxMentees" INTEGER NOT NULL DEFAULT 3,
    "availability" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorshipRequest" (
    "id" UUID NOT NULL,
    "menteeId" UUID NOT NULL,
    "mentorId" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "status" "MentorshipRequestStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentorshipRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorshipSession" (
    "id" UUID NOT NULL,
    "requestId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "meetingLink" TEXT NOT NULL DEFAULT '',
    "status" "MentorshipSessionStatus" NOT NULL DEFAULT 'scheduled',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentorshipSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorReview" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentorReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialEvent" (
    "id" UUID NOT NULL,
    "organizerId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" UUID NOT NULL,
    "conversationId" UUID NOT NULL,
    "senderId" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageAttachment" (
    "id" UUID NOT NULL,
    "messageId" UUID NOT NULL,
    "filename" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "kind" "MessageAttachmentKind" NOT NULL DEFAULT 'other',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationArchive" (
    "id" UUID NOT NULL,
    "conversationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationArchive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumRole" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "ForumRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRoleAssignment" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumThread" (
    "id" UUID NOT NULL,
    "roleId" UUID,
    "authorId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumReply" (
    "id" UUID NOT NULL,
    "threadId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumVote" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "threadId" UUID,
    "replyId" UUID,
    "voteType" "ForumVoteType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumFlag" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "threadId" UUID,
    "replyId" UUID,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectionRequest" (
    "id" UUID NOT NULL,
    "requesterId" UUID NOT NULL,
    "receiverId" UUID NOT NULL,
    "message" TEXT NOT NULL DEFAULT '',
    "status" "ConnectionRequestStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConnectionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Connection" (
    "id" UUID NOT NULL,
    "userAId" UUID NOT NULL,
    "userBId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Connection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Endorsement" (
    "id" UUID NOT NULL,
    "endorserId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "skill" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Endorsement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileView" (
    "id" UUID NOT NULL,
    "viewerId" UUID,
    "userId" UUID NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBlock" (
    "id" UUID NOT NULL,
    "blockerId" UUID NOT NULL,
    "blockedId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserReport" (
    "id" UUID NOT NULL,
    "reporterId" UUID NOT NULL,
    "reportedId" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPrivacySettings" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "showEmail" BOOLEAN NOT NULL DEFAULT false,
    "showPhone" BOOLEAN NOT NULL DEFAULT false,
    "allowMessages" BOOLEAN NOT NULL DEFAULT true,
    "allowConnections" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserPrivacySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" TEXT NOT NULL DEFAULT '',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "email" BOOLEAN NOT NULL DEFAULT true,
    "inApp" BOOLEAN NOT NULL DEFAULT true,
    "digest" BOOLEAN NOT NULL DEFAULT false,
    "settings" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationTemplate" (
    "id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "stripePriceMonthlyId" TEXT NOT NULL DEFAULT '',
    "stripePriceYearlyId" TEXT NOT NULL DEFAULT '',
    "priceMonthly" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "priceYearly" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'LKR',
    "features" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "planId" UUID,
    "stripeCustomerId" TEXT NOT NULL DEFAULT '',
    "stripeSubscriptionId" TEXT NOT NULL DEFAULT '',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'trialing',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "billingInterval" "BillingInterval" NOT NULL DEFAULT 'month',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "subscriptionId" UUID,
    "stripePaymentIntentId" TEXT NOT NULL DEFAULT '',
    "stripeInvoiceId" TEXT NOT NULL DEFAULT '',
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'lkr',
    "status" TEXT NOT NULL DEFAULT 'succeeded',
    "description" TEXT NOT NULL DEFAULT '',
    "invoiceUrl" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "type" "FeedbackType" NOT NULL,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'new',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "pageUrl" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIUsageLog" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "feature" TEXT NOT NULL,
    "featureName" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL DEFAULT 'v1',
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "responseTime" DOUBLE PRECISION,
    "responseTimeMs" INTEGER,
    "estimatedCost" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "status" "AIUsageStatus" NOT NULL DEFAULT 'success',
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIFeedback" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "requestType" TEXT NOT NULL,
    "inputText" TEXT NOT NULL,
    "outputText" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "comment" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptTemplate" (
    "id" UUID NOT NULL,
    "feature" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "promptText" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "django_users_email_key" ON "django_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "django_users_supabaseUserId_key" ON "django_users"("supabaseUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Authenticator_credentialID_key" ON "Authenticator"("credentialID");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_referralCode_key" ON "user_profiles"("referralCode");

-- CreateIndex
CREATE INDEX "resumes_userId_idx" ON "resumes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "resume_contents_resumeId_key" ON "resume_contents"("resumeId");

-- CreateIndex
CREATE INDEX "resume_versions_resumeId_createdAt_idx" ON "resume_versions"("resumeId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "template_categories_name_key" ON "template_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "job_role_templates_slug_key" ON "job_role_templates"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "job_role_templates_roleName_category_key" ON "job_role_templates"("roleName", "category");

-- CreateIndex
CREATE UNIQUE INDEX "ats_check_results_cvDocumentId_key" ON "ats_check_results"("cvDocumentId");

-- CreateIndex
CREATE UNIQUE INDEX "GCVTemplate_slug_key" ON "GCVTemplate"("slug");

-- CreateIndex
CREATE INDEX "job_applications_userId_status_idx" ON "job_applications"("userId", "status");

-- CreateIndex
CREATE INDEX "interview_questions_category_difficulty_idx" ON "interview_questions"("category", "difficulty");

-- CreateIndex
CREATE UNIQUE INDEX "saved_questions_userId_questionId_key" ON "saved_questions"("userId", "questionId");

-- CreateIndex
CREATE INDEX "salary_data_jobTitle_country_idx" ON "salary_data"("jobTitle", "country");

-- CreateIndex
CREATE UNIQUE INDEX "cost_of_living_city_country_key" ON "cost_of_living"("city", "country");

-- CreateIndex
CREATE UNIQUE INDEX "CareerGPSQuestionnaire_sessionId_key" ON "CareerGPSQuestionnaire"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "CareerGPSPlan_sessionId_key" ON "CareerGPSPlan"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "LinkedInExtractedProfile_auditId_key" ON "LinkedInExtractedProfile"("auditId");

-- CreateIndex
CREATE UNIQUE INDEX "LinkedInAuditResult_auditId_key" ON "LinkedInAuditResult"("auditId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Course_courseId_key" ON "Course"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedCourse_userId_courseId_key" ON "SavedCourse"("userId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedTool_userId_toolId_key" ON "SavedTool"("userId", "toolId");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceCategory_slug_key" ON "ResourceCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Resource_slug_key" ON "Resource"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SavedResource_userId_resourceId_key" ON "SavedResource"("userId", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_name_key" ON "BlogCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_slug_key" ON "BlogCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogLike_postId_userId_key" ON "BlogLike"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "SuccessStory_slug_key" ON "SuccessStory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Question_slug_key" ON "Question"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MentorProfile_userId_key" ON "MentorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MentorReview_sessionId_key" ON "MentorReview"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialEvent_slug_key" ON "SocialEvent"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationArchive_conversationId_userId_key" ON "ConversationArchive"("conversationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ForumRole_name_key" ON "ForumRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ForumRole_slug_key" ON "ForumRole"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "UserRoleAssignment_userId_roleId_key" ON "UserRoleAssignment"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "ForumThread_slug_key" ON "ForumThread"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectionRequest_requesterId_receiverId_key" ON "ConnectionRequest"("requesterId", "receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "Connection_userAId_userBId_key" ON "Connection"("userAId", "userBId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBlock_blockerId_blockedId_key" ON "UserBlock"("blockerId", "blockedId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPrivacySettings_userId_key" ON "UserPrivacySettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationTemplate_type_key" ON "NotificationTemplate"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_slug_key" ON "Plan"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PromptTemplate_feature_version_key" ON "PromptTemplate"("feature", "version");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "django_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "django_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Authenticator" ADD CONSTRAINT "Authenticator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "django_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "django_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_contents" ADD CONSTRAINT "resume_contents_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ats_check_results" ADD CONSTRAINT "ats_check_results_cvDocumentId_fkey" FOREIGN KEY ("cvDocumentId") REFERENCES "cv_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
