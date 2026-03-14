import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import { 
  OrganizationTable, 
  JobListingTable, 
  OrganizationUserSettingsTable,
  UserTable 
} from "./schema";
import { eq } from "drizzle-orm";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing in .env.local");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function seed() {
  console.log("🌱 Seeding database...");

  // 1. Get the first user to assign as admin
  const users = await db.select().from(UserTable).limit(1);
  if (users.length === 0) {
    console.error("❌ No users found in database. Please sign in to the app first.");
    process.exit(1);
  }
  const adminUser = users[0];
  console.log(`👤 Using user: ${adminUser.email} (ID: ${adminUser.id})`);

  const organizations = [
    {
      id: "org_neuro_tech",
      name: "NeuroTech AI",
      imageUrl: "https://images.unsplash.com/photo-1675271591211-126ad94e495d?auto=format&fit=crop&q=80&w=200&h=200",
    },
    {
      id: "org_quantum_labs",
      name: "QuantumScale Labs",
      imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=200&h=200",
    },
    {
      id: "org_synth_core",
      name: "SynthCore Systems",
      imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4628c9759?auto=format&fit=crop&q=80&w=200&h=200",
    },
  ];

  for (const org of organizations) {
    // Insert Organization
    await db.insert(OrganizationTable).values(org).onConflictDoUpdate({
      target: OrganizationTable.id,
      set: { name: org.name, imageUrl: org.imageUrl },
    });

    // Link User as Admin
    await db.insert(OrganizationUserSettingsTable).values({
      userId: adminUser.id,
      organizationId: org.id,
      role: "admin",
    }).onConflictDoNothing();

    console.log(`✅ Organization created/updated: ${org.name}`);
  }

  const jobs = [
    {
      id: crypto.randomUUID(),
      organizationId: "org_neuro_tech",
      title: "Senior AI Research Scientist",
      description: "We are looking for a Senior AI Research Scientist to join our team... (Professional description)",
      wage: 180000,
      wageInterval: "yearly",
      locationRequirement: "remote",
      experienceLevel: "senior",
      type: "full-time",
      status: "published",
      postedAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      organizationId: "org_neuro_tech",
      title: "Machine Learning Engineer (Computer Vision)",
      description: "Join us in building next-gen computer vision models for medical imaging...",
      wage: 150000,
      wageInterval: "yearly",
      locationRequirement: "hybrid",
      experienceLevel: "mid-level",
      type: "full-time",
      status: "published",
      postedAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      organizationId: "org_synth_core",
      title: "Frontend Lead (React/Next.js)",
      description: "Build beautiful, AI-driven interfaces for our core platform...",
      wage: 160000,
      wageInterval: "yearly",
      locationRequirement: "remote",
      experienceLevel: "senior",
      type: "full-time",
      status: "published",
      postedAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      organizationId: "org_quantum_labs",
      title: "Quant AI Developer",
      description: "Apply deep learning to high-frequency trading and financial modeling...",
      wage: 220000,
      wageInterval: "yearly",
      locationRequirement: "in-office",
      experienceLevel: "senior",
      type: "full-time",
      status: "published",
      postedAt: new Date(),
    },
  ];

  for (const job of jobs) {
    await db.insert(JobListingTable).values(job as any);
    console.log(`💼 Job posted: ${job.title}`);
  }

  console.log("🚀 Seeding completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
