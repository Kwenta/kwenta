import Wei, { wei } from '@synthetixio/wei';
import React, { useCallback, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import InfoBox from 'components/InfoBox';
import Loader from 'components/Loader';
import PreviewArrow from 'components/PreviewArrow';
import { useFuturesContext } from 'contexts/FuturesContext';
import { FuturesPotentialTradeDetails } from 'queries/futures/types';
import {
	crossMarginAvailableMarginState,
	crossMarginMarginDeltaState,
	marketInfoState,
	positionState,
	potentialTradeDetailsState,
	tradeSizeState,
} from 'store/futures';
import {
	formatCurrency,
	formatDollars,
	formatNumber,
	formatPercent,
	zeroBN,
} from 'utils/formatters/number';

import EditLeverageModal from './EditLeverageModal';

type Props = {
	editingLeverage?: boolean;
};

function MarginInfoBox({ editingLeverage }: Props) {
	const position = useRecoilValue(positionState);
	const marketInfo = useRecoilValue(marketInfoState);
	const { nativeSize } = useRecoilValue(tradeSizeState);
	const potentialTrade = useRecoilValue(potentialTradeDetailsState);
	const marginDelta = useRecoilValue(crossMarginMarginDeltaState);
	const crossMarginFreeMargin = useRecoilValue(crossMarginAvailableMarginState);
	const [openModal, setOpenModal] = useState<'leverage' | 'deposit' | null>(null);

	const { selectedLeverage } = useFuturesContext();

	const totalMargin = position?.remainingMargin.add(crossMarginFreeMargin) ?? zeroBN;
	const availableMargin = position?.accessibleMargin.add(crossMarginFreeMargin) ?? zeroBN;
	const currentSize = position?.position?.size ?? zeroBN;

	const marginUsage = availableMargin.gt(zeroBN)
		? totalMargin.sub(availableMargin).div(totalMargin)
		: zeroBN;

	const previewTotalMargin = useMemo(() => {
		const remainingMargin = crossMarginFreeMargin.sub(marginDelta);
		return remainingMargin.add(potentialTrade.data?.margin || zeroBN);
	}, [crossMarginFreeMargin, marginDelta, potentialTrade.data?.margin]);

	const getPotentialAvailableMargin = useCallback(
		(previewTrade: FuturesPotentialTradeDetails | null, marketMaxLeverage: Wei | undefined) => {
			let inaccessible;

			inaccessible = previewTrade?.notionalValue.div(marketMaxLeverage).abs() ?? zeroBN;

			// If the user has a position open, we'll enforce a min initial margin requirement.
			if (inaccessible.gt(0)) {
				if (inaccessible.lt(previewTrade?.minInitialMargin ?? zeroBN)) {
					inaccessible = previewTrade?.minInitialMargin ?? zeroBN;
				}
			}

			// check if available margin will be less than 0
			return previewTotalMargin.sub(inaccessible).gt(0)
				? previewTotalMargin.sub(inaccessible).abs()
				: zeroBN;
		},
		[previewTotalMargin]
	);

	const previewAvailableMargin = React.useMemo(() => {
		const potentialAvailableMargin = getPotentialAvailableMargin(
			potentialTrade.data,
			marketInfo?.maxLeverage
		);
		return potentialAvailableMargin;
	}, [potentialTrade.data, marketInfo?.maxLeverage, getPotentialAvailableMargin]);

	const potentialMarginUsage = useMemo(() => {
		if (!potentialTrade.data) return zeroBN;
		const notionalValue = potentialTrade.data.notionalValue || zeroBN;
		const maxSize = totalMargin.mul(potentialTrade.data.leverage);
		return notionalValue.div(maxSize);
	}, [potentialTrade.data, totalMargin]);

	const previewTradeData = React.useMemo(() => {
		const size = wei(nativeSize || zeroBN);

		return {
			showPreview: !size.eq(0) || !marginDelta.eq(0),
			totalMargin: potentialTrade.data?.margin || zeroBN,
			freeAccountMargin: crossMarginFreeMargin.sub(marginDelta),
			availableMargin: previewAvailableMargin.gt(0) ? previewAvailableMargin : zeroBN,
			size: potentialTrade.data?.size || zeroBN,
			leverage: potentialTrade.data?.margin.gt(0)
				? potentialTrade.data.notionalValue.div(potentialTrade.data.margin).abs()
				: zeroBN,
			marginUsage: potentialMarginUsage.gt(1) ? wei(1) : potentialMarginUsage,
		};
	}, [
		nativeSize,
		marginDelta,
		potentialTrade.data?.margin,
		previewAvailableMargin,
		potentialTrade.data?.notionalValue,
		potentialTrade.data?.size,
		crossMarginFreeMargin,
		potentialMarginUsage,
	]);

	const showPreview = previewTradeData.showPreview && !potentialTrade.data?.showStatus;

	return (
		<>
			<StyledInfoBox
				dataTestId="market-info-box"
				details={{
					'Free Account Margin': {
						value: formatDollars(crossMarginFreeMargin),
						valueNode: (
							<PreviewArrow showPreview={showPreview}>
								{potentialTrade.status === 'fetching' ? (
									<MiniLoader />
								) : (
									formatDollars(previewTradeData.freeAccountMargin)
								)}
							</PreviewArrow>
						),
					},
					'Market Margin': !editingLeverage
						? {
								value: formatDollars(position?.remainingMargin),
								valueNode: (
									<PreviewArrow showPreview={showPreview}>
										{potentialTrade.status === 'fetching' ? (
											<MiniLoader />
										) : (
											formatDollars(previewTradeData.totalMargin)
										)}
									</PreviewArrow>
								),
						  }
						: null,
					'Margin Usage': {
						value: formatPercent(marginUsage),
						valueNode: (
							<PreviewArrow showPreview={showPreview}>
								{potentialTrade.status === 'fetching' ? (
									<MiniLoader />
								) : (
									formatPercent(previewTradeData?.marginUsage)
								)}
							</PreviewArrow>
						),
					},
					Leverage: {
						value: (
							<>
								{formatNumber(selectedLeverage, { maxDecimals: 2 })}x
								{!editingLeverage && (
									<EditButton onClick={() => setOpenModal('leverage')}>Edit</EditButton>
								)}
							</>
						),
						valueNode: (
							<PreviewArrow showPreview={showPreview && !!editingLeverage}>
								{potentialTrade.status === 'fetching' ? (
									<MiniLoader />
								) : (
									formatNumber(previewTradeData.leverage || 0) + 'x'
								)}
							</PreviewArrow>
						),
					},
					'Position Size': editingLeverage
						? {
								value: formatCurrency(marketInfo?.asset || '', currentSize),
								valueNode: (
									<PreviewArrow showPreview={showPreview}>
										{potentialTrade.status === 'fetching' ? (
											<MiniLoader />
										) : (
											formatCurrency(marketInfo?.asset || '', previewTradeData.size)
										)}
									</PreviewArrow>
								),
						  }
						: null,
				}}
				disabled={marketInfo?.isSuspended}
			/>

			{openModal === 'leverage' && <EditLeverageModal onDismiss={() => setOpenModal(null)} />}
		</>
	);
}

const MiniLoader = () => {
	return <Loader inline height="11px" width="11px" style={{ marginLeft: '10px' }} />;
};

const StyledInfoBox = styled(InfoBox)`
	margin-bottom: 16px;

	.value {
		font-family: ${(props) => props.theme.fonts.regular};
	}
`;

const Button = styled.span`
	transition: all 0.1s ease-in-out;
	&:hover {
		opacity: 0.7;
	}
`;

const EditButton = styled(Button)`
	margin-left: 8px;
	cursor: pointer;
	color: ${(props) => props.theme.colors.selectedTheme.yellow};
`;

export default React.memo(MarginInfoBox);
