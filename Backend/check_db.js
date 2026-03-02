import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const tables = await prisma.$queryRaw`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';`
    tables.forEach(t => console.log(t.tablename))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
