import { h } from 'preact'
import { mount, shallow } from 'enzyme'

import MockedLocalised from '~jest/MockedLocalised'
import MockedReduxProvider, {
  mockedReduxProps,
} from '~jest/MockedReduxProvider'
import Document from '../Document'
import withCaptureVariant from '../withCaptureVariant'

import type { StepComponentDocumentProps } from '~types/routers'

jest.mock('../withCrossDeviceWhenNoCamera')

const DocumentFrontCapture = withCaptureVariant(Document, { side: 'front' })
const DocumentBackCapture = withCaptureVariant(Document, { side: 'back' })
const DocumentVideoCapture = withCaptureVariant(Document, {
  requestedVariant: 'video',
})

const defaultProps: StepComponentDocumentProps = {
  allowCrossDeviceFlow: true,
  back: jest.fn(),
  changeFlowTo: jest.fn(),
  componentsList: [],
  nextStep: jest.fn(),
  previousStep: jest.fn(),
  resetSdkFocus: jest.fn(),
  step: 0,
  stepIndexType: 'user',
  trackScreen: jest.fn(),
  triggerOnError: jest.fn(),
  ...mockedReduxProps,
}

describe('Capture', () => {
  describe('DocumentFrontCapture', () => {
    it('renders without crashing', () => {
      const wrapper = shallow(<DocumentFrontCapture {...defaultProps} />)
      expect(wrapper.exists()).toBeTruthy()
    })

    describe('when mounted', () => {
      it('renders without crashing', () => {
        const wrapper = mount(
          <MockedReduxProvider>
            <MockedLocalised>
              <DocumentFrontCapture {...defaultProps} documentType="passport" />
            </MockedLocalised>
          </MockedReduxProvider>
        )

        expect(wrapper.exists()).toBeTruthy()
        expect(wrapper.find('Uploader').exists()).toBeTruthy()
        expect(wrapper.find('Uploader PageTitle .title').text()).toEqual(
          'doc_submit.title_passport'
        )
      })
    })
  })

  describe('DocumentBackCapture', () => {
    it('renders without crashing', () => {
      const wrapper = shallow(<DocumentBackCapture {...defaultProps} />)
      expect(wrapper.exists()).toBeTruthy()
    })

    describe('when mounted', () => {
      it('renders without crashing', () => {
        const wrapper = mount(
          <MockedReduxProvider>
            <MockedLocalised>
              <DocumentBackCapture
                {...defaultProps}
                documentType="driving_licence"
              />
            </MockedLocalised>
          </MockedReduxProvider>
        )

        expect(wrapper.exists()).toBeTruthy()
        expect(wrapper.find('Uploader').exists()).toBeTruthy()
        expect(wrapper.find('Uploader PageTitle .title').text()).toEqual(
          'doc_submit.title_license_back'
        )
      })
    })
  })

  describe('DocumentVideoCapture', () => {
    it('renders without crashing', () => {
      const wrapper = shallow(<DocumentVideoCapture {...defaultProps} />)
      expect(wrapper.exists()).toBeTruthy()
    })

    describe('when mounted', () => {
      it('renders without crashing', () => {
        const wrapper = mount(
          <MockedReduxProvider>
            <MockedLocalised>
              <DocumentVideoCapture {...defaultProps} documentType="passport" />
            </MockedLocalised>
          </MockedReduxProvider>
        )

        expect(wrapper.exists()).toBeTruthy()
        expect(wrapper.find('VideoCapture').exists()).toBeTruthy()
      })
    })
  })
})