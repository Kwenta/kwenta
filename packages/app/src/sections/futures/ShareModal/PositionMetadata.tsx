import { ZERO_WEI } from '@kwenta/sdk/constants'
import { formatDollars } from '@kwenta/sdk/utils'
import { format } from 'date-fns'
import { useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { FuturesPositionTablePosition } from 'types/futures'

import media from 'styles/media'
import getLocale from 'utils/formatters/getLocale'

function getColor(props: any) {
	let color = ''

	switch (props.className) {
		case 'header':
			color = props.theme.colors.common.tertiaryGray
			break
		case 'time':
			color = props.theme.colors.common.tertiaryGray
			break
		case 'date-or-price':
			color = props.theme.colors.white
			break

		default:
			color = props.theme.colors.common.tertiaryGray
	}

	return color
}

function getFontSize(props: any) {
	let fontSize = ''

	switch (props.className) {
		case 'header':
			fontSize = '0.83vw'
			break
		case 'time':
			fontSize = '0.83vw'
			break
		case 'date-or-price':
			fontSize = '1.23vw'
			break

		default:
			fontSize = '0.83vw'
	}

	return fontSize
}

function getMobileFontSize(props: any) {
	let fontSize = ''

	switch (props.className) {
		case 'date-or-price':
			fontSize = '3vw'
			break
		case 'header':
		case 'time':
		default:
			fontSize = '2vw'
			break
	}

	return fontSize
}

function getFontFamily(props: any) {
	const fontFamilyObj: any = {
		time: props.theme.fonts.regular,
		header: props.theme.fonts.compressedMedium,
		'date-or-price': props.theme.fonts.bold,
	}

	for (const key of Object.keys(fontFamilyObj)) {
		if (key === props.className) return fontFamilyObj[props.className]
	}
}

const PositionMetadata: React.FC<{ position: FuturesPositionTablePosition }> = ({ position }) => {
	const { t } = useTranslation()
	const [currentTimestamp, setCurrentTimestamp] = useState(0)

	const avgEntryPrice = position?.history?.avgEntryPrice.toNumber().toString() ?? ''
	const openTimestamp = position?.history?.openTimestamp ?? 0

	useLayoutEffect(() => {
		const now = new Date().getTime()
		setCurrentTimestamp(now)
	}, [])

	const openAtDate = format(openTimestamp, 'PP', { locale: getLocale() })
	const openAtTime = format(openTimestamp, 'HH:mm:ss', { locale: getLocale() })
	const createdOnDate = format(currentTimestamp, 'PP', { locale: getLocale() })
	const createdOnTime = format(currentTimestamp, 'HH:mm:ss', { locale: getLocale() })

	return (
		<>
			<TopLeftContainer>
				<ContainerText className="header">
					{t('futures.modals.share.position-metadata.open-at')}
				</ContainerText>
				<ContainerText className="date-or-price">{openAtDate.toUpperCase()}</ContainerText>
				<ContainerText className="time">{openAtTime}</ContainerText>
			</TopLeftContainer>
			<TopRightContainer>
				<ContainerText className="header">
					{t('futures.modals.share.position-metadata.created-on')}
				</ContainerText>
				<ContainerText className="date-or-price">{createdOnDate.toUpperCase()}</ContainerText>
				<ContainerText className="time">{createdOnTime}</ContainerText>
			</TopRightContainer>
			<BottomLeftContainer>
				<ContainerText className="header">
					{t('futures.modals.share.position-metadata.avg-open-price')}
				</ContainerText>
				<ContainerText className="date-or-price">
					{formatDollars(avgEntryPrice ?? ZERO_WEI, {
						suggestDecimals: true,
					})}
				</ContainerText>
			</BottomLeftContainer>
			<BottomRightContainer>
				<ContainerText className="header">
					{t('futures.modals.share.position-metadata.current-price')}
				</ContainerText>
				<ContainerText className="date-or-price">
					{formatDollars(position?.lastPrice ?? ZERO_WEI, {
						suggestDecimals: true,
					})}
				</ContainerText>
			</BottomRightContainer>
		</>
	)
}

const ContainerText = styled.div`
	font-size: ${(props) => getFontSize(props)};
	font-weight: 100;
	color: ${(props) => getColor(props)};

	text-transform: uppercase;

	width: 100%;

	font-family: ${(props) => getFontFamily(props)};
	${media.lessThan('md')`
		font-size: ${(props) => getMobileFontSize(props)};
	`}
`

const TopRightContainer = styled.div`
	position: absolute;
	display: flex;
	flex-direction: column;

	width: 100%;

	bottom: 5.5vw;
	left: 12.02vw;

	${media.lessThan('md')`
		top: unset;
		bottom: 45%;
		right: 0;
		left: unset;
		width: 48%;
		text-align: left;
	`}
`

const TopLeftContainer = styled.div`
	position: absolute;
	display: flex;
	flex-direction: column;

	width: 100%;

	bottom: 5.5vw;
	left: 2.02vw;

	${media.lessThan('md')`
		top: unset;
		bottom: 45%;
		right: unset;
		left: 0;
		width: 48%;
		text-align: right;
	`}
`

const BottomRightContainer = styled.div`
	position: absolute;
	display: flex;
	flex-direction: column;

	width: 100%;

	bottom: 2vw;
	left: 12.02vw;

	${media.lessThan('md')`
		top: unset;
		bottom: 35%;
		right: 0;
		left: unset;
		width: 48%;
		text-align: left;
	`}
`

const BottomLeftContainer = styled.div`
	position: absolute;
	display: flex;
	flex-direction: column;

	width: 100%;

	bottom: 2vw;
	left: 2.02vw;

	${media.lessThan('md')`
		top: unset;
		bottom: 35%;
		right: unset;
		left: 0;
		width: 48%;
		text-align: right;
	`}
`

export default PositionMetadata
