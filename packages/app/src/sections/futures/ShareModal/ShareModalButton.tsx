import { ZERO_WEI } from '@kwenta/sdk/constants'
import { PositionSide } from '@kwenta/sdk/types'
import { formatDollars, formatNumber, getMarketName } from '@kwenta/sdk/utils'
import { toPng } from 'html-to-image'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { FuturesPositionTablePositionActive } from 'types/futures'

import TwitterIcon from 'assets/svg/social/twitter.svg'
import Button from 'components/Button'
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'

function getTwitterText(
	side: PositionSide,
	marketName: string,
	leverage: string,
	pnlPct: string,
	dollarEntry: string,
	dollarCurrent: string
) {
	return encodeURIComponent(`Here is the PnL report of my position on @kwenta_io:

${side === 'long' ? 'Long' : 'Short'} $${marketName} ${leverage}: ${pnlPct}
from ${dollarEntry} to ${dollarCurrent}

https://kwenta.eth.limo`)
}

function downloadPng(dataUrl: string) {
	const link = document.createElement('a')

	link.download = 'my-pnl-on-kwenta.png'
	link.href = dataUrl
	link.pathname = 'assets/png/' + link.download
	link.click()
}

type ShareModalButtonProps = {
	position: FuturesPositionTablePositionActive
}

const ShareModalButton: FC<ShareModalButtonProps> = ({ position }) => {
	const { t } = useTranslation()

	const handleDownloadImage = async () => {
		let node = document.getElementById('pnl-graphic')

		if (node) {
			const dataUrl = await toPng(node, { cacheBust: true })
			downloadPng(dataUrl)
		}
	}

	const handleTweet = () => {
		const side = position?.activePosition.side === 'long' ? PositionSide.LONG : PositionSide.SHORT
		const marketName = getMarketName(position.market.asset!)
		const leverage = formatNumber(position?.activePosition.leverage ?? ZERO_WEI) + 'x'
		const pnlPct = `+${position?.activePosition.pnlPct.mul(100).toNumber().toFixed(2)}%`

		const avgEntryPrice = position.activePosition.details?.avgEntryPrice
			? formatNumber(position.activePosition.details?.avgEntryPrice)
			: ''
		const dollarEntry = formatDollars(avgEntryPrice ?? ZERO_WEI, { suggestDecimals: true })
		const dollarCurrent = formatNumber(position.activePosition.lastPrice ?? ZERO_WEI)
		const text = getTwitterText(side, marketName, leverage, pnlPct, dollarEntry, dollarCurrent)
		window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
	}

	return (
		<>
			<DesktopOnlyView>
				<ButtonContainer>
					<Button variant="primary" onClick={handleDownloadImage} size="small" disabled={false}>
						{t('futures.modals.share.buttons.download')}
					</Button>
				</ButtonContainer>
			</DesktopOnlyView>
			<MobileOrTabletView>
				<ButtonContainer>
					<Button variant="secondary" onClick={handleDownloadImage} size="small" disabled={false}>
						{t('futures.modals.share.buttons.download')}
					</Button>
					<Button variant="primary" onClick={handleTweet} size="small" disabled={false}>
						<InnerButtonContainer>
							<span>{t('futures.modals.share.buttons.twitter')}</span>
							<StyledTwitterIcon />
						</InnerButtonContainer>
					</Button>
				</ButtonContainer>
			</MobileOrTabletView>
		</>
	)
}

const ButtonContainer = styled.div`
	display: flex;
	flex-direction: row;
	gap: 4vw;

	margin: 25px 0px 25px 0px;

	justify-content: center;
	align-items: center;
`

const InnerButtonContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	gap: 1vw;
`

const StyledTwitterIcon = styled(TwitterIcon)`
	width: 2.5vw;
`

export default ShareModalButton
