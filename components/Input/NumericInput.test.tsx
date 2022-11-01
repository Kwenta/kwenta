import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { wait } from '@testing-library/user-event/dist/utils';

import ContextProvider from 'testing/unit/mocks/MockProviders';

import NumericInput from './NumericInput';

describe('NumericInput', () => {
	test('happy path', async () => {
		const onChangeMock = jest.fn();

		const result = render(
			<ContextProvider>
				<NumericInput value={''} onChange={onChangeMock} placeholder={'MyNumericInput'} />
			</ContextProvider>
		);
		await wait(1000);

		const input = result.getByPlaceholderText('MyNumericInput');
		expect(input).toBeInTheDocument();
		expect(input).toHaveValue(null);
		userEvent.type(input, '1');
		expect(onChangeMock).toBeCalledWith(expect.any(Object), '1');
	});
	test('ignores non number', async () => {
		const onChangeMock = jest.fn();

		const result = render(
			<ContextProvider>
				<NumericInput value={''} onChange={onChangeMock} placeholder={'MyNumericInput'} />
			</ContextProvider>
		);
		await wait(1000);
		const input = result.getByPlaceholderText('MyNumericInput');
		expect(input).toBeInTheDocument();
		expect(input).toHaveValue(null);
		userEvent.type(input, 'abc');
		expect(onChangeMock).not.toBeCalled();
	});
});
