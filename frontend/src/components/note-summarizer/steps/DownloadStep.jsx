import { Download, RotateCcw, Check } from 'lucide-react'
import { useWizard } from '@/context/WizardContext'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import FinalPreview from '../FinalPreview'
import { apiService } from '@/services/ApiService'

export default function DownloadStep() {
  const { state, dispatch } = useWizard()
  const { getAccessToken } = useAuth()
  const { finalContent } = state

  const handleDownload = async () => {
    try {
      await apiService.downloadDocx(getAccessToken)
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    }
  }

  const handleStartOver = () => {
    dispatch({ type: 'RESET' })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
              <Check className="h-6 w-6 text-success-foreground" />
            </div>
            <div>
              <CardTitle>Notes Generated Successfully</CardTitle>
              <CardDescription>
                Review the preview below and download your consolidated notes as a Word document.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button onClick={handleDownload} size="lg">
              <Download className="h-5 w-5 mr-2" />
              Download as .docx
            </Button>
            <Button variant="outline" size="lg" onClick={handleStartOver}>
              <RotateCcw className="h-5 w-5 mr-2" />
              Start Over
            </Button>
          </div>
        </CardContent>
      </Card>

      <FinalPreview content={finalContent} />

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => dispatch({ type: 'SET_STEP', payload: 4 })}
        >
          Back to Edit Outline
        </Button>
      </div>
    </div>
  )
}
