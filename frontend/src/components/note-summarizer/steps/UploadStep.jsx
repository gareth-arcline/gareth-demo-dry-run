import { v4 as uuidv4 } from 'uuid'
import { useWizard } from '@/context/WizardContext'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import FileDropZone from '../FileDropZone'
import FileListItem from '../FileListItem'
import { validateFile, getFileExtension } from '@/lib/fileUtils'
import { apiService } from '@/services/ApiService'

export default function UploadStep() {
  const { state, dispatch } = useWizard()
  const { getAccessToken } = useAuth()
  const { files, isProcessing } = state

  const handleFilesSelected = async (selectedFiles) => {
    const newFiles = []
    const validFiles = []

    for (const file of selectedFiles) {
      const validation = validateFile(file)
      const fileEntry = {
        id: uuidv4().slice(0, 8),
        file,
        name: file.name,
        size: file.size,
        type: getFileExtension(file.name),
        status: validation.valid ? 'pending' : 'error',
        progress: 0,
        message: '',
        error: validation.valid ? null : validation.error,
        serverId: null,
      }
      newFiles.push(fileEntry)
      if (validation.valid) validFiles.push(fileEntry)
    }

    dispatch({ type: 'ADD_FILES', payload: newFiles })

    if (validFiles.length === 0) return

    // Upload valid files
    dispatch({ type: 'SET_PROCESSING', payload: true })
    try {
      // Mark files as uploading
      for (const f of validFiles) {
        dispatch({ type: 'UPDATE_FILE_PROGRESS', payload: { id: f.id, progress: 0, status: 'uploading', message: 'Preparing...' } })
      }

      const rawFiles = validFiles.map(f => f.file)
      const result = await apiService.uploadFilesWithProgress(
        rawFiles,
        getAccessToken,
        (pct, msg) => {
          for (const f of validFiles) {
            dispatch({ type: 'UPDATE_FILE_PROGRESS', payload: { id: f.id, progress: pct, status: 'uploading', message: msg } })
          }
        }
      )

      // Mark uploaded with server file IDs
      result.files.forEach((serverFile, i) => {
        if (i < validFiles.length) {
          dispatch({
            type: 'UPDATE_FILE_PROGRESS',
            payload: { id: validFiles[i].id, progress: 100, status: 'complete', message: 'Upload complete', serverId: serverFile.file_id },
          })
        }
      })
    } catch (error) {
      for (const f of validFiles) {
        dispatch({
          type: 'UPDATE_FILE_PROGRESS',
          payload: { id: f.id, progress: 0, status: 'error', message: error.message },
        })
      }
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false })
    }
  }

  const handleRemove = async (fileId) => {
    const file = files.find(f => f.id === fileId)
    if (file?.serverId) {
      try {
        await apiService.deleteFile(file.serverId, getAccessToken)
      } catch {
        // file already gone or server down, proceed with UI removal
      }
    }
    dispatch({ type: 'REMOVE_FILE', payload: fileId })
  }

  const completedFiles = files.filter(f => f.status === 'complete')
  const canProceed = completedFiles.length > 0 && !isProcessing

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Your Notes</CardTitle>
        <CardDescription>
          Upload the raw notes files you want to consolidate. You can upload multiple files at once.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FileDropZone onFilesSelected={handleFilesSelected} disabled={isProcessing} />

        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {completedFiles.length} of {files.length} file{files.length !== 1 ? 's' : ''} ready
            </p>
            {files.map(file => (
              <FileListItem key={file.id} file={file} onRemove={handleRemove} />
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button
            onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })}
            disabled={!canProceed}
          >
            Next: Write Prompt
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
