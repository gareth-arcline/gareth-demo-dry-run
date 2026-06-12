import { Check, Upload, MessageSquare, List, PenLine, Sparkles, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWizard } from '@/context/WizardContext'

const STEPS = [
  { label: 'Upload', icon: Upload },
  { label: 'Prompt', icon: MessageSquare },
  { label: 'Outline', icon: List },
  { label: 'Edit', icon: PenLine },
  { label: 'Generate', icon: Sparkles },
  { label: 'Download', icon: Download },
]

export default function WizardStepper() {
  const { state, dispatch } = useWizard()
  const { currentStep } = state

  const handleStepClick = (stepNum) => {
    if (stepNum < currentStep) {
      dispatch({ type: 'SET_STEP', payload: stepNum })
    }
  }

  return (
    <div className="flex items-center justify-center w-full mb-8">
      {STEPS.map((step, index) => {
        const stepNum = index + 1
        const isCompleted = stepNum < currentStep
        const isActive = stepNum === currentStep
        const isFuture = stepNum > currentStep
        const Icon = step.icon

        return (
          <div key={step.label} className="flex items-center">
            <button
              onClick={() => handleStepClick(stepNum)}
              disabled={isFuture}
              className={cn(
                "flex flex-col items-center gap-1.5 group",
                isCompleted && "cursor-pointer",
                isFuture && "cursor-default"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                  isCompleted && "bg-primary text-primary-foreground",
                  isActive && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background",
                  isFuture && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium hidden sm:block",
                  isActive && "text-primary",
                  isCompleted && "text-primary group-hover:underline",
                  isFuture && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </button>

            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "w-8 md:w-16 h-0.5 mx-1 md:mx-2 mt-[-1.25rem] sm:mt-[-1.5rem]",
                  stepNum < currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
