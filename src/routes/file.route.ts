import { FastifyInstance } from 'fastify'
import fs from 'fs/promises'
import path from 'path'
import { authMiddleware } from './middlewares/auth_middleware'
import FileDeleteController from '../controllers/FileDelete.controller'
import FilesRepository from '../database/repository/files.repository'

const UPLOADS_DIR = path.join(__dirname, '../uploads')
fs.mkdir(UPLOADS_DIR, { recursive: true })

export default function FileRoute(app: FastifyInstance, { filesRepository }: { filesRepository: FilesRepository }) {
    app.addHook('preHandler', authMiddleware)

    app.delete('/:bucketId/upload/:file_name', async (req, res) => {
        const { file_name } = req.params as any
        const { bucketId } = req.params as any
        if (!file_name || !bucketId) {
            res.status(400).send('Faltando bucketId ou file_name')
            return
        }
        try {
            const response = await FileDeleteController(bucketId, file_name, filesRepository)
            res.status(response.status).send(response.message || '')
        } catch (error) {
            console.error('Erro ao deletar o arquivo:', error)
            res.status(500).send('Erro ao deletar o arquivo')
        }
    })
}
