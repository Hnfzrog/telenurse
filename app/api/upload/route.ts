import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

export const dynamic = "force-dynamic"

const s3Client = new S3Client({
  region: process.env.B2_REGION || "us-east-005",
  endpoint: `https://s3.${process.env.B2_REGION || "us-east-005"}.backblazeb2.com`,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APPLICATION_KEY!,
  },
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = Date.now() + "_" + file.name.replaceAll(" ", "_")
    const bucketName = process.env.B2_BUCKET_NAME || "telenurse"

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: filename,
        Body: buffer,
        ContentType: file.type,
      })
    )
    
    // Construct the public URL
    const publicUrl = `https://f005.backblazeb2.com/file/${bucketName}/${filename}`
    
    return NextResponse.json({ url: publicUrl }, { status: 201 })
  } catch (error: any) {
    console.error("Upload Error:", error)
    return NextResponse.json({ error: error.message || "Failed to upload file." }, { status: 500 })
  }
}
