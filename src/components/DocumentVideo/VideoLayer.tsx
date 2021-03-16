import { h, FunctionComponent, Fragment } from 'preact'
import { memo, useCallback, useEffect, useState } from 'preact/compat'

import { useLocales } from '~locales'
import Button from '../Button'
import DocumentOverlay, {
  calculateHollowRect,
} from '../Overlay/DocumentOverlay'
import Instructions from './Instructions'
import StepProgress from './StepProgress'
import style from './style.scss'

import type { DocumentTypes } from '~types/steps'
import type { DocInstructionLocale } from '~utils/localesMapping'
import type { VideoLayerProps } from '../VideoCapture'

export type Props = {
  documentType: DocumentTypes
  instructionKeys: DocInstructionLocale[]
  onNext: () => void
  onSubmit: () => void
  stepNumber: number
  totalSteps: number
} & VideoLayerProps

const SUCCESS_STATE_TIMEOUT = 2000
const SUCCESS_STATE_VIBRATION = 500

const VideoLayer: FunctionComponent<Props> = ({
  disableInteraction,
  documentType,
  instructionKeys,
  isRecording,
  onNext,
  onStart,
  onStop,
  onSubmit,
  stepNumber,
  totalSteps,
}) => {
  const [stepFinished, setStepFinished] = useState(false)
  const { translate } = useLocales()

  useEffect(() => {
    if (stepFinished) {
      navigator.vibrate(SUCCESS_STATE_VIBRATION)
    }
  }, [stepFinished])

  const handleNext = useCallback(() => {
    if (stepNumber === 0) {
      onNext()
      return
    }

    setStepFinished(true)

    if (stepNumber >= totalSteps) {
      onStop()
    }

    setTimeout(() => {
      if (stepNumber >= totalSteps) {
        onSubmit()
        return
      }

      onNext()
      setStepFinished(false)
    }, SUCCESS_STATE_TIMEOUT)
  }, [stepNumber, totalSteps, onNext, onStop, onSubmit])

  const { title, subtitle, button } = instructionKeys[stepNumber]

  const instruction = (
    <Instructions
      subtitle={subtitle ? translate(subtitle) : undefined}
      title={translate(title)}
    />
  )

  const items = stepFinished ? (
    <div className={style.instructions}>
      <span className={style.success} />
    </div>
  ) : (
    <Fragment>
      {instruction}
      <Button
        variants={['centered', 'primary', 'lg']}
        disabled={disableInteraction}
        onClick={isRecording ? handleNext : onStart}
      >
        {translate(button)}
      </Button>
    </Fragment>
  )

  const hollowRect = calculateHollowRect(documentType, 0.5)

  return (
    <Fragment>
      <DocumentOverlay
        marginBottom={0.5}
        type={documentType}
        withPlaceholder={stepNumber === 0}
      />
      <div className={style.controls} style={{ top: hollowRect.bottom }}>
        <StepProgress stepNumber={stepNumber} totalSteps={totalSteps} />
        {items}
      </div>
    </Fragment>
  )
}

export default memo(VideoLayer)
