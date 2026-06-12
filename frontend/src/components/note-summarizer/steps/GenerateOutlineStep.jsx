import { useEffect, useState, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { useWizard } from '@/context/WizardContext'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { apiService } from '@/services/ApiService'

const STATUS_MESSAGES = [
  'Analyzing uploaded files...',
  'Identifying key themes...',
  'Building outline structure...',
  'Organizing topics...',
  'Finalizing outline...',
]

export default function GenerateOutlineStep() {
  const { state, dispatch } = useWizard()
  const { getAccessToken } = useAuth()
  const [statusIndex, setStatusIndex] = useState(0)
  const hasStarted = useRef(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % STATUS_MESSAGES.length)
    }, 1200)
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

        const result = await apiService.generateOutline(fileIds, state.prompt, getAccessToken)

        const outline = result.outline.topics.map(t => ({
          id: t.id,
          title: t.title,
          subTopics: t.sub_topics.map(s => ({ id: s.id, text: s.text })),
        }))

        dispatch({ type: 'SET_OUTLINE', payload: outline })
        dispatch({ type: 'SET_STEP', payload: 4 })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message })
        dispatch({ type: 'SET_STEP', payload: 2 })
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
              Generating Outline
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
