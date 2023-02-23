import router from 'next/router';
import React, { memo, useCallback, useMemo, useReducer } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';

import EligibleIcon from 'assets/svg/app/eligible.svg';
import LinkArrowIcon from 'assets/svg/app/link-arrow.svg';
import NotEligibleIcon from 'assets/svg/app/not-eligible.svg';
import HelpIcon from 'assets/svg/app/question-mark.svg';
import Badge from 'components/Badge';
import { InfoBoxContainer, InfoBoxRow } from 'components/InfoBox';
import { FlexDivRow, FlexDivRowCentered } from 'components/layout/flex';
import { Body } from 'components/Text';
import Tooltip from 'components/Tooltip/Tooltip';
import { NO_VALUE } from 'constants/placeholder';
import ROUTES from 'constants/routes';
import Connector from 'containers/Connector';
import {
	selectCrossMarginSettings,
	selectCrossMarginTradeFees,
	selectIsolatedMarginFee,
	selectMarketInfo,
	selectOrderFee,
	selectOrderType,
	selectTradePreview,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import {
	selectStakedEscrowedKwentaBalance,
	selectStakedKwentaBalance,
} from 'state/staking/selectors';
import { formatCurrency, formatDollars, formatPercent, zeroBN } from 'utils/formatters/number';

const MarketCostTooltip = memo(() => {
	const { t } = useTranslation();

	return (
		<Tooltip
			height="auto"
			preset="top"
			width="300px"
			content={t('futures.market.trade.fees.tooltip')}
			style={{ textTransform: 'none' }}
		>
			<StyledHelpIcon />
		</Tooltip>
	);
});

const ExecutionFeeTooltip = memo(() => {
	const { t } = useTranslation();

	return (
		<Tooltip
			height="auto"
			preset="top"
			width="300px"
			content={t('futures.market.trade.fees.keeper-tooltip')}
			style={{ textTransform: 'none' }}
		>
			<StyledHelpIcon />
		</Tooltip>
	);
});

export const CrossMarginFeeInfoBox = memo(() => {
	const orderType = useAppSelector(selectOrderType);

	return (
		<FeeInfoBoxContainer>
			<ProtocolFeeRow />
			<LimitStopFeeRow />
			<CrossMarginFeeRow />
			<TotalFeeRow />
			{(orderType === 'limit' || orderType === 'stop_market') && <KeeperDepositRow />}
		</FeeInfoBoxContainer>
	);
});

export const IsolatedMarginFeeInfoBox = memo(() => {
	const orderType = useAppSelector(selectOrderType);
	return (
		<FeeInfoBoxContainer>
			{orderType === 'delayed' || orderType === 'delayed_offchain' ? (
				<>
					<TotalFeesRow />
					<TradingRewardRow />
				</>
			) : (
				<FeeRow />
			)}
		</FeeInfoBoxContainer>
	);
});

const FeeRow = memo(() => {
	const isolatedMarginFee = useAppSelector(selectIsolatedMarginFee);

	return (
		<InfoBoxRow
			title="Fee"
			value={formatDollars(isolatedMarginFee, { suggestDecimals: true })}
			keyNode={<MarketCostTooltip />}
		/>
	);
});

const ProtocolFeeRow = memo(() => {
	const crossMarginFees = useAppSelector(selectCrossMarginTradeFees);

	return (
		<InfoBoxRow
			title="Protocol Fee"
			value={formatDollars(crossMarginFees.staticFee, { suggestDecimals: true })}
			keyNode={<MarketCostTooltip />}
		/>
	);
});

const LimitStopFeeRow = memo(() => {
	const crossMarginFees = useAppSelector(selectCrossMarginTradeFees);
	const orderType = useAppSelector(selectOrderType);
	const { limitOrderFee, stopOrderFee } = useAppSelector(selectCrossMarginSettings);

	const orderFeeRate = useMemo(
		() =>
			orderType === 'limit' ? limitOrderFee : orderType === 'stop_market' ? stopOrderFee : null,
		[orderType, stopOrderFee, limitOrderFee]
	);

	return (
		<InfoBoxRow
			dataTestId="limit-stop"
			title="Limit / Stop Fee"
			{...(crossMarginFees.limitStopOrderFee.gt(0) && orderFeeRate
				? {
						value: formatDollars(crossMarginFees.limitStopOrderFee, { suggestDecimals: true }),
						keyNode: formatPercent(orderFeeRate),
				  }
				: { value: '' })}
		/>
	);
});

const CrossMarginFeeRow = memo(() => {
	const crossMarginFees = useAppSelector(selectCrossMarginTradeFees);
	const { tradeFee: crossMarginTradeFeeRate } = useAppSelector(selectCrossMarginSettings);

	return (
		<InfoBoxRow
			title="Cross Margin Fee"
			value={formatDollars(crossMarginFees.crossMarginFee, { suggestDecimals: true })}
			keyNode={formatPercent(crossMarginTradeFeeRate)}
		/>
	);
});

const TradingRewardRow = memo(() => {
	const { t } = useTranslation();
	const { walletAddress } = Connector.useContainer();
	const stakedEscrowedKwentaBalance = useAppSelector(selectStakedEscrowedKwentaBalance);
	const stakedKwentaBalance = useAppSelector(selectStakedKwentaBalance);

	const isRewardEligible = useMemo(
		() => !!walletAddress && stakedKwentaBalance.add(stakedEscrowedKwentaBalance).gt(0),
		[walletAddress, stakedKwentaBalance, stakedEscrowedKwentaBalance]
	);

	const goToStaking = useCallback(() => {
		router.push(ROUTES.Dashboard.Stake);
	}, []);

	return (
		<InfoBoxRow
			title="Trading Reward"
			compactBox
			value=""
			keyNode={
				<CompactBox $isEligible={isRewardEligible} onClick={goToStaking}>
					<FlexDivRow style={{ marginBottom: '5px' }}>
						<div>{t('dashboard.stake.tabs.trading-rewards.trading-reward')}</div>
						<Badge color={isRewardEligible ? 'yellow' : 'red'}>
							{t(`dashboard.stake.tabs.trading-rewards.${isRewardEligible ? '' : 'not-'}eligible`)}
							{isRewardEligible ? (
								<EligibleIcon viewBox="0 0 8 8" style={{ paddingLeft: '2px' }} />
							) : (
								<NotEligibleIcon />
							)}
						</Badge>
					</FlexDivRow>
					<FlexDivRowCentered>
						<Body color="secondary">
							<Trans
								i18nKey={`dashboard.stake.tabs.trading-rewards.stake-to-${
									isRewardEligible ? 'earn' : 'start'
								}`}
								components={[<Body weight="bold" inline />]}
							/>
						</Body>
						<StyledLinkArrowIcon />
					</FlexDivRowCentered>
				</CompactBox>
			}
		/>
	);
});

const TotalFeeRow = memo(() => {
	const crossMarginFees = useAppSelector(selectCrossMarginTradeFees);
	return (
		<InfoBoxRow
			title="Total Fee"
			value={formatDollars(crossMarginFees.total, {
				minDecimals: crossMarginFees.total.lt(0.01) ? 4 : 2,
			})}
		/>
	);
});

const KeeperDepositRow = memo(() => {
	const marketInfo = useAppSelector(selectMarketInfo);
	const crossMarginFees = useAppSelector(selectCrossMarginTradeFees);

	return (
		<InfoBoxRow
			title="Keeper Deposit"
			value={
				!!marketInfo?.keeperDeposit
					? formatCurrency('ETH', crossMarginFees.keeperEthDeposit, { currencyKey: 'ETH' })
					: NO_VALUE
			}
		/>
	);
});

const TotalFeesRow = memo(() => {
	const [expanded, toggleExpanded] = useReducer((s) => !s, false);
	const tradePreview = useAppSelector(selectTradePreview);
	const commitDeposit = useMemo(() => tradePreview?.fee ?? zeroBN, [tradePreview?.fee]);
	const marketInfo = useAppSelector(selectMarketInfo);
	const totalDeposit = useMemo(() => {
		return commitDeposit.add(marketInfo?.keeperDeposit ?? zeroBN);
	}, [commitDeposit, marketInfo?.keeperDeposit]);

	return (
		<InfoBoxRow
			title="Total Fees"
			value={formatDollars(totalDeposit)}
			expandable
			expanded={expanded}
			onToggleExpand={toggleExpanded}
		>
			<ExecutionFeeRow />
			<EstimatedTradeFeeRow />
		</InfoBoxRow>
	);
});

const ExecutionFeeRow = memo(() => {
	const marketInfo = useAppSelector(selectMarketInfo);

	return (
		<InfoBoxRow
			title="Execution Fee"
			value={!!marketInfo?.keeperDeposit ? formatDollars(marketInfo.keeperDeposit) : NO_VALUE}
			keyNode={<ExecutionFeeTooltip />}
			isSubItem
		/>
	);
});

const EstimatedTradeFeeRow = memo(() => {
	const { takerFee, makerFee } = useAppSelector(selectOrderFee);
	const tradePreview = useAppSelector(selectTradePreview);
	const commitDeposit = useMemo(() => tradePreview?.fee ?? zeroBN, [tradePreview?.fee]);

	return (
		<InfoBoxRow
			title={`Est. Trade Fee (${formatPercent(makerFee)} / ${formatPercent(takerFee)})`}
			value={!!commitDeposit ? formatDollars(commitDeposit, { suggestDecimals: true }) : NO_VALUE}
			keyNode={<MarketCostTooltip />}
			isSubItem
		/>
	);
});

const FeeInfoBoxContainer = styled(InfoBoxContainer)`
	margin-bottom: 16px;
`;

const StyledHelpIcon = styled(HelpIcon)`
	margin-left: 4px;
`;

const StyledLinkArrowIcon = styled(LinkArrowIcon)`
	cursor: pointer;
	fill: ${(props) => props.theme.colors.selectedTheme.text.label};
`;

const CompactBox = styled.div<{ $isEligible: boolean }>`
	font-size: 13px;
	padding-left: 10px;
	cursor: pointer;
	margin-top: 10px;

	${(props) => `
		color: ${props.theme.colors.selectedTheme.text.value};
		border-left: 2px solid 
			${props.theme.colors.selectedTheme.badge[props.$isEligible ? 'yellow' : 'red'].background};
		`}
`;
