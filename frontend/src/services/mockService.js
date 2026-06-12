import { v4 as uuidv4 } from 'uuid'
import { generateMockOutline, generateMockFinalContent } from '@/lib/mockData'
import { getFileExtension } from '@/lib/fileUtils'

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const mockService = {
  async uploadFiles(files, onProgress) {
    const totalSteps = 20
    for (let i = 0; i <= totalSteps; i++) {
      await delay(80)
      const pct = Math.round((i / totalSteps) * 70)
      if (onProgress) onProgress(pct, 'Uploading files...')
    }

    if (onProgress) onProgress(80, 'Server is processing files...')
    await delay(500)
    if (onProgress) onProgress(95, 'Finalizing...')
    await delay(300)

    return {
      files: files.map(f => ({
        file_id: uuidv4().slice(0, 8),
        file_name: f.name,
        file_size: f.size,
        file_type: getFileExtension(f.name),
      })),
    }
  },

  async generateOutline(fileIds, prompt) {
    await delay(2500)
    const outline = generateMockOutline()
    return { outline: { topics: outline } }
  },

  async generateNotes(outline, fileIds) {
    await delay(3500)
    const notes = generateMockFinalContent(outline)
    return { notes }
  },

  async downloadDocx() {
    const blob = new Blob(
      ['This is a placeholder document. Connect the backend for real .docx generation.'],
      { type: 'text/plain' }
    )
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'Notes_Summary.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },
}

export default mockService
