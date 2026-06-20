import FilesRepository from '../../src/database/repository/files.repository'
import db from '../../src/database/drizzle'
import { describe, it, expect } from 'vitest'
import { bucketsTable } from '../../src/database/schema'
import { eq } from 'drizzle-orm'

describe('FilesRepository', () => {
    const FileRepository = new FilesRepository(db)
    const bucketName = 'bucket1'
    let bucketId = ''
    let fileId: string = ''

    it('load data for testing', async () => {
        const res = await db
            .select()
            .from(bucketsTable)
            .where(eq(bucketsTable.name, bucketName))
            .limit(1)
            .then((res) => res[0])
        bucketId = res.id
    })

    it('should list files by bucket id', async () => {
        const files = await FileRepository.listFilesByBucketId(bucketId, { page: 1, pageSize: 10 })
        if (files.length > 0) {
            fileId = files[0].id
        }
        expect(files.length).toBeGreaterThan(0)
    })

    it('should find file by id', async () => {
        const file = await FileRepository.findFileById(fileId)
        expect(file).toBeDefined()
        expect(file.id).toBe(fileId)
    })

    it('should return undefined for non-existing file id', async () => {
        const file = await FileRepository.findFileById('non-existing-id')
        expect(file).toBeUndefined()
    })

    it('complex query with multiple filters', async () => {
        const query = {
            page: 1,
            pageSize: 10,
            name: 'file1.txt',
            type: 'text/plain',
        }

        const files = await FileRepository.listFilesByBucketId(bucketId, query)
        expect(files.length).toBeGreaterThan(0)
        expect(files[0].name).toBe('file1.txt')
        expect(files[0].type).toBe('text/plain')
    })

    it("filter type text/plain and name contains 'file'", async () => {
        const query = {
            page: 1,
            pageSize: 10,
            type: 'text/plain',
            nameContains: 'file',
        }
        const files = await FileRepository.listFilesByBucketId(bucketId, query)
        console.log(files.length)
        expect(files.length).toBe(2)
        expect(files[0].name).toContain('file')
        expect(files[0].type).toBe('text/plain')
    })

    it('filter by createdAt range', async () => {
        const now = Math.floor(Date.now() / 1000)
        const oneHourAgo = now - 3600
        const query = {
            page: 1,
            pageSize: 10,
            createdAtFrom: oneHourAgo,
            createdAtTo: now,
        }
        const files = await FileRepository.listFilesByBucketId(bucketId, query)
        expect(files.length).toBeGreaterThan(0)
        expect(files[0].created_at).toBeGreaterThanOrEqual(oneHourAgo)
        expect(files[0].created_at).toBeLessThanOrEqual(now)
    })
})
