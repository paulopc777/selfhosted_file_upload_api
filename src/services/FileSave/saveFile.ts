import { SaveFileResponse } from './SaveFIle.type'

export default async function saveFile(fileId: string, data: string, originalFileName?: string): Promise<SaveFileResponse> {
    const fs = require('fs/promises')
    const path = require('path')

    const UPLOADS_DIR = path.join(__dirname, '../../uploads')

    // Ensure the uploads directory exists
    await fs.mkdir(UPLOADS_DIR, { recursive: true })

    // Determine file extension
    const extension = getFileExtension(data, originalFileName)

    // Add extension to fileId
    const fileNameWithExtension = `${fileId}${extension}`

    // Define the file path
    const filePath = path.join(UPLOADS_DIR, fileNameWithExtension)

    // Clean the base64 data (remove data URI prefix if exists)
    const cleanData = cleanBase64Data(data)

    // Check file size (50MB limit)
    const fileSizeInBytes = (cleanData.length * 3) / 4 // Approximate size from base64
    const maxSizeInBytes = 50 * 1024 * 1024 // 50MB

    if (fileSizeInBytes > maxSizeInBytes) {
        throw new Error('Arquivo muito grande. Tamanho máximo permitido: 50MB')
    }

    // Write the base64 data to the file
    await fs.writeFile(filePath, Buffer.from(cleanData, 'base64'))

    // Return the URL to access the uploaded file
    return {
        url: `/uploads/${fileNameWithExtension}`,
        fileName: fileNameWithExtension,
        extension,
    }
}

/**
 * Extracts the appropriate file extension based on the base64 data or original filename
 * Accepts: .txt, .xls, .xlsx, .doc, .docx, .ppt, .pptx, .pdf
 * @param data Base64 string (may include data URI prefix)
 * @param originalFileName Optional original filename to extract extension from
 * @returns File extension including the dot (e.g., ".pdf", ".docx")
 */
function getFileExtension(data: string, originalFileName?: string): string {
    // First try to get extension from data URI
    const match = data.match(/^data:([^;]+);base64,/)

    if (match && match[1]) {
        const mimeType = match[1]
        switch (mimeType) {
            case 'text/plain':
                return '.txt'
            case 'application/vnd.ms-excel':
                return '.xls'
            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                return '.xlsx'
            case 'application/msword':
                return '.doc'
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                return '.docx'
            case 'application/vnd.ms-powerpoint':
                return '.ppt'
            case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                return '.pptx'
            case 'application/pdf':
                return '.pdf'
            default:
                break // Continue to filename-based detection
        }
    }

    // Try to get extension from original filename
    if (originalFileName) {
        const fileExtMatch = originalFileName.match(/\.([^.]+)$/)
        if (fileExtMatch) {
            const ext = fileExtMatch[1].toLowerCase()
            const allowedExtensions = ['txt', 'xls', 'xlsx', 'doc', 'docx', 'ppt', 'pptx', 'pdf']
            if (allowedExtensions.includes(ext)) {
                return `.${ext}`
            }
        }
    }

    // Try to infer from base64 data signatures
    if (data.includes('JVBERi')) {
        return '.pdf' // PDF signature
    } else if (data.includes('UEsDBBQ')) {
        // This could be xlsx, docx, or pptx (all are ZIP-based)
        // Default to .docx, but ideally the MIME type or filename should be provided
        return '.docx'
    } else if (data.includes('0M8R4KGx')) {
        // This could be xls, doc, or ppt (all use compound document format)
        // Default to .doc, but ideally the MIME type or filename should be provided
        return '.doc'
    }

    throw new Error('Tipo de arquivo não suportado. Apenas .txt, .xls, .xlsx, .doc, .docx, .ppt, .pptx e .pdf são aceitos.')
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
