import React from 'react';
import styled from 'styled-components';
import InfoBox from 'components/InfoBox';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';
import { Synths } from '@synthetixio/contracts-interface';
import { useRecoilValue } from 'recoil';
import { maxLeverageState, positionState } from 'store/futures';

type MarketInfoBoxProps = {
	isMarketClosed: boolean;
};

const MarketInfoBox: React.FC<MarketInfoBoxProps> = ({ isMarketClosed }) => {
	const maxLeverage = useRecoilValue(maxLeverageState);
	const position = useRecoilValue(positionState);
	const details = React.useMemo(
		() => ({
			totalMargin: position?.remainingMargin ?? zeroBN,
			availableMargin: position?.accessibleMargin ?? zeroBN,
			buyingPower: position?.remainingMargin.gt(zeroBN)
				? position?.remainingMargin?.mul(maxLeverage ?? zeroBN)
				: zeroBN,
			marginUsage: position?.remainingMargin.gt(zeroBN)
				? position?.remainingMargin?.sub(position?.accessibleMargin).div(position?.remainingMargin)
				: zeroBN,
		}),
		[position, maxLeverage]
	);

	return (
		<StyledInfoBox
			details={{
				'Total Margin': {
					value: `${formatCurrency(Synths.sUSD, details.totalMargin, {
						currencyKey: Synths.sUSD,
					})}`,
				},
				'Available Margin': {
					value: `${formatCurrency(Synths.sUSD, details.availableMargin, {
						currencyKey: Synths.sUSD,
					})}`,
				},
				'Buying Power': {
					value: `${formatCurrency(Synths.sUSD, details.buyingPower, { sign: '$' })}`,
				},
				'Margin Usage': { value: `${formatPercent(details.marginUsage)}` },
			}}
			disabled={isMarketClosed}
		/>
	);
};

const StyledInfoBox = styled(InfoBox)`
	margin-bottom: 16px;
`;

export default MarketInfoBox;
