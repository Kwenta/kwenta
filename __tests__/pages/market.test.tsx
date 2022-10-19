import { render, waitFor } from '@testing-library/react';

import mockConnector from 'testing/unit/__mocks__/mockConnector';
import MockProviders from 'testing/unit/__mocks__/MockProviders';
import { mockGrapqhlRequest, mockReactQuery } from 'testing/unit/__mocks__/mockQueries';
import { TEST_ADDR } from 'testing/unit/constants';

import Market from '../../pages/market';

describe('Futures market page - cross margin', () => {
	beforeAll(() => {
		// TODO: remove this when we return to writing tests
		jest.spyOn(console, 'error').mockImplementation(() => {});
		mockReactQuery();
	});
	test('Displays cross margin not available when unsupported network', async () => {
		mockGrapqhlRequest({ crossMarginAccounts: [] });
		mockConnector({ network: { id: 1, name: 'ethereum' } });

		const { findAllByTestId } = render(
			<MockProviders>
				<Market />
			</MockProviders>
		);

		const components = await findAllByTestId('cross-margin-unsupported-network');
		// Mobile and Desktop both get rendered
		expect(components.length).toEqual(2);
	});
	test('Displays cross margin onboard prompt when no cross margin account', async () => {
		mockGrapqhlRequest({ crossMarginAccounts: [] });
		mockConnector();

		const { findAllByTestId } = render(
			<MockProviders>
				<Market />
			</MockProviders>
		);

		const components = await findAllByTestId('cross-margin-create-account');
		// Mobile and Desktop both get rendered
		expect(components.length).toEqual(2);
	});
	test('Trade panel input is disabled when wallet not connected', async () => {
		mockGrapqhlRequest({ crossMarginAccounts: [{ id: TEST_ADDR }] });
		mockConnector();

		const { findByTestId } = render(
			<MockProviders>
				<Market />
			</MockProviders>
		);

		await waitFor(async () => {
			const component = await findByTestId('set-order-size-amount-susd-desktop');
			expect(component.hasAttribute('disabled'));
		});
	});
});
