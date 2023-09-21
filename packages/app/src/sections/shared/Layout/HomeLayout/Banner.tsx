import { useRouter } from 'next/router'
import { memo, useCallback, useEffect } from 'react'
import styled from 'styled-components'

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import { Body } from 'components/Text'
import {
	BANNER_ENABLED,
	BANNER_HEIGHT_DESKTOP,
	BANNER_LINK_URL,
	BANNER_TEXT,
	BANNER_WAITING_TIME,
} from 'constants/announcement'
import useWindowSize from 'hooks/useWindowSize'
import { MARKET_SELECTOR_HEIGHT_MOBILE } from 'sections/futures/Trade/MarketsDropdownSelector'
import CloseIconWithHover from 'sections/shared/components/CloseIconWithHover'
import { setShowBanner } from 'state/app/reducer'
import { selectShowBanner } from 'state/app/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import media from 'styles/media'
import localStore from 'utils/localStore'

type BannerViewProps = {
	mode: 'mobile' | 'desktop'
	onDismiss: (e: any) => void
	onDetails?: () => void
}

const BannerView: React.FC<BannerViewProps> = ({ mode, onDismiss, onDetails }) => {
	const router = useRouter()
	const isMobile = mode === 'mobile'
	const { lessThanWidth } = useWindowSize()
	const closeIconStyle = isMobile ? { flex: '0.08', marginTop: '5px' } : { flex: '0.1' }
	const closeIconProps = isMobile ? { width: 12, height: 12 } : {}
	const linkSize = isMobile ? 'small' : 'medium'
	const marginTop =
		router.pathname.includes('market') &&
		lessThanWidth('md') &&
		!router.pathname.includes('dashboard')
			? `${MARKET_SELECTOR_HEIGHT_MOBILE}px`
			: '0px'
	const marginBottom =
		router.pathname.includes('market') && !router.pathname.includes('dashboard') ? `0px` : '15px'

	return (
		<FuturesBannerContainer
			onClick={onDetails}
			$hasDetails={!!BANNER_LINK_URL}
			$marginTop={marginTop}
			$marginBottom={marginBottom}
		>
			<FuturesBannerLinkWrapper>
				<FuturesLink size={linkSize}>
					<strong>Important: </strong>
					{BANNER_TEXT}
				</FuturesLink>
				<CloseIconWithHover onClick={onDismiss} style={closeIconStyle} {...closeIconProps} />
			</FuturesBannerLinkWrapper>
		</FuturesBannerContainer>
	)
}

const Banner = memo(() => {
	const dispatch = useAppDispatch()
	const showBanner = useAppSelector(selectShowBanner)
	const storedTime: number = localStore.get('bannerIsClicked') || 0

	useEffect(
		() => {
			const currentTime = new Date().getTime()
			dispatch(setShowBanner(currentTime - storedTime >= BANNER_WAITING_TIME && BANNER_ENABLED))
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[storedTime]
	)

	const handleDismiss = useCallback(
		(e: any) => {
			dispatch(setShowBanner(false))
			localStore.set('bannerIsClicked', new Date().getTime())
			e.stopPropagation()
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	)

	const openDetails = useCallback(
		() => BANNER_LINK_URL && window.open(BANNER_LINK_URL, '_blank', 'noopener noreferrer'),
		[]
	)

	if (!BANNER_ENABLED || !showBanner) return null

	return (
		<>
			<DesktopOnlyView>
				<BannerView mode="desktop" onDismiss={handleDismiss} onDetails={openDetails} />
			</DesktopOnlyView>
			<MobileOrTabletView>
				<BannerView mode="mobile" onDismiss={handleDismiss} onDetails={openDetails} />
			</MobileOrTabletView>
		</>
	)
})

const FuturesLink = styled(Body)`
	margin-right: 5px;
	padding: 4px 9px;
	border-radius: 20px;
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.banner.yellow.text};
	flex: 5;
	${media.lessThan('md')`
		margin-right: 0px;
		flex: 1;
	`};
`

const FuturesBannerContainer = styled.div<{
	$hasDetails?: boolean
	$marginTop: string
	$marginBottom: string
}>`
	height: ${BANNER_HEIGHT_DESKTOP}px;
	width: 100%;
	display: flex;
	align-items: center;
	background: ${(props) => props.theme.colors.selectedTheme.newTheme.banner.yellow.background};
	margin-bottom: ${(props) => props.$marginBottom || '15px'};
	cursor: ${(props) => (props.$hasDetails ? 'pointer' : 'auto')};
	margin-top: ${(props) => props.$marginTop || '0px'};

	${media.lessThan('md')`
		position: relative;
		margin-bottom: 0px;
		flex-direction: row;
		justify-content: center;
		text-align: center;
		background: transaparent;
		padding: 12px 10px;
		border-radius: 0px;
		gap: 5px;
	`}
`

const FuturesBannerLinkWrapper = styled.div`
	width: 100%;
	text-align: center;
	position: absolute;
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 13px;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 0 10px;
`

export default Banner
