import useSynthetixQueries from '@synthetixio/queries';
import { FC } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import Currency from 'components/Currency';
import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import { Synths } from 'constants/currency';
import useGetCurrentPortfolioValue from 'queries/futures/useGetCurrentPortfolioValue';
import { walletAddressState } from 'store/wallet';
import { zeroBN } from 'utils/formatters/number';

const PortfolioChart: FC = () => {
	const portfolioValueQuery = useGetCurrentPortfolioValue();
	const portfolioValue = portfolioValueQuery?.data ?? null;

	const walletAddress = useRecoilValue(walletAddressState);
	const { useSynthsBalancesQuery } = useSynthetixQueries();
	const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);
	const synthBalances = synthsBalancesQuery.data ?? null;

	const total = (portfolioValue ?? zeroBN).add(synthBalances?.totalUSDBalance ?? zeroBN);

	return (
		<>
			<MobileHiddenView>
				<Chart>
					<PortfolioTitle>Portfolio Value</PortfolioTitle>
					<PortfolioText currencyKey={Synths.sUSD} price={total} sign="$" />
				</Chart>
			</MobileHiddenView>
			<MobileOnlyView>
				<PortfolioText currencyKey={Synths.sUSD} price={total} sign="$" />
				<MobileChartPlaceholder />
			</MobileOnlyView>
		</>
	);
};

const Chart = styled.div`
	width: 100%;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;
	height: 200px;
`;

const PortfolioTitle = styled.p`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 16px;
	margin-top: 26px;
	margin-left: 26px;
	margin-bottom: 10px;
`;
const PortfolioText = styled(Currency.Price)`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	font-family: ${(props) => props.theme.fonts.monoBold};
	letter-spacing: -1.2px;
	font-size: 27px;
	margin-left: 26px;
	margin-top: 0;
	margin-bottom: 26px;

	span {
		line-height: 27px;
	}
`;

const MobileChartPlaceholder = styled.div`
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
`;

export default PortfolioChart;
