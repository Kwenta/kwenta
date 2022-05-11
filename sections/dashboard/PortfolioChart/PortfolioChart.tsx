import { FC } from 'react';
import styled from 'styled-components';
import { Synths } from 'constants/currency';
import Currency from 'components/Currency';
import { zeroBN } from 'utils/formatters/number';
import Wei from '@synthetixio/wei';

type PortfolioChartProps = {
	totalFuturesPortfolioValue: Wei;
	totalSpotBalanceValue: Wei;
	totalShortsValue: Wei;
};

const PortfolioChart: FC<PortfolioChartProps> = (props: PortfolioChartProps) => {
	const { totalFuturesPortfolioValue, totalSpotBalanceValue, totalShortsValue } = props;
	const total = totalFuturesPortfolioValue.add(totalSpotBalanceValue).add(totalShortsValue);
	return (
		<Chart>
			<PortfolioTitle>Portfolio Value</PortfolioTitle>
			<PortfolioText
				currencyKey={Synths.sUSD}
				price={total ?? zeroBN}
				sign={'$'}
				conversionRate={1}
			/>
		</Chart>
	);
};

const Chart = styled.div`
	width: 100%;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;
	height: 200px;
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
