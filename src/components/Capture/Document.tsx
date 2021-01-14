import { h, Component } from 'preact'
import { appendToTracking } from '../../Tracker'
import DocumentAutoCapture from '../Photo/DocumentAutoCapture'
import DocumentLiveCapture from '../Photo/DocumentLiveCapture'
import Uploader from '../Uploader'
import PageTitle from '../PageTitle'
import CustomFileInput from '../CustomFileInput'
import withCrossDeviceWhenNoCamera from './withCrossDeviceWhenNoCamera'
import { getDocumentTypeGroup } from '../DocumentSelector/documentTypes'
import { isDesktop, isHybrid, addDeviceRelatedProperties } from '~utils/index'
import { compose } from '~utils/func'
import { validateFile } from '~utils/file'
import { DOCUMENT_CAPTURE_LOCALES_MAPPING } from '~utils/localesMapping'
import { randomId } from '~utils/string'
import { localised } from '../../locales'
import FallbackButton from '../Button/FallbackButton'
import style from './style.scss'

import type {
  DocumentSides,
  ImageResizeInfo,
  SdkMetadata,
  FlowVariants,
} from '~types/commons'
import type { DocumentTypes, PoATypes } from '~types/steps'

type Props = {
  actions: {
    deleteCapture: () => void
    createCapture: (...args: unknown[]) => void
  }
  changeFlowTo: (newFlow: FlowVariants) => void
  documentType: DocumentTypes
  forceCrossDevice: boolean
  hasCamera: boolean
  isPoA: boolean
  mobileFlow: boolean
  nextStep: () => void
  poaDocumentType: PoATypes
  side?: DocumentSides
  subTitle: string
  translate: (key: string) => string
  uploadFallback: boolean
  useLiveDocumentCapture: boolean
  useWebcam: boolean
}

type CapturePayload = {
  base64?: string
  blob: Blob
  filename?: string
  id?: string
  isPreviewCropped?: boolean
  sdkMetadata: SdkMetadata
}

class Document extends Component<Props> {
  static defaultProps = {
    side: 'front',
    forceCrossDevice: false,
  }

  handleCapture = (payload: CapturePayload) => {
    const {
      isPoA,
      documentType,
      poaDocumentType,
      actions,
      side,
      nextStep,
      mobileFlow,
    } = this.props
    const documentCaptureData = {
      ...payload,
      sdkMetadata: addDeviceRelatedProperties(payload.sdkMetadata, mobileFlow),
      method: 'document',
      documentType: isPoA ? poaDocumentType : documentType,
      side,
      id: payload.id || randomId(),
    }
    actions.createCapture(documentCaptureData)

    nextStep()
  }

  handleUpload = (blob: Blob, imageResizeInfo: ImageResizeInfo) =>
    this.handleCapture({
      blob,
      sdkMetadata: { captureMethod: 'html5', imageResizeInfo },
    })

  handleError = () => this.props.actions.deleteCapture()

  handleFileSelected = (file: File) =>
    validateFile(file, this.handleUpload, this.handleError)

  renderUploadFallback = (text: string) => (
    <CustomFileInput
      className={style.uploadFallback}
      onChange={this.handleFileSelected}
      accept="image/*"
      capture
    >
      {text}
    </CustomFileInput>
  )

  renderCrossDeviceFallback = (text: string) => (
    <FallbackButton
      text={text}
      onClick={() => this.props.changeFlowTo('crossDeviceSteps')}
    />
  )

  render() {
    const {
      useLiveDocumentCapture,
      useWebcam,
      hasCamera,
      documentType,
      poaDocumentType,
      isPoA,
      side,
      translate,
      subTitle,
      uploadFallback,
    } = this.props

    const title = translate(
      DOCUMENT_CAPTURE_LOCALES_MAPPING[isPoA ? poaDocumentType : documentType][
        side
      ].title
    )
    const propsWithErrorHandling = { ...this.props, onError: this.handleError }
    const renderTitle = <PageTitle {...{ title, subTitle }} smaller />
    const renderFallback = isDesktop
      ? this.renderCrossDeviceFallback
      : this.renderUploadFallback
    const enableLiveDocumentCapture =
      useLiveDocumentCapture && (!isDesktop || isHybrid)

    if (hasCamera && useWebcam) {
      return (
        <DocumentAutoCapture
          {...propsWithErrorHandling}
          renderTitle={renderTitle}
          renderFallback={renderFallback}
          containerClassName={style.documentContainer}
          onValidCapture={this.handleCapture}
        />
      )
    }

    if (hasCamera && enableLiveDocumentCapture) {
      return (
        <DocumentLiveCapture
          {...propsWithErrorHandling}
          renderTitle={renderTitle}
          renderFallback={renderFallback}
          containerClassName={style.liveDocumentContainer}
          onCapture={this.handleCapture}
          isUploadFallbackDisabled={!uploadFallback}
        />
      )
    }

    // Different upload types show different icons
    // return the right icon name for document
    // For document, the upload can be 'identity' or 'proof_of_address'
    const uploadType = getDocumentTypeGroup(poaDocumentType || documentType)
    const instructions = translate(
      DOCUMENT_CAPTURE_LOCALES_MAPPING[isPoA ? poaDocumentType : documentType][
        side
      ].body
    )

    return (
      <Uploader
        {...propsWithErrorHandling}
        uploadType={uploadType}
        onUpload={this.handleUpload}
        title={title}
        instructions={instructions}
      />
    )
  }
}

export default compose(
  appendToTracking,
  localised,
  withCrossDeviceWhenNoCamera
)(Document)