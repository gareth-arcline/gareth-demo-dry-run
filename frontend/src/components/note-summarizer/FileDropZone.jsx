import { useState, useRef } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ACCEPTED_EXTENSIONS } from '@/lib/fileUtils'

export default function FileDropZone({ onFilesSelected, disabled = false }) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  const acceptString = ACCEPTED_EXTENSIONS.join(',')

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (disabled) return
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) onFilesSelected(files)
  }

  const handleClick = () => {
    if (!disabled) inputRef.current?.click()
  }

  const handleInputChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) onFilesSelected(files)
    e.target.value = ''
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/50",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={acceptString}
        onChange={handleInputChange}
        className="hidden"
      />
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-lg font-medium">
            {isDragging ? 'Drop files here' : 'Drag & drop your notes files here'}
          </p>
          <p className="text-sm text-muted-foreground">
            or click to browse
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Supported: .docx, .pptx, .doc, .ppt, .pdf, .txt, .md, .eml, .msg
        </p>
      </div>
    </div>
  )
}
