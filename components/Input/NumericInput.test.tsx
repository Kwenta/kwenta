import { render } from '@testing-library/react';
import ContextProvider from 'test-utils/ContextProvider';
import NumericInput from './NumericInput';
import userEvent from '@testing-library/user-event';

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
