import router from 'next/router';
import React, { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';

import EligibleIcon from 'assets/svg/app/eligible.svg';
import LinkArrowIcon from 'assets/svg/app/link-arrow.svg';
import NotEligibleIcon from 'assets/svg/app/not-eligible.svg';
import HelpIcon from 'assets/svg/app/question-mark.svg';
import InfoBox, { DetailedInfo } from 'components/InfoBox/InfoBox';
import { Body } from 'components/Text';
import Tooltip from 'components/Tooltip/Tooltip';
import { NO_VALUE } from 'constants/placeholder';
import ROUTES from 'constants/routes';
import Connector from 'containers/Connector';
import {
	selectCrossMarginSettings,
	selectCrossMarginTradeFees,
	selectFuturesType,
	selectIsolatedMarginFee,
	selectMarketInfo,
	selectOrderType,
	selectTradePreview,
	selectTradeSizeInputs,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import {
	selectStakedEscrowedKwentaBalance,
	selectStakedKwentaBalance,
} from 'state/staking/selectors';
import { computeOrderFee } from 'utils/costCalculations';
import { formatCurrency, formatDollars, formatPercent, zeroBN } from 'utils/formatters/number';

const FeeInfoBox: React.FC = () => {
	const { t } = useTranslation();
	const { walletAddress } = Connector.useContainer();
	const orderType = useAppSelector(selectOrderType);
	const stakedEscrowedKwentaBalance = useAppSelector(selectStakedEscrowedKwentaBalance);
	const stakedKwentaBalance = useAppSelector(selectStakedKwentaBalance);
	const crossMarginFees = useAppSelector(selectCrossMarginTradeFees);
	const isolatedMarginFee = useAppSelector(selectIsolatedMarginFee);
	const { susdSizeDelta } = useAppSelector(selectTradeSizeInputs);
	const accountType = useAppSelector(selectFuturesType);
	const { tradeFee: crossMarginTradeFeeRate, limitOrderFee, stopOrderFee } = useAppSelector(
		selectCrossMarginSettings
	);
	const marketInfo = useAppSelector(selectMarketInfo);
	const tradePreview = useAppSelector(selectTradePreview);

	const [feesExpanded, setFeesExpanded] = useState(false);

	const commitDeposit = useMemo(() => tradePreview?.fee ?? zeroBN, [tradePreview?.fee]);

	const totalDeposit = useMemo(() => {
		return commitDeposit.add(marketInfo?.keeperDeposit ?? zeroBN);
	}, [commitDeposit, marketInfo?.keeperDeposit]);

	const { makerFee, takerFee } = useMemo(
		() => computeOrderFee(marketInfo, susdSizeDelta, orderType),
		[marketInfo, susdSizeDelta, orderType]
	);

	const orderFeeRate = useMemo(
		() =>
			orderType === 'limit' ? limitOrderFee : orderType === 'stop_market' ? stopOrderFee : null,
		[orderType, stopOrderFee, limitOrderFee]
	);

	const marketCostTooltip = useMemo(
		() => (
			<Tooltip
				height={'auto'}
				preset="top"
				width="300px"
				content={t('futures.market.trade.fees.tooltip')}
				style={{ textTransform: 'none' }}
			>
				<StyledHelpIcon />
			</Tooltip>
		),
		[t]
	);

	const executionFeeTooltip = useMemo(
		() => (
			<Tooltip
				height={'auto'}
				preset="top"
				width="300px"
				content={t('futures.market.trade.fees.keeper-tooltip')}
				style={{ textTransform: 'none' }}
			>
				<StyledHelpIcon />
			</Tooltip>
		),
		[t]
	);

	const isRewardEligible = useMemo(
		() => !!walletAddress && stakedKwentaBalance.add(stakedEscrowedKwentaBalance).gt(0),
		[walletAddress, stakedKwentaBalance, stakedEscrowedKwentaBalance]
	);

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
					<CompactBox
						$isEligible={isRewardEligible}
						onClick={() => router.push(ROUTES.Dashboard.Stake)}
					>
						<div>
							<div>{t('dashboard.stake.tabs.trading-rewards.trading-reward')}</div>
							<p>
								{isRewardEligible ? (
									<div className="badge badge-yellow">
										{t('dashboard.stake.tabs.trading-rewards.eligible')}
										<EligibleIcon style={{ paddingLeft: '2px' }} />
									</div>
								) : (
									<div className="badge badge-red">
										{t('dashboard.stake.tabs.trading-rewards.not-eligible')}
										<NotEligibleIcon />
									</div>
								)}
							</p>
						</div>
						<div>
							<RewardCopy>
								<Trans
									i18nKey={`dashboard.stake.tabs.trading-rewards.stake-to-${
										isRewardEligible ? 'earn' : 'start'
									}`}
									components={[<Body variant="bold" />]}
								/>
							</RewardCopy>
							<StyledLinkArrowIcon />
						</div>
					</CompactBox>
				),
			},
			'Total Fee': {
				value: formatDollars(crossMarginFees.total, {
					minDecimals: crossMarginFees.total.lt(0.01) ? 4 : 2,
				}),
			},
		};
		if (orderType === 'limit' || orderType === 'stop_market') {
			return {
				...crossMarginFeeInfo,
				'Keeper Deposit': {
					value: !!marketInfo?.keeperDeposit
						? formatCurrency('ETH', crossMarginFees.keeperEthDeposit, { currencyKey: 'ETH' })
						: NO_VALUE,
				},
			};
		}
		if (orderType === 'delayed' || orderType === 'delayed_offchain') {
			return {
				'Total Fees': {
					expandable: true,
					value: formatDollars(totalDeposit),
					subItems: {
						'Execution Fee': {
							value: !!marketInfo?.keeperDeposit
								? formatDollars(marketInfo.keeperDeposit)
								: NO_VALUE,
							keyNode: executionFeeTooltip,
						},
						[`Est. Trade Fee (${formatPercent(makerFee ?? zeroBN)} / ${formatPercent(
							takerFee ?? zeroBN
						)})`]: {
							value: !!commitDeposit
								? formatDollars(commitDeposit, { minDecimals: commitDeposit.lt(0.01) ? 4 : 2 })
								: NO_VALUE,
							keyNode: marketCostTooltip,
						},
					},
					onClick: () => setFeesExpanded(!feesExpanded),
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
		totalDeposit,
		crossMarginTradeFeeRate,
		isolatedMarginFee,
		crossMarginFees,
		orderFeeRate,
		commitDeposit,
		accountType,
		marketInfo?.keeperDeposit,
		marketCostTooltip,
		executionFeeTooltip,
		feesExpanded,
		makerFee,
		takerFee,
	]);

	return <StyledInfoBox details={feesInfo} />;
};

const StyledInfoBox = styled(InfoBox)`
	margin-bottom: 16px;
`;

const StyledHelpIcon = styled(HelpIcon)`
	margin-left: 4px;
`;

const StyledLinkArrowIcon = styled(LinkArrowIcon)`
	cursor: pointer;
`;

const RewardCopy = styled(Body)`
	color: ${(props) => props.theme.colors.selectedTheme.text.label};
`;

const CompactBox = styled.div<{ $isEligible: boolean }>`
	color: ${(props) => props.theme.colors.selectedTheme.rewardTitle};
	font-size: 13px;
	padding-left: 8px;
	cursor: pointer;
	margin-top: 16px;

	.badge {
		font-family: ${(props) => props.theme.fonts.black};
		padding: 0px 6px;
		border-radius: 100px;
		font-variant: all-small-caps;
	}

	.badge-red {
		color: ${(props) => props.theme.colors.selectedTheme.badge.red.text};
		background: ${(props) => props.theme.colors.selectedTheme.badge.red.background};
		min-width: 100px;
	}

	.badge-yellow {
		color: ${(props) => props.theme.colors.selectedTheme.badge.yellow.text};
		background: ${(props) => props.theme.colors.selectedTheme.badge.yellow.background};
		min-width: 70px;
	}

	${(props) =>
		`border-left: 3px solid 
				${
					props.$isEligible
						? props.theme.colors.selectedTheme.badge.yellow.background
						: props.theme.colors.selectedTheme.badge.red.background
				};
		`}
`;

export default FeeInfoBox;
