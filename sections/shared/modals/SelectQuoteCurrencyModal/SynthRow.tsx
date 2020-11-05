import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import synthetix from 'lib/synthetix';

import Currency from 'components/Currency';

import useMarketClosed from 'hooks/useMarketClosed';

import { SynthBalance } from 'queries/walletBalances/useSynthsBalancesQuery';

import { SelectableCurrencyRow } from 'styles/common';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

type SynthRowProps = {
	synth: SynthBalance;
	onClick: () => void;
};
const SynthRow: FC<SynthRowProps> = ({ synth, onClick }) => {
	const { t } = useTranslation();
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();

	const { synthsMap } = synthetix;
	const { currencyKey, usdBalance, balance } = synth;
	const synthDesc = synthsMap != null ? synthsMap[currencyKey]?.description : null;

	const totalValue = usdBalance;

	const { marketClosureReason } = useMarketClosed(currencyKey);

	return (
		<StyledSelectableCurrencyRow onClick={onClick} isSelectable={true}>
			<Currency.Name
				currencyKey={currencyKey}
				name={t('common.currency.synthetic-currency-name', {
					currencyName: synthDesc,
				})}
				showIcon={true}
				marketClosureReason={marketClosureReason}
			/>
			<Currency.Amount
				currencyKey={currencyKey}
				amount={balance}
				totalValue={totalValue}
				sign={selectedPriceCurrency.sign}
				conversionRate={selectPriceCurrencyRate}
			/>
		</StyledSelectableCurrencyRow>
	);
};

const StyledSelectableCurrencyRow = styled(SelectableCurrencyRow)`
	padding: 5px 16px;
`;

export default SynthRow;
