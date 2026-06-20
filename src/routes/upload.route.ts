import { FastifyInstance } from 'fastify'
import { authMiddleware } from '../middlewares/auth_middleware'
import Type, { Static } from 'typebox'
import FileSaveController from '../controllers/FileSave.controller'
import FilesRepository from '../database/repository/files.repository'

const FileUploadSchema = Type.Object({
    file_id: Type.String({
        description: 'Identificador único do arquivo (UUID)',
        title: 'File ID',
    }),
    data: Type.String({
        description: 'Dados do arquivo codificados em Base64',
        title: 'File Data',
    }),
    original_filename: Type.Optional(
        Type.String({
            description: 'Nome original do arquivo (opcional)',
            title: 'Original Filename',
        })
    ),
})

const FileUploadParamsSchema = Type.Object({
    bucket: Type.String({
        description: 'Bucket onde o arquivo será salvo (image, file, audio)',
        title: 'Bucket',
    }),
})

const Schema = {
    schema: { body: FileUploadSchema, params: FileUploadParamsSchema },
}

export default function UploadFileRoute(app: FastifyInstance, options: { filesRepository: FilesRepository }) {
    const { filesRepository } = options
    app.addHook('preHandler', authMiddleware)

    app.post('/:bucket/upload-image', Schema, async (req, res) => {
        const { file_id, data } = req.body as Static<typeof FileUploadSchema>
        const { bucket } = req.params as Static<typeof FileUploadParamsSchema>

        let referer = req.headers['referer'] || req.headers['referrer'] || req.headers.origin || req.headers['origin'] || 'unknown'
        referer = Array.isArray(referer) ? referer[0] : referer

        console.log(referer)

        if (!file_id || !data) {
            res.status(400).send('Faltando file_id ou data')
            return
        }
        try {
            const response = await FileSaveController({ type: 'image', filesRepository, file: { file_id, data }, referer, bucket_id: bucket })
            res.send({ url: response.url })
        } catch (error: any) {
            console.error(error)
            res.status(500).send({
                error: error.message || 'Erro ao salvar a imagem',
            })
        }
    })

    app.post('/upload-file', Schema, async (req, res) => {
        const { file_id, data, original_filename } = req.body as Static<typeof FileUploadSchema>
        const { bucket } = req.params as Static<typeof FileUploadParamsSchema>

        let referer = req.headers['referer'] || req.headers['referrer'] || req.headers.origin || req.headers['origin'] || 'unknown'
        referer = Array.isArray(referer) ? referer[0] : referer
        if (!file_id || !data) {
            res.status(400).send('Faltando file_id ou data')
            return
        }
        try {
            const response = await FileSaveController({ type: 'file', filesRepository, file: { file_id, data, original_filename }, referer, bucket_id: bucket })
            res.send({ url: response.url })
        } catch (error: any) {
            console.error(error)
            res.status(500).send({
                error: error.message || 'Erro ao salvar o arquivo',
            })
        }
    })

    app.post('/upload-audio', Schema, async (req, res) => {
        const { file_id, data, original_filename } = req.body as Static<typeof FileUploadSchema>
        const { bucket } = req.params as Static<typeof FileUploadParamsSchema>
        let referer = req.headers['referer'] || req.headers['referrer'] || req.headers.origin || req.headers['origin'] || 'unknown'
        referer = Array.isArray(referer) ? referer[0] : referer
        if (!file_id || !data) {
            res.status(400).send('Faltando file_id ou data')
            return
        }
        try {
            const response = await FileSaveController({ type: 'audio', filesRepository, file: { file_id, data, original_filename }, referer, bucket_id: bucket })
            res.send({ url: response.url })
        } catch (error: any) {
            res.status(500).send({
                error: error.message || 'Erro ao salvar o áudio',
            })
        }
    })
}
