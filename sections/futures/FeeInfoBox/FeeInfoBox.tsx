import router from 'next/router';
import React, { useMemo, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';

import EligibleIcon from 'assets/svg/app/eligible.svg';
import LinkArrowIcon from 'assets/svg/app/link-arrow.svg';
import NotEligibleIcon from 'assets/svg/app/not-eligible.svg';
import InfoBox, { DetailedInfo } from 'components/InfoBox/InfoBox';
import * as Text from 'components/Text';
import { NO_VALUE } from 'constants/placeholder';
import ROUTES from 'constants/routes';
import Connector from 'containers/Connector';
import {
	selectCrossMarginSettings,
	selectCrossMarginTradeFees,
	selectDelayedOrderFee,
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
import { computeOrderFee } from 'utils/costCalculations';
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
	const { nativeSizeDelta, susdSizeDelta } = useAppSelector(selectTradeSizeInputs);
	const accountType = useAppSelector(selectFuturesType);
	const { tradeFee: crossMarginTradeFeeRate, limitOrderFee, stopOrderFee } = useAppSelector(
		selectCrossMarginSettings
	);
	const marketInfo = useAppSelector(selectMarketInfo);
	const { commitDeposit } = useAppSelector(selectDelayedOrderFee);

	const totalDeposit = useMemo(() => {
		return (commitDeposit ?? zeroBN).add(marketInfo?.keeperDeposit ?? zeroBN);
	}, [commitDeposit, marketInfo?.keeperDeposit]);

	const { orderFee, makerFee, takerFee } = useMemo(
		() => computeOrderFee(marketInfo, susdSizeDelta, orderType),
		[marketInfo, susdSizeDelta, orderType]
	);

	const orderFeeRate = useMemo(
		() =>
			orderType === 'limit' ? limitOrderFee : orderType === 'stop market' ? stopOrderFee : null,
		[orderType, stopOrderFee, limitOrderFee]
	);

	const marketCostTooltip = useMemo(
		() => (
			<>
				{nativeSizeDelta.abs().gt(0)
					? formatPercent(orderFee ?? zeroBN)
					: `${formatPercent(makerFee ?? zeroBN)} / ${formatPercent(takerFee ?? zeroBN)}`}
			</>
		),
		[orderFee, makerFee, takerFee, nativeSizeDelta]
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
					<CompactBox
						onClick={() => router.push(ROUTES.Dashboard.Stake)}
						$isEligible={isRewardEligible}
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
									components={[<Text.Body variant="bold" />]}
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
		if (orderType === 'delayed' || orderType === 'delayed offchain') {
			return {
				'Keeper Deposit': {
					value: !!marketInfo?.keeperDeposit ? formatDollars(marketInfo.keeperDeposit) : NO_VALUE,
				},
				'Commit Deposit': {
					value: !!commitDeposit
						? formatDollars(commitDeposit, { minDecimals: commitDeposit.lt(0.01) ? 4 : 2 })
						: NO_VALUE,
					keyNode: marketCostTooltip,
				},
				'Total Deposit': {
					value: formatDollars(totalDeposit),
					spaceBeneath: true,
				},
				'Estimated Fees': {
					value: !!commitDeposit
						? formatDollars(commitDeposit, { minDecimals: commitDeposit.lt(0.01) ? 4 : 2 })
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
		commitDeposit,
		accountType,
		marketInfo?.keeperDeposit,
		marketCostTooltip,
		totalDeposit,
	]);

	return <StyledInfoBox details={feesInfo} />;
};

const StyledInfoBox = styled(InfoBox)`
	margin-bottom: 16px;
`;

const StyledLinkArrowIcon = styled(LinkArrowIcon)`
	cursor: pointer;
`;

const RewardCopy = styled(Text.Body)`
	color: ${(props) => props.theme.colors.selectedTheme.text.title};
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
