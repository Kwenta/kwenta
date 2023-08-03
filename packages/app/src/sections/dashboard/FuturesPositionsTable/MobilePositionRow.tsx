import { PositionSide } from '@kwenta/sdk/types'
import { getMarketName, MarketKeyByAsset, formatNumber } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import { memo, FC } from 'react'
import styled, { css } from 'styled-components'
import { FuturesPositionTablePositionActive } from 'types/futures'

import { border } from 'components/Button'
import ChangePercent from 'components/ChangePercent'
import Currency from 'components/Currency'
import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults'
import { selectMarkPrices } from 'state/futures/selectors'
import { useAppSelector } from 'state/hooks'
import { isDecimalFour } from 'utils/futures'

type MobilePositionRowProps = {
	position: FuturesPositionTablePositionActive
	onClick(): void
}

const MobilePositionRow: FC<MobilePositionRowProps> = memo(({ position, onClick }) => {
	const prices = useAppSelector(selectMarkPrices)
	const marketPrice = position.market
		? prices[MarketKeyByAsset[position.market.asset]] ?? wei(0)
		: wei(0)
	return !!position && !!position.market ? (
		<OpenPositionContainer
			side={position?.activePosition.side}
			key={position.market?.asset}
			onClick={onClick}
		>
			<CurrencyDetailsContainer>
				<StyledCurrencyIcon currencyKey={position.market?.marketKey} />
				<div>
					<OpenPositionSize>
						{formatNumber(position?.activePosition.size ?? 0)}
						<OpenPositionMarketName>{getMarketName(position.market?.asset)}</OpenPositionMarketName>
					</OpenPositionSize>
					<OpenPositionSide side={position?.activePosition.side ?? PositionSide.LONG}>
						<span className="side">{position?.activePosition.side ?? PositionSide.LONG}</span>{' '}
						<span className="at">@</span>{' '}
						<span className="leverage">
							{formatNumber(position?.activePosition.leverage ?? 0, { maxDecimals: 1 })}x
						</span>
					</OpenPositionSide>
				</div>
			</CurrencyDetailsContainer>
			<RightColumnsContainer>
				<div>
					<div>
						<Currency.Price
							price={marketPrice}
							formatOptions={
								isDecimalFour(position.market.asset) ? { minDecimals: DEFAULT_CRYPTO_DECIMALS } : {}
							}
						/>
					</div>
					<EntryPrice>
						{position.activePosition.details?.avgEntryPrice && (
							<Currency.Price
								price={position.activePosition.details?.avgEntryPrice}
								formatOptions={
									isDecimalFour(position.market.asset)
										? { minDecimals: DEFAULT_CRYPTO_DECIMALS }
										: {}
								}
							/>
						)}
					</EntryPrice>
				</div>
				<div>
					<ChangePercent value={position.activePosition.pnlPct ?? 0} />
					<div>
						<Currency.Price price={position.activePosition.pnl ?? 0} />
					</div>
				</div>
			</RightColumnsContainer>
		</OpenPositionContainer>
	) : (
		<></>
	)
})

const OpenPositionContainer = styled.div<{ side?: PositionSide }>`
	display: flex;
	justify-content: space-between;
	margin-bottom: 15px;
	padding: 10px;
	border-radius: 8px;
	box-sizing: border-box;
	position: relative;

	${border};
	background: ${(props) => props.theme.colors.selectedTheme.button.fill};

	${(props) =>
		props.side === PositionSide.LONG &&
		css`
			&::before {
				background: linear-gradient(
					180deg,
					rgba(127, 212, 130, 0.5) 0%,
					rgba(50, 111, 52, 0.5) 100%
				);
			}
		`}

	${(props) =>
		props.side === PositionSide.SHORT &&
		css`
			&::before {
				background: linear-gradient(
					180deg,
					rgba(239, 104, 104, 0.5) 0%,
					rgba(147, 54, 54, 0.5) 100%
				);
			}
		`}
`

const OpenPositionSize = styled.div`
	display: flex;
	align-items: center;
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.selectedTheme.text.value};
	font-size: 12px;
`

const OpenPositionMarketName = styled.span`
	color: ${(props) => props.theme.colors.selectedTheme.yellow};
	border: 1px solid ${(props) => props.theme.colors.selectedTheme.yellow};
	border-radius: 4px;
	font-size: 6px;
	padding: 2px;
	margin-left: 4px;
`

const OpenPositionSide = styled.div<{ side: PositionSide }>`
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.bold};

	.side {
		text-transform: uppercase;
		color: ${(props) =>
			props.side === PositionSide.LONG
				? props.theme.colors.selectedTheme.green
				: props.theme.colors.selectedTheme.red};
	}

	.at {
		color: ${(props) => props.theme.colors.selectedTheme.gray};
	}

	.leverage {
		color: ${(props) => props.theme.colors.selectedTheme.text.value};
	}
`

const EntryPrice = styled.div`
	span {
		color: ${(props) => props.theme.colors.selectedTheme.gray};
	}
`

const StyledCurrencyIcon = styled(Currency.Icon)`
	width: 30px;
	height: 30px;
	margin-right: 8px;
`

const CurrencyDetailsContainer = styled.div`
	display: flex;
	width: 125px;
	margin-right: 30px;
`

const RightColumnsContainer = styled.div`
	display: flex;
	flex: 1;
	justify-content: space-between;
`

export default MobilePositionRow
