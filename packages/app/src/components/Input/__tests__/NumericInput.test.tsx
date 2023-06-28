import { fireEvent, render } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'

import { themes } from 'styles/theme'

import NumericInput from '../NumericInput'

const wait = (ms: number) => {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

describe('NumericInput', () => {
	test('happy path', async () => {
		const onChangeMock = jest.fn()

		const result = render(
			<ThemeProvider theme={themes.dark}>
				<NumericInput value={''} onChange={onChangeMock} placeholder={'MyNumericInput'} />
			</ThemeProvider>
		)
		await wait(1000)

		const input = result.getByPlaceholderText('MyNumericInput')
		expect(input).toBeInTheDocument()
		expect(input).toHaveValue('')
		fireEvent.change(input, { target: { value: '1' } })
		expect(onChangeMock).toBeCalledWith(expect.any(Object), '1')
	})
	test('ignores non number', async () => {
		const onChangeMock = jest.fn()

		const result = render(
			<ThemeProvider theme={themes.dark}>
				<NumericInput value={''} onChange={onChangeMock} placeholder={'MyNumericInput'} />
			</ThemeProvider>
		)
		await wait(1000)
		const input = result.getByPlaceholderText('MyNumericInput')
		expect(input).toBeInTheDocument()
		expect(input).toHaveValue('')
		fireEvent.change(input, { target: { value: 'abc' } })
		expect(onChangeMock).toBeCalledWith(expect.any(Object), '')
	})
})
