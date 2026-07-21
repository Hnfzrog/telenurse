export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { BookOpen, Search, ArrowRight, Filter, Clock, ChevronRight } from "lucide-react"
import { EducationClient } from "./EducationClient"
import { requireOnboarding } from "@/lib/checkOnboarding"

export default async function EducationPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/login")
  if (session.user.role === "PASIEN") {
    await requireOnboarding()
  }

  const articles = await prisma.educationContent.findMany({
    where: { isPublished: true },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  })

  const categories = await prisma.educationCategory.findMany({
    orderBy: { sortOrder: "asc" }
  })

  return <EducationClient articles={articles} categories={categories} />
}
