import React from 'react';
import styled from 'styled-components';
import Wei from '@synthetixio/wei';
import InfoBox from 'components/InfoBox';
import { formatCurrency, formatPercent } from 'utils/formatters/number';
import { Synths } from '@synthetixio/contracts-interface';

type MarketInfoBoxProps = {
	totalMargin: Wei;
	availableMargin: Wei;
	buyingPower: Wei;
	marginUsage: Wei;
	isMarketClosed: boolean;
};

const MarketInfoBox: React.FC<MarketInfoBoxProps> = ({
	totalMargin,
	availableMargin,
	buyingPower,
	marginUsage,
	isMarketClosed,
}) => {
	return (
		<StyledInfoBox
			details={{
				'Total Margin': {
					value: `${formatCurrency(Synths.sUSD, totalMargin, { currencyKey: Synths.sUSD })}`,
				},
				'Available Margin': {
					value: `${formatCurrency(Synths.sUSD, availableMargin, {
						currencyKey: Synths.sUSD,
					})}`,
				},
				'Buying Power': { value: `${formatCurrency(Synths.sUSD, buyingPower, { sign: '$' })}` },
				'Margin Usage': { value: `${formatPercent(marginUsage)}` },
			}}
			disabled={isMarketClosed}
		/>
	);
};

const StyledInfoBox = styled(InfoBox)`
	margin-bottom: 16px;
`;

export default MarketInfoBox;
