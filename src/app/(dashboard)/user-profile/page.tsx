import { UserProfile } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/drizzle/db";
import { UserResumeTable } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { ResumeUpload } from "@/components/ResumeUpload";
import { format } from "date-fns";

export default async function UserProfilePage() {
  const { userId } = await auth();

  let existingResumeDate: string | null = null;

  if (userId) {
    const resume = await db.query.UserResumeTable.findFirst({
      where: eq(UserResumeTable.userId, userId),
      orderBy: desc(UserResumeTable.createdAt),
    });

    if (resume) {
      existingResumeDate = format(resume.updatedAt, "MMM d, yyyy 'at' h:mm a");
    }
  }

  return (
    <div className="space-y-8 py-6">
      <div className="flex justify-center">
        <UserProfile routing="hash" />
      </div>
      <div className="max-w-2xl mx-auto w-full px-4">
        <ResumeUpload existingResumeDate={existingResumeDate} />
      </div>
    </div>
  );
}
