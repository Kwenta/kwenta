import router from 'next/router';
import React, { FC, useMemo, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';

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
import { computeNPFee, computeMarketFee } from 'utils/costCalculations';
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

	const { commitDeposit, nextPriceFee } = useMemo(() => computeNPFee(marketInfo, nativeSizeDelta), [
		marketInfo,
		nativeSizeDelta,
	]);

	const totalDeposit = useMemo(() => {
		return (commitDeposit ?? zeroBN).add(marketInfo?.keeperDeposit ?? zeroBN);
	}, [commitDeposit, marketInfo?.keeperDeposit]);

	const nextPriceDiscount = useMemo(() => {
		return (nextPriceFee ?? zeroBN).sub(commitDeposit ?? zeroBN);
	}, [commitDeposit, nextPriceFee]);

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
				spaceBeneath: true,
				hideKey: true,
				keyNode: (
					// {t('dashboard.stake.tabs.trading-rewards.stake-to-earn')}
					<div
						style={{
							display: 'block',
							marginTop: '10px',
							borderLeft: '3px solid #FFB800',
							paddingLeft: '8px',
						}}
					>
						<div className="black">{t('dashboard.stake.tabs.trading-rewards.trading-reward')}</div>
						<Paragraph style={{ marginTop: '5px' }}>
							<Trans
								i18nKey={'dashboard.stake.tabs.trading-rewards.stake-to-earn'}
								components={[<Emphasis />]}
							/>
						</Paragraph>
					</div>
				),
				valueNode: stakedKwentaBalance.add(stakedEscrowedKwentaBalance).gt(0) ? (
					<div className="bg-yellow">{t('dashboard.stake.tabs.trading-rewards.eligible')}</div>
				) : (
					<div className="bg-red" onClick={() => router.push(ROUTES.Dashboard.Stake)}>
						{t('dashboard.stake.tabs.trading-rewards.not-eligible')}
					</div>
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
		if (orderType === 'next price') {
			return {
				'Keeper Deposit': {
					value: !!marketInfo?.keeperDeposit ? formatDollars(marketInfo.keeperDeposit) : NO_VALUE,
				},
				'Commit Deposit': {
					value: !!commitDeposit
						? formatDollars(commitDeposit, { minDecimals: commitDeposit.lt(0.01) ? 4 : 2 })
						: NO_VALUE,
				},
				'Total Deposit': {
					value: formatDollars(totalDeposit),
					spaceBeneath: true,
				},
				'Next Price Discount': {
					value: !!nextPriceDiscount ? formatDollars(nextPriceDiscount) : NO_VALUE,
					color: nextPriceDiscount.lt(0) ? 'green' : nextPriceDiscount.gt(0) ? 'red' : undefined,
				},
				'Estimated Fees': {
					value: formatDollars(totalDeposit.add(nextPriceDiscount ?? zeroBN)),
					keyNode: dynamicFeeRate?.gt(0) ? <ToolTip /> : null,
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
		stakedKwentaBalance,
		stakedEscrowedKwentaBalance,
		orderType,
		crossMarginTradeFeeRate,
		isolatedMarginFee,
		crossMarginFees,
		orderFeeRate,
		dynamicFeeRate,
		commitDeposit,
		accountType,
		marketInfo?.keeperDeposit,
		nextPriceDiscount,
		marketCostTooltip,
		totalDeposit,
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

const Emphasis = styled.b`
	font-family: 700;
`;
export default FeeInfoBox;

// .neon {
// 	color: ${(props) => props.theme.colors.selectedTheme.badge['neon'].text};
// 	font-weight: 700;
// 	font-family: ${(props) => props.theme.fonts.regular};
// 	text-transform: uppercase;
// 	letter-spacing: 1px;
// 	font-size: 12px;
// }

// .bg-neon {
// 	font-family: ${(props) => props.theme.fonts.black};
// 	color: ${(props) => props.theme.colors.selectedTheme.badge['neon'].text};
// 	background: ${(props) => props.theme.colors.selectedTheme.badge['neon'].background};
// 	padding: 0px 6px;
// 	border-radius: 100px;
// 	font-weight: 900;
// 	font-variant: all-small-caps;
// }
