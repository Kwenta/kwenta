import Wei from '@synthetixio/wei';
import { memo, useMemo, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import HelpIcon from 'assets/svg/app/question-mark.svg';
import { InfoBoxRow } from 'components/InfoBox';
import Tooltip from 'components/Tooltip/Tooltip';
import { NO_VALUE } from 'constants/placeholder';
import { CrossMarginOrderType } from 'sdk/types/futures';
import { selectCrossMarginSettings } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { formatCurrency, formatDollars, formatPercent, zeroBN } from 'utils/formatters/number';

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

const ExecutionFeeRow = memo(({ executionFee }: { executionFee: Wei }) => {
	return (
		<InfoBoxRow
			title="Execution Fee"
			value={!!executionFee ? formatDollars(executionFee) : NO_VALUE}
			keyNode={<ExecutionFeeTooltip />}
			isSubItem
		/>
	);
});

const LimitStopFeeRow = memo(
	({
		conditionalOrderFee,
		orderType,
	}: {
		conditionalOrderFee: Wei;
		orderType: CrossMarginOrderType;
	}) => {
		const { fees } = useAppSelector(selectCrossMarginSettings);

		const orderFeeRate = useMemo(
			() => (orderType === 'limit' ? fees.limit : orderType === 'stop_market' ? fees.stop : null),
			[orderType, fees]
		);

		return (
			<InfoBoxRow
				isSubItem
				dataTestId="limit-stop"
				title="Limit / Stop Fee"
				value={formatDollars(conditionalOrderFee, { suggestDecimals: true })}
				keyNode={formatPercent(orderFeeRate ?? 0)}
			/>
		);
	}
);

const KeeperDepositRow = memo(({ smartMarginKeeperDeposit }: { smartMarginKeeperDeposit: Wei }) => {
	return (
		<InfoBoxRow
			title="Keeper Deposit"
			isSubItem
			value={
				smartMarginKeeperDeposit.gt(0)
					? formatCurrency('ETH', smartMarginKeeperDeposit, { currencyKey: 'ETH' })
					: NO_VALUE
			}
		/>
	);
});

const EstimatedTradeFeeRow = memo(({ rates, tradeFee }: { rates: FeeRates; tradeFee?: Wei }) => {
	return (
		<InfoBoxRow
			title={`Est. Trade Fee (${formatPercent(rates.maker)} / ${formatPercent(rates.taker)})`}
			value={!!tradeFee ? formatDollars(tradeFee, { suggestDecimals: true }) : NO_VALUE}
			keyNode={<MarketCostTooltip />}
			isSubItem
		/>
	);
});

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

type FeeRates = {
	maker: Wei;
	taker: Wei;
};

type FeesRowProps = {
	tradeFee: Wei;
	orderType: CrossMarginOrderType;
	conditionalOrderFee: Wei;
	smartMarginKeeperDeposit: Wei;
	executionFee: Wei;
	rates: FeeRates;
};

const FeesRow = memo(
	({
		tradeFee,
		smartMarginKeeperDeposit,
		conditionalOrderFee,
		orderType,
		executionFee,
		rates,
	}: FeesRowProps) => {
		const [expanded, toggleExpanded] = useReducer((s) => !s, false);

		const totalFee = useMemo(() => {
			let total = tradeFee.add(executionFee ?? zeroBN);
			return total.add(conditionalOrderFee);
		}, [tradeFee, executionFee, conditionalOrderFee]);

		return (
			<InfoBoxRow
				title="Total Fees"
				value={formatDollars(totalFee)}
				expandable
				expanded={expanded}
				onToggleExpand={toggleExpanded}
			>
				<ExecutionFeeRow executionFee={executionFee} />
				{conditionalOrderFee.gt(0) && (
					<LimitStopFeeRow conditionalOrderFee={conditionalOrderFee} orderType={orderType} />
				)}
				<EstimatedTradeFeeRow rates={rates} tradeFee={tradeFee} />
				{(orderType === 'limit' || orderType === 'stop_market') && (
					<KeeperDepositRow smartMarginKeeperDeposit={smartMarginKeeperDeposit} />
				)}
			</InfoBoxRow>
		);
	}
);

export default FeesRow;

const StyledHelpIcon = styled(HelpIcon)`
	margin-left: 4px;
`;
