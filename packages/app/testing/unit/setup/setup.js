import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
jest.mock('src/components/Slider/ValueLabel')
jest.setTimeout(30000)
