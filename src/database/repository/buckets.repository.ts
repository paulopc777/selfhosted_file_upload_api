import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { bucketsTable } from '../schema'
import { eq } from 'drizzle-orm'

export default class BucketsRepository {
    constructor(
        readonly db: NodePgDatabase<Record<string, never>> & {
            $client: Pool
        }
    ) {}

    async findBucketByName(name: string) {
        const bucket = await this.db
            .select()
            .from(bucketsTable)
            .where(eq(bucketsTable.name, name))
            .limit(1)
            .then((res) => res[0])
        return bucket
    }

    async findBucketsByUserId(userId: string) {
        const buckets = await this.db.select().from(bucketsTable).where(eq(bucketsTable.user_id, userId))
        return buckets
    }

    async createBucket(name: string, userId: string) {
        const bucket = await this.db
            .insert(bucketsTable)
            .values({ name, user_id: userId })
            .returning()
            .then((res) => res[0])
        return bucket
    }

    async deleteBucket(bucketId: string) {
        await this.db.delete(bucketsTable).where(eq(bucketsTable.id, bucketId))
    }

    async findBucketById(bucketId: string) {
        const bucket = await this.db
            .select()
            .from(bucketsTable)
            .where(eq(bucketsTable.id, bucketId))
            .limit(1)
            .then((res) => res[0])
        return bucket
    }

    async updateBucketName(bucketId: string, newName: string) {
        await this.db.update(bucketsTable).set({ name: newName }).where(eq(bucketsTable.id, bucketId))
    }
}
