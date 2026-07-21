import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { CategoriesClient } from "./CategoriesClient"

export default async function AdminCategoriesPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login")

  const categories = await prisma.educationCategory.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { contents: true }
      }
    }
  })

  return <CategoriesClient initialCategories={categories} />
}

export const dynamic = "force-dynamic";
