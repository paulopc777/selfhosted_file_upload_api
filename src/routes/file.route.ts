import { FastifyInstance } from 'fastify'
import fs from 'fs/promises'
import path from 'path'
import { authMiddleware } from '../middlewares/auth_middleware'

const UPLOADS_DIR = path.join(__dirname, '../uploads')
fs.mkdir(UPLOADS_DIR, { recursive: true })

export default function FileRoute(app: FastifyInstance) {
    app.addHook('preHandler', authMiddleware)

    app.delete('/upload/:file_name', async (req, res) => {
        const { file_name } = req.params as any
        const filePath = path.join(UPLOADS_DIR, file_name)
        try {
            await fs.unlink(filePath)
            res.status(204).send()
        } catch (error) {
            console.error('Erro ao deletar o arquivo:', error)
            res.status(500).send('Erro ao deletar o arquivo')
        }
    })
}
