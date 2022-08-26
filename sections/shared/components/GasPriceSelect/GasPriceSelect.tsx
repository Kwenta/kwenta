import { NetworkId } from '@synthetixio/contracts-interface';
import { GasPrices } from '@synthetixio/queries';
import Wei from '@synthetixio/wei';
import { FC } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { useNetwork, chain } from 'wagmi';

import { NO_VALUE } from 'constants/placeholder';
import { parseGasPriceObject } from 'hooks/useGas';
import useIsL2 from 'hooks/useIsL2';
import { customGasPriceState, gasSpeedState } from 'store/wallet';
import { formatCurrency, formatNumber } from 'utils/formatters/number';

import { SummaryItem, SummaryItemValue, SummaryItemLabel } from '../common';

type GasPriceSelectProps = {
	gasPrices: GasPrices | undefined;
	transactionFee?: Wei | number | null;
	className?: string;
};

const GasPriceSelect: FC<GasPriceSelectProps> = ({ gasPrices, transactionFee, ...rest }) => {
	const { t } = useTranslation();
	const gasSpeed = useRecoilValue(gasSpeedState);
	const customGasPrice = useRecoilValue(customGasPriceState);
	const { chain: network } = useNetwork();
	const isL2 = useIsL2(network?.id as NetworkId);
	const isMainnet =
		network !== undefined ? [chain.mainnet.id, chain.goerli.id].includes(network?.id) : false;

	const formattedTransactionFee = useMemo(() => {
		return transactionFee
			? formatCurrency('sUSD', transactionFee, { sign: '$', maxDecimals: 1 })
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
