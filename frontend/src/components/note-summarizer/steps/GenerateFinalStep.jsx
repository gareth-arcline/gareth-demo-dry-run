import { useEffect, useState, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { useWizard } from '@/context/WizardContext'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { apiService } from '@/services/ApiService'

const STATUS_MESSAGES = [
  'Consolidating notes from all files...',
  'Summarizing content by topic...',
  'Generating detailed sections...',
  'Formatting output...',
  'Finalizing document...',
]

export default function GenerateFinalStep() {
  const { state, dispatch } = useWizard()
  const { getAccessToken } = useAuth()
  const [statusIndex, setStatusIndex] = useState(0)
  const hasStarted = useRef(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % STATUS_MESSAGES.length)
    }, 1400)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    async function generate() {
      dispatch({ type: 'SET_PROCESSING', payload: true })
      try {
        const fileIds = state.files
          .filter(f => f.status === 'complete')
          .map(f => f.serverId || f.id)

        // Convert outline to backend format
        const outlineForApi = state.outline.map(t => ({
          id: t.id,
          title: t.title,
          sub_topics: t.subTopics.map(s => ({ id: s.id, text: s.text })),
        }))

        const result = await apiService.generateNotes(outlineForApi, fileIds, getAccessToken)

        dispatch({ type: 'SET_FINAL_CONTENT', payload: result.notes })
        dispatch({ type: 'SET_STEP', payload: 6 })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message })
        dispatch({ type: 'SET_STEP', payload: 4 })
      } finally {
        dispatch({ type: 'SET_PROCESSING', payload: false })
      }
    }

    generate()
  }, [])

  return (
    <Card>
      <CardContent className="py-16">
        <div className="text-center space-y-6">
          <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
          <div>
            <h3 className="text-xl font-semibold text-primary mb-2">
              Generating Final Notes
            </h3>
            <p className="text-muted-foreground animate-pulse">
              {STATUS_MESSAGES[statusIndex]}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
