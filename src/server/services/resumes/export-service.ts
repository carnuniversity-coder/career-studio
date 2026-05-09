import { parseResumeContent, resumeContentToText } from "@/lib/resume-content";
import { getResumeForUser } from "@/server/services/resumes/resume-service";

export async function getResumePlainTextForExport(userId: string, resumeId: string) {
  const resume = await getResumeForUser(userId, resumeId);

  if (!resume) {
    return null;
  }

  const content = parseResumeContent(resume.content?.data);

  return {
    title: resume.title,
    content,
    text: resumeContentToText(content),
  };
}
