import { FileText, File, Mail, Presentation } from 'lucide-react'

export const ACCEPTED_EXTENSIONS = [
  '.docx', '.doc', '.pptx', '.ppt', '.eml', '.msg', '.txt', '.pdf', '.md'
]

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export function validateFile(file) {
  const ext = getFileExtension(file.name)
  if (!ACCEPTED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `File type "${ext}" is not supported. Accepted: ${ACCEPTED_EXTENSIONS.join(', ')}` }
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File "${file.name}" exceeds the 50MB size limit.` }
  }
  return { valid: true }
}

export function getFileExtension(filename) {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot === -1) return ''
  return filename.slice(lastDot).toLowerCase()
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)
  return `${size} ${units[i]}`
}

export function getFileIcon(extension) {
  switch (extension) {
    case '.pptx':
    case '.ppt':
      return Presentation
    case '.eml':
    case '.msg':
      return Mail
    case '.docx':
    case '.doc':
    case '.txt':
    case '.md':
    case '.pdf':
      return FileText
    default:
      return File
  }
}
