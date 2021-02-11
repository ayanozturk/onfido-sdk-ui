import { h, FunctionComponent, Ref } from 'preact'
import { mount, shallow, ReactWrapper } from 'enzyme'
import Webcam from 'react-webcam-onfido'

import MockedLocalised from '~jest/MockedLocalised'
import MockedReduxProvider from '~jest/MockedReduxProvider'
import Camera from '../../Camera'
import VideoCapture, {
  VideoLayerProps,
  Props as VideoCaptureProps,
} from '../index'

import type { CameraProps } from '~types/camera'
import type { CaptureMethods } from '~types/commons'

jest.mock('../../utils')

const assertTimeout = (wrapper: ReactWrapper, seconds: number) => {
  const timeout = wrapper.find('Timeout')
  expect(timeout.exists()).toBeTruthy()
  expect(timeout.prop('seconds')).toEqual(seconds)
}

const assertInactiveError = (
  wrapper: ReactWrapper,
  method: CaptureMethods,
  forceRedo: boolean
) => {
  expect(wrapper.find('#record-video').text()).toEqual('Start')
  expect(wrapper.find('Timeout').exists()).toBeFalsy()

  const error = wrapper.find('CameraError Error')
  expect(error.exists()).toBeTruthy()

  if (!forceRedo) {
    expect(error.find('.title').text()).toEqual(
      'selfie_capture.alert.camera_inactive.title'
    )

    return
  }

  expect(wrapper.find('#record-video').prop('disabled')).toBeTruthy()

  if (method === 'document') {
    expect(wrapper.find('FallbackButton').text()).toEqual(
      'doc_video_capture.alert.timeout.detail'
    )
  } else {
    expect(wrapper.find('FallbackButton').text()).toEqual(
      'selfie_capture.alert.timeout.detail'
    )
  }
}

const MockedVideoLayer: FunctionComponent<VideoLayerProps> = ({
  disableInteraction,
  isRecording,
  onStart,
  onStop,
}) => (
  <button
    id="record-video"
    disabled={disableInteraction}
    onClick={isRecording ? onStop : onStart}
  >
    {isRecording ? 'Stop' : 'Start'}
  </button>
)

const defaultProps: VideoCaptureProps = {
  inactiveError: { name: 'CAMERA_INACTIVE' },
  method: 'face',
  onRecordingStart: jest.fn(),
  onRedo: jest.fn(),
  onVideoCapture: jest.fn(),
  renderFallback: jest.fn(),
  renderVideoLayer: MockedVideoLayer,
  trackScreen: jest.fn(),
}

describe('VideoCapture', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    const wrapper = shallow(<VideoCapture {...defaultProps} />)
    expect(wrapper.exists()).toBeTruthy()
  })

  describe('when mounted', () => {
    let wrapper: ReactWrapper
    let camera: ReactWrapper<CameraProps>

    beforeEach(() => {
      wrapper = mount(
        <MockedReduxProvider>
          <MockedLocalised>
            <VideoCapture {...defaultProps} title="Fake title" />
          </MockedLocalised>
        </MockedReduxProvider>
      )

      camera = wrapper.find<CameraProps>(Camera)
    })

    it('renders Camera correctly', () => {
      expect(wrapper.exists()).toBeTruthy()
      expect(camera.exists()).toBeTruthy()

      const {
        buttonType,
        isButtonDisabled,
        renderError,
        renderFallback,
      } = camera.props()
      expect(buttonType).toEqual('video')
      expect(isButtonDisabled).toBeFalsy()
      expect(renderError).toBeFalsy()

      renderFallback('fake_fallback_reason')
      expect(defaultProps.renderFallback).toHaveBeenCalledWith(
        'fake_fallback_reason'
      )

      expect(wrapper.find('PageTitle').exists()).toBeTruthy()
      expect(wrapper.find('PageTitle').text()).toEqual('Fake title')
    })

    it('renders inactive timeout correctly', () => assertTimeout(wrapper, 12))

    describe('when inactive timed out', () => {
      beforeEach(() => {
        jest.runTimersToTime(12_000) // 12 seconds - default value
        wrapper.update()
      })

      it('shows inactive error correctly', () =>
        assertInactiveError(wrapper, defaultProps.method, false))
    })

    describe('when recording', () => {
      beforeEach(() => {
        wrapper.find('#record-video').simulate('click')
      })

      it('starts video recording and hides title', () => {
        expect(wrapper.find('#record-video').text()).toEqual('Stop')
        expect(defaultProps.onRecordingStart).toHaveBeenCalled()
        expect(wrapper.find('PageTitle').exists()).toBeFalsy()
      })

      it('renders inactive timeout correctly', () => assertTimeout(wrapper, 20))

      it('stops video recording with capture payload', () => {
        wrapper.find('#record-video').simulate('click')
        expect(wrapper.find('#record-video').text()).toEqual('Start')

        expect(defaultProps.onVideoCapture).toHaveBeenCalledWith({
          blob: new Blob(),
          sdkMetadata: {
            camera_name: 'fake-video-track',
            captureMethod: 'live',
            microphone_name: 'fake-audio-track',
          },
        })
      })

      describe('when inactive timed out', () => {
        beforeEach(() => {
          jest.runTimersToTime(20_000) // 20 seconds - default value
          wrapper.update()
        })

        it('shows inactive error correctly', () =>
          assertInactiveError(wrapper, defaultProps.method, true))
      })
    })

    describe('for documents', () => {
      beforeEach(() => {
        wrapper = mount(
          <MockedReduxProvider>
            <MockedLocalised>
              <VideoCapture {...defaultProps} method="document" />
            </MockedLocalised>
          </MockedReduxProvider>
        )

        wrapper.find('#record-video').simulate('click')
      })

      it('renders inactive timeout correctly', () => assertTimeout(wrapper, 30))

      describe('when inactive timed out', () => {
        beforeEach(() => {
          jest.runTimersToTime(30_000) // 30 seconds - for documents
          wrapper.update()
        })

        it('shows inactive error correctly', () =>
          assertInactiveError(wrapper, 'document', true))
      })
    })

    describe('with webcamRef passed', () => {
      it('triggers callback function correctly', () => {
        const mockedWebcamRef = jest.fn()

        wrapper = mount(
          <MockedReduxProvider>
            <MockedLocalised>
              <VideoCapture {...defaultProps} webcamRef={mockedWebcamRef} />
            </MockedLocalised>
          </MockedReduxProvider>
        )

        expect(mockedWebcamRef).toHaveBeenCalled()
      })

      it('assign ref object correctly', () => {
        const mockedWebcamRef: Ref<Webcam> = {}

        wrapper = mount(
          <MockedReduxProvider>
            <MockedLocalised>
              <VideoCapture {...defaultProps} webcamRef={mockedWebcamRef} />
            </MockedLocalised>
          </MockedReduxProvider>
        )

        expect(mockedWebcamRef.current).toBeDefined()
      })
    })
  })
})
