import { FC, MouseEvent, ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { CurrencyKey } from 'constants/currency';
import { NO_VALUE } from 'constants/placeholder';

import CaretDownIcon from 'assets/svg/app/caret-down-gray.svg';

import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';

import Card from 'components/Card';
import NumericInput from 'components/Input/NumericInput';
import Loader from 'components/Loader';

import {
	FlexDivRowCentered,
	numericValueCSS,
	CapitalizedText,
	FlexDivColCentered,
	FlexDivCol,
	FlexDivRow,
} from 'styles/common';
import { border } from 'components/Button';
import { Side } from '../types';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { TxProvider } from 'sections/shared/modals/TxConfirmationModal/TxConfirmationModal';
import Wei, { wei } from '@synthetixio/wei';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import Connector from 'containers/Connector';
import Button from 'components/Button';

type CurrencyCardProps = {
	side: Side;
	currencyKey: string | null;
	amount: string;
	onAmountChange: (value: string) => void;
	walletBalance: Wei | null;
	onBalanceClick: () => void;
	onCurrencySelect?: () => void;
	priceRate: Wei | number | string | null;
	className?: string;
	label: ReactNode;
	interactive?: boolean;
	disableInput?: boolean;
	slippagePercent?: Wei | null;
	isLoading?: boolean;
	txProvider?: TxProvider;
};

const CurrencyCard: FC<CurrencyCardProps> = ({
	side,
	currencyKey,
	amount,
	slippagePercent,
	onAmountChange,
	walletBalance,
	onBalanceClick,
	onCurrencySelect,
	priceRate,
	label,
	interactive = true,
	disableInput = false,
	isLoading = false,
	txProvider = 'synthetix',
	...rest
}) => {
	const { t } = useTranslation();
	const {
		selectPriceCurrencyRate,
		selectedPriceCurrency,
		getPriceAtCurrentRate,
	} = useSelectedPriceCurrency();

	const isBase = useMemo(() => side === 'base', [side]);

	const hasWalletBalance = useMemo(() => walletBalance != null && currencyKey != null, [
		walletBalance,
		currencyKey,
	]);
	const amountBN = useMemo(() => (amount === '' ? zeroBN : wei(amount)), [amount]);

	const insufficientBalance = !isBase && hasWalletBalance ? amountBN.gt(walletBalance!) : false;

	let tradeAmount = priceRate ? amountBN.mul(priceRate) : null;
	if (selectPriceCurrencyRate != null && tradeAmount != null) {
		tradeAmount = getPriceAtCurrentRate(tradeAmount);
	}

	const currencyKeySelected = currencyKey != null;
	const hasCurrencySelectCallback = onCurrencySelect != null;
	const { synthsMap } = Connector.useContainer();

	return (
		<StyledCard
			className={`currency-card currency-card-${side}`}
			interactive={interactive}
			{...rest}
		>
			<StyledCardBody className="currency-card-body">
				<CurrencyContainer className="currency-container">
					<InputContainer>
						<InputLabel data-testid="destination">{label}</InputLabel>
						<CurrencyAmountContainer
							className="currency-amount-container"
							disableInput={disableInput}
						>
							<FlexDivRowCentered>
								<CurrencyAmount
									value={amount}
									onChange={(_, value) => onAmountChange(value)}
									placeholder={t('exchange.currency-card.amount-placeholder')}
									data-testid="currency-amount"
								/>
								{!isBase && (
									<MaxButton onClick={hasWalletBalance ? onBalanceClick : undefined}>
										<CapitalizedText>{t('exchange.currency-card.max-button')}</CapitalizedText>
									</MaxButton>
								)}
							</FlexDivRowCentered>
							<FlexDivRowCentered>
								<CurrencyAmountValue data-testid="amount-value">
									{currencyKeySelected && tradeAmount != null
										? formatCurrency(selectedPriceCurrency.name as CurrencyKey, tradeAmount, {
												sign: selectedPriceCurrency.sign,
										  })
										: null}
								</CurrencyAmountValue>
								<Slippage>
									{!isLoading &&
										slippagePercent != null &&
										slippagePercent.lt(0) &&
										formatPercent(slippagePercent)}
								</Slippage>
							</FlexDivRowCentered>
							{isLoading && <StyledLoader width="24px" height="24px" />}
						</CurrencyAmountContainer>
					</InputContainer>

					<SelectorContainer>
						<CurrencyNameLabel data-testid="currency-name">
							{currencyKeySelected
								? t('common.currency.synthetic-currency-name', {
										currencyName: synthsMap[currencyKey as CurrencyKey]?.description,
								  })
								: t('exchange.currency-card.synth-name')}
						</CurrencyNameLabel>
						<CurrencySelector
							currencyKeySelected={currencyKeySelected}
							onClick={hasCurrencySelectCallback ? onCurrencySelect : undefined}
							role="button"
							data-testid="currency-selector"
						>
							<TokenLabel>
								{currencyKeySelected && (
									<CurrencyIcon
										currencyKey={currencyKey as CurrencyKey}
										width="25px"
										height="25px"
									/>
								)}
								{currencyKey ?? (
									<CapitalizedText>
										{txProvider === '1inch'
											? t('exchange.currency-card.currency-selector.select-token')
											: t('exchange.currency-card.currency-selector.select-synth')}
									</CapitalizedText>
								)}
							</TokenLabel>
							{hasCurrencySelectCallback && <CaretDownIcon />}
						</CurrencySelector>
						<WalletBalanceContainer disableInput={disableInput}>
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
					</SelectorContainer>
				</CurrencyContainer>
			</StyledCardBody>
		</StyledCard>
	);
};

const MaxButton = styled(Button)`
	width: 40px;
	height: 21px;
	font-size: 11px;
	padding: 0px 10px;
	margin: 16px 16px 0px 0px;
	font-family: ${(props) => props.theme.fonts.mono};
`;
const TokenLabel = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	gap: 10px;
`;

const StyledCard = styled(Card)<{ interactive?: boolean }>`
	${(props) =>
		!props.interactive &&
		css`
			pointer-events: none;
		`}
`;

const StyledCardBody = styled(Card.Body)`
	padding: 20px 32px;
`;

const InputContainer = styled(FlexDivCol)`
	row-gap: 21px;
`;

const InputLabel = styled.div`
	text-transform: capitalize;
	color: ${(props) => props.theme.colors.common.primaryGold};
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.regular};
	line-height: 0.75em;
	padding-top: 6px;
	margin-left: 16px;
`;

const SelectorContainer = styled(FlexDivColCentered)`
	row-gap: 18px;
`;

const CurrencyContainer = styled(FlexDivRowCentered)`
	gap: 20px;
`;

const CurrencySelector = styled.div<{
	currencyKeySelected: boolean;
	onClick: ((event: MouseEvent<HTMLDivElement, MouseEvent>) => void) | undefined;
	interactive?: boolean;
}>`
	display: flex;
	justify-content: space-between;
	height: 43px;
	width: 180px;
	padding: 12px;
	font-size: 18px;
	line-height: 1em;
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.common.primaryWhite};
	svg {
		color: ${(props) => props.theme.colors.goldColors.color1};
	}

	background: ${(props) => props.theme.colors.selectedTheme.button.background};
	box-shadow: ${(props) => props.theme.colors.selectedTheme.button.shadow};
	border-radius: 10px;
	box-sizing: border-box;
	position: relative;
	${border}

	&:hover {
		background: ${(props) => props.theme.colors.selectedTheme.button.hover};
	}

	${(props) => !props.currencyKeySelected && css``};

	${(props) =>
		props.onClick &&
		css`
			&:hover {
				background-color: ${(props) => props.theme.colors.selectedTheme.button.hover};
				cursor: pointer;
			}
		`};
`;

const CurrencyAmountContainer = styled.div<{ disableInput?: boolean }>`
	background: ${(props) => props.theme.colors.inputGradient};
	border: ${(props) => props.theme.colors.selectedTheme.border};
	box-sizing: border-box;
	box-shadow: ${(props) => props.theme.colors.inputHighlight};
	border-radius: 8px;
	height: 84px;
	width: 290px;
	position: relative;
	${(props) =>
		props.disableInput &&
		css`
			pointer-events: none;
		`}
`;

const CurrencyAmount = styled(NumericInput)`
	margin-top: 10px;
	padding: 10px 16px;
	font-size: 16px;
	border: 0;
	height: 30px;
	font-size: 30px;
	line-height: 2.25em;
	letter-spacing: -1px;
`;

const CurrencyAmountValue = styled.div`
	${numericValueCSS};
	padding: 8px 8px 2px 16px;
	font-size: 14px;
	line-height: 1.25em;
	width: 150px;
	overflow: hidden;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;

const Slippage = styled.div`
	${numericValueCSS};
	padding: 0px 8px 2px 8px;
	font-size: 11px;
	color: ${(props) => props.theme.colors.yellow};
`;

const CurrencyNameLabel = styled.div`
	text-transform: capitalize;
	text-align: left;
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.regular};
	line-height: 1.25em;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	width: 180px;
	padding-left: 12px;
`;

const WalletBalanceContainer = styled(FlexDivRow)<{ disableInput?: boolean }>`
	${(props) =>
		props.disableInput &&
		css`
			pointer-events: none;
		`}
	width: 160px;
`;

const WalletBalanceLabel = styled.div`
	text-transform: capitalize;
	font-size: 13px;
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`;

const WalletBalance = styled.div<{ insufficientBalance: boolean }>`
	${numericValueCSS};
	font-size: 13px;
	font-family: ${(props) => props.theme.fonts.mono};
	cursor: ${(props) => (props.onClick ? 'pointer' : 'default')};
	${(props) =>
		props.insufficientBalance &&
		css`
			color: ${props.theme.colors.red};
		`}
	color: ${(props) => props.theme.colors.common.primaryWhite};
`;

const StyledLoader = styled(Loader)`
	left: 90%;
`;

export default CurrencyCard;
