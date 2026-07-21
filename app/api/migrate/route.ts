import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const logs: string[] = []
  
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "health_records" ADD COLUMN "dynamic_data" JSONB;`)
    logs.push("Added dynamic_data")
  } catch(e: any) { 
    logs.push("dynamic_data: " + e.message) 
  }
  
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "health_records" ADD COLUMN "nurse_notes" TEXT;`)
    logs.push("Added nurse_notes")
  } catch(e: any) { 
    logs.push("nurse_notes: " + e.message) 
  }

  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "push_subscriptions" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "endpoint" TEXT NOT NULL,
        "p256dh" TEXT NOT NULL,
        "auth" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `)
    logs.push("Created push_subscriptions")
  } catch(e: any) { logs.push("push_subscriptions: " + e.message) }
  
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "monitoring_schedules" (
        "id" SERIAL PRIMARY KEY,
        "patient_id" INTEGER NOT NULL,
        "nurse_id" INTEGER NOT NULL,
        "reminder_time" VARCHAR(5) NOT NULL,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "monitoring_schedules_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "monitoring_schedules_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `)
    logs.push("Created monitoring_schedules")
  } catch(e: any) { logs.push("monitoring_schedules: " + e.message) }

  return NextResponse.json({ success: true, logs })
}
