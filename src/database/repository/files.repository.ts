import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { filesTable } from '../schema'
import { and, eq, gte, like, lte } from 'drizzle-orm'

type ListParams = {
    page: number
    pageSize: number
    name?: string
    referer?: string
    sha256?: string
    createdAtFrom?: number
    createdAtTo?: number
    type?: string
    nameContains?: string
    lastAccessedAtFrom?: number
    lastAccessedAtTo?: number
}

export default class FilesRepository {
    constructor(
        readonly db: NodePgDatabase<Record<string, never>> & {
            $client: Pool
        }
    ) {}

    async findFileById(fileId: string) {
        const file = await this.db
            .select()
            .from(filesTable)
            .where(eq(filesTable.id, fileId))
            .limit(1)
            .then((res) => res[0])
        return file
    }

    async listFilesByBucketId(bucketId: string, listParams: ListParams) {
        const { page, pageSize, name } = listParams

        const conditions = [eq(filesTable.bucket_id, bucketId)]

        if (name) {
            conditions.push(eq(filesTable.name, name))
        }

        if (listParams.referer) {
            conditions.push(eq(filesTable.referer, listParams.referer))
        }

        if (listParams.sha256) {
            conditions.push(eq(filesTable.sha256, listParams.sha256))
        }

        if (listParams.createdAtFrom) {
            conditions.push(gte(filesTable.created_at, listParams.createdAtFrom))
        }

        if (listParams.createdAtTo) {
            conditions.push(lte(filesTable.created_at, listParams.createdAtTo))
        }

        if (listParams.type) {
            conditions.push(eq(filesTable.type, listParams.type))
        }

        if (listParams.nameContains) {
            conditions.push(like(filesTable.name, `%${listParams.nameContains}%`))
        }

        if (listParams.lastAccessedAtFrom) {
            conditions.push(gte(filesTable.last_accessed_at, listParams.lastAccessedAtFrom))
        }

        if (listParams.lastAccessedAtTo) {
            conditions.push(lte(filesTable.last_accessed_at, listParams.lastAccessedAtTo))
        }

        return this.db
            .select()
            .from(filesTable)
            .where(and(...conditions))
            .limit(pageSize)
            .offset((page - 1) * pageSize)
    }

    async deleteFileById(fileId: string) {
        await this.db.delete(filesTable).where(eq(filesTable.id, fileId))
    }

    async updateLastAccessedAt(fileId: string) {
        await this.db
            .update(filesTable)
            .set({ last_accessed_at: Math.floor(Date.now() / 1000) })
            .where(eq(filesTable.id, fileId))
    }

    async createFile(fileData: { name: string; bucket_id: string; size: number; type: string; sha256: string; referer?: string; user_id?: string }) {
        const { name, bucket_id, user_id, size, type, sha256, referer } = fileData
        const newFile = await this.db
            .insert(filesTable)
            .values({
                name,
                bucket_id,
                user_id,
                size,
                type,
                sha256,
                referer,
            })
            .returning()
            .then((res) => res[0])
        return newFile
    }
}
