import { h, FunctionComponent } from 'preact'
import { memo, useCallback, useState } from 'preact/compat'
import type { Dispatch } from 'redux'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@onfido/castor-react'
import classNames from 'classnames'

import { useSdkOptions } from '~contexts'
import { useLocales } from '~locales'
import { uploadBinaryMedia, createV4Document } from '~utils/onfidoApi'
import { actions } from 'components/ReduxAppWrapper/store/actions'
import theme from 'components/Theme/style.scss'
import { appendToTracking } from 'Tracker'
import Error from '../../Error'
import Spinner from '../../Spinner'
import Content from './Content'
import style from './style.scss'

import type { CombinedActions, RootState, DocumentCapture } from '~types/redux'
import type { ErrorProp, StepComponentDocumentProps } from '~types/routers'

const Confirm: FunctionComponent<StepComponentDocumentProps> = ({
  nextStep,
  previousStep,
  triggerOnError,
}) => {
  const [{ token }] = useSdkOptions()
  const [loading, setLoading] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [error, setError] = useState<ErrorProp | undefined>(undefined)
  const { translate } = useLocales()

  const dispatch = useDispatch<Dispatch<CombinedActions>>()
  const apiUrl = useSelector<RootState, string | undefined>(
    (state) => state.globals.urls.auth_url
  )
  const documentFront = useSelector<RootState, DocumentCapture | undefined>(
    (state) => state.captures.document_front
  )
  const documentBack = useSelector<RootState, DocumentCapture | undefined>(
    (state) => state.captures.document_back
  )
  const documentVideo = useSelector<RootState, DocumentCapture | undefined>(
    (state) => state.captures.document_video
  )

  const onUploadDocuments = useCallback(async () => {
    if (!documentFront) {
      console.error('Front of document not captured')
      return
    }

    if (!documentVideo) {
      console.error('Document video not captured')
      return
    }

    setLoading(true)

    const mediaUuids = []

    try {
      const { media_id: frontMediaUuid } = await uploadBinaryMedia(
        {
          file: documentFront.blob,
          filename: documentFront.filename,
          sdkMetadata: documentFront.sdkMetadata,
        },
        apiUrl,
        token
      )

      mediaUuids.push(frontMediaUuid)
      dispatch(
        actions.deleteCapture({
          method: 'document',
          side: 'front',
        })
      )

      if (documentBack) {
        const { media_id: backMediaUuid } = await uploadBinaryMedia(
          {
            file: documentBack.blob,
            filename: documentBack.filename,
            sdkMetadata: documentBack.sdkMetadata,
          },
          apiUrl,
          token
        )

        mediaUuids.push(backMediaUuid)
        dispatch(
          actions.deleteCapture({
            method: 'document',
            side: 'back',
          })
        )
      }

      const { media_id: videoMediaUuid } = await uploadBinaryMedia(
        {
          file: documentVideo.blob,
          filename: documentVideo.filename,
          sdkMetadata: documentVideo.sdkMetadata,
        },
        apiUrl,
        token,
        true // includes file HMAC Auth
      )

      mediaUuids.push(videoMediaUuid)

      const { uuid: documentUuid } = await createV4Document(
        mediaUuids,
        apiUrl,
        token
      )

      dispatch(
        actions.setCaptureMetadata({
          capture: documentVideo,
          apiResponse: {
            id: documentUuid,
            media_uuids: mediaUuids,
          },
        })
      )

      nextStep()
    } catch (errorResponse) {
      setLoading(false)
      triggerOnError(errorResponse)
      setError({ name: 'REQUEST_ERROR', type: 'error' })
    }
  }, [
    nextStep,
    token,
    dispatch,
    apiUrl,
    documentFront,
    documentBack,
    documentVideo,
    triggerOnError,
  ])

  const onSecondaryClick = useCallback(() => {
    if (error || previewing) {
      previousStep()
      return
    }

    setPreviewing(true)
  }, [error, previewing, previousStep])

  if (loading) {
    return <Spinner />
  }

  return (
    <div className={style.container}>
      {error ? <Error error={error} role="alert" /> : <div />}
      {!error && <Content capture={documentVideo} previewing={previewing} />}
      <div className={style.buttonsContainer}>
        <Button
          onClick={onUploadDocuments}
          variant="primary"
          className={classNames(theme['button-centered'], theme['button-lg'])}
          data-onfido-qa="doc-video-confirm-primary-btn"
        >
          {translate('video_confirmation.button_primary')}
        </Button>
        <Button
          onClick={onSecondaryClick}
          variant="secondary"
          className={classNames(theme['button-centered'], theme['button-lg'])}
          data-onfido-qa="doc-video-confirm-secondary-btn"
        >
          {translate(
            error || previewing
              ? 'video_confirmation.button_secondary'
              : 'doc_video_confirmation.button_secondary'
          )}
        </Button>
      </div>
    </div>
  )
}

export default appendToTracking(memo(Confirm), 'confirmation_video')
