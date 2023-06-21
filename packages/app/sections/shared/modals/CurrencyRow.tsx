import { SynthSymbol } from '@kwenta/sdk/data'
import Wei from '@synthetixio/wei'
import { FC, memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Currency from 'components/Currency'
import { NO_VALUE } from 'constants/placeholder'
import Connector from 'containers/Connector'
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency'
import { useAppSelector } from 'state/hooks'
import { SelectableCurrencyRow } from 'styles/common'

type Token = {
	name: string
	symbol: string
	isSynth: boolean
	logoURI?: string
}

type TokenBalance = {
	currencyKey: string
	balance: Wei
	usdBalance?: Wei
}

type SynthRowProps = {
	token: Token
	balance?: TokenBalance
	onClick: () => void
}

const CurrencyRow: FC<SynthRowProps> = memo(({ token, onClick, balance }) => {
	const { t } = useTranslation()
	const { isWalletConnected } = Connector.useContainer()
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency()
	const synthSuspensions = useAppSelector(({ exchange }) => exchange.synthSuspensions)
	const currencyKey = token.symbol

	const reason = token.isSynth ? synthSuspensions?.[token.symbol as SynthSymbol]?.reason : undefined

	return (
		<StyledSelectableCurrencyRow key={token.symbol} onClick={onClick} isSelectable>
			<Currency.Name
				name={
					token.isSynth
						? t('common.currency.synthetic-currency-name', { currencyName: token.name })
						: token.name
				}
				showIcon
				iconProps={!token.isSynth ? { url: token.logoURI } : undefined}
				{...{ currencyKey, marketClosureReason: reason }}
			/>
			{isWalletConnected ? (
				<Currency.Amount
					amount={balance?.balance ?? 0}
					totalValue={balance?.usdBalance ?? 0}
					sign={selectedPriceCurrency.sign}
					conversionRate={selectPriceCurrencyRate}
					{...{ currencyKey }}
				/>
			) : (
				NO_VALUE
			)}
		</StyledSelectableCurrencyRow>
	)
})

const StyledSelectableCurrencyRow = styled(SelectableCurrencyRow)`
	padding: 5px 16px;
`

export default CurrencyRow
