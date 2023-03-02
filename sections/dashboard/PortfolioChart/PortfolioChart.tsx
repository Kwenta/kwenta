import Wei from '@synthetixio/wei';
import { FC, useMemo } from 'react';
import styled from 'styled-components';

import Currency from 'components/Currency';
import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import * as Text from 'components/Text';
import { selectBalances } from 'state/balances/selectors';
import { selectFuturesPortfolio } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';

type PortfolioChartProps = {
	exchangeTokenBalances: Wei;
};

const PortfolioChart: FC<PortfolioChartProps> = ({ exchangeTokenBalances }) => {
	const portfolio = useAppSelector(selectFuturesPortfolio);
	const balances = useAppSelector(selectBalances);

	// TODO: Add back cross margin when relevant
	const total = useMemo(
		() => portfolio.isolatedMarginFutures.add(balances.totalUSDBalance).add(exchangeTokenBalances),
		[portfolio.isolatedMarginFutures, balances.totalUSDBalance, exchangeTokenBalances]
	);

	return (
		<>
			<MobileHiddenView>
				<Chart>
					<PortfolioTitle>Portfolio Value</PortfolioTitle>
					<PortfolioText currencyKey="sUSD" price={total} sign="$" />
				</Chart>
			</MobileHiddenView>
			<MobileOnlyView>
				<PortfolioText currencyKey="sUSD" price={total} sign="$" />
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

const PortfolioTitle = styled(Text.Body).attrs({ weight: 'bold' })`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-size: 16px;
	margin: 26px 0 10px 26px;
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
