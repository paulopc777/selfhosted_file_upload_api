import { FastifyInstance } from 'fastify'
import saveBaseImage from '../services/saveBaseImage'
import saveAudio from '../services/saveAudio'
import saveFile from '../services/saveFile'
import { authMiddleware } from '../middlewares/auth_middleware'

export default function UploadFileRoute(app: FastifyInstance) {
    app.addHook('preHandler', authMiddleware)

    app.post('/upload-image', async (req, res) => {
        console.log('Upload file request')
        const { file_id, data } = req.body as any

        if (!file_id || !data) {
            res.status(400).send('Faltando file_id ou data')
            return
        }
        try {
            const save = await saveBaseImage(file_id, data)
            res.send({ url: save })
        } catch (error: any) {
            res.status(500).send({
                error: error.message || 'Erro ao salvar a imagem',
            })
        }
    })

    app.post('/upload-file', async (req, res) => {
        const { file_id, data, original_filename } = req.body as any
        if (!file_id || !data) {
            res.status(400).send('Faltando file_id ou data')
            return
        }
        try {
            const save = await saveFile(file_id, data, original_filename)
            res.send({ url: save })
        } catch (error: any) {
            res.status(500).send({
                error: error.message || 'Erro ao salvar o arquivo',
            })
        }
    })

    app.post('/upload-audio', async (req, res) => {
        const { file_id, data, original_filename } = req.body as any
        if (!file_id || !data) {
            res.status(400).send('Faltando file_id ou data')
            return
        }
        try {
            const save = await saveAudio(file_id, data, original_filename)
            res.send({ url: save })
        } catch (error: any) {
            res.status(500).send({
                error: error.message || 'Erro ao salvar o áudio',
            })
        }
    })
}
