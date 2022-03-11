import React from 'react';
import styled from 'styled-components';
import Wei from '@synthetixio/wei';
import InfoBox from 'components/InfoBox';
import { formatCurrency, formatNumber, formatPercent } from 'utils/formatters/number';
import { Synths } from '@synthetixio/contracts-interface';

type MarketInfoBoxProps = {
	availableMargin: Wei;
	buyingPower: Wei;
	marginUsage: Wei;
	leverage: Wei;
	liquidationPrice: Wei;
};

const MarketInfoBox: React.FC<MarketInfoBoxProps> = ({
	availableMargin,
	buyingPower,
	marginUsage,
	leverage,
	liquidationPrice,
}) => {
	return (
		<StyledInfoBox
			details={{
				'Available Margin': `${formatCurrency(Synths.sUSD, availableMargin, { sign: '$' })}`,
				'Buying Power': `${formatCurrency(Synths.sUSD, buyingPower, { sign: '$' })}`,
				'Margin Usage': `${formatPercent(marginUsage)}`,
				Leverage: `${formatNumber(leverage)}x`,
				'Liquidation Price': `${formatCurrency(Synths.sUSD, liquidationPrice, { sign: '$' })}`,
			}}
		/>
	);
};

const StyledInfoBox = styled(InfoBox)`
	margin-bottom: 16px;
`;

export default MarketInfoBox;
