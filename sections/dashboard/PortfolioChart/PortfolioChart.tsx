import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import useGetCurrentPortfolioValue from 'queries/futures/useGetCurrentPortfolioValue';
import { FuturesMarket } from 'queries/futures/types';
import { Synths } from 'constants/currency';
import Currency from 'components/Currency';

type PortfolioChartProps = {
	futuresMarkets: FuturesMarket[]
};

const PortfolioChart: FC<PortfolioChartProps> = ({ futuresMarkets }: PortfolioChartProps) => {
	const { t } = useTranslation();

	const markets = futuresMarkets.map((market: FuturesMarket) => {return market.asset})
	const portfolioValueQuery = useGetCurrentPortfolioValue(markets);
	const portfolioValue = portfolioValueQuery?.data ?? undefined;

	return (
		<Chart>
			<PortfolioTitle>Portfolio Value: </PortfolioTitle>
			{!!portfolioValue && <PortfolioText
				currencyKey={Synths.sUSD}
				price={portfolioValue}
				sign={'$'}
				conversionRate={1}
			/>}
		</Chart>
	);
};

const Chart = styled.div`
	min-width: 915px;
	min-height: 259px;
	border: 1px solid #353333;
	border-radius: 16px;
`

const PortfolioTitle = styled.span`
`
const PortfolioText = styled(Currency.Price)`
`


export default PortfolioChart;
