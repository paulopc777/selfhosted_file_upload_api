import fastify from 'fastify'
import fs from 'fs/promises'
import path from 'path'
import { HOST, PORT } from './config/contants'
import UploadFileRoute from './routes/upload.route'
import FileRoute from './routes/file.route'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import db from './database/drizzle'
import FilesRepository from './database/repository/files.repository'

export const app = fastify({
    bodyLimit: 50 * 1024 * 1024, // Increased limit for file uploads (50MB)
}).withTypeProvider<TypeBoxTypeProvider>()

// Dependency injection
const filesRepository = new FilesRepository(db)
app.decorate('filesRepository', filesRepository)

const UPLOADS_DIR = path.join(__dirname, 'uploads')
fs.mkdir(UPLOADS_DIR, { recursive: true })

app.get('/', (req, res) => {
    res.send('Servidor de upload de arquivos está rodando!')
})

app.register(UploadFileRoute, { filesRepository })
app.register(FileRoute, { filesRepository })

app.register(require('@fastify/static'), {
    root: UPLOADS_DIR,
    prefix: '/uploads/',
})

app.listen({ host: HOST, port: PORT }, () => {
    console.log(`Servidor rodando em http://${HOST}:${PORT}/`)
})
