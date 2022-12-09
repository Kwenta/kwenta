import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import TimerIcon from 'assets/svg/app/timer.svg';
import InfoBox, { DetailedInfo } from 'components/InfoBox/InfoBox';
import StyledTooltip from 'components/Tooltip/StyledTooltip';
import { NO_VALUE } from 'constants/placeholder';
import { selectMarketInfo } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import {
	tradeFeesState,
	orderTypeState,
	sizeDeltaState,
	futuresAccountTypeState,
	crossMarginSettingsState,
	dynamicFeeRateState,
} from 'store/futures';
import { computeNPFee, computeMarketFee } from 'utils/costCalculations';
import { formatCurrency, formatDollars, formatPercent, zeroBN } from 'utils/formatters/number';

const FeeInfoBox: React.FC = () => {
	const orderType = useRecoilValue(orderTypeState);
	const fees = useRecoilValue(tradeFeesState);
	const dynamicFeeRate = useRecoilValue(dynamicFeeRateState);
	const sizeDelta = useRecoilValue(sizeDeltaState);
	const accountType = useRecoilValue(futuresAccountTypeState);
	const { tradeFee: crossMarginTradeFee, limitOrderFee, stopOrderFee } = useRecoilValue(
		crossMarginSettingsState
	);
	const marketInfo = useAppSelector(selectMarketInfo);

	const { commitDeposit, nextPriceFee } = useMemo(() => computeNPFee(marketInfo, sizeDelta), [
		marketInfo,
		sizeDelta,
	]);

	const totalDeposit = useMemo(() => {
		return (commitDeposit ?? zeroBN).add(marketInfo?.keeperDeposit ?? zeroBN);
	}, [commitDeposit, marketInfo?.keeperDeposit]);

	const nextPriceDiscount = useMemo(() => {
		return (nextPriceFee ?? zeroBN).sub(commitDeposit ?? zeroBN);
	}, [commitDeposit, nextPriceFee]);

	const staticRate = useMemo(() => computeMarketFee(marketInfo, sizeDelta), [
		marketInfo,
		sizeDelta,
	]);

	const orderFeeRate = useMemo(
		() =>
			orderType === 'limit' ? limitOrderFee : orderType === 'stop market' ? stopOrderFee : null,
		[orderType, stopOrderFee, limitOrderFee]
	);

	const marketCostTooltip = useMemo(
		() => (
			<>
				{formatPercent(staticRate ?? zeroBN)}
				{dynamicFeeRate?.gt(0) && (
					<>
						{' + '}
						<ToolTip>
							<StyledDynamicFee>{formatPercent(dynamicFeeRate)}</StyledDynamicFee>
						</ToolTip>
					</>
				)}
			</>
		),
		[staticRate, dynamicFeeRate]
	);

	const feesInfo = useMemo<Record<string, DetailedInfo | null | undefined>>(() => {
		const crossMarginFeeInfo = {
			'Protocol Fee': {
				value: formatDollars(fees.staticFee, {
					minDecimals: fees.staticFee.lt(0.01) ? 4 : 2,
				}),
				keyNode: marketCostTooltip,
			},
			'Limit / Stop Fee':
				fees.limitStopOrderFee.gt(0) && orderFeeRate
					? {
							value: formatDollars(fees.limitStopOrderFee, {
								minDecimals: fees.limitStopOrderFee.lt(0.01) ? 4 : 2,
							}),
							keyNode: formatPercent(orderFeeRate),
					  }
					: null,
			'Cross Margin Fee': {
				value: formatDollars(fees.crossMarginFee, {
					minDecimals: fees.crossMarginFee.lt(0.01) ? 4 : 2,
				}),
				spaceBeneath: true,
				keyNode: formatPercent(crossMarginTradeFee),
			},

			'Total Fee': {
				value: formatDollars(fees.total, {
					minDecimals: fees.total.lt(0.01) ? 4 : 2,
				}),
			},
		};
		if (orderType === 'limit' || orderType === 'stop market') {
			return {
				...crossMarginFeeInfo,
				'Keeper Deposit': {
					value: !!marketInfo?.keeperDeposit
						? formatCurrency('ETH', fees.keeperEthDeposit, { currencyKey: 'ETH' })
						: NO_VALUE,
				},
			};
		}
		return accountType === 'isolated_margin'
			? {
					Fee: {
						value: formatDollars(fees.total, {
							minDecimals: fees.total.lt(0.01) ? 4 : 2,
						}),
						keyNode: marketCostTooltip,
					},
			  }
			: crossMarginFeeInfo;
	}, [
		orderType,
		crossMarginTradeFee,
		fees,
		orderFeeRate,
		accountType,
		marketInfo?.keeperDeposit,
		marketCostTooltip,
	]);

	return <StyledInfoBox details={feesInfo} />;
};

const ToolTip: FC = (props) => {
	const { t } = useTranslation();

	return (
		<DynamicStyledToolTip
			height={'auto'}
			preset="bottom"
			width="300px"
			content={t('futures.market.trade.cost-basis.tooltip')}
			style={{ textTransform: 'none' }}
		>
			{props.children}
			<StyledTimerIcon />
		</DynamicStyledToolTip>
	);
};

const StyledInfoBox = styled(InfoBox)`
	margin-bottom: 16px;
`;

const DynamicStyledToolTip = styled(StyledTooltip)`
	padding: 10px;
`;

const StyledDynamicFee = styled.span`
	color: ${(props) => props.theme.colors.selectedTheme.gold};
	margin-left: 5px;
`;

const StyledTimerIcon = styled(TimerIcon)`
	margin-left: 5px;
	path {
		fill: ${(props) => props.theme.colors.selectedTheme.gold};
	}
`;

export default FeeInfoBox;
