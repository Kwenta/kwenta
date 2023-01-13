import { GasPrices } from '@synthetixio/queries';
import Wei from '@synthetixio/wei';
import { FC, useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { NO_VALUE } from 'constants/placeholder';
import { parseGasPriceObject } from 'hooks/useGas';
import useIsL1 from 'hooks/useIsL1';
import useIsL2 from 'hooks/useIsL2';
import { customGasPriceState, gasSpeedState } from 'store/wallet';
import { formatNumber, formatDollars } from 'utils/formatters/number';

import { SummaryItem, SummaryItemValue, SummaryItemLabel } from './common';

type GasPriceSelectProps = {
	gasPrices: GasPrices | undefined;
	transactionFee?: Wei | number | null;
	className?: string;
};

type GasPriceItemProps = {
	gasPrices: GasPrices | undefined;
	transactionFee?: Wei | number | null;
};

const GasPriceItem: FC<GasPriceItemProps> = memo(({ gasPrices, transactionFee }) => {
	const isL2 = useIsL2();
	const gasSpeed = useRecoilValue(gasSpeedState);
	const customGasPrice = useRecoilValue(customGasPriceState);
	const formattedTransactionFee = useMemo(() => {
		return transactionFee ? formatDollars(transactionFee, { maxDecimals: 1 }) : NO_VALUE;
	}, [transactionFee]);

	const hasCustomGasPrice = customGasPrice !== '';
	const gasPrice = gasPrices ? parseGasPriceObject(gasPrices[gasSpeed]) : null;

	if (!gasPrice) return <>{NO_VALUE}</>;

	return (
		<span data-testid="gas-price">
			{isL2
				? formattedTransactionFee
				: `${formatNumber(hasCustomGasPrice ? +customGasPrice : gasPrice ?? 0, {
						minDecimals: 2,
				  })} Gwei`}
		</span>
	);
});

const GasPriceSelect: FC<GasPriceSelectProps> = memo(({ gasPrices, transactionFee, ...rest }) => {
	const { t } = useTranslation();
	const isMainnet = useIsL1();

	return (
		<SummaryItem {...rest}>
			<SummaryItemLabel>
				{isMainnet
					? t('common.summary.gas-prices.max-fee')
					: t('common.summary.gas-prices.gas-price')}
			</SummaryItemLabel>
			<SummaryItemValue>
				<GasPriceItem gasPrices={gasPrices} transactionFee={transactionFee} />
			</SummaryItemValue>
		</SummaryItem>
	);
});

export default GasPriceSelect;
