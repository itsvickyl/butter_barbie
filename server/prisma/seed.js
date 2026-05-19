const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });



async function main() {
    console.log('Seeding data...');

    // 1. Create Users in auth.users (Raw SQL because we don't have Service Key)
    // We use pgcrypto's gen_random_uuid() and a dummy password hash

    const priyaId = 'd0b3c6a0-0000-0000-0000-000000000001';
    const rahulId = 'd0b3c6a0-0000-0000-0000-000000000002';

    // Cleanup first to avoid duplicates if re-run
    try {
        await prisma.$executeRaw`DELETE FROM auth.users WHERE email IN ('priya@example.com', 'rahul@example.com')`;
    } catch (e) {
        console.log('No previous users to delete or permission denied (might be fine)');
    }

    console.log('Creating auth users...');

    // Insert Priya
    await prisma.$executeRaw`
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
      ${priyaId}::uuid, 
      '00000000-0000-0000-0000-000000000000', 
      'authenticated', 
      'authenticated', 
      'priya@example.com', 
      crypt('password123', gen_salt('bf')), -- Valid bcrypt hash
      now(), 
      '{"provider": "email", "providers": ["email"]}', 
      '{"name": "Priya Sharma"}', 
      now(), 
      now()
    )
    ON CONFLICT (id) DO NOTHING;
  `;

    // Insert Rahul
    await prisma.$executeRaw`
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
      ${rahulId}::uuid, 
      '00000000-0000-0000-0000-000000000000', 
      'authenticated', 
      'authenticated', 
      'rahul@example.com', 
      crypt('password123', gen_salt('bf')),
      now(), 
      '{"provider": "email", "providers": ["email"]}', 
      '{"name": "Rahul Verma"}', 
      now(), 
      now()
    )
    ON CONFLICT (id) DO NOTHING;
  `;


    // Trigger should have created profiles. Let's update them with extra data.
    console.log('Updating profiles...');

    // Wait a bit for trigger? usually instant in same trans/db, but let's just upsert via prisma
    // Actually we can just update

    await prisma.user.update({
        where: { id: priyaId },
        data: { department: 'CSE', year: 3 }
    });

    await prisma.user.update({
        where: { id: rahulId },
        data: { department: 'ECE', year: 2 }
    });

    // Import points utility
    const { awardPoints } = require('../src/utils/points');

    console.log('Seeding resources...');

    // Create dummy resources
    const resource1 = await prisma.resource.create({
        data: {
            title: 'Data Structures Notes - Trees',
            description: 'Comprehensive notes on Binary Trees and AVL Trees.',
            type: 'NOTES',
            subject: 'Data Structures',
            semester: 3,
            year: 2,
            fileUrl: 'https://example.com/ds-notes.pdf',
            fileName: 'ds-notes.pdf',
            fileSize: 102400, // 100KB
            uploaderId: priyaId,
            tags: ['trees', 'dsa', 'algorithms'],
        },
    });

    // Award points for upload
    await awardPoints(prisma, priyaId, 'UPLOAD');

    const resource2 = await prisma.resource.create({
        data: {
            title: 'Digital Electronics Past Paper 2024',
            description: 'Solved previous year question paper.',
            type: 'PAST_PAPER',
            subject: 'Digital Electronics',
            semester: 3,
            year: 2,
            fileUrl: 'https://example.com/de-paper.pdf',
            fileName: 'de-paper.pdf',
            fileSize: 204800, // 200KB
            uploaderId: rahulId,
            tags: ['electronics', 'pyq'],
        },
    });

    // Award points for upload
    await awardPoints(prisma, rahulId, 'UPLOAD');

    console.log('Seeding ratings and downloads...');

    // Rahul downloads Priya's notes
    await prisma.download.create({
        data: {
            userId: rahulId,
            resourceId: resource1.id
        }
    });
    // Award points to Uploader (Priya) for download
    await awardPoints(prisma, priyaId, 'DOWNLOAD');


    // Priya rates Rahul's paper
    await prisma.rating.create({
        data: {
            score: 5,
            review: 'Very helpful, thanks!',
            userId: priyaId,
            resourceId: resource2.id
        }
    });
    // Award points to Uploader (Rahul) for rating
    await awardPoints(prisma, rahulId, 'RATING');

    // Update avgRating (mock calculation for now, ideally DB trigger or calculated field)
    await prisma.resource.update({
        where: { id: resource2.id },
        data: { avgRating: 5.0 }
    });

    console.log({ resource1, resource2 });
    console.log('Seeding complete with points integration!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });

