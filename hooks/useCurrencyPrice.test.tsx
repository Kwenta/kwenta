import { FC } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { RecoilRoot } from 'recoil';

import useSynthetixQueries from '@synthetixio/queries';
import useCurrencyPrice from './useCurrencyPrice';
import { wei } from '@synthetixio/wei';

jest.mock('@synthetixio/queries');
const useSynthetixQueriesMock = useSynthetixQueries as jest.MockedFunction<
	typeof useSynthetixQueries
>;
const wrapper: FC = ({ children }) => <RecoilRoot>{children}</RecoilRoot>;

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

		const { result } = renderHook(() => useCurrencyPrice('sBTC'), { wrapper });
		expect(result.current.toString(0)).toBe('60000');
	});
});
