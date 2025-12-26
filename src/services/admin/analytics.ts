import prisma from '@/lib/prisma'

export interface AdminAnalyticsStats {
    activeSessions: number
}

export async function getActiveSessionStats(): Promise<AdminAnalyticsStats> {
    try {
        // defined as unique sessions with activity in the last 30 minutes
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)

        const activeSessions = await prisma.widgetAnalyticsEvent.groupBy({
            by: ['sessionId'],
            where: {
                createdAt: {
                    gte: thirtyMinutesAgo,
                },
                sessionId: {
                    not: undefined // Ensure sessionId is not null/undefined if that's possible, though schema says string
                }
            },
        })

        // GroupBy returns an array of unique groups. The length of this array is the number of unique sessionIds.
        return {
            activeSessions: activeSessions.length,
        }
    } catch (error) {
        console.warn('Failed to fetch active session stats', error)
        return {
            activeSessions: 0,
        }
    }
}
