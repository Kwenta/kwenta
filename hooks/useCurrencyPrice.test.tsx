import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import { renderHook } from '@testing-library/react-hooks';
import { wait } from '@testing-library/user-event/dist/utils';

import { SynthetixProvider } from 'testing/unit/mocks/MockProviders';

import useCurrencyPrice from './useCurrencyPrice';

jest.mock('@synthetixio/queries');
const useSynthetixQueriesMock = useSynthetixQueries as jest.MockedFunction<
	typeof useSynthetixQueries
>;

describe('useCurrencyPrice', () => {
	test('happy path', async () => {
		useSynthetixQueriesMock.mockReturnValue({
			useExchangeRatesQuery: jest.fn().mockReturnValue({
				isSuccess: true,
				data: {
					sBTC: wei(60000),
					sUSD: wei(1),
				},
			}),
		} as any);
		expect(1).toBe(1);

		const { result } = renderHook(() => useCurrencyPrice('sBTC'), { wrapper: SynthetixProvider });
		expect(result.current.toString(0)).toBe('60000');
	});
});
