import FilesRepository from '../database/repository/files.repository'
import saveAudio from '../services/FileSave/saveAudio'
import saveBaseImage from '../services/FileSave/saveBaseImage'
import saveFile from '../services/FileSave/saveFile'
import crypto from 'crypto'

type FilesTypes = 'image' | 'file' | 'audio'

const SaveFile = (type: FilesTypes, file_id: string, data: string, original_filename?: string) => {
    switch (type) {
        case 'image':
            return saveBaseImage(file_id, data)
        case 'file':
            return saveFile(file_id, data, original_filename)
        case 'audio':
            return saveAudio(file_id, data, original_filename)
        default:
            throw new Error('Tipo de arquivo inválido')
    }
}

interface FileSaveData {
    type: FilesTypes
    filesRepository: FilesRepository
    file: { file_id: string; data: string; original_filename?: string }
    referer?: string
    bucket_id: string
}

export default async function FileSaveController({ type, filesRepository, file, referer, bucket_id }: FileSaveData) {
    const { file_id, data, original_filename } = file
    const data_save = await SaveFile(type, file_id, data, original_filename)

    if (!data_save) {
        throw new Error('Erro ao salvar o arquivo')
    }

    const sha256 = crypto.createHash('sha256').update(data).digest('hex')

    await filesRepository.createFile({
        name: original_filename || `${file_id}.${type === 'image' ? 'png' : type === 'audio' ? 'mp3' : 'bin'}`,
        bucket_id: bucket_id,
        size: 1, // TODO: Calcular o tamanho real do arquivo
        type: data_save.extension,
        sha256: sha256,
        referer: referer,
    })

    return data_save
}
