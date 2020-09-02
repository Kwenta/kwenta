import { useTranslation } from 'react-i18next';
import { FC, ChangeEvent } from 'react';
import styled from 'styled-components';

import { CurrencyKey } from 'constants/currency';
import { NO_VALUE } from 'constants/placeholder';

import CaretDownIcon from 'assets/svg/app/caret-down.svg';

import { formatCryptoCurrency } from 'utils/formatters/number';

import Card from 'components/Card';
import NumericInput from 'components/Input/NumericInput';

import { FlexDivCentered, FlexDivRowCentered, numericValueCSS } from 'styles/common';

type CurrencyCardProps = {
	side: 'base' | 'quote';
	currencyKey?: CurrencyKey;
	amount: string;
	onAmountChange: ((event: ChangeEvent<HTMLInputElement>) => void) | undefined;
	walletBalance: number | null;
	onBalanceClick: () => void | undefined;
	onCurrencySelect: () => void;
};

const CurrencyCard: FC<CurrencyCardProps> = ({
	side,
	currencyKey,
	amount,
	onAmountChange,
	walletBalance,
	onBalanceClick,
	onCurrencySelect,
	...rest
}) => {
	const { t } = useTranslation();

	const isBase = side === 'base';

	return (
		<StyledCard {...rest}>
			<Card.Body>
				<LabelContainer>
					{isBase ? t('exchange.currency-card.into') : t('exchange.currency-card.from')}
				</LabelContainer>
				<CurrencyContainer>
					<CurrencySelector onClick={onCurrencySelect}>
						{currencyKey || t('exchange.currency-selector.no-value')} <CaretDownIcon />
					</CurrencySelector>
					{currencyKey && (
						<CurrencyAmount value={amount} onChange={onAmountChange} placeholder="0" />
					)}
				</CurrencyContainer>
				<WalletBalanceContainer>
					<WalletBalanceLabel>{t('exchange.currency-card.wallet-balance')}</WalletBalanceLabel>
					<WalletBalance onClick={onBalanceClick || undefined}>
						{walletBalance == null ? NO_VALUE : formatCryptoCurrency(walletBalance)}
					</WalletBalance>
				</WalletBalanceContainer>
			</Card.Body>
		</StyledCard>
	);
};

const StyledCard = styled(Card)`
	width: 312px;
`;

const LabelContainer = styled.div`
	padding-bottom: 13px;
	text-transform: capitalize;
`;

const CurrencyContainer = styled(FlexDivCentered)`
	padding-bottom: 6px;
`;

const CurrencySelector = styled.div`
	display: grid;
	align-items: center;
	grid-auto-flow: column;
	grid-gap: 9px;
	margin-right: 20px;
	font-size: 16px;
	padding: 4px 10px;
	margin-left: -10px;
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.white};
	&:hover {
		background-color: ${(props) => props.theme.colors.black};
		border-radius: 100px;
		cursor: pointer;
	}
	svg {
		color: ${(props) => props.theme.colors.purple};
	}
`;

const CurrencyAmount = styled(NumericInput)`
	font-size: 16px;
`;

const WalletBalanceContainer = styled(FlexDivRowCentered)``;

const WalletBalanceLabel = styled.div`
	text-transform: capitalize;
	font-family: ${(props) => props.theme.fonts.bold};
`;

const WalletBalance = styled.div`
	${numericValueCSS};
	cursor: ${(props) => (props.onClick ? 'pointer' : 'default')};
`;

export default CurrencyCard;
