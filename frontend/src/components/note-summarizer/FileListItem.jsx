import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { formatFileSize, getFileIcon, getFileExtension } from '@/lib/fileUtils'

export default function FileListItem({ file, onRemove }) {
  const ext = getFileExtension(file.name)
  const Icon = getFileIcon(ext)
  const isUploading = file.status === 'uploading'
  const isComplete = file.status === 'complete'
  const isError = file.status === 'error'

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-card",
        isError && "border-destructive/50"
      )}
    >
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <span className="text-xs text-muted-foreground ml-2 shrink-0">
            {formatFileSize(file.size)}
          </span>
        </div>

        {isUploading && (
          <div className="mt-1.5">
            <Progress value={file.progress} className="h-1.5" />
            <p className="text-xs text-muted-foreground mt-1">{file.message || 'Uploading...'}</p>
          </div>
        )}

        {isError && (
          <p className="text-xs text-destructive mt-1">{file.error}</p>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={() => onRemove(file.id)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Remove file</span>
      </Button>
    </div>
  )
}
