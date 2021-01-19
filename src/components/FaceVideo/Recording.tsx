import { h, FunctionComponent } from 'preact'
import Challenge from './Challenge'
import classNames from 'classnames'
import Button from '../Button'
import style from './style.scss'
import { localised, LocalisedType } from '../../locales'

import type { ChallengePayload } from '~types/api'

type OwnProps = {
  currentChallenge: ChallengePayload
  disableInteraction: boolean
  hasError: boolean
  isLastChallenge: boolean
  onNext: () => void
  onStop: () => void
}

type Props = OwnProps & LocalisedType

const Recording: FunctionComponent<Props> = ({
  onStop,
  onNext,
  currentChallenge,
  isLastChallenge,
  disableInteraction,
  translate,
}) => (
  <div>
    <div className={style.caption}>
      <div>
        <div className={style.recordingIndicator}>
          <span role="status" className={style.recordingIndicatorText}>
            {translate('video_capture.status')}
          </span>
        </div>
        <Challenge {...currentChallenge} />
      </div>
    </div>
    <div className={style.actions}>
      <div className={style.captureActionsHint}>
        {translate(
          isLastChallenge
            ? 'video_capture.body_stop'
            : 'video_capture.body_next'
        )}
      </div>
      {!isLastChallenge ? (
        <Button
          variants={['centered', 'primary', 'lg']}
          disabled={disableInteraction}
          onClick={onNext}
        >
          {translate('video_capture.button_primary_next')}
        </Button>
      ) : (
        <button
          type="button"
          aria-label={translate('video_capture.button_stop_accessibility')}
          disabled={disableInteraction}
          onClick={onStop}
          className={classNames(style.btn, style.stopRecording)}
        />
      )}
    </div>
  </div>
)

export default localised<OwnProps>(Recording)