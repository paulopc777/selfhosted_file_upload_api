import { SaveFileResponse } from './SaveFIle.type'

export default async function saveBaseImage(fileId: string, data: string): Promise<SaveFileResponse> {
    const fs = require('fs/promises')
    const path = require('path')

    const UPLOADS_DIR = path.join(__dirname, '../../uploads')

    // Ensure the uploads directory exists
    await fs.mkdir(UPLOADS_DIR, { recursive: true })

    // Determine file extension based on the base64 data
    const extension = getFileExtension(data)

    // Add extension to fileId
    const fileNameWithExtension = `${fileId}${extension}`

    // Define the file path
    const filePath = path.join(UPLOADS_DIR, fileNameWithExtension)

    // Clean the base64 data (remove data URI prefix if exists)
    const cleanData = cleanBase64Data(data)

    // Write the base64 data to the file
    await fs.writeFile(filePath, Buffer.from(cleanData, 'base64'))

    // Return the URL to access the uploaded image
    return {
        url: `/uploads/${fileNameWithExtension}`,
        fileName: fileNameWithExtension,
        extension,
    }
}

/**
 * Extracts the appropriate file extension based on the base64 data
 * Only accepts JPEG (jpeg, jpe), PNG, and GIF file types
 * @param data Base64 string (may include data URI prefix)
 * @returns File extension including the dot (e.g., ".png", ".jpg")
 */
function getFileExtension(data: string): string {
    // Look for the data URI format (data:image/png;base64,...)
    const match = data.match(/^data:(image\/[\w+]+);base64,/)

    if (match && match[1]) {
        const mimeType = match[1]
        switch (mimeType) {
            case 'image/png':
                return '.png'
            case 'image/jpeg':
            case 'image/jpg':
                return '.jpeg'
            case 'image/gif':
                return '.gif'
            default:
                throw new Error('Unsupported file type. Only JPEG, PNG, and GIF are accepted.')
        }
    }

    // If no MIME type is detected, try to infer from the base64 data
    // This is less reliable but provides a fallback
    if (data.includes('/9j/')) {
        return '.jpeg' // JPEG signature
    } else if (data.includes('iVBOR')) {
        return '.png' // PNG signature
    } else if (data.includes('R0lGOD')) {
        return '.gif' // GIF signature
    }

    throw new Error('Unsupported file type. Only JPEG, PNG, and GIF are accepted.')
}

/**
 * Removes the data URI prefix if it exists
 * @param data Base64 string possibly with data URI prefix
 * @returns Clean base64 string
 */
function cleanBase64Data(data: string): string {
    const match = data.match(/^data:image\/[\w+]+;base64,(.+)$/)
    return match ? match[1] : data
}
