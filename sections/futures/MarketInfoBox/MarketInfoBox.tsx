import React from 'react';
import styled from 'styled-components';
import Wei from '@synthetixio/wei';
import InfoBox from 'components/InfoBox';
import { formatCurrency } from 'utils/formatters/number';
import { Synths } from '@synthetixio/contracts-interface';

type MarketInfoBoxProps = {
	availableMargin: Wei;
	buyingPower: Wei;
};

const MarketInfoBox: React.FC<MarketInfoBoxProps> = ({ availableMargin, buyingPower }) => {
	return (
		<StyledInfoBox
			details={{
				'Available Margin': `${formatCurrency(Synths.sUSD, availableMargin, { sign: '$' })}`,
				'Buying Power': `${formatCurrency(Synths.sUSD, buyingPower, { sign: '$' })}`,
				'Margin Usage': '10%',
				Leverage: '4x',
				'Liquidation Price': '$3,718.33',
			}}
		/>
	);
};

const StyledInfoBox = styled(InfoBox)`
	margin-bottom: 16px;
`;

export default MarketInfoBox;
