import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { token } = await req.json()
    
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 400 })
    }
    
    console.log("🔔 [DEBUG] WEB PUSH TOKEN RECEIVED FOR USER ID:", session.user.id, "TOKEN:", token.substring(0, 20) + "...")
    
    // Check if token already exists for this user
    const existing = await prisma.pushSubscription.findFirst({
      where: {
        userId: parseInt(session.user.id),
        token: token,
      }
    })

    if (!existing) {
      await prisma.pushSubscription.create({
        data: {
          userId: parseInt(session.user.id),
          token: token,
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Web Push Subscribe Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
