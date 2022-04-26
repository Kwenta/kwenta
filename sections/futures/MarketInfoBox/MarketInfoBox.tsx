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
				'Total Margin': `${formatCurrency(Synths.sUSD, totalMargin, { currencyKey: Synths.sUSD })}`,
				'Available Margin': `${formatCurrency(Synths.sUSD, availableMargin, {
					currencyKey: Synths.sUSD,
				})}`,
				'Buying Power': `${formatCurrency(Synths.sUSD, buyingPower, { sign: '$' })}`,
				'Margin Usage': `${formatPercent(marginUsage)}`,
			}}
			isMarketClosed={isMarketClosed}
		/>
	);
};

const StyledInfoBox = styled(InfoBox)`
	margin-bottom: 16px;
`;

export default MarketInfoBox;
