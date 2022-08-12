import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC, FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { StylesConfig } from 'react-select';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import LabelContainer from 'components/Nav/DropDownLabel';
import Select from 'components/Select';
import { DropdownIndicator, IndicatorSeparator } from 'components/Select/Select';
import { linkCSS } from 'styles/common';

import { NAV_SUB_MENUS } from '../constants';
import { menuLinksState } from '../states';

type ReactSelectOptionProps = {
	label: string;
	postfixIcon?: string;
	isActive: boolean;
	link: string;
	Icon: FunctionComponent<any>;
	onClick?: () => {};
};

const Nav: FC = () => {
	const { t } = useTranslation();
	const { asPath } = useRouter();

	const menuLinks = useRecoilValue(menuLinksState);

	function getLastVisited(): string | null | undefined {
		if (typeof window !== 'undefined') {
			const lastVisited = localStorage.getItem('lastVisited');
			return lastVisited;
		}
	}

	function getLink(link: string) {
		if (link.slice(0, 7) === '/market') {
			const lastVisited: string | null | undefined = getLastVisited();

			if (lastVisited !== null && lastVisited !== undefined) {
				return lastVisited;
			} else {
				return link;
			}
		} else {
			return link;
		}
	}

	const styles: StylesConfig = {
		dropdownIndicator: () => ({
			display: 'none',
		}),
		singleValue: () => ({}),
		control: () => ({}),
	};

	const formatOptionLabel = ({ label, Icon, link, isActive, onClick }: ReactSelectOptionProps) => {
		if (label === 'header.nav.markets')
			return (
				<MenuInside isActive={isActive} onClick={onClick}>
					{t(label)}
				</MenuInside>
			);
		return (
			<Link href={link} onClick={onClick}>
				<LabelContainer>
					{label !== 'Futures' ? t(label) : <NavLabel>{t(label)}</NavLabel>}
					{Icon && <Icon />}
				</LabelContainer>
			</Link>
		);
	};

	return (
		<nav>
			<MenuLinks>
				{menuLinks.map(({ i18nLabel, link }) => {
					const routeBase = asPath.split('/')[1];
					const linkBase = link.split('/')[1];
					const isActive = routeBase === linkBase;
					const subLinks = NAV_SUB_MENUS[link];
					if (!subLinks) {
						return (
							<div key={getLink(link)}>
								<Link href={getLink(link)}>
									<MenuInside isActive={isActive}>{t(i18nLabel)}</MenuInside>
								</Link>
							</div>
						);
					}

					const options = subLinks.map((l) => {
						return { label: l.i18nLabel, Icon: l.Icon, link: l.link, onClick: () => {} };
					});

					return (
						<DropDownSelect
							formatOptionLabel={formatOptionLabel}
							customStyles={styles}
							controlHeight={41}
							options={options}
							value={{ label: i18nLabel, isActive }}
							menuWidth={240}
							components={{ IndicatorSeparator, DropdownIndicator }}
							isSearchable={false}
							noOutline
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
`;

const MenuInside = styled.div<{ isActive: boolean }>`
	${linkCSS};
	padding: 8px 13px;
	margin-right: 2px;
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 15px;
	text-transform: capitalize;
	border-radius: 100px;
	background: transparent;
	cursor: pointer;
	color: ${(props) =>
		props.isActive
			? props.theme.colors.selectedTheme.button.text
			: props.theme.colors.selectedTheme.gray};
	&:hover {
		background: ${(props) => props.theme.colors.selectedTheme.button.fill};
	}
`;

const DropDownSelect = styled(Select)`
	.react-select__control {
		padding: 0;
	}

	.react-select__group {
		padding: 20px;

		.react-select__group-heading {
			color: ${(props) => props.theme.colors.selectedTheme.button.text};
			font-size: 12px;
			padding: 0;
			margin-bottom: 15px;
			text-transform: none;
		}
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
