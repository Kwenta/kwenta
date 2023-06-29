import { FuturesMarketAsset, SynthSuspensionReason } from '@kwenta/sdk/types'
import { MarketKeyByAsset, formatDollars, formatPercent } from '@kwenta/sdk/utils'
import Wei from '@synthetixio/wei'
import { FC } from 'react'
import styled, { css } from 'styled-components'

import CurrencyIcon from 'components/Currency/CurrencyIcon'
import { FlexDivCentered } from 'components/layout/flex'
import MarketBadge from 'components/MarketBadge'
import { StyledCaretDownIcon } from 'components/Select'
import { Body, NumericValue } from 'components/Text'
import { PricesInfo } from 'state/prices/types'
import media from 'styles/media'

import {
	MARKETS_DETAILS_HEIGHT_DESKTOP,
	TRADE_PANEL_WIDTH_LG,
	TRADE_PANEL_WIDTH_MD,
} from '../styles'

type Props = {
	asset: FuturesMarketAsset
	label: string
	description: string
	isMarketClosed?: boolean
	closureReason?: SynthSuspensionReason
	mobile?: boolean
	priceDetails: {
		oneDayChange: Wei
		priceInfo?: PricesInfo
	}
	onClick: () => void
	expanded: boolean
}

const MarketsDropdownSelector: FC<Props> = (props) => (
	<Container {...props}>
		<ContentContainer mobile={props.mobile}>
			<LeftContainer $mobile={props.mobile}>
				<CurrencyIcon currencyKey={MarketKeyByAsset[props.asset]} width={31} height={31} />
				<div className="currency-meta">
					<CurrencyLabel weight="bold">
						{props.label}
						<MarketBadge
							currencyKey={props.asset}
							isFuturesMarketClosed={props.isMarketClosed}
							futuresClosureReason={props.closureReason}
						/>
					</CurrencyLabel>
				</div>
				{props.mobile && <StyledCaretDownIcon $flip={props.expanded} />}
			</LeftContainer>
			{props.mobile && (
				<MobileRightContainer>
					<div>
						<NumericValue value={props.priceDetails.priceInfo}>
							{formatDollars(props.priceDetails.priceInfo?.price ?? '0')}
						</NumericValue>
						<NumericValue value={props.priceDetails.oneDayChange} colored>
							{formatPercent(props.priceDetails.oneDayChange)}
						</NumericValue>
					</div>
				</MobileRightContainer>
			)}

			{!props.mobile && <StyledCaretDownIcon $flip={props.expanded} />}
		</ContentContainer>
	</Container>
)

export const MARKET_SELECTOR_HEIGHT_MOBILE = 58

export const CurrencyLabel = styled(Body)`
	font-size: 16px;
	display: flex;
	align-items: center;
	gap: 5px;
`

const Container = styled.div`
	width: 100%;
	height: 100%;
`

export const ContentContainer = styled(FlexDivCentered)<{ mobile?: boolean }>`
	.currency-meta {
		flex: 1;
		margin-left: 12px;
	}
	width: ${(props) => (props.mobile ? '100%' : TRADE_PANEL_WIDTH_MD + 'px')};
	${media.greaterThan('xxl')`
		width: ${TRADE_PANEL_WIDTH_LG + 0.5}px;
	`}

	${media.lessThan('xxl')`
		width: ${TRADE_PANEL_WIDTH_MD + 0.5}px;
	`}

	${media.lessThan('md')`
		width: 100%;
	`}

	${(props) =>
		props.mobile &&
		css`
			width: 100%;
		`}

	background: ${(props) => props.theme.colors.selectedTheme.newTheme.containers.primary.background};

	color: ${(props) => props.theme.colors.selectedTheme.text.value};
	padding: 15px;
	cursor: pointer;
	transition: all 0.2s ease-in-out;
	&:hover {
		background: ${(props) =>
			props.theme.colors.selectedTheme.newTheme.button.cell.hover.background};
	}

	p {
		margin: 0;
	}

	&:not(:last-of-type) {
		margin-bottom: 4px;
	}

	height: ${(props) =>
		props.mobile ? MARKET_SELECTOR_HEIGHT_MOBILE : MARKETS_DETAILS_HEIGHT_DESKTOP - 1}px;
`

const LeftContainer = styled.div<{ $mobile?: boolean }>`
	flex: 1;
	display: flex;
	align-items: center;

	${(props) =>
		props.$mobile &&
		css`
			padding-right: 15px;
			border-right: ${props.theme.colors.selectedTheme.border};
		`}
`

const MobileRightContainer = styled.div`
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	padding-left: 15px;
	text-align: right;
`

export default MarketsDropdownSelector
