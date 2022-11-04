import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC, FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import Badge from 'components/Badge';
import LabelContainer from 'components/Nav/DropDownLabel';
import Select from 'components/Select';
import { DropdownIndicator, IndicatorSeparator } from 'components/Select/Select';
import { currentMarketState } from 'store/futures';
import { linkCSS } from 'styles/common';

import { DESKTOP_NAV_LINKS, Badge as BadgeType } from '../constants';

type ReactSelectOptionProps = {
	i18nLabel: string;
	postfixIcon?: string;
	isActive: boolean;
	link: string;
	badge: BadgeType;
	Icon: FunctionComponent<any>;
};

const Nav: FC = () => {
	const { t } = useTranslation();
	const { asPath } = useRouter();
	const currentMarket = useRecoilValue(currentMarketState);

	function getLink(link: string) {
		return link.slice(0, 7) === '/market' ? `/market/?asset=${currentMarket}` : link;
	}

	const formatOptionLabel = ({
		i18nLabel,
		Icon,
		badge,
		link,
		isActive,
	}: ReactSelectOptionProps) => {
		if (i18nLabel === 'header.nav.markets' || i18nLabel === 'header.nav.leaderboard')
			return (
				<MenuInside isDropDown isActive={isActive}>
					{t(i18nLabel)}
				</MenuInside>
			);
		return (
			<Link href={link}>
				<LabelContainer>
					<NavLabel>
						{t(i18nLabel)}
						{badge && <Badge color="yellow">{t(badge.i18nLabel)}</Badge>}
					</NavLabel>
					{Icon && <Icon />}
				</LabelContainer>
			</Link>
		);
	};

	return (
		<nav>
			<MenuLinks>
				{DESKTOP_NAV_LINKS.map(({ i18nLabel, link, links }) => {
					const routeBase = asPath.split('/')[1];
					const linkBase = link.split('/')[1]?.split('?')[0];
					const isActive = routeBase === linkBase;

					const url = getLink(link);
					if (!links) {
						return (
							<div key={url}>
								<Link href={url}>
									<MenuInside isActive={isActive}>{t(i18nLabel)}</MenuInside>
								</Link>
							</div>
						);
					}

					return (
						<DropDownSelect
							key={url}
							variant="transparent"
							formatOptionLabel={formatOptionLabel}
							controlHeight={34}
							options={links}
							value={{ i18nLabel, isActive }}
							menuWidth={240}
							components={{ IndicatorSeparator, DropdownIndicator }}
							isSearchable={false}
						/>
					);
				})}
			</MenuLinks>
		</nav>
	);
};

const MenuLinks = styled.ul`
	display: flex;
`;

const NavLabel = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 15px;
	line-height: 15px;
`;

const MenuInside = styled.div<{ isActive: boolean; isDropDown?: boolean }>`
	${linkCSS};
	padding: 8px ${(props) => (props.isDropDown ? '0px' : '13px')};
	margin-right: 2px;
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 15px;
	text-transform: capitalize;
	border-radius: 100px;
	background: transparent;
	cursor: pointer;
	color: ${(props) =>
		props.isActive
			? props.theme.colors.selectedTheme.button.text.primary
			: props.theme.colors.selectedTheme.gray};
	&:hover {
		background: ${(props) =>
			!props.isDropDown ? props.theme.colors.selectedTheme.button.fill : 'transparent'};
	}
`;

const DropDownSelect = styled(Select)`
	.react-select__control {
		padding: 0 6px;
		width: 98px;
	}

	.react-select__group {
		padding: 20px;

		.react-select__group-heading {
			color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
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
		display: flex;
		justify-content: center;
	}

	.react-select__menu-notice--no-options {
		padding: 15px;
	}
`;

export default Nav;
