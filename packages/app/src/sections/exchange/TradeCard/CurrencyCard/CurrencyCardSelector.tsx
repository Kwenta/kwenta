import { formatCurrency } from '@kwenta/sdk/utils'
import Wei from '@synthetixio/wei'
import { FC, memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import CaretDownIcon from 'assets/svg/app/caret-down-gray.svg'
import { border } from 'components/Button'
import CurrencyIcon from 'components/Currency/CurrencyIcon'
import { FlexDivColCentered, FlexDivRow } from 'components/layout/flex'
import { NO_VALUE } from 'constants/placeholder'
import { selectInsufficientBalance } from 'state/exchange/selectors'
import { useAppSelector } from 'state/hooks'
import { CapitalizedText, numericValueCSS } from 'styles/common'

type CurrencyCardSelectorProps = {
	tokenName: string | null
	hasCurrencySelectCallback: boolean
	onCurrencySelect?: () => void
	currencyKey?: string
	disableInput: boolean
	hasWalletBalance: boolean
	onBalanceClick(): void
	isBase: boolean
	walletBalance?: Wei | null
}

const CurrencyCardSelector: FC<CurrencyCardSelectorProps> = memo(
	({
		tokenName,
		hasCurrencySelectCallback,
		onCurrencySelect,
		currencyKey,
		disableInput,
		hasWalletBalance,
		onBalanceClick,
		walletBalance,
		isBase,
	}) => {
		const { t } = useTranslation()

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
						{!!currencyKey && <CurrencyIcon currencyKey={currencyKey} width={25} height={25} />}
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
					<CurrencyCardSelectorWalletBalance
						hasWalletBalance={hasWalletBalance}
						onBalanceClick={onBalanceClick}
						isBase={isBase}
						currencyKey={currencyKey}
						walletBalance={walletBalance}
					/>
				</WalletBalanceContainer>
			</SelectorContainer>
		)
	}
)

const CurrencyCardSelectorWalletBalance = memo(
	({ hasWalletBalance, onBalanceClick, isBase, currencyKey, walletBalance }: any) => {
		const insufficientBalance = useAppSelector(selectInsufficientBalance)

		return (
			<WalletBalance
				onClick={hasWalletBalance ? onBalanceClick : undefined}
				insufficientBalance={isBase ? false : insufficientBalance}
				data-testid="wallet-balance"
			>
				{hasWalletBalance ? formatCurrency(currencyKey!, walletBalance!) : NO_VALUE}
			</WalletBalance>
		)
	}
)

const TokenLabel = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	gap: 10px;
`

const SelectorContainer = styled(FlexDivColCentered)`
	row-gap: 18px;
`

const CurrencySelector = styled.div<{
	currencyKeySelected: boolean
	interactive?: boolean
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
	background: ${(props) => props.theme.colors.selectedTheme.newTheme.containers.primary.background};

	&:hover {
		background: ${(props) => props.theme.colors.selectedTheme.newTheme.button.cell.hover.background};
	}

	${(props) =>
		props.onClick &&
		css`
			&:hover {
				background-color: ${(props) => props.theme.colors.selectedTheme.button.hover};
				cursor: pointer;
			}
		`};
`

const CurrencyNameLabel = styled.div`
	text-transform: capitalize;
	text-align: left;
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.regular};
	line-height: 1.25em;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	width: 180px;
	padding-left: 12px;
`

const WalletBalanceContainer = styled(FlexDivRow)<{ disableInput?: boolean }>`
	${(props) =>
		props.disableInput &&
		css`
			pointer-events: none;
		`}
	width: 160px;
`

const WalletBalanceLabel = styled.div`
	text-transform: capitalize;
	font-size: 13px;
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.selectedTheme.gray};
`

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
`

export default CurrencyCardSelector
