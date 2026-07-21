import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { name, description } = await req.json()
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    const category = await prisma.educationCategory.update({
      where: { id: parseInt(params.id) },
      data: { name, slug, description }
    })
    return NextResponse.json(category, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await prisma.educationCategory.delete({
      where: { id: parseInt(params.id) }
    })
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
