const { PrismaClient } = require('@prisma/client');

/**
 * Awards points to a user for a specific action.
 * @param {import('@prisma/client').PrismaClient} prisma - The Prisma Client instance.
 * @param {string} userId - The ID of the user (uploader) to award points to.
 * @param {string} action - The action performed ('UPLOAD', 'DOWNLOAD', 'RATING').
 * @returns {Promise<number>} - The new total points of the user.
 */
async function awardPoints(prisma, userId, action) {
    let pointsToAdd = 0;

    switch (action) {
        case 'UPLOAD':
            pointsToAdd = 10;
            break;
        case 'DOWNLOAD':
            pointsToAdd = 2; // Awarded to the UPLOADER, not the downloader usually, but per spec: "handle +10 on upload, +2 on download, +1 on rating"
            // Clarification: Usually download points go to uploader. 
            // Spec says: "Integrate points into download flow: +2 points to uploader on each download"
            // So userId passed here should be uploaderId.
            break;
        case 'RATING':
            pointsToAdd = 1; // "Award +1 point to resource uploader on new rating"
            break;
        default:
            throw new Error('Invalid action for points award');
    }

    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                points: {
                    increment: pointsToAdd,
                },
            },
            select: { points: true },
        });
        console.log(`Awarded ${pointsToAdd} points to user ${userId} for ${action}. Total: ${user.points}`);
        return user.points;
    } catch (error) {
        console.error(`Error awarding points to user ${userId}:`, error);
        throw error;
    }
}

module.exports = { awardPoints };
