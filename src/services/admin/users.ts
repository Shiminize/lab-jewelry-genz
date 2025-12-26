import prisma from '@/lib/prisma'

export interface AdminUserStats {
    totalUsers: number
}

export async function getAdminUserStats(): Promise<AdminUserStats> {
    try {
        const totalUsers = await prisma.user.count()

        return {
            totalUsers,
        }
    } catch (error) {
        console.warn('Failed to fetch admin user stats', error)
        return {
            totalUsers: 0,
        }
    }
}
