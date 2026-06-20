import { eq } from 'drizzle-orm'
import db from '../drizzle'
import { bucketsTable, filesTable, rolesEnum, usersTable } from '../schema'

async function DropAll() {
    await db.delete(filesTable).where(eq(filesTable.name, 'file1.txt')).execute()
    await db.delete(filesTable).where(eq(filesTable.name, 'file2.txt')).execute()
    await db.delete(bucketsTable).where(eq(bucketsTable.name, 'bucket1')).execute()
    await db.delete(usersTable).where(eq(usersTable.email, 'paulo@teste.com.br')).execute()
}

async function seedFiles() {
    const userExists = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, 'paulo@teste.com.br'))
        .limit(1)
        .then((res) => res[0])

    console.log(userExists)
    if (userExists) {
        await DropAll()
    }

    const user = await db
        .insert(usersTable)
        .values({ email: 'paulo@teste.com.br', password: 'password', role: 'admin' })
        .returning()
        .then((res) => res[0])

    const bucket = await db
        .insert(bucketsTable)
        .values({ name: 'bucket1', user_id: user.id })
        .returning()
        .then((res) => res[0])

    await db.insert(filesTable).values({
        name: 'file1.txt',
        bucket_id: bucket.id,
        user_id: user.id,
        size: 1024,
        type: 'text/plain',
        sha256: 'abc123',
        referer: 'http://example.com',
    })

    await db.insert(filesTable).values({
        name: 'file2.txt',
        bucket_id: bucket.id,
        user_id: user.id,
        size: 2048,
        type: 'text/plain',
        sha256: 'def456',
        referer: 'http://example.com',
    })

    await db.insert(filesTable).values({
        name: 'file3.img',
        bucket_id: bucket.id,
        user_id: user.id,
        size: 4096,
        type: 'image/png',
        sha256: 'ghi789',
        referer: 'http://example.com',
    })
}

seedFiles()
