import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import Wei from '@synthetixio/wei';

import { NO_VALUE } from 'constants/placeholder';
import Currency from 'components/Currency';
import { SelectableCurrencyRow } from 'styles/common';
import useMarketClosed from 'hooks/useMarketClosed';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { isWalletConnectedState } from 'store/wallet';

type Token = {
	name: string;
	symbol: string;
	isSynth: boolean;
	logoURI?: string;
};

type TokenBalance = {
	currencyKey: string;
	balance: Wei;
	usdBalance?: Wei;
};

type SynthRowProps = {
	token: Token;
	balance?: TokenBalance;
	onClick: () => void;
};
const CurrencyRow: FC<SynthRowProps> = ({ token, onClick, balance }) => {
	const { t } = useTranslation();
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	const currencyKey = token.symbol;

	const { marketClosureReason } = useMarketClosed(
		token.isSynth ? (currencyKey as CurrencyKey) : null
	);

	return (
		<StyledSelectableCurrencyRow key={currencyKey} onClick={onClick} isSelectable={true}>
			<Currency.Name
				name={
					token.isSynth
						? t('common.currency.synthetic-currency-name', {
								currencyName: token.name,
						  })
						: token.name
				}
				showIcon={true}
				iconProps={
					!token.isSynth
						? {
								url: token.logoURI,
						  }
						: undefined
				}
				{...{ currencyKey, marketClosureReason }}
			/>
			{isWalletConnected ? (
				<Currency.Amount
					amount={balance?.balance ?? 0}
					totalValue={balance?.usdBalance ?? 0}
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

export default CurrencyRow;
