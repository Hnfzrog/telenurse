import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "monitoring_indicators" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(50) UNIQUE NOT NULL,
        "label" VARCHAR(100) NOT NULL,
        "unit" VARCHAR(20),
        "min_value" DECIMAL(8, 2),
        "max_value" DECIMAL(8, 2),
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "health_records" ADD COLUMN "nurse_notes" TEXT;`);
    } catch (e) {
      console.log("Column might already exist");
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
