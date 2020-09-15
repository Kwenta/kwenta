import { useTranslation } from 'react-i18next';
import { FC, ChangeEvent } from 'react';
import styled, { css } from 'styled-components';

import { CurrencyKey } from 'constants/currency';
import { NO_VALUE } from 'constants/placeholder';

import CaretDownIcon from 'assets/svg/app/caret-down.svg';

import { formatCurrency } from 'utils/formatters/number';

import Card from 'components/Card';
import NumericInput from 'components/Input/NumericInput';

import {
	FlexDivCentered,
	FlexDivRowCentered,
	numericValueCSS,
	CapitalizedText,
} from 'styles/common';

import { Side } from '../types';

type CurrencyCardProps = {
	side: Side;
	currencyKey: CurrencyKey | null;
	amount: string;
	onAmountChange: (event: ChangeEvent<HTMLInputElement>) => void;
	walletBalance: number | null;
	onBalanceClick: () => void | undefined;
	onCurrencySelect: () => void;
	className?: string;
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

	const hasWalletBalance = walletBalance != null && currencyKey != null;
	const insufficientBalance =
		!isBase && hasWalletBalance ? Number(amount) > Number(walletBalance) : false;

	return (
		<Card {...rest}>
			<Card.Body>
				<LabelContainer>
					{isBase ? t('exchange.common.into') : t('exchange.common.from')}
				</LabelContainer>
				<CurrencyContainer>
					<CurrencySelector onClick={onCurrencySelect}>
						{currencyKey ?? (
							<CapitalizedText>
								{t('exchange.currency-card.currency-selector.no-value')}
							</CapitalizedText>
						)}{' '}
						<CaretDownIcon />
					</CurrencySelector>
					{currencyKey != null && (
						<CurrencyAmount value={amount} onChange={onAmountChange} placeholder="0" />
					)}
				</CurrencyContainer>
				<WalletBalanceContainer>
					<WalletBalanceLabel>{t('exchange.currency-card.wallet-balance')}</WalletBalanceLabel>
					<WalletBalance
						onClick={hasWalletBalance ? onBalanceClick : undefined}
						insufficientBalance={insufficientBalance}
					>
						{/* @ts-ignore */}
						{hasWalletBalance ? formatCurrency(currencyKey, walletBalance) : NO_VALUE}
					</WalletBalance>
				</WalletBalanceContainer>
			</Card.Body>
		</Card>
	);
};

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

const WalletBalance = styled.div<{ insufficientBalance: boolean }>`
	${numericValueCSS};
	cursor: ${(props) => (props.onClick ? 'pointer' : 'default')};
	${(props) =>
		props.insufficientBalance &&
		css`
			color: ${props.theme.colors.red};
		`}
`;

export default CurrencyCard;
