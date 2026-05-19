const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { awardPoints } = require('../utils/points');

// GET /resources - List all resources with filters
router.get('/', async (req, res) => {
    try {
        const { subject, semester, type, sort, search, limit = 20, offset = 0 } = req.query;

        const where = {};
        if (subject) where.subject = subject;
        if (semester) where.semester = parseInt(semester);
        if (type) where.type = type;

        // Search functionality
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { tags: { has: search } }
            ];
        }

        const orderBy = {};
        if (sort === 'downloads') {
            orderBy.downloadCount = 'desc';
        } else {
            orderBy.createdAt = 'desc'; // Default: Newest
        }

        const resources = await prisma.resource.findMany({
            where,
            orderBy,
            take: parseInt(limit),
            skip: parseInt(offset),
            include: {
                uploader: {
                    select: { name: true, points: true }
                }
            }
        });

        res.json(resources);
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ error: 'Failed to fetch resources' });
    }
});

// GET /resources/:id - Get single resource
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resource = await prisma.resource.findUnique({
            where: { id },
            include: {
                uploader: {
                    select: { name: true, points: true }
                }
            }
        });

        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        res.json(resource);
    } catch (error) {
        console.error('Error fetching resource:', error);
        res.status(500).json({ error: 'Failed to fetch resource' });
    }
});

// POST /resources - Create new resource (Upload)
router.post('/', async (req, res) => {
    try {
        const {
            title, description, type, subject, semester, year,
            fileUrl, fileName, fileSize, tags, uploaderId
        } = req.body;

        // Basic validation
        if (!title || !fileUrl || !uploaderId || !type || !subject) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create Resource
        const resource = await prisma.resource.create({
            data: {
                title,
                description,
                type,
                subject,
                semester: parseInt(semester),
                year: parseInt(year),
                fileUrl,
                fileName,
                fileSize: parseInt(fileSize),
                tags,
                uploaderId
            }
        });

        // Award Points to Uploader
        const newPoints = await awardPoints(prisma, uploaderId, 'UPLOAD');

        res.status(201).json({
            message: 'Resource uploaded successfully',
            resource,
            uploaderPoints: newPoints
        });
    } catch (error) {
        console.error('Error uploading resource:', error);
        res.status(500).json({ error: 'Failed to upload resource' });
    }
});

// POST /resources/:id/download - Track download and award points
router.post('/:id/download', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body; // Authenticated user downloading

        if (!userId) return res.status(400).json({ error: 'userId is required' });

        // Check if resource exists
        const resource = await prisma.resource.findUnique({ where: { id } });
        if (!resource) return res.status(404).json({ error: 'Resource not found' });

        // Record Download
        await prisma.download.create({
            data: {
                userId,
                resourceId: id
            }
        });

        // Increment download count
        await prisma.resource.update({
            where: { id },
            data: { downloadCount: { increment: 1 } }
        });

        // Award points to Uploader (not downloader)
        await awardPoints(prisma, resource.uploaderId, 'DOWNLOAD');

        res.json({ message: 'Download tracked', fileUrl: resource.fileUrl });
    } catch (error) {
        console.error('Error tracking download:', error);
        res.status(500).json({ error: 'Failed to track download' });
    }
});

// POST /resources/:id/rate - Rate a resource
router.post('/:id/rate', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, score, review } = req.body;

        if (!userId || !score) return res.status(400).json({ error: 'userId and score are required' });
        if (score < 1 || score > 5) return res.status(400).json({ error: 'Score must be between 1 and 5' });

        // Upsert Rating (Update if exists, Create if new)
        const rating = await prisma.rating.upsert({
            where: {
                userId_resourceId: {
                    userId,
                    resourceId: id
                }
            },
            update: { score, review },
            create: { userId, resourceId: id, score, review }
        });

        // Calculate new average rating
        const aggregates = await prisma.rating.aggregate({
            where: { resourceId: id },
            _avg: { score: true }
        });
        const newAvg = aggregates._avg.score || 0;

        // Update Resource with new Average
        const resource = await prisma.resource.update({
            where: { id },
            data: { avgRating: newAvg }
        });

        // Award points to Uploader
        await awardPoints(prisma, resource.uploaderId, 'RATING');

        res.json({ message: 'Rating submitted', avgRating: newAvg, rating });
    } catch (error) {
        console.error('Error submitting rating:', error);
        res.status(500).json({ error: 'Failed to submit rating' });
    }
});

module.exports = router;


