import fs from 'fs/promises'
import path from 'path'
import FilesRepository from '../database/repository/files.repository'

const UPLOADS_DIR = path.join(__dirname, '../uploads')
fs.mkdir(UPLOADS_DIR, { recursive: true })

export default async function FileDeleteController(bucketId: string, file_name: string, filesRepository: FilesRepository) {
    const filePath = path.join(UPLOADS_DIR, file_name)
    try {

        const fileRecord = await filesRepository.listFilesByBucketId(bucketId, { page: 1, pageSize: 1, name: file_name }).then(res => res[0])
        if (!fileRecord) {
            return { ok: false, status: 404, message: 'Arquivo não encontrado' }
        }

        await filesRepository.deleteFileById(fileRecord.id)

        await fs.unlink(filePath)
        return { ok: true, status: 204 }
    } catch (error) {
        console.error('Erro ao deletar o arquivo:', error)
        return { ok: false, status: 500, message: 'Erro ao deletar o arquivo' }
    }
}
