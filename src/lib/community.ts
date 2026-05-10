export function displayName(user: { firstName?: string | null; lastName?: string | null; email?: string | null }) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();

  return fullName || user.email || "Career Studio member";
}

export function sortUserPair(userAId: string, userBId: string) {
  return [userAId, userBId].sort() as [string, string];
}

export function directConversationKey(userAId: string, userBId: string) {
  const [firstId, secondId] = sortUserPair(userAId, userBId);

  return `direct:${firstId}:${secondId}`;
}

export function parseDirectConversationKey(title: string) {
  const [, firstId, secondId] = title.split(":");

  return firstId && secondId ? ([firstId, secondId] as [string, string]) : null;
}

export function otherDirectParticipant(title: string, currentUserId: string) {
  const pair = parseDirectConversationKey(title);

  if (!pair) {
    return null;
  }

  return pair[0] === currentUserId ? pair[1] : pair[1] === currentUserId ? pair[0] : null;
}

export function slugifyCommunityTitle(title: string) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return slug || "discussion";
}

export function dateTimeLocalValue(date: Date) {
  const offsetMs = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}
