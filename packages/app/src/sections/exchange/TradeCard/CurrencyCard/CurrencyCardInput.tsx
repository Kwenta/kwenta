import { ZERO_WEI } from '@kwenta/sdk/constants'
import { formatDollars } from '@kwenta/sdk/utils'
import Wei, { wei } from '@synthetixio/wei'
import { FC, memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import Button from 'components/Button'
import NumericInput from 'components/Input/NumericInput'
import { FlexDivCol, FlexDivRowCentered } from 'components/layout/flex'
import Loader from 'components/Loader'
import Pill from 'components/Pill'
import { Body } from 'components/Text'
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency'
import { CapitalizedText, numericValueCSS } from 'styles/common'

type CurrencyCardInputProps = {
	label: string
	isBase: boolean
	disabled?: boolean
	amount: string
	onAmountChange(value: string): void
	hasWalletBalance: boolean
	onBalanceClick(): void
	isLoading: boolean
	disableInput: boolean
	currencyKeySelected: boolean
	priceRate?: Wei | number | null
}

const CurrencyCardInputLabel: FC<{ label: string }> = memo(({ label }) => {
	return <InputLabel data-testid="destination">{label}</InputLabel>
})

const CurrencyCardInputMaxButton: FC<{ onClick?: () => void }> = memo(({ onClick }) => {
	const { t } = useTranslation()

	return (
		<MaxButton onClick={onClick} noOutline>
			{t('exchange.currency-card.max-button')}
		</MaxButton>
	)
})

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
		const { t } = useTranslation()

		return (
			<InputContainer>
				<CurrencyCardInputLabel label={label} />
				<CurrencyAmountContainer className="currency-amount-container" disableInput={disableInput}>
					<FlexDivRowCentered>
						<CurrencyAmount
							disabled={disabled}
							value={amount}
							onChange={(_, value) => {
								onAmountChange(value)
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
		)
	}
)

const CurrencyCardInputAmountValue = memo(({ currencyKeySelected, amount, priceRate }: any) => {
	const { selectPriceCurrencyRate, getPriceAtCurrentRate } = useSelectedPriceCurrency()

	const tradeAmount = useMemo(() => {
		const amountBN = amount === '' ? ZERO_WEI : wei(amount)
		let current = priceRate ? amountBN.mul(priceRate) : null

		if (!!selectPriceCurrencyRate && !!current) {
			current = getPriceAtCurrentRate(current)
		}

		return current
	}, [priceRate, selectPriceCurrencyRate, getPriceAtCurrentRate, amount])

	return (
		<CurrencyAmountValue data-testid="amount-value">
			{currencyKeySelected && !!tradeAmount ? formatDollars(tradeAmount, { sign: '$' }) : null}
		</CurrencyAmountValue>
	)
})

const InputContainer = styled(FlexDivCol)`
	row-gap: 21px;
`

const InputLabel = styled(Body).attrs({ weight: 'bold', capitalized: true })`
	text-transform: capitalize;
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.sectionHeader};
	font-size: 15px;
	line-height: 0.75em;
	padding-top: 6px;
	margin-left: 16px;
`

const MaxButton = styled(Button).attrs({ mono: true })`
	width: 40px;
	height: 21px;
	font-size: 11px;
	padding: 0 10px;
	margin-left: 15px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	border-radius: 10.5px;
	font-variant: all-small-caps;
`

const CurrencyAmount = styled(NumericInput)`
	border: 0;
	padding: 0;
	height: 30px;
	background: transparent;
	box-shadow: none;

	input {
		font-size: 30px;
		line-height: 2.25em;
		letter-spacing: -1px;
		height: 30px;
		width: 100%;
	}
`

const CurrencyAmountContainer = styled.div<{ disableInput?: boolean }>`
	background: ${(props) => props.theme.colors.selectedTheme.input.background};
	border: ${(props) => props.theme.colors.selectedTheme.border};
	box-sizing: border-box;
	border-radius: 8px;
	min-height: 84px;
	width: 290px;
	padding: 13px 16px;
	position: relative;

	${(props) =>
		props.disableInput &&
		css`
			pointer-events: none;
		`}
`

const StyledLoader = styled(Loader)`
	left: 90%;
`

const CurrencyAmountValue = styled.div`
	${numericValueCSS};
	padding: 8px 8px 2px 0;
	font-size: 14px;
	line-height: 1.25em;
	width: 150px;
	overflow: hidden;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`

export default CurrencyCardInput
