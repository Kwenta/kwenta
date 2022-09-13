import Wei from '@synthetixio/wei';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Button from 'components/Button';
import NumericInput from 'components/Input/NumericInput';
import Loader from 'components/Loader';
import { CapitalizedText, FlexDivCol, FlexDivRowCentered, numericValueCSS } from 'styles/common';
import { formatCurrency, formatPercent } from 'utils/formatters/number';

type CurrencyCardInputProps = {
	label: string;
	isBase: boolean;
	disabled?: boolean;
	amount: string;
	onAmountChange(value: string): void;
	hasWalletBalance: boolean;
	onBalanceClick(): void;
	isLoading: boolean;
	disableInput: boolean;
	tradeAmount: Wei | null;
	slippagePercent?: Wei | null;
	currencyKeySelected: boolean;
};

const CurrencyCardInputLabel: React.FC<{ label: string }> = React.memo(({ label }) => {
	return <InputLabel data-testid="destination">{label}</InputLabel>;
});

const CurrencyCardInput: React.FC<CurrencyCardInputProps> = React.memo(
	({
		label,
		isBase,
		disabled,
		amount,
		onAmountChange,
		hasWalletBalance,
		onBalanceClick,
		isLoading,
		disableInput,
		tradeAmount,
		slippagePercent,
		currencyKeySelected,
	}) => {
		const { t } = useTranslation();

		return (
			<InputContainer>
				<CurrencyCardInputLabel label={label} />
				<CurrencyAmountContainer className="currency-amount-container" disableInput={disableInput}>
					<FlexDivRowCentered>
						<CurrencyAmount
							disabled={disabled}
							value={amount}
							onChange={(_, value) => {
								onAmountChange(value);
							}}
							placeholder={t('exchange.currency-card.amount-placeholder')}
							data-testid="currency-amount"
						/>
						{!isBase && (
							<MaxButton onClick={hasWalletBalance ? onBalanceClick : undefined} noOutline>
								<CapitalizedText>{t('exchange.currency-card.max-button')}</CapitalizedText>
							</MaxButton>
						)}
					</FlexDivRowCentered>
					<FlexDivRowCentered>
						<CurrencyAmountValue data-testid="amount-value">
							{currencyKeySelected && tradeAmount != null
								? formatCurrency('sUSD', tradeAmount, { sign: '$' })
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
		);
	}
);

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

const MaxButton = styled(Button)`
	width: 40px;
	height: 21px;
	font-size: 11px;
	padding: 0px 10px;
	margin: 10px 15px 0px 0px;
	font-family: ${(props) => props.theme.fonts.mono};
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

const StyledLoader = styled(Loader)`
	left: 90%;
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

export default CurrencyCardInput;
