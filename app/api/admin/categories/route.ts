import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { name, description } = await req.json()
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    const category = await prisma.educationCategory.create({
      data: { name, slug, description }
    })
    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
