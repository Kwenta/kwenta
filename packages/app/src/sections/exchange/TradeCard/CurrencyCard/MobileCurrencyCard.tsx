import { ZERO_WEI } from '@kwenta/sdk/constants'
import { formatCurrency } from '@kwenta/sdk/utils'
import Wei, { wei } from '@synthetixio/wei'
import { FC, memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import CaretDownIcon from 'assets/svg/app/caret-down-gray.svg'
import CurrencyIcon from 'components/Currency/CurrencyIcon'
import NumericInput from 'components/Input/NumericInput'
import { NO_VALUE } from 'constants/placeholder'
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency'
import { SectionHeader, SectionSubTitle, SectionTitle } from 'sections/futures/mobile'

type MobileCurrencyCardProps = {
	currencyKey?: string
	amount: string
	onAmountChange: (value: string) => void
	walletBalance?: Wei | null
	onBalanceClick: () => void
	onCurrencySelect?: () => void
	priceRate?: Wei | number | string | null
	label: string
	disabled?: boolean
}

const MobileCurrencyCard: FC<MobileCurrencyCardProps> = memo(
	({
		currencyKey,
		amount,
		onAmountChange,
		walletBalance,
		onBalanceClick,
		onCurrencySelect,
		priceRate,
		label,
		disabled,
	}) => {
		const { t } = useTranslation()
		const { selectPriceCurrencyRate, getPriceAtCurrentRate } = useSelectedPriceCurrency()

		const hasWalletBalance = useMemo(
			() => !!walletBalance && !!currencyKey,
			[walletBalance, currencyKey]
		)

		const amountBN = useMemo(() => (amount === '' ? ZERO_WEI : wei(amount)), [amount])

		const tradeAmount = useMemo(() => {
			let current = priceRate ? amountBN.mul(priceRate) : null

			if (!!selectPriceCurrencyRate && !!current) {
				current = getPriceAtCurrentRate(current)
			}

			return current
		}, [priceRate, amountBN, selectPriceCurrencyRate, getPriceAtCurrentRate])

		const hasCurrencySelectCallback = useMemo(() => !!onCurrencySelect, [onCurrencySelect])

		return (
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
								onAmountChange(value)
							}}
							placeholder={t('exchange.currency-card.amount-placeholder')}
							disabled={disabled}
							roundedCorner={false}
							noShadow
						/>
						<SwapCurrencyPrice data-testid="amount-value">
							{!!currencyKey && tradeAmount != null
								? formatCurrency('sUSD', tradeAmount, { sign: '$' })
								: null}
						</SwapCurrencyPrice>
					</div>
					<MobileCurrencySelector
						currencyKeySelected={!!currencyKey}
						onClick={hasCurrencySelectCallback ? onCurrencySelect : undefined}
						data-testid="currency-selector"
					>
						{!!currencyKey && <CurrencyIcon currencyKey={currencyKey} width={20} height={20} />}
						<div className="label">{currencyKey ?? 'Select'}</div>
						{hasCurrencySelectCallback && <CaretDownIcon width="9" />}
					</MobileCurrencySelector>
				</MainInput>
			</div>
		)
	}
)

const MobileCurrencySelector = styled.button<{
	currencyKeySelected: boolean
}>`
	background: ${(props) => props.theme.colors.selectedTheme.button.fill};
	padding: 6px;
	padding-left: 5px;
	border-radius: 8px;
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
`

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
`

const SwapTextInput = styled(NumericInput)`
	background-color: transparent;
	border: none;
	color: ${(props) => props.theme.colors.selectedTheme.text.value};
	height: initial;

	& > input {
		font-family: ${(props) => props.theme.fonts.regular};
		font-size: 19px;
		line-height: 1;
		margin-bottom: 4px;
	}
`

const SwapCurrencyPrice = styled.div`
	font-size: 12px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	height: 12px;
	margin-left: 10px;
`

export default MobileCurrencyCard
