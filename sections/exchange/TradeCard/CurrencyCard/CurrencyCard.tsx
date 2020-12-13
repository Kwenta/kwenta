import { FC, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { Svg } from 'react-optimized-image';
import BigNumber from 'bignumber.js';

import { CurrencyKey } from 'constants/currency';
import { NO_VALUE } from 'constants/placeholder';

import CaretDownIcon from 'assets/svg/app/caret-down.svg';

import { formatCurrency, toBigNumber, zeroBN } from 'utils/formatters/number';

import Card from 'components/Card';
import NumericInput from 'components/Input/NumericInput';

import { FlexDivRowCentered, numericValueCSS, CapitalizedText } from 'styles/common';

import { Side } from '../types';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

type CurrencyCardProps = {
	side: Side;
	currencyKey: CurrencyKey | null;
	amount: string;
	onAmountChange: (value: string) => void;
	walletBalance: BigNumber | null;
	onBalanceClick: () => void;
	onCurrencySelect?: () => void;
	priceRate: number;
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
	priceRate,
	...rest
}) => {
	const { t } = useTranslation();
	const {
		selectPriceCurrencyRate,
		selectedPriceCurrency,
		getPriceAtCurrentRate,
	} = useSelectedPriceCurrency();

	const isBase = side === 'base';

	const hasWalletBalance = walletBalance != null && currencyKey != null;
	const amountBN = amount === '' ? zeroBN : toBigNumber(amount);

	const insufficientBalance = !isBase && hasWalletBalance ? amountBN.gt(walletBalance!) : false;

	let tradeAmount = amountBN.multipliedBy(priceRate);
	if (selectPriceCurrencyRate != null) {
		tradeAmount = getPriceAtCurrentRate(tradeAmount);
	}

	const currencyKeySelected = currencyKey != null;
	const hasCurrencySelectCallback = onCurrencySelect != null;

	return (
		<Card className="currency-card" {...rest}>
			<StyledCardBody>
				<LabelContainer data-testid="destination">
					{isBase ? t('exchange.common.into') : t('exchange.common.from')}
				</LabelContainer>
				<CurrencyContainer>
					<CurrencySelector
						currencyKeySelected={currencyKeySelected}
						onClick={hasCurrencySelectCallback ? onCurrencySelect : undefined}
						role="button"
						data-testid="currency-selector"
					>
						{currencyKey ?? (
							<CapitalizedText>
								{t('exchange.currency-card.currency-selector.no-value')}
							</CapitalizedText>
						)}{' '}
						{hasCurrencySelectCallback && <Svg src={CaretDownIcon} />}
					</CurrencySelector>
					{currencyKeySelected && (
						<CurrencyAmountContainer>
							<CurrencyAmount
								value={amount}
								onChange={(_, value) => onAmountChange(value)}
								placeholder="0"
								data-testid="currency-amount"
							/>
							<CurrencyAmountValue data-testid="amount-value">
								{formatCurrency(selectedPriceCurrency.name, tradeAmount, {
									sign: selectedPriceCurrency.sign,
								})}
							</CurrencyAmountValue>
						</CurrencyAmountContainer>
					)}
				</CurrencyContainer>
				<WalletBalanceContainer>
					<WalletBalanceLabel>{t('exchange.currency-card.wallet-balance')}</WalletBalanceLabel>
					<WalletBalance
						onClick={hasWalletBalance ? onBalanceClick : undefined}
						insufficientBalance={insufficientBalance}
						data-testid="wallet-balance"
					>
						{/* @ts-ignore */}
						{hasWalletBalance ? formatCurrency(currencyKey, walletBalance) : NO_VALUE}
					</WalletBalance>
				</WalletBalanceContainer>
			</StyledCardBody>
		</Card>
	);
};

const StyledCardBody = styled(Card.Body)`
	padding-top: 11px;
	padding-bottom: 11px;
`;

const LabelContainer = styled.div`
	padding-bottom: 2px;
	text-transform: capitalize;
`;

const CurrencyContainer = styled(FlexDivRowCentered)`
	padding-bottom: 6px;
`;

const CurrencySelector = styled.div<{
	currencyKeySelected: boolean;
	onClick: ((event: MouseEvent<HTMLDivElement, MouseEvent>) => void) | undefined;
}>`
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
	svg {
		color: ${(props) => props.theme.colors.goldColors.color1};
	}

	${(props) =>
		!props.currencyKeySelected &&
		css`
			margin: 12px 0 12px -10px;
		`};

	${(props) =>
		props.onClick &&
		css`
			&:hover {
				background-color: ${(props) => props.theme.colors.black};
				border-radius: 100px;
				cursor: pointer;
			}
		`};
`;

const CurrencyAmountContainer = styled.div`
	background-color: ${(props) => props.theme.colors.black};
	border-radius: 4px;
	width: 70%;
`;

const CurrencyAmount = styled(NumericInput)`
	font-size: 16px;
	border: 0;
	height: 30px;
`;

const CurrencyAmountValue = styled.div`
	${numericValueCSS};
	padding: 0px 8px 2px 8px;
	font-size: 10px;
	width: 150px;
	overflow: hidden;
	text-overflow: ellipsis;
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
