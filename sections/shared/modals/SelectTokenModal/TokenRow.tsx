import { FC } from 'react';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';
import BigNumber from 'bignumber.js';
import startCase from 'lodash/startCase';

import { Synth } from 'lib/synthetix';

import { NO_VALUE } from 'constants/placeholder';

import Currency from 'components/Currency';

import { SelectableCurrencyRow } from 'styles/common';

import { Token } from 'queries/tokenLists/types';

import { isWalletConnectedState } from 'store/wallet';

type TokenRowProps = {
	token: Token;
	onClick: () => void;
	balance?: BigNumber;
	totalValue?: BigNumber;
	selectedPriceCurrency: Synth;
	selectPriceCurrencyRate: number | null;
};
const TokenRow: FC<TokenRowProps> = ({
	token,
	onClick,
	balance,
	totalValue,
	selectedPriceCurrency,
	selectPriceCurrencyRate,
}) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	const currencyKey = token.symbol;

	return (
		<StyledSelectableCurrencyRow key={currencyKey} onClick={onClick} isSelectable={true}>
			<Currency.Name
				name={startCase(token.name)}
				showIcon={true}
				iconProps={{ type: 'token' }}
				{...{ currencyKey }}
			/>
			{isWalletConnected ? (
				<Currency.Amount
					amount={balance ?? 0}
					totalValue={totalValue ?? 0}
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

export default TokenRow;
