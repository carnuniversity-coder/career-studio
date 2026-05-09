export type ResumeCreateDraft = {
  userId: string;
  title: string;
  templateKey: string;
};

export async function createResumeDraft(_draft: ResumeCreateDraft) {
  void _draft;
  throw new Error("TODO: implement during the resume engine phase.");
}
