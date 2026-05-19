const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// GET /users/leaderboard - Top 20 users by points
router.get('/leaderboard', async (req, res) => {
    try {
        const leaderboard = await prisma.user.findMany({
            orderBy: {
                points: 'desc'
            },
            take: 20,
            select: {
                id: true,
                name: true,
                department: true,
                points: true,
                _count: {
                    select: { resources: true }
                }
            }
        });
        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// GET /users/:id/profile - User profile info
router.get('/:id/profile', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { resources: true, downloads: true }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get recent uploads
        const recentUploads = await prisma.resource.findMany({
            where: { uploaderId: id },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        res.json({ ...user, recentUploads });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// GET /users/:id/downloads - User's download history
router.get('/:id/downloads', async (req, res) => {
    try {
        const { id } = req.params;
        const downloads = await prisma.download.findMany({
            where: { userId: id },
            orderBy: { downloadedAt: 'desc' },
            include: {
                resource: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        subject: true,
                        fileUrl: true,
                        uploader: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        res.json(downloads);
    } catch (error) {
        console.error('Error fetching user downloads:', error);
        res.status(500).json({ error: 'Failed to fetch downloads' });
    }
});

module.exports = router;

