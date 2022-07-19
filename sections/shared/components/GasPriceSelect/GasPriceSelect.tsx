import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { customGasPriceState, gasSpeedState, isL2State, isMainnetState } from 'store/wallet';
import { useRecoilValue } from 'recoil';
import Wei from '@synthetixio/wei';

import { NO_VALUE } from 'constants/placeholder';

import { formatCurrency, formatNumber } from 'utils/formatters/number';
import { Synths } from 'constants/currency';
import { SummaryItem, SummaryItemValue, SummaryItemLabel } from '../common';
import { GasPrices } from '@synthetixio/queries';

import { parseGasPriceObject } from 'hooks/useGas';
import { useMemo } from 'react';

type GasPriceSelectProps = {
	gasPrices: GasPrices | undefined;
	transactionFee?: Wei | number | null;
	className?: string;
};

const GasPriceSelect: FC<GasPriceSelectProps> = ({ gasPrices, transactionFee, ...rest }) => {
	const { t } = useTranslation();
	const gasSpeed = useRecoilValue(gasSpeedState);
	const customGasPrice = useRecoilValue(customGasPriceState);
	const isMainnet = useRecoilValue(isMainnetState);
	const isL2 = useRecoilValue(isL2State);

	const formattedTransactionFee = useMemo(() => {
		return transactionFee
			? formatCurrency(Synths.sUSD, transactionFee, { sign: '$', maxDecimals: 1 })
			: NO_VALUE;
	}, [transactionFee]);

	const hasCustomGasPrice = customGasPrice !== '';
	const gasPrice = gasPrices ? parseGasPriceObject(gasPrices[gasSpeed]) : null;

	const gasPriceItem = (
		<span data-testid="gas-price">
			{isL2
				? formattedTransactionFee
				: `${formatNumber(hasCustomGasPrice ? +customGasPrice : gasPrice ?? 0, {
						minDecimals: 2,
				  })} Gwei`}
		</span>
	);

	return (
		<SummaryItem {...rest}>
			<SummaryItemLabel>
				{isMainnet
					? t('common.summary.gas-prices.max-fee')
					: t('common.summary.gas-prices.gas-price')}
			</SummaryItemLabel>
			<SummaryItemValue>{gasPrice != null ? gasPriceItem : NO_VALUE}</SummaryItemValue>
		</SummaryItem>
	);
};

export default GasPriceSelect;
