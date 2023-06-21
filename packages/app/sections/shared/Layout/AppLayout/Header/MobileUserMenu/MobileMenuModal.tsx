import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import LinkIconLight from 'assets/svg/app/link-light.svg'
import MobileMenuArrow from 'assets/svg/app/mobile-menu-arrow.svg'
import MoonIcon from 'assets/svg/app/moon.svg'
import SunIcon from 'assets/svg/app/sun.svg'
import KwentaYellowIcon from 'assets/svg/brand/logo-yellow.svg'
import FullScreenModal from 'components/FullScreenModal'
import { FlexDivRow, FlexDivRowCentered } from 'components/layout/flex'
import SegmentedControl from 'components/SegmentedControl'
import ROUTES from 'constants/routes'
import Links from 'sections/dashboard/Links'
import Logo from 'sections/shared/Layout/Logo'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { setTheme } from 'state/preferences/reducer'
import { selectCurrentTheme } from 'state/preferences/selectors'

import { HOMEPAGE_MENU_LINKS, MOBILE_NAV_LINKS } from '../constants'

import { MenuButton } from './menu'
import MobileSubMenu from './MobileSubMenu'

type MobileMenuModalProps = {
	onDismiss(): void
}

export const MobileMenuModal: FC<MobileMenuModalProps> = ({ onDismiss }) => {
	const { t } = useTranslation()
	const router = useRouter()
	const dispatch = useAppDispatch()

	const menuLinks =
		window.location.pathname === ROUTES.Home.Root ? HOMEPAGE_MENU_LINKS : MOBILE_NAV_LINKS

	const currentTheme = useAppSelector(selectCurrentTheme)

	const showStatsPage = useCallback(() => {
		router.push(ROUTES.Stats.Home)
		onDismiss()
	}, [router, onDismiss])

	const toggleTheme = useCallback(
		(index: number) => {
			dispatch(setTheme(index === 0 ? 'light' : 'dark'))
		},
		[dispatch]
	)

	const selectedThemeIndex = useMemo(() => (currentTheme === 'light' ? 0 : 1), [currentTheme])

	return (
		<StyledFullScreenModal isOpen>
			<Container>
				<LogoContainer>
					<Logo />
				</LogoContainer>
				<div>
					<MetaRow>
						<Links isMobile />
						<ControlContainer>
							<SegmentedControl
								values={[<SunIcon width={17} height={17} />, <MoonIcon width={12} height={12} />]}
								onChange={toggleTheme}
								selectedIndex={selectedThemeIndex}
								icon
							/>
						</ControlContainer>
					</MetaRow>
					{menuLinks.map(({ i18nLabel, link, links }) => (
						<div key={link}>
							{links?.length ? (
								<MobileSubMenu
									links={links}
									i18nLabel={i18nLabel}
									defaultOpen={router.asPath.includes(link)}
									onDismiss={onDismiss}
								/>
							) : link === ROUTES.Stats.Home ? (
								<MenuButton
									currentTheme={currentTheme}
									isActive={router.asPath.includes(link)}
									onClick={showStatsPage}
								>
									{t(i18nLabel)}
									<MobileMenuArrow />
								</MenuButton>
							) : (
								<Link href={link}>
									<MenuButton
										currentTheme={currentTheme}
										isActive={router.asPath.includes(link)}
										onClick={onDismiss}
										isLink
									>
										<FlexDivRowCentered>
											{t(i18nLabel)}
											{i18nLabel === 'header.nav.markets' ? (
												<KwentaYellowIcon height={18} width={18} style={{ marginLeft: 6 }} />
											) : i18nLabel === 'header.nav.options.title' ? (
												<LinkIconLight height={16} width={16} style={{ marginLeft: 6 }} />
											) : null}
										</FlexDivRowCentered>
										<MobileMenuArrow />
									</MenuButton>
								</Link>
							)}
						</div>
					))}
				</div>
			</Container>
		</StyledFullScreenModal>
	)
}

const StyledFullScreenModal = styled(FullScreenModal)`
	top: 0;

	[data-reach-dialog-content] {
		margin: 0;
		width: 100%;
		height: 100%;

		& > div {
			height: 100%;
		}
	}
`

const Container = styled.div`
	height: 100%;
	padding: 24px 32px 100px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	overflow-y: scroll;
`

const LogoContainer = styled.div`
	margin-bottom: 50px;
`

const MetaRow = styled(FlexDivRow)`
	justify-content: space-between;
	align-items: center;
	margin-bottom: 50px;
`

const ControlContainer = styled.div`
	width: 75px;

	> div {
		padding: 3px;
		gap: 3px;
	}

	button {
		max-width: 35px;
		padding: 0;
	}
`

export default MobileMenuModal
