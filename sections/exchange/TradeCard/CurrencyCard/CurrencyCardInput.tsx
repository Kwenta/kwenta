import Wei, { wei } from '@synthetixio/wei';
import { FC, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Button from 'components/Button';
import NumericInput from 'components/Input/NumericInput';
import { FlexDivCol, FlexDivRowCentered } from 'components/layout/flex';
import Loader from 'components/Loader';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { CapitalizedText, numericValueCSS } from 'styles/common';
import { formatDollars, zeroBN } from 'utils/formatters/number';

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
	currencyKeySelected: boolean;
	priceRate?: Wei | number | null;
};

const CurrencyCardInputLabel: FC<{ label: string }> = memo(({ label }) => {
	return <InputLabel data-testid="destination">{label}</InputLabel>;
});

const CurrencyCardInputMaxButton: FC<{ onClick?: () => void }> = memo(({ onClick }) => {
	const { t } = useTranslation();

	return (
		<MaxButton onClick={onClick} noOutline>
			<CapitalizedText>{t('exchange.currency-card.max-button')}</CapitalizedText>
		</MaxButton>
	);
});

const CurrencyCardInput: FC<CurrencyCardInputProps> = memo(
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
		currencyKeySelected,
		priceRate,
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
							<CurrencyCardInputMaxButton onClick={hasWalletBalance ? onBalanceClick : undefined} />
						)}
					</FlexDivRowCentered>
					<FlexDivRowCentered>
						<CurrencyCardInputAmountValue
							amount={amount}
							currencyKeySelected={currencyKeySelected}
							priceRate={priceRate}
						/>
					</FlexDivRowCentered>
					{isLoading && <StyledLoader width="24px" height="24px" />}
				</CurrencyAmountContainer>
			</InputContainer>
		);
	}
);

const CurrencyCardInputAmountValue = memo(({ currencyKeySelected, amount, priceRate }: any) => {
	const { selectPriceCurrencyRate, getPriceAtCurrentRate } = useSelectedPriceCurrency();

	const tradeAmount = useMemo(() => {
		const amountBN = amount === '' ? zeroBN : wei(amount);
		let current = priceRate ? amountBN.mul(priceRate) : null;

		if (!!selectPriceCurrencyRate && !!current) {
			current = getPriceAtCurrentRate(current);
		}

		return current;
	}, [priceRate, selectPriceCurrencyRate, getPriceAtCurrentRate, amount]);

	return (
		<CurrencyAmountValue data-testid="amount-value">
			{currencyKeySelected && !!tradeAmount ? formatDollars(tradeAmount, { sign: '$' }) : null}
		</CurrencyAmountValue>
	);
});

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

export default CurrencyCardInput;
