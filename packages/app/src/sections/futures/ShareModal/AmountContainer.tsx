import { ZERO_WEI } from '@kwenta/sdk/constants'
import { PositionSide } from '@kwenta/sdk/types'
import { MarketKeyByAsset, formatNumber, getMarketName } from '@kwenta/sdk/utils'
import { FC, useMemo } from 'react'
import styled from 'styled-components'

import CurrencyIcon from 'components/Currency/CurrencyIcon'
import { selectMarketAsset } from 'state/futures/selectors'
import { SharePositionParams } from 'state/futures/types'
import { useAppSelector } from 'state/hooks'
import media from 'styles/media'

const AmountContainer: FC<SharePositionParams> = ({ asset, position }) => {
	const defaultAsset = useAppSelector(selectMarketAsset)
	const marketAsset = asset ?? defaultAsset
	const marketName = getMarketName(marketAsset)
	const positionDetails = position ?? null
	const leverage = formatNumber(positionDetails?.leverage ?? ZERO_WEI) + 'x'
	const side = positionDetails?.side === 'long' ? PositionSide.LONG : PositionSide.SHORT
	const pnlPct = positionDetails?.pnlPct.mul(100)

	const amount = useMemo(() => {
		if (pnlPct) {
			return pnlPct.gt(0)
				? `+${pnlPct.toNumber().toFixed(2)}%`
				: pnlPct.eq(0)
				? `+0.00%`
				: `${pnlPct.toNumber().toFixed(2)}%`
		}
	}, [pnlPct])

	return (
		<Container>
			<StyledPositionType>
				<StyledCurrencyIcon currencyKey={MarketKeyByAsset[marketAsset]} />
				<StyledPositionDetails>{marketName}</StyledPositionDetails>
				<StyledPositionDetails className="line-separator">|</StyledPositionDetails>
				<StyledPositionSide className={side}>{side.toUpperCase()}</StyledPositionSide>
				<StyledPositionDetails className="line-separator">|</StyledPositionDetails>
				<StyledPositionLeverage>{leverage}</StyledPositionLeverage>
			</StyledPositionType>
			<StyledAmount className={amount}>{amount}</StyledAmount>
		</Container>
	)
}

const StyledCurrencyIcon = styled(CurrencyIcon)`
	height: 1.94vw;
	width: auto;
	margin: -0.3vw 0.5vw 0vw 0vw;
`

const StyledPositionLeverage = styled.div`
	display: flex;
	flex-direction: column;
	color: ${(props) => props.theme.colors.common.primaryGold};
	font-size: 1.07vw;

	${media.lessThan('md')`
		font-size: 4vw;
	`}
`

const StyledPositionSide = styled.div`
	display: flex;
	flex-direction: column;
	color: ${(props) =>
		props.className === 'long' ? props.theme.colors.green : props.theme.colors.red};

	font-size: 1.07vw;

	${media.lessThan('md')`
		font-size: 4vw;
	`}
`

const StyledPositionDetails = styled.div`
	margin: ${(props) => (props.className === 'line-separator' ? '0vw 0.7vw 0vw 0.7vw' : '')};

	display: flex;
	flex-direction: column;

	font-size: 1.07vw;

	color: ${(props) => props.theme.colors.white};

	${media.lessThan('md')`
		font-size: 4vw;
	`}
`

const StyledPositionType = styled.div`
	display: flex;
	flex-direction: row;

	${media.lessThan('md')`
		align-items: center;
		gap: 2vw;
	`}
`

const StyledAmount = styled.div`
	position: absolute;
	margin-top: -0.05vw;

	font-size: 4.8vw;
	font-weight: 700;
	color: ${(props) =>
		props.className && parseFloat(props.className) > 0
			? props.theme.colors.green
			: props.theme.colors.red};

	text-shadow: 0px 0px 3.99vw
		${(props) =>
			props.className && parseFloat(props.className) > 0
				? 'rgba(127, 212, 130, 0.35)'
				: 'rgb(255, 4, 32, 0.35)'};

	${media.lessThan('md')`
		position: static;
		font-size: 10vw;
	`}
`

const Container = styled.div`
	position: absolute;
	top: 6vw;
	left: 2.02vw;

	${media.lessThan('md')`
		top: 46%;
		transform: translateY(-110%);
		left: 0;
		right: 0;
		display: flex;
		flex-direction: column;
		justify-items: center;
		align-items: center;
	`}
`

export default AmountContainer
