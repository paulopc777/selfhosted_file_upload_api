import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { usersTable } from '../schema'
import { eq } from 'drizzle-orm'

export default class UsersRepository {
    constructor(
        readonly db: NodePgDatabase<Record<string, never>> & {
            $client: Pool
        }
    ) {}

    async findByEmail(email: string) {
        const user = await this.db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email))
            .limit(1)
            .then((res) => res[0])
        return user
    }

    async changePassword(userId: string, newPassword: string) {
        await this.db.update(usersTable).set({ password: newPassword }).where(eq(usersTable.id, userId))
    }
}
