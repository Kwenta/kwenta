import Wei from '@synthetixio/wei'
import { FC, useMemo, memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import Card, { CardBody } from 'components/Card'
import { FlexDivRowCentered } from 'components/layout/flex'

import { Side } from '../types'

import CurrencyCardInput from './CurrencyCardInput'
import CurrencyCardSelector from './CurrencyCardSelector'

type CurrencyCardProps = {
	side: Side
	currencyKey?: string
	currencyName?: string
	amount: string
	onAmountChange: (value: string) => void
	walletBalance?: Wei | null
	onBalanceClick: () => void
	onCurrencySelect?: () => void
	priceRate?: Wei | number | null
	className?: string
	label: string
	disableInput?: boolean
	isLoading?: boolean
	disabled?: boolean
}

const CurrencyCard: FC<CurrencyCardProps> = memo(
	({
		side,
		currencyKey,
		currencyName,
		amount,
		onAmountChange,
		walletBalance,
		onBalanceClick,
		onCurrencySelect,
		priceRate,
		label,
		disableInput = false,
		isLoading = false,
		disabled,
		...rest
	}) => {
		const { t } = useTranslation()

		const isBase = useMemo(() => side === 'base', [side])

		const hasWalletBalance = useMemo(() => !!walletBalance && !!currencyKey, [
			walletBalance,
			currencyKey,
		])

		const hasCurrencySelectCallback = !!onCurrencySelect

		const tokenName = useMemo(() => {
			return currencyKey && currencyKey[0] === 's'
				? t('common.currency.synthetic-currency-name', { currencyName })
				: currencyName || t('exchange.currency-card.synth-name')
		}, [currencyKey, currencyName, t])

		return (
			<CardContainer>
				<StyledCard
					data-testid={'currency-card-' + side}
					className={`currency-card currency-card-${side}`}
					interactive
					{...rest}
				>
					<StyledCardBody className="currency-card-body">
						<CurrencyContainer className="currency-container">
							<CurrencyCardInput
								disableInput={disableInput}
								disabled={disabled}
								label={label}
								amount={amount}
								isBase={isBase}
								onAmountChange={onAmountChange}
								isLoading={isLoading}
								currencyKeySelected={!!currencyKey}
								hasWalletBalance={hasWalletBalance}
								onBalanceClick={onBalanceClick}
								priceRate={priceRate}
							/>

							<CurrencyCardSelector
								tokenName={tokenName}
								disableInput={disableInput}
								onBalanceClick={onBalanceClick}
								onCurrencySelect={onCurrencySelect}
								walletBalance={walletBalance}
								hasWalletBalance={hasWalletBalance}
								currencyKey={currencyKey}
								hasCurrencySelectCallback={hasCurrencySelectCallback}
								isBase={isBase}
							/>
						</CurrencyContainer>
					</StyledCardBody>
				</StyledCard>
			</CardContainer>
		)
	}
)

const CardContainer = styled.div`
	display: grid;
	height: 183px;
`

const StyledCard = styled(Card)<{ interactive?: boolean }>`
	${(props) =>
		!props.interactive &&
		css`
			pointer-events: none;
		`}
`

const StyledCardBody = styled(CardBody)`
	padding: 20px 32px;
`

const CurrencyContainer = styled(FlexDivRowCentered)`
	gap: 20px;
`

export default CurrencyCard
