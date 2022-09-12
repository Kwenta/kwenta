import Wei, { wei } from '@synthetixio/wei';
import { FC, ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSetRecoilState } from 'recoil';
import styled, { css } from 'styled-components';

import CaretDownIcon from 'assets/svg/app/caret-down-gray.svg';
import { border } from 'components/Button';
import Button from 'components/Button';
import Card from 'components/Card';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import NumericInput from 'components/Input/NumericInput';
import Loader from 'components/Loader';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import { CurrencyKey } from 'constants/currency';
import { NO_VALUE } from 'constants/placeholder';
import Connector from 'containers/Connector';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { SectionHeader, SectionSubTitle, SectionTitle } from 'sections/futures/MobileTrade/common';
import { ratioState } from 'store/exchange';
import {
	FlexDivRowCentered,
	numericValueCSS,
	CapitalizedText,
	FlexDivColCentered,
	FlexDivCol,
	FlexDivRow,
} from 'styles/common';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';

import { Side } from '../types';

type CurrencyCardProps = {
	side: Side;
	currencyKey: string | null;
	currencyName: string | null;
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
	disabled?: boolean;
};

const CurrencyCard: FC<CurrencyCardProps> = ({
	side,
	currencyKey,
	currencyName,
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
	disabled,
	...rest
}) => {
	const { t } = useTranslation();
	const {
		selectPriceCurrencyRate,
		selectedPriceCurrency,
		getPriceAtCurrentRate,
	} = useSelectedPriceCurrency();

	const isBase = useMemo(() => side === 'base', [side]);

	const hasWalletBalance = useMemo(() => !!walletBalance && !!currencyKey, [
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

	const setRatio = useSetRecoilState(ratioState);

	const tokenName =
		currencyKey && synthsMap[currencyKey]
			? t('common.currency.synthetic-currency-name', {
					currencyName,
			  })
			: currencyName || t('exchange.currency-card.synth-name');

	return (
		<>
			<DesktopOnlyView>
				<CardContainer>
					<StyledCard
						data-testid={'currency-card-' + side}
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
												disabled={disabled}
												value={amount}
												onChange={(_, value) => {
													onAmountChange(value);
													setRatio(undefined);
												}}
												placeholder={t('exchange.currency-card.amount-placeholder')}
												data-testid="currency-amount"
											/>
											{!isBase && (
												<MaxButton
													onClick={hasWalletBalance ? onBalanceClick : undefined}
													noOutline
												>
													<CapitalizedText>
														{t('exchange.currency-card.max-button')}
													</CapitalizedText>
												</MaxButton>
											)}
										</FlexDivRowCentered>
										<FlexDivRowCentered>
											<CurrencyAmountValue data-testid="amount-value">
												{currencyKeySelected && tradeAmount != null
													? formatCurrency(selectedPriceCurrency.name, tradeAmount, {
															sign: selectedPriceCurrency.sign,
													  })
													: null}
											</CurrencyAmountValue>
											<Slippage>
												{!isLoading &&
													slippagePercent?.lt(0) &&
													formatPercent(slippagePercent) + t('exchange.currency-card.slippage')}
											</Slippage>
										</FlexDivRowCentered>
										{isLoading && <StyledLoader width="24px" height="24px" />}
									</CurrencyAmountContainer>
								</InputContainer>

								<SelectorContainer>
									<CurrencyNameLabel data-testid="currency-name">{tokenName}</CurrencyNameLabel>
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
													{t('exchange.currency-card.currency-selector.select-token')}
												</CapitalizedText>
											)}
										</TokenLabel>
										{hasCurrencySelectCallback && <CaretDownIcon />}
									</CurrencySelector>
									<WalletBalanceContainer disableInput={disableInput}>
										<WalletBalanceLabel>
											{t('exchange.currency-card.wallet-balance')}
										</WalletBalanceLabel>
										<WalletBalance
											onClick={hasWalletBalance ? onBalanceClick : undefined}
											insufficientBalance={insufficientBalance}
											data-testid="wallet-balance"
										>
											{hasWalletBalance ? formatCurrency(currencyKey!, walletBalance!) : NO_VALUE}
										</WalletBalance>
									</WalletBalanceContainer>
								</SelectorContainer>
							</CurrencyContainer>
						</StyledCardBody>
					</StyledCard>
				</CardContainer>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<div>
					<SectionHeader>
						<SectionTitle>{label}</SectionTitle>
						<SectionSubTitle
							onClick={hasWalletBalance ? onBalanceClick : undefined}
							style={{ cursor: 'pointer' }}
						>
							Balance: {hasWalletBalance ? formatCurrency(currencyKey!, walletBalance!) : NO_VALUE}
						</SectionSubTitle>
					</SectionHeader>
					<MainInput>
						<div>
							<SwapTextInput
								value={amount}
								onChange={(_, value) => {
									onAmountChange(value);
									setRatio(undefined);
								}}
								placeholder={t('exchange.currency-card.amount-placeholder')}
								disabled={disabled}
							/>
							<SwapCurrencyPrice data-testid="amount-value">
								{currencyKeySelected && tradeAmount != null
									? formatCurrency(selectedPriceCurrency.name, tradeAmount, {
											sign: selectedPriceCurrency.sign,
									  })
									: null}
							</SwapCurrencyPrice>
						</div>
						<MobileCurrencySelector
							currencyKeySelected={currencyKeySelected}
							onClick={hasCurrencySelectCallback ? onCurrencySelect : undefined}
							data-testid="currency-selector"
						>
							{currencyKeySelected && (
								<CurrencyIcon currencyKey={currencyKey as CurrencyKey} width="20px" height="20px" />
							)}
							<div className="label">{currencyKey ?? 'Select'}</div>
							{hasCurrencySelectCallback && <CaretDownIcon />}
						</MobileCurrencySelector>
					</MainInput>
				</div>
			</MobileOrTabletView>
		</>
	);
};

const MaxButton = styled(Button)`
	width: 40px;
	height: 21px;
	font-size: 11px;
	padding: 0px 10px;
	margin: 10px 15px 0px 0px;
	font-family: ${(props) => props.theme.fonts.mono};
`;

const TokenLabel = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	gap: 10px;
`;

const CardContainer = styled.div`
	display: grid;
	height: 183px;
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
	color: ${(props) => props.theme.colors.selectedTheme.gold};
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
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	svg {
		color: ${(props) => props.theme.colors.goldColors.color1};
	}
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

const MobileCurrencySelector = styled.button<{
	currencyKeySelected: boolean;
}>`
	background: ${(props) => props.theme.colors.selectedTheme.button.fill};
	padding: 6px;
	padding-left: 5px;
	border-radius: 12px;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	color: ${(props) => props.theme.colors.selectedTheme.text.value};
	display: flex;
	align-items: center;

	.label {
		margin-left: 6px;
		margin-right: 6px;
		font-family: ${(props) => props.theme.fonts.regular};
		font-size: 15px;
	}

	svg {
		margin-top: -2px;
	}
`;

const CurrencyAmountContainer = styled.div<{ disableInput?: boolean }>`
	background: ${(props) => props.theme.colors.selectedTheme.input.background};
	border: ${(props) => props.theme.colors.selectedTheme.border};
	box-sizing: border-box;
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
	background: transparent;
`;

const CurrencyAmountValue = styled.div`
	${numericValueCSS};
	padding: 8px 8px 2px 16px;
	font-size: 14px;
	line-height: 1.25em;
	width: 150px;
	overflow: hidden;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`;

const Slippage = styled.div`
	${numericValueCSS};
	padding: 0px 8px 2px 8px;
	font-size: 11px;
	color: ${(props) => props.theme.colors.selectedTheme.gold};
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
			color: ${props.theme.colors.selectedTheme.red};
		`}
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`;

const StyledLoader = styled(Loader)`
	left: 90%;
`;

const MainInput = styled.div`
	box-sizing: border-box;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 10px;
	padding: 10px;
	padding-left: 0;
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 15px;
`;

const SwapTextInput = styled(NumericInput)`
	background-color: transparent;
	border: none;
	color: ${(props) => props.theme.colors.selectedTheme.text.value};
	font-size: 18px;
	font-family: ${(props) => props.theme.fonts.mono};
	margin-bottom: 10px;
	height: initial;

	&:focus {
		outline: none;
	}
`;

const SwapCurrencyPrice = styled.div`
	font-size: 12px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	height: 12px;
	margin-left: 10px;
`;

export default CurrencyCard;
