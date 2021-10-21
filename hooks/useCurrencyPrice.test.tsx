import { renderHook } from '@testing-library/react-hooks';
import useSynthetixQueries from '@synthetixio/queries';
import useCurrencyPrice from './useCurrencyPrice';
import { wei } from '@synthetixio/wei';
import ContextProvider from 'test-utils/ContextProvider';

jest.mock('@synthetixio/queries');
const useSynthetixQueriesMock = useSynthetixQueries as jest.MockedFunction<
	typeof useSynthetixQueries
>;

describe('useCurrencyPrice', () => {
	test('happy path', () => {
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

		const { result } = renderHook(() => useCurrencyPrice('sBTC'), { wrapper: ContextProvider });
		expect(result.current.toString(0)).toBe('60000');
	});
});
