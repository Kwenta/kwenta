import { FC, useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { NO_VALUE } from 'constants/placeholder';
import useIsL1 from 'hooks/useIsL1';
import useIsL2 from 'hooks/useIsL2';
import { formatNumber, formatDollars } from 'sdk/utils/number';
import { SummaryItem, SummaryItemValue, SummaryItemLabel } from 'sections/exchange/summary';
import { selectGasPrice } from 'state/app/selectors';
import { selectTransactionFeeWei } from 'state/exchange/selectors';
import { useAppSelector } from 'state/hooks';

type GasPriceSelectProps = {
	className?: string;
};

const GasPriceItem: FC = memo(() => {
	const customGasPrice = useAppSelector(selectGasPrice);
	const isL2 = useIsL2();
	const transactionFee = useAppSelector(selectTransactionFeeWei);

	const formattedTransactionFee = useMemo(() => {
		return transactionFee ? formatDollars(transactionFee, { maxDecimals: 1 }) : NO_VALUE;
	}, [transactionFee]);

	return (
		<span data-testid="gas-price">
			{isL2 ? formattedTransactionFee : `${formatNumber(+customGasPrice, { minDecimals: 2 })} Gwei`}
		</span>
	);
});

const GasPriceSelect: FC<GasPriceSelectProps> = memo(({ ...rest }) => {
	const { t } = useTranslation();
	const isMainnet = useIsL1();

	return (
		<SummaryItem {...rest}>
			<SummaryItemLabel>
				{t(`common.summary.gas-prices.${isMainnet ? 'max-fee' : 'gas-price'}`)}
			</SummaryItemLabel>
			<SummaryItemValue>
				<GasPriceItem />
			</SummaryItemValue>
		</SummaryItem>
	);
});

export default GasPriceSelect;
