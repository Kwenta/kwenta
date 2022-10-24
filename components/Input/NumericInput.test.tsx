import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ContextProvider from 'testing/unit/__mocks__/MockProviders';

import NumericInput from './NumericInput';

describe('NumericInput', () => {
	test('happy path', () => {
		const onChangeMock = jest.fn();

		const result = render(
			<ContextProvider>
				<NumericInput value={''} onChange={onChangeMock} placeholder={'MyNumericInput'} />
			</ContextProvider>
		);
		const input = result.getByPlaceholderText('MyNumericInput');
		expect(input).toBeInTheDocument();
		expect(input).toHaveValue(null);
		userEvent.type(input, '1');
		expect(onChangeMock).toBeCalledWith(expect.any(Object), '1');
	});
	test('ignores non number', () => {
		const onChangeMock = jest.fn();

		const result = render(
			<ContextProvider>
				<NumericInput value={''} onChange={onChangeMock} placeholder={'MyNumericInput'} />
			</ContextProvider>
		);
		const input = result.getByPlaceholderText('MyNumericInput');
		expect(input).toBeInTheDocument();
		expect(input).toHaveValue(null);
		userEvent.type(input, 'abc');
		expect(onChangeMock).not.toBeCalled();
	});
});
