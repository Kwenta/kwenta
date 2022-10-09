import Wei from '@synthetixio/wei';
import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import CaretDownIcon from 'assets/svg/app/caret-down-gray.svg';
import { border } from 'components/Button';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import { NO_VALUE } from 'constants/placeholder';
import { CapitalizedText, FlexDivColCentered, FlexDivRow, numericValueCSS } from 'styles/common';
import { formatCurrency } from 'utils/formatters/number';

type CurrencyCardSelectorProps = {
	tokenName: string | null;
	hasCurrencySelectCallback: boolean;
	onCurrencySelect?: () => void;
	currencyKey: string | null;
	disableInput: boolean;
	hasWalletBalance: boolean;
	onBalanceClick(): void;
	insufficientBalance: boolean;
	walletBalance?: Wei | null;
};

const CurrencyCardSelector: FC<CurrencyCardSelectorProps> = memo(
	({
		tokenName,
		hasCurrencySelectCallback,
		onCurrencySelect,
		currencyKey,
		disableInput,
		hasWalletBalance,
		onBalanceClick,
		insufficientBalance,
		walletBalance,
	}) => {
		const { t } = useTranslation();
		return (
			<SelectorContainer>
				<CurrencyNameLabel data-testid="currency-name">{tokenName}</CurrencyNameLabel>
				<CurrencySelector
					currencyKeySelected={!!currencyKey}
					onClick={hasCurrencySelectCallback ? onCurrencySelect : undefined}
					role="button"
					data-testid="currency-selector"
				>
					<TokenLabel>
						{!!currencyKey && <CurrencyIcon currencyKey={currencyKey} width="25px" height="25px" />}
						{currencyKey ?? (
							<CapitalizedText>
								{t('exchange.currency-card.currency-selector.select-token')}
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
						{hasWalletBalance ? formatCurrency(currencyKey!, walletBalance!) : NO_VALUE}
					</WalletBalance>
				</WalletBalanceContainer>
			</SelectorContainer>
		);
	}
);

const TokenLabel = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	gap: 10px;
`;

const SelectorContainer = styled(FlexDivColCentered)`
	row-gap: 18px;
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

	${(props) =>
		props.onClick &&
		css`
			&:hover {
				background-color: ${(props) => props.theme.colors.selectedTheme.button.hover};
				cursor: pointer;
			}
		`};
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

export default CurrencyCardSelector;
