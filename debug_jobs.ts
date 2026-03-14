import { db } from "./src/drizzle/db"
import { JobListingTable, OrganizationTable, OrganizationUserSettingsTable, UserTable } from "./src/drizzle/schema"
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function checkData() {
  const users = await db.select().from(UserTable)
  const orgs = await db.select().from(OrganizationTable)
  const links = await db.select().from(OrganizationUserSettingsTable)

  console.log("Users:", users.map(u => ({ id: u.id, name: u.name })))
  console.log("\nOrganizations:", orgs.map(o => ({ id: o.id, name: o.name })))
  console.log("\nUser-Org Links:", links.map(l => ({ 
    userId: l.userId, 
    orgId: l.organizationId, 
    role: l.role 
  })))
  
  process.exit(0)
}

checkData().catch(err => {
  console.error(err)
  process.exit(1)
})
