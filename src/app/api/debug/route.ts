import { NextResponse } from 'next/server'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || 'NOT_SET'
  const directUrl = process.env.DIRECT_DATABASE_URL || 'NOT_SET'
  
  const maskedDbUrl = dbUrl.replace(/:[^:@]+@/, ':****@')
  const maskedDirectUrl = directUrl.replace(/:[^:@]+@/, ':****@')
  
  return NextResponse.json({
    DATABASE_URL: {
      set: dbUrl !== 'NOT_SET',
      length: dbUrl.length,
      masked: maskedDbUrl,
      hasPooler: dbUrl.includes('pooler'),
      hasCorrectPort: dbUrl.includes(':6543')
    },
    DIRECT_DATABASE_URL: {
      set: directUrl !== 'NOT_SET',
      length: directUrl.length,
      masked: maskedDirectUrl,
      hasDb: directUrl.includes('db.'),
      hasCorrectPort: directUrl.includes(':5432')
    }
  })
}
