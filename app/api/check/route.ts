import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const result = await prisma.$queryRawUnsafe(`SELECT column_name FROM information_schema.columns WHERE table_name = 'health_records';`)
    return NextResponse.json(result)
  } catch(e: any) { 
    return NextResponse.json({ error: e.message })
  }
}
