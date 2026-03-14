import { db } from "./src/drizzle/db"
import { JobListingTable } from "./src/drizzle/schema"
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function createTestJob() {
  const [job] = await db.insert(JobListingTable).values({
    id: crypto.randomUUID(),
    organizationId: '20bdcfe8-cb36-4224-a95c-58e48d2f0f70', // One of the healthy orgs
    title: 'AI Researcher (Test)',
    description: 'Come build the future of AI with us! This is a test post.',
    type: 'full-time',
    locationRequirement: 'remote',
    experienceLevel: 'senior',
    status: 'published',
    wage: 150000,
    wageInterval: 'yearly',
    postedAt: new Date(),
  }).returning()

  console.log("Created test job:", job.id)
  process.exit(0)
}

createTestJob().catch(err => {
  console.error(err)
  process.exit(1)
})
