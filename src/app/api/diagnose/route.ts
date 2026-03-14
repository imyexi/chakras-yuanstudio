import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const tests = []
  
  // Test 1: Check environment variables
  const dbUrl = process.env.DATABASE_URL || ''
  const directUrl = process.env.DIRECT_DATABASE_URL || ''
  
  tests.push({
    name: 'Environment Variables',
    status: dbUrl && directUrl ? 'PASS' : 'FAIL',
    details: {
      DATABASE_URL_length: dbUrl.length,
      DIRECT_DATABASE_URL_length: directUrl.length
    }
  })
  
  // Test 2: Try direct connection
  try {
    const directDb = new (await import('@prisma/client')).PrismaClient({
      datasourceUrl: directUrl
    })
    await directDb.$queryRaw`SELECT 1`
    await directDb.$disconnect()
    tests.push({
      name: 'Direct Connection',
      status: 'PASS',
      details: 'Direct connection successful'
    })
  } catch (error) {
    tests.push({
      name: 'Direct Connection',
      status: 'FAIL',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  // Test 3: Try pooler connection
  try {
    const poolerDb = new (await import('@prisma/client')).PrismaClient({
      datasourceUrl: dbUrl
    })
    await poolerDb.$queryRaw`SELECT 1`
    await poolerDb.$disconnect()
    tests.push({
      name: 'Pooler Connection',
      status: 'PASS',
      details: 'Pooler connection successful'
    })
  } catch (error) {
    tests.push({
      name: 'Pooler Connection',
      status: 'FAIL',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    tests
  })
}
