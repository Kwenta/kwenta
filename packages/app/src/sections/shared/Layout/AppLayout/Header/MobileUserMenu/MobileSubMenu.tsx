import Link from 'next/link'
import { useRouter } from 'next/router'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import Badge from 'components/Badge'
import { GridDiv } from 'components/layout/grid'
import { useAppSelector } from 'state/hooks'
import { selectCurrentTheme } from 'state/preferences/selectors'
import { ThemeName } from 'styles/theme'

import { SubMenuLink } from '../constants'

import { MenuButton } from './menu'

type MobileSubMenuOption = {
	label: string
	icon?: React.ReactNode
	selected?: boolean
	externalLink?: string
	onClick?: () => void
}

type MobileSubMenuProps = {
	i18nLabel: string
	defaultOpen?: boolean
	options?: MobileSubMenuOption[]
	links?: SubMenuLink[]
	onDismiss(): void
}

const MobileSubMenu: React.FC<MobileSubMenuProps> = memo(
	({ i18nLabel, options, links, onDismiss }) => {
		const { t } = useTranslation()
		const { asPath } = useRouter()
		const currentTheme = useAppSelector(selectCurrentTheme)

		return (
			<>
				<SubMenuButton currentTheme={currentTheme}>{t(i18nLabel)}</SubMenuButton>
				<SubMenuContainer onClick={onDismiss}>
					{links
						? links.map(({ i18nLabel, link: subLink, badge, Icon }) => (
								<SubMenuItemContainer key={i18nLabel}>
									<StyledLink href={subLink}>
										<SubMenuItem currentTheme={currentTheme} active={asPath.includes(subLink)}>
											<div>
												{t(i18nLabel)}{' '}
												{badge?.map(({ i18nLabel, color }) => (
													<StyledBadge color={color}>{t(i18nLabel)}</StyledBadge>
												))}
												{Icon && <Icon />}
											</div>
										</SubMenuItem>
									</StyledLink>
								</SubMenuItemContainer>
						  ))
						: options?.map(({ label, icon, onClick, selected, externalLink }) => (
								<SubMenuItemContainer key={label}>
									<SubMenuIcon selected={selected}>{icon ?? '·'}</SubMenuIcon>
									{externalLink ? (
										<SubMenuExternalLink href={externalLink} target="_blank" rel="noreferrer">
											<SubMenuItem currentTheme={currentTheme} selected={selected}>
												{label}
											</SubMenuItem>
										</SubMenuExternalLink>
									) : (
										<SubMenuFlex>
											<SubMenuItem
												currentTheme={currentTheme}
												onClick={selected ? undefined : onClick}
												selected={selected}
											>
												{label}
											</SubMenuItem>
										</SubMenuFlex>
									)}
								</SubMenuItemContainer>
						  ))}
				</SubMenuContainer>
			</>
		)
	}
)

const SubMenuButton = styled(MenuButton)`
	margin-bottom: 20px;
`

const StyledBadge = styled(Badge)`
	font-size: 12px;
	padding: 2.5px 5px 2px 5px;
	margin-left: 8px;
`

const SubMenuContainer = styled(GridDiv)`
	grid-template-columns: 1fr 1fr;
	grid-gap: 10px;
	box-sizing: border-box;
	margin-bottom: 20px;
`

const SubMenuItemContainer = styled.div`
	border-bottom: 2px solid ${(props) => props.theme.colors.selectedTheme.newTheme.border.color};
`

const StyledLink = styled(Link)`
	flex-grow: 1;
`

const SubMenuFlex = styled.div`
	flex-grow: 1;
`

const SubMenuExternalLink = styled.a`
	flex-grow: 1;
	text-decoration: none;
`

const SubMenuItem = styled.div<{ currentTheme: ThemeName; active?: boolean; selected?: boolean }>`
	font-size: 16px;
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.secondary};
	box-sizing: border-box;
	width: 100%;
	text-transform: capitalize;
	padding-bottom: 10px;

	div {
		display: flex;
		justify-content: space-between;
		padding-right: 12px;
	}

	svg {
		height: 22px;
		width: 22px;
	}

	${(props) =>
		props.selected &&
		css`
			color: ${(props) => props.theme.colors.selectedTheme.yellow};
		`}
`

const SubMenuIcon = styled.div<{ selected?: boolean }>`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 19px;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	margin-right: 20px;
	width: 12px;

	& > div {
		font-size: 12px;
	}

	.currency-icon {
		font-family: ${(props) => props.theme.fonts.regular};
		font-size: 19px;
		color: ${(props) => props.theme.colors.common.secondaryGray};

		${(props) =>
			props.selected &&
			css`
				color: ${(props) => props.theme.colors.common.secondaryGold};
			`}
	}
`

export default MobileSubMenu
