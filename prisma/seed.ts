import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Clear existing data (optional, but good for resetting)
  await prisma.educationContent.deleteMany()
  await prisma.educationCategory.deleteMany()
  await prisma.healthRecord.deleteMany()
  await prisma.patientProfile.deleteMany()
  await prisma.user.deleteMany()

  const password = await bcrypt.hash('password123', 10)

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'Admin TeleNurse',
      email: 'admin@telenurse.com',
      password,
      role: 'ADMIN',
    },
  })
  
  const nurse = await prisma.user.create({
    data: {
      name: 'Ns. Siti Rahmawati, S.Kep',
      email: 'perawat@telenurse.com',
      password,
      role: 'PERAWAT',
    },
  })

  const patient = await prisma.user.create({
    data: {
      name: 'Budi Santoso',
      email: 'pasien@telenurse.com',
      password,
      role: 'PASIEN',
      phone: '081234567890',
      patientProfile: {
        create: {
          dateOfBirth: new Date('1965-05-15'),
          gender: 'LAKI_LAKI',
          address: 'Jl. Merdeka No. 45, Jakarta',
          bloodType: 'O',
          medicalHistory: 'Hipertensi',
          emergencyContactName: 'Andi Santoso',
          emergencyContactPhone: '081987654321',
        }
      }
    },
  })

  // 2. Create Education Categories
  const catPTM = await prisma.educationCategory.create({
    data: {
      name: 'Penyakit Tidak Menular (PTM)',
      slug: 'penyakit-tidak-menular',
      description: 'Edukasi terkait penyakit kronis seperti hipertensi dan diabetes.',
      sortOrder: 1,
    }
  })

  const catHidupSehat = await prisma.educationCategory.create({
    data: {
      name: 'Pola Hidup Sehat',
      slug: 'pola-hidup-sehat',
      description: 'Edukasi tentang nutrisi, olahraga, dan manajemen stres.',
      sortOrder: 2,
    }
  })

  // 3. Create Articles
  await prisma.educationContent.create({
    data: {
      title: 'Pentingnya Menjaga Tekanan Darah Tetap Stabil',
      slug: 'menjaga-tekanan-darah-stabil',
      excerpt: 'Tekanan darah tinggi (hipertensi) sering disebut sebagai "silent killer". Ketahui cara menjaganya.',
      body: 'Tekanan darah tinggi (hipertensi) sering disebut sebagai "silent killer" karena seringkali tidak menunjukkan gejala hingga terjadi komplikasi serius seperti serangan jantung atau stroke.\n\nCara menjaga tekanan darah:\n1. Kurangi asupan garam (maksimal 1 sendok teh per hari).\n2. Olahraga rutin minimal 30 menit sehari.\n3. Kelola stres dengan meditasi atau relaksasi.\n4. Rutin minum obat sesuai anjuran dokter/perawat.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
      isPublished: true,
      publishedAt: new Date(),
      categoryId: catPTM.id,
      authorId: admin.id,
    }
  })

  await prisma.educationContent.create({
    data: {
      title: 'Mengenal Porsi Makan Piring Makanku',
      slug: 'porsi-makan-piring-makanku',
      excerpt: 'Panduan gizi seimbang untuk lansia dan penderita PTM.',
      body: 'Untuk menjaga kadar gula darah dan kesehatan tubuh, Kementerian Kesehatan menyarankan konsep "Isi Piringku".\n\n- 1/2 piring berisi sayur dan buah.\n- 1/4 piring berisi protein (lauk pauk).\n- 1/4 piring berisi karbohidrat kompleks (nasi merah, kentang).\n\nHindari makanan yang digoreng berlebihan dan kurangi konsumsi gula pasir harian.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
      isPublished: true,
      publishedAt: new Date(),
      categoryId: catHidupSehat.id,
      authorId: admin.id,
    }
  })

  // 4. Create dummy health records for patient
  // Let's create records for the last 3 days
  const today = new Date()
  
  await prisma.healthRecord.create({
    data: {
      patientId: patient.id,
      recordedAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      systolicBp: 145,
      diastolicBp: 90,
      heartRate: 85,
      bodyTemperature: 36.5,
      isAbnormal: true, // Systolic > 140
      abnormalNotes: 'Tekanan darah tinggi'
    }
  })

  await prisma.healthRecord.create({
    data: {
      patientId: patient.id,
      recordedAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      systolicBp: 135,
      diastolicBp: 85,
      heartRate: 82,
      bodyTemperature: 36.6,
      isAbnormal: false,
    }
  })

  await prisma.healthRecord.create({
    data: {
      patientId: patient.id,
      recordedAt: today,
      systolicBp: 130,
      diastolicBp: 80,
      heartRate: 78,
      bloodSugar: 110,
      bodyTemperature: 36.5,
      isAbnormal: false,
    }
  })

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
