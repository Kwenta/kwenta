import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { SynthBalance } from 'queries/walletBalances/useSynthsBalancesQuery';

import { NO_VALUE } from 'constants/placeholder';

import { Synth } from 'lib/synthetix';

import Currency from 'components/Currency';

import { SelectableCurrencyRow } from 'styles/common';

import useMarketClosed from 'hooks/useMarketClosed';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import { isWalletConnectedState } from 'store/wallet';

type SynthRowProps = {
	synth: Synth;
	onClick: () => void;
	synthBalance?: SynthBalance;
};
const SynthRow: FC<SynthRowProps> = ({ synth, onClick, synthBalance }) => {
	const { t } = useTranslation();
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	const currencyKey = synth.name;

	const { marketClosureReason } = useMarketClosed(currencyKey);

	return (
		<StyledSelectableCurrencyRow key={currencyKey} onClick={onClick} isSelectable={true}>
			<Currency.Name
				name={t('common.currency.synthetic-currency-name', {
					currencyName: synth.description,
				})}
				showIcon={true}
				{...{ currencyKey, marketClosureReason }}
			/>
			{isWalletConnected ? (
				<Currency.Amount
					amount={synthBalance?.balance ?? 0}
					totalValue={synthBalance?.usdBalance ?? 0}
					sign={selectedPriceCurrency.sign}
					conversionRate={selectPriceCurrencyRate}
					{...{ currencyKey }}
				/>
			) : (
				NO_VALUE
			)}
		</StyledSelectableCurrencyRow>
	);
};

const StyledSelectableCurrencyRow = styled(SelectableCurrencyRow)`
	padding: 5px 16px;
`;

export default SynthRow;
