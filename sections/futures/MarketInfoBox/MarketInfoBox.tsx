import React, { memo } from 'react';
import styled from 'styled-components';

import { InfoBoxContainer, InfoBoxRow } from 'components/InfoBox';
import PreviewArrow from 'components/PreviewArrow';
import {
	selectAvailableMargin,
	selectBuyingPower,
	selectMarginUsage,
	selectMarketSuspended,
	selectPreviewTradeData,
	selectTradePreview,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { formatDollars, formatPercent } from 'utils/formatters/number';

const AvailableMarginRow = memo(() => {
	const availableMargin = useAppSelector(selectAvailableMargin);
	const potentialTrade = useAppSelector(selectTradePreview);
	const previewTradeData = useAppSelector(selectPreviewTradeData);
	const marketSuspended = useAppSelector(selectMarketSuspended);

	return (
		<InfoBoxRow
			title="Available Margin"
			dataTestId=""
			value={formatDollars(availableMargin, { currencyKey: undefined })}
			valueNode={
				<PreviewArrow showPreview={previewTradeData.showPreview && !potentialTrade?.showStatus}>
					{formatDollars(previewTradeData?.availableMargin)}
				</PreviewArrow>
			}
			disabled={marketSuspended}
		/>
	);
});

const BuyingPowerRow = memo(() => {
	const potentialTrade = useAppSelector(selectTradePreview);
	const previewTradeData = useAppSelector(selectPreviewTradeData);
	const buyingPower = useAppSelector(selectBuyingPower);
	const marketSuspended = useAppSelector(selectMarketSuspended);

	return (
		<InfoBoxRow
			title="Buying Power"
			value={formatDollars(buyingPower, { currencyKey: undefined })}
			valueNode={
				previewTradeData?.buyingPower && (
					<PreviewArrow showPreview={previewTradeData.showPreview && !potentialTrade?.showStatus}>
						{formatDollars(previewTradeData?.buyingPower)}
					</PreviewArrow>
				)
			}
			dataTestId=""
			disabled={marketSuspended}
		/>
	);
});

const MarginUsageRow = memo(() => {
	const previewTradeData = useAppSelector(selectPreviewTradeData);
	const potentialTrade = useAppSelector(selectTradePreview);
	const marginUsage = useAppSelector(selectMarginUsage);
	const marketSuspended = useAppSelector(selectMarketSuspended);

	return (
		<InfoBoxRow
			title="Margin Usage"
			value={formatPercent(marginUsage)}
			valueNode={
				<PreviewArrow showPreview={previewTradeData.showPreview && !potentialTrade?.showStatus}>
					{formatPercent(previewTradeData?.marginUsage)}
				</PreviewArrow>
			}
			dataTestId=""
			disabled={marketSuspended}
		/>
	);
});

const MarketInfoBox: React.FC = memo(() => {
	return (
		<MarketInfoBoxContainer>
			<AvailableMarginRow />
			<BuyingPowerRow />
			<MarginUsageRow />
		</MarketInfoBoxContainer>
	);
});

const MarketInfoBoxContainer = styled(InfoBoxContainer)`
	margin-bottom: 16px;

	.value {
		font-family: ${(props) => props.theme.fonts.regular};
	}
`;

export default MarketInfoBox;
