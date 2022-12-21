import router from 'next/router';
import React, { FC, useMemo, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';

import LinkArrowIcon from 'assets/svg/app/link-arrow.svg';
import TimerIcon from 'assets/svg/app/timer.svg';
import InfoBox, { DetailedInfo } from 'components/InfoBox/InfoBox';
import StyledTooltip from 'components/Tooltip/StyledTooltip';
import { NO_VALUE } from 'constants/placeholder';
import ROUTES from 'constants/routes';
import Connector from 'containers/Connector';
import {
	selectCrossMarginSettings,
	selectCrossMarginTradeFees,
	selectDynamicFeeRate,
	selectFuturesType,
	selectIsolatedMarginFee,
	selectMarketInfo,
	selectOrderType,
	selectTradeSizeInputs,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { fetchStakingData } from 'state/staking/actions';
import {
	selectStakedEscrowedKwentaBalance,
	selectStakedKwentaBalance,
} from 'state/staking/selectors';
import { Paragraph } from 'styles/common';
import { computeMarketFee } from 'utils/costCalculations';
import { formatCurrency, formatDollars, formatPercent, zeroBN } from 'utils/formatters/number';

const FeeInfoBox: React.FC = () => {
	const { t } = useTranslation();
	const { walletAddress } = Connector.useContainer();
	const dispatch = useAppDispatch();
	const orderType = useAppSelector(selectOrderType);
	const stakedEscrowedKwentaBalance = useAppSelector(selectStakedEscrowedKwentaBalance);
	const stakedKwentaBalance = useAppSelector(selectStakedKwentaBalance);
	const crossMarginFees = useAppSelector(selectCrossMarginTradeFees);
	const isolatedMarginFee = useAppSelector(selectIsolatedMarginFee);
	const dynamicFeeRate = useAppSelector(selectDynamicFeeRate);
	const { nativeSizeDelta } = useAppSelector(selectTradeSizeInputs);
	const accountType = useAppSelector(selectFuturesType);
	const { tradeFee: crossMarginTradeFeeRate, limitOrderFee, stopOrderFee } = useAppSelector(
		selectCrossMarginSettings
	);
	const marketInfo = useAppSelector(selectMarketInfo);

	const staticRate = useMemo(() => computeMarketFee(marketInfo, nativeSizeDelta), [
		marketInfo,
		nativeSizeDelta,
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

	const isRewardEligible = useMemo(
		() => !!walletAddress && stakedKwentaBalance.add(stakedEscrowedKwentaBalance).gt(0),
		[walletAddress, stakedKwentaBalance, stakedEscrowedKwentaBalance]
	);

	useEffect(() => {
		if (!!walletAddress) {
			dispatch(fetchStakingData());
		}
	}, [dispatch, walletAddress]);

	const feesInfo = useMemo<Record<string, DetailedInfo | null | undefined>>(() => {
		const crossMarginFeeInfo = {
			'Protocol Fee': {
				value: formatDollars(crossMarginFees.staticFee, {
					minDecimals: crossMarginFees.staticFee.lt(0.01) ? 4 : 2,
				}),
				keyNode: marketCostTooltip,
			},
			'Limit / Stop Fee':
				crossMarginFees.limitStopOrderFee.gt(0) && orderFeeRate
					? {
							value: formatDollars(crossMarginFees.limitStopOrderFee, {
								minDecimals: crossMarginFees.limitStopOrderFee.lt(0.01) ? 4 : 2,
							}),
							keyNode: formatPercent(orderFeeRate),
					  }
					: null,
			'Cross Margin Fee': {
				value: formatDollars(crossMarginFees.crossMarginFee, {
					minDecimals: crossMarginFees.crossMarginFee.lt(0.01) ? 4 : 2,
				}),
				keyNode: formatPercent(crossMarginTradeFeeRate),
			},
			'Trading Reward': {
				value: '',
				compactBox: true,
				spaceBeneath: true,
				keyNode: (
					<p
						className={`compact-box ${isRewardEligible ? 'border-yellow' : 'border-red'}`}
						onClick={() => router.push(ROUTES.Dashboard.Stake)}
					>
						<div>
							<div>{t('dashboard.stake.tabs.trading-rewards.trading-reward')}</div>
							<p>
								{isRewardEligible ? (
									<div className="badge badge-yellow">
										{t('dashboard.stake.tabs.trading-rewards.eligible')}
									</div>
								) : (
									<div className="badge badge-red">
										{t('dashboard.stake.tabs.trading-rewards.not-eligible')}
									</div>
								)}
							</p>
						</div>
						<div>
							<Paragraph className="reward-copy">
								<Trans
									i18nKey={
										isRewardEligible
											? 'dashboard.stake.tabs.trading-rewards.stake-to-earn'
											: 'dashboard.stake.tabs.trading-rewards.stake-to-start'
									}
									components={[<Emphasis />]}
								/>
							</Paragraph>
							<StyledLinkArrowIcon />
						</div>
					</p>
				),
			},
			'Total Fee': {
				value: formatDollars(crossMarginFees.total, {
					minDecimals: crossMarginFees.total.lt(0.01) ? 4 : 2,
				}),
			},
		};
		if (orderType === 'limit' || orderType === 'stop market') {
			return {
				...crossMarginFeeInfo,
				'Keeper Deposit': {
					value: !!marketInfo?.keeperDeposit
						? formatCurrency('ETH', crossMarginFees.keeperEthDeposit, { currencyKey: 'ETH' })
						: NO_VALUE,
				},
			};
		}
		return accountType === 'isolated_margin'
			? {
					Fee: {
						value: formatDollars(isolatedMarginFee, {
							minDecimals: isolatedMarginFee.lt(0.01) ? 4 : 2,
						}),
						keyNode: marketCostTooltip,
					},
			  }
			: crossMarginFeeInfo;
	}, [
		t,
		isRewardEligible,
		orderType,
		crossMarginTradeFeeRate,
		isolatedMarginFee,
		crossMarginFees,
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

const StyledLinkArrowIcon = styled(LinkArrowIcon)`
	cursor: pointer;
`;

const Emphasis = styled.b`
	font-family: ${(props) => props.theme.fonts.bold};
`;

export default FeeInfoBox;
