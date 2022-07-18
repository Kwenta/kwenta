import React from 'react';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import useSynthetixQueries from '@synthetixio/queries';

import InfoBox from 'components/InfoBox';
import { useExchangeContext } from 'contexts/ExchangeContext';
import { customGasPriceState, gasSpeedState, isL2State, isMainnetState } from 'store/wallet';
import { formatCurrency, formatNumber, formatPercent, zeroBN } from 'utils/formatters/number';
import { NO_VALUE } from 'constants/placeholder';
import { Synths } from 'constants/currency';
import { parseGasPriceObject } from 'hooks/useGas';
import TimerIcon from 'assets/svg/app/timer.svg';
import StyledTooltip from 'components/Tooltip/StyledTooltip';

const SwapInfoBox: React.FC = () => {
	const { t } = useTranslation();
	const gasSpeed = useRecoilValue(gasSpeedState);
	const customGasPrice = useRecoilValue(customGasPriceState);
	const isMainnet = useRecoilValue(isMainnetState);
	const isL2 = useRecoilValue(isL2State);
	const { transactionFee, feeCost, exchangeFeeRate, baseFeeRate } = useExchangeContext();
	const { useEthGasPriceQuery } = useSynthetixQueries();

	const ethGasPriceQuery = useEthGasPriceQuery();

	const gasPrices = React.useMemo(
		() => (ethGasPriceQuery.isSuccess ? ethGasPriceQuery?.data ?? undefined : undefined),
		[ethGasPriceQuery.isSuccess, ethGasPriceQuery.data]
	);

	const hasCustomGasPrice = customGasPrice !== '';
	const gasPrice = gasPrices ? parseGasPriceObject(gasPrices[gasSpeed]) : null;

	const formattedTransactionFee = React.useMemo(() => {
		return transactionFee
			? formatCurrency(Synths.sUSD, transactionFee, { sign: '$', maxDecimals: 1 })
			: NO_VALUE;
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
								exchangeFeeRate.sub(baseFeeRate).gt(0) ? (
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
												{formatPercent(exchangeFeeRate.sub(baseFeeRate), { minDecimals: 2 })}
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
							? formatCurrency(Synths.sUSD, feeCost, {
									sign: '$',
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
