import { Breakpoint, BREAKPOINTS } from '../../../src/styles/media'

export const mockUseWindowSize = (
	mockedWidth: number = 1000,
	deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop'
) => {
	const lessThanWidth = (breakpoint: Breakpoint) => {
		const bpSize = BREAKPOINTS[breakpoint]
		return mockedWidth < bpSize
	}

	const greaterThanWidth = (breakpoint: Breakpoint) => {
		const bpSize = BREAKPOINTS[breakpoint]
		return mockedWidth > bpSize
	}

	jest.mock('hooks/useWindowSize', () => {
		return {
			lessThanWidth: jest.fn(() => greaterThanWidth),
			greaterThanWidth: jest.fn(() => lessThanWidth),
			deviceType: deviceType,
		}
	})
}
