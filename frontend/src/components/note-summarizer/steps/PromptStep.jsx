import { useWizard } from '@/context/WizardContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

const EXAMPLE_PROMPTS = [
  "Summarize key discussion topics and action items from the site visit notes",
  "Consolidate findings into company overview, financial performance, and next steps",
  "Extract key themes around operational capabilities, risks, and growth opportunities",
]

export default function PromptStep() {
  const { state, dispatch } = useWizard()
  const { prompt } = state

  const handlePromptChange = (e) => {
    dispatch({ type: 'SET_PROMPT', payload: e.target.value })
  }

  const handleExampleClick = (example) => {
    dispatch({ type: 'SET_PROMPT', payload: example })
  }

  const canProceed = prompt.trim().length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Describe Your Summary Themes</CardTitle>
        <CardDescription>
          Tell the AI what themes or topics you want the consolidated notes to focus on.
          Be specific about the structure and key areas to cover.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={prompt}
          onChange={handlePromptChange}
          placeholder="e.g., Summarize the key discussion topics, financial highlights, operational observations, and action items from the site visit and meeting notes..."
          className="min-h-[120px] resize-y"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {prompt.length} characters
          </span>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Example prompts:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((example, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="cursor-pointer hover:bg-accent transition-colors text-xs py-1.5"
                onClick={() => handleExampleClick(example)}
              >
                {example}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => dispatch({ type: 'SET_STEP', payload: 1 })}
          >
            Back
          </Button>
          <Button
            onClick={() => dispatch({ type: 'SET_STEP', payload: 3 })}
            disabled={!canProceed}
          >
            Generate Outline
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
