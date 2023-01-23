import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import TimerIcon from 'assets/svg/app/timer.svg';
import InfoBox from 'components/InfoBox';
import StyledTooltip from 'components/Tooltip/StyledTooltip';
import { NO_VALUE } from 'constants/placeholder';
import { parseGasPriceObject } from 'hooks/useGas';
import useIsL1 from 'hooks/useIsL1';
import useIsL2 from 'hooks/useIsL2';
import { selectGasPrice, selectGasSpeed } from 'state/app/selectors';
import { selectTransactionFeeWei, selectFeeCostWei } from 'state/exchange/selectors';
import { useAppSelector } from 'state/hooks';
import { formatDollars, formatNumber, formatPercent, zeroBN } from 'utils/formatters/number';

const SwapInfoBox: React.FC = () => {
	const { t } = useTranslation();
	const gasSpeed = useAppSelector(selectGasSpeed);
	const customGasPrice = useAppSelector(selectGasPrice);
	const isL2 = useIsL2();
	const isMainnet = useIsL1();
	const { exchangeFeeRate, baseFeeRate } = useAppSelector(({ exchange }) => ({
		exchangeFeeRate: exchange.exchangeFeeRate,
		baseFeeRate: exchange.baseFeeRate,
	}));

	const { useEthGasPriceQuery } = useSynthetixQueries();

	const transactionFee = useAppSelector(selectTransactionFeeWei);
	const feeCost = useAppSelector(selectFeeCostWei);

	const ethGasPriceQuery = useEthGasPriceQuery();

	const gasPrices = React.useMemo(() => ethGasPriceQuery?.data ?? undefined, [
		ethGasPriceQuery.data,
	]);

	const hasCustomGasPrice = customGasPrice !== '';
	const gasPrice = gasPrices ? parseGasPriceObject(gasPrices[gasSpeed]) : null;

	const formattedTransactionFee = React.useMemo(() => {
		return transactionFee ? formatDollars(transactionFee, { maxDecimals: 1 }) : NO_VALUE;
	}, [transactionFee]);

	const gasPriceItem = isL2
		? formattedTransactionFee
		: `${formatNumber(hasCustomGasPrice ? +customGasPrice : gasPrice ?? 0, {
				minDecimals: 2,
		  })} Gwei`;

	return (
		<StyledInfoBox
			details={{
				[isMainnet
					? t('common.summary.gas-prices.max-fee')
					: t('common.summary.gas-prices.gas-price')]: {
					value: gasPrice != null ? gasPriceItem : NO_VALUE,
				},
				[t('exchange.summary-info.fee')]: {
					value: '',
					valueNode: (
						<div style={{ display: 'flex' }}>
							{formatPercent(baseFeeRate ?? zeroBN)}
							{exchangeFeeRate != null && baseFeeRate != null ? (
								wei(exchangeFeeRate)
									.sub(baseFeeRate ?? 0)
									.gt(0) ? (
									<>
										{' + '}
										<StyledTooltip
											height="auto"
											preset="bottom"
											width="300px"
											content="This transaction will incur an additional dynamic fee due to market volatility."
											style={{ padding: 10, textTransform: 'none' }}
										>
											<StyledDynamicFee>
												{formatPercent(wei(exchangeFeeRate).sub(baseFeeRate), { minDecimals: 2 })}
											</StyledDynamicFee>
											<StyledTimerIcon />
										</StyledTooltip>
									</>
								) : null
							) : null}
						</div>
					),
				},
				[t('common.summary.fee-cost')]: {
					value:
						feeCost != null
							? formatDollars(feeCost, {
									minDecimals: feeCost.lt(0.01) ? 4 : 2,
							  })
							: NO_VALUE,
				},
			}}
		/>
	);
};

const StyledInfoBox = styled(InfoBox)`
	margin-bottom: 15px;
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

export default SwapInfoBox;
