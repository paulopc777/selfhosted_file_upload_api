import { SaveFileResponse } from './SaveFIle.type'

export default async function saveAudio(fileId: string, data: string, originalFileName?: string): Promise<SaveFileResponse> {
    const fs = require('fs/promises')
    const path = require('path')

    const UPLOADS_DIR = path.join(__dirname, '../../uploads')

    // Ensure the uploads directory exists
    await fs.mkdir(UPLOADS_DIR, { recursive: true })

    // Determine file extension
    const extension = getAudioExtension(data, originalFileName)

    // Add extension to fileId
    const fileNameWithExtension = `${fileId}${extension}`

    // Define the file path
    const filePath = path.join(UPLOADS_DIR, fileNameWithExtension)

    // Clean the base64 data (remove data URI prefix if exists)
    const cleanData = cleanBase64Data(data)

    // Check file size (15MB limit for audio files)
    const fileSizeInBytes = (cleanData.length * 3) / 4 // Approximate size from base64
    const maxSizeInBytes = 15 * 1024 * 1024 // 15MB

    if (fileSizeInBytes > maxSizeInBytes) {
        throw new Error('Arquivo de áudio muito grande. Tamanho máximo permitido: 15MB')
    }

    // Write the base64 data to the file
    await fs.writeFile(filePath, Buffer.from(cleanData, 'base64'))

    // Return the URL to access the uploaded audio file
    return {
        url: `/uploads/${fileNameWithExtension}`,
        fileName: fileNameWithExtension,
        extension,
    }
}

/**
 * Extracts the appropriate audio file extension based on the base64 data or original filename
 * Accepts: .aac, .amr, .mp3, .m4a, .ogg
 * @param data Base64 string (may include data URI prefix)
 * @param originalFileName Optional original filename to extract extension from
 * @returns File extension including the dot (e.g., ".mp3", ".aac")
 */
function getAudioExtension(data: string, originalFileName?: string): string {
    // First try to get extension from data URI
    const match = data.match(/^data:([^;]+);base64,/)
    if (match && match[1]) {
        const mimeType = match[1]
        switch (mimeType) {
            case 'audio/aac':
                return '.aac'
            case 'audio/amr':
                return '.amr'
            case 'audio/mpeg':
            case 'audio/mp3':
                return '.mp3'
            case 'audio/mp4':
            case 'audio/m4a':
                return '.m4a'
            case 'audio/ogg':
                return '.ogg'
            case 'audio/webm':
                return '.webm'
            case 'audio/mpeg':
                return '.mpeg'
            default:
                break // Continue to filename-based detection
        }
    }

    // Try to get extension from original filename
    if (originalFileName) {
        const fileExtMatch = originalFileName.match(/\.([^.]+)$/)
        if (fileExtMatch) {
            const ext = fileExtMatch[1].toLowerCase()
            const allowedExtensions = ['aac', 'amr', 'mp3', 'm4a', 'ogg', 'webm']
            if (allowedExtensions.includes(ext)) {
                return `.${ext}`
            }
        }
    }

    // Try to infer from base64 data signatures
    if (data.includes('ID3') || data.includes('LAME')) {
        return '.mp3' // MP3 signature
    } else if (data.includes('OggS')) {
        return '.ogg' // OGG signature
    } else if (data.includes('ftyp')) {
        return '.m4a' // M4A/MP4 signature
    } else if (data.includes('#!AMR')) {
        return '.amr' // AMR signature
    }

    throw new Error('Tipo de arquivo de áudio não suportado. Apenas .aac, .amr, .mp3, .m4a, .ogg e .webm são aceitos.')
}

/**
 * Removes the data URI prefix if it exists
 * @param data Base64 string possibly with data URI prefix
 * @returns Clean base64 string
 */
function cleanBase64Data(data: string): string {
    const match = data.match(/^data:[^;]+;base64,(.+)$/)
    return match ? match[1] : data
}
