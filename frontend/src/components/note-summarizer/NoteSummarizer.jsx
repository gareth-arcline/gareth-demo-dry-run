import { WizardProvider, useWizard } from '@/context/WizardContext'
import WizardStepper from './WizardStepper'
import UploadStep from './steps/UploadStep'
import PromptStep from './steps/PromptStep'
import GenerateOutlineStep from './steps/GenerateOutlineStep'
import EditOutlineStep from './steps/EditOutlineStep'
import GenerateFinalStep from './steps/GenerateFinalStep'
import DownloadStep from './steps/DownloadStep'

function WizardContent() {
  const { state } = useWizard()

  const renderStep = () => {
    switch (state.currentStep) {
      case 1: return <UploadStep />
      case 2: return <PromptStep />
      case 3: return <GenerateOutlineStep />
      case 4: return <EditOutlineStep />
      case 5: return <GenerateFinalStep />
      case 6: return <DownloadStep />
      default: return <UploadStep />
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <WizardStepper />
      {renderStep()}
    </div>
  )
}

export default function NoteSummarizer() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  )
}
