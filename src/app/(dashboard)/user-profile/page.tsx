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
    <div className="space-y-12 py-6">
      <div className="max-w-2xl mx-auto w-full px-4 space-y-4">
        <h2 className="text-2xl font-bold text-white tracking-tight">Your Resume</h2>
        <ResumeUpload existingResumeDate={existingResumeDate} />
      </div>

      <div className="flex justify-center border-t border-white/5 pt-12">
        <UserProfile routing="hash" />
      </div>
    </div>
  );
}
