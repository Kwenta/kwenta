import { PositionSide } from '@kwenta/sdk/types'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC, useCallback, useReducer } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import CloseIcon from 'assets/svg/app/close.svg'
import MenuIcon from 'assets/svg/app/menu.svg'
import Button from 'components/Button'
import { DEFAULT_FUTURES_MARGIN_TYPE } from 'constants/defaults'
import ROUTES from 'constants/routes'
import { zIndex } from 'constants/ui'
import { MOBILE_FOOTER_HEIGHT } from 'constants/ui'
import { setTradePanelDrawerOpen } from 'state/futures/reducer'
import { setLeverageSide } from 'state/futures/smartMargin/reducer'
import { useAppDispatch } from 'state/hooks'
import { FixedFooterMixin } from 'styles/common'

import MobileMenuModal from './MobileMenuModal'
import MobileWalletButton from './MobileWalletButton'

const MobileUserMenu: FC = () => {
	const [isOpen, toggleOpen] = useReducer((s) => !s, false)
	const { t } = useTranslation()
	const { asPath } = useRouter()

	const dispatch = useAppDispatch()

	const handleSideSelect = useCallback(
		(side: PositionSide) => () => {
			dispatch(setLeverageSide(side))
			dispatch(setTradePanelDrawerOpen(true))
		},
		[dispatch]
	)

	return (
		<>
			<MobileFooterContainer>
				<MobileFooterIconContainer onClick={toggleOpen}>
					{isOpen ? <CloseIcon /> : <MenuIcon />}
				</MobileFooterIconContainer>
				<MobileFooterSeparator />
				<MobileFooterRight>
					{window.location.pathname === ROUTES.Home.Root ? (
						<Link href={ROUTES.Markets.Home(DEFAULT_FUTURES_MARGIN_TYPE)}>
							<Button size="small">{t('homepage.nav.start-trade')}</Button>
						</Link>
					) : asPath.split('/').includes('market') && !isOpen ? (
						<PositionButtonsContainer>
							<Button
								size="xsmall"
								variant="long"
								fontSize={13}
								fullWidth
								onClick={handleSideSelect(PositionSide.LONG)}
							>
								Long
							</Button>
							<Button
								size="xsmall"
								variant="short"
								fontSize={13}
								fullWidth
								onClick={handleSideSelect(PositionSide.SHORT)}
							>
								Short
							</Button>
						</PositionButtonsContainer>
					) : (
						<MobileWalletButton toggleModal={toggleOpen} />
					)}
				</MobileFooterRight>
			</MobileFooterContainer>
			{isOpen && <MobileMenuModal onDismiss={toggleOpen} />}
		</>
	)
}

const MobileFooterContainer = styled.div`
	${FixedFooterMixin};
	display: flex;
	align-items: center;
	border-top: ${(props) => props.theme.colors.selectedTheme.newTheme.border.style};
	padding: 15px 20px;
	background-color: ${(props) => props.theme.colors.selectedTheme.background};
	z-index: ${zIndex.MOBILE_FOOTER};
	height: ${MOBILE_FOOTER_HEIGHT};
`

const MobileFooterIconContainer = styled.div`
	width: 25px;
`

const MobileFooterSeparator = styled.div`
	margin: 0 20px;
	height: 32px;
	width: 1px;
	background-color: ${(props) => props.theme.colors.selectedTheme.newTheme.border.color};
`

const MobileFooterRight = styled.div`
	display: flex;
	flex-grow: 1;
	justify-content: flex-end;
	align-items: center;
`

const PositionButtonsContainer = styled.div`
	display: grid;
	width: 100%;
	grid-template-columns: 1fr 1fr;
	grid-gap: 10px;
`

export default MobileUserMenu
