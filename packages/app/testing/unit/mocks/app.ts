export const mockResizeObserver = () => {
	// @ts-ignore
	delete window.ResizeObserver
	window.ResizeObserver = jest.fn().mockImplementation(() => ({
		observe: jest.fn(),
		unobserve: jest.fn(),
		disconnect: jest.fn(),
	}))
}
