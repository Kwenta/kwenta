import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC, FunctionComponent, memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import LinkIconLight from 'assets/svg/app/link-light.svg'
import KwentaYellowIcon from 'assets/svg/brand/logo-yellow.svg'
import Badge from 'components/Badge'
import { FlexDivRow } from 'components/layout/flex'
import LabelContainer from 'components/Nav/DropDownLabel'
import Select from 'components/Select'
import { DropdownIndicator, IndicatorSeparator } from 'components/Select'
import Tooltip from 'components/Tooltip/Tooltip'
import { selectMarketAsset } from 'state/futures/common/selectors'
import { useAppSelector } from 'state/hooks'
import { linkCSS } from 'styles/common'
import media from 'styles/media'

import { DESKTOP_NAV_LINKS, Badge as BadgeType } from './constants'

type ReactSelectOptionProps = {
	i18nLabel: string
	postfixIcon?: string
	isActive: boolean
	link: string
	isParentLink?: boolean
	badge: BadgeType[]
	Icon: FunctionComponent<any>
}

const Nav: FC = memo(() => {
	const { t } = useTranslation()
	const { asPath } = useRouter()
	const marketAsset = useAppSelector(selectMarketAsset)

	const getLink = useCallback(
		(link: string) => {
			return link.indexOf('/market') === 0
				? `/market/?accountType=cross_margin&asset=${marketAsset}`
				: link
		},
		[marketAsset]
	)

	const formatOptionLabel = ({
		i18nLabel,
		Icon,
		badge,
		link,
		isActive,
		isParentLink,
	}: ReactSelectOptionProps) => {
		if (i18nLabel === 'header.nav.leaderboard' || i18nLabel === 'header.nav.options.title') {
			return (
				<MenuInside isDropDown isActive={isActive}>
					{t(i18nLabel)}
				</MenuInside>
			)
		}

		const option = (
			<LabelContainer>
				<NavLabel isActive={isActive || !isParentLink}>
					{t(i18nLabel)}
					{badge?.map(({ i18nLabel, color }) => (
						<Badge color={color}>{t(i18nLabel)}</Badge>
					))}
				</NavLabel>
				{Icon && <Icon />}
			</LabelContainer>
		)
		if (link) {
			return <Link href={link}>{option}</Link>
		}

		return option
	}

	return (
		<nav>
			<MenuLinks>
				{DESKTOP_NAV_LINKS.map(({ i18nLabel, link, links }) => {
					const routeBase = asPath.split('/')[1]
					const linkBase = link.split('/')[1]?.split('?')[0]
					const isActive = routeBase === linkBase
					const url = getLink(link)

					if (!links) {
						return (
							<Link key={url} href={url}>
								<MenuInside isActive={isActive}>
									{i18nLabel === 'header.nav.markets' ? (
										<CustomStyledTooltip
											preset="bottom"
											width="260px"
											height="auto"
											content={t('dashboard.stake.tabs.trading-rewards.trading-rewards-tooltip')}
										>
											<WithCursor cursor="pointer">
												<FlexDivRow>
													{t(i18nLabel)}
													<KwentaYellowIcon height={20} width={20} style={{ paddingLeft: 5 }} />
												</FlexDivRow>
											</WithCursor>
										</CustomStyledTooltip>
									) : i18nLabel === 'header.nav.options.title' ? (
										<FlexDivRow>
											{t(i18nLabel)}
											<LinkIconLight height={18} width={18} style={{ paddingLeft: 5 }} />
										</FlexDivRow>
									) : (
										t(i18nLabel)
									)}
								</MenuInside>
							</Link>
						)
					}

					return (
						<DropDownSelect
							key={url}
							variant="transparent"
							formatOptionLabel={formatOptionLabel}
							controlHeight={34}
							options={links}
							value={{ i18nLabel, isActive, isParentLink: true }}
							components={{ IndicatorSeparator, DropdownIndicator }}
							isSearchable={false}
						/>
					)
				})}
			</MenuLinks>
		</nav>
	)
})

const CustomStyledTooltip = styled(Tooltip)`
	padding: 10px;
	text-align: left;
	text-transform: none;
	${media.lessThan('md')`
		width: 310px;
	`}
`

const WithCursor = styled.div<{ cursor: 'help' | 'pointer' }>`
	cursor: ${(props) => props.cursor};
`

const MenuLinks = styled.ul`
	display: flex;
	padding-top: 2px;
`

const NavLabel = styled.div<{ isActive?: boolean }>`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 15px;
	line-height: 15px;
	color: ${(props) =>
		props.isActive
			? props.theme.colors.selectedTheme.button.text.primary
			: props.theme.colors.selectedTheme.gray};
`

const MenuInside = styled.div<{ isActive: boolean; isDropDown?: boolean }>`
	${linkCSS};
	padding: 8px ${(props) => (props.isDropDown ? '0px' : '13px')};
	margin-right: 2px;
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 15px;
	text-transform: capitalize;
	text-align: center;
	border-radius: 100px;
	background: transparent;
	cursor: pointer;
	width: 100%;
	color: ${(props) =>
		props.isActive
			? props.theme.colors.selectedTheme.button.text.primary
			: props.theme.colors.selectedTheme.gray};
	&:hover {
		background: ${(props) =>
			!props.isDropDown ? props.theme.colors.selectedTheme.button.fill : 'transparent'};
	}
`

const DropDownSelect = styled(Select)`
	.react-select__menu {
		width: 180px;
		text-transform: capitalize;
		left: 0;
	}

	.react-select__option {
		svg {
			width: 14px;
			height: 14px;

			> path {
				fill: #ffb800;
			}
		}
	}

	.react-select__control {
		padding: 0 6px;
	}

	.react-select__group {
		padding: 20px;

		.react-select__group-heading {
			font-size: 12px;
			padding: 0;
			margin-bottom: 15px;
			text-transform: none;
		}
	}

	.react-select__dropdown-indicator {
		margin-right: 5px;
		margin-top: 2px;
		padding: 0;
	}

	.react-select__value-container {
		padding: 0px;
		text-transform: capitalize;
		width: ${(props) => {
			//@ts-ignore
			return props.value?.i18nLabel === 'header.nav.markets'
				? '94px'
				: //@ts-ignore
				props.value?.i18nLabel === 'header.nav.leaderboard'
				? '110px'
				: //@ts-ignore
				props.value?.i18nLabel === 'header.nav.options.title'
				? '80px'
				: '100%'
		}};
	}

	.react-select__single-value {
		display: flex;
		align-items: center;
		width: 100%;
	}

	.react-select__menu-notice--no-options {
		padding: 15px;
	}
`

export default Nav
