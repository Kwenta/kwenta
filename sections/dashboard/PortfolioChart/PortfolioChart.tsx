import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import useGetCurrentPortfolioValue from 'queries/futures/useGetCurrentPortfolioValue';
import { FuturesMarket } from 'queries/futures/types';
import { Synths } from 'constants/currency';
import Currency from 'components/Currency';
import { zeroBN } from 'utils/formatters/number';

type PortfolioChartProps = {
	futuresMarkets: FuturesMarket[];
};

const PortfolioChart: FC<PortfolioChartProps> = ({ futuresMarkets }: PortfolioChartProps) => {
	const { t } = useTranslation();

	const markets = futuresMarkets.map((market: FuturesMarket) => {
		return market.asset;
	});
	const portfolioValueQuery = useGetCurrentPortfolioValue(markets);
	const portfolioValue = portfolioValueQuery?.data ?? null;

	return (
		<Chart>
			<PortfolioTitle>Futures Portfolio Value</PortfolioTitle>
			<PortfolioText
				currencyKey={Synths.sUSD}
				price={portfolioValue ?? zeroBN}
				sign={'$'}
				conversionRate={1}
			/>
		</Chart>
	);
};

const Chart = styled.div`
	min-width: 915px;
	border: 1px solid #353333;
	border-radius: 16px;
	height: 200px ;
`;

const PortfolioTitle = styled.p`
	color: ${(props) => props.theme.colors.common.secondaryGray};
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 16px;
	font-weight: bold;
	margin-top: 26px;
	margin-left: 26px;
	margin-bottom: 10px;
`;
const PortfolioText = styled(Currency.Price)`
	color: ${(props) => props.theme.colors.common.primaryWhite};
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 27px;
	font-weight: bold;
	margin-left: 26px;
	margin-top: 0;
	margin-bottom: 26px;

	span {
		line-height: 27px;
	}
`;

export default PortfolioChart;
