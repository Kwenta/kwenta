import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC, FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import LabelContainer from 'components/Nav/DropDownLabel';
import Select from 'components/Select';
import { DropdownIndicator, IndicatorSeparator } from 'components/Select/Select';
import { currentMarketState } from 'store/futures';
import { linkCSS } from 'styles/common';

import { DESKTOP_NAV_LINKS } from '../constants';

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
	const currentMarket = useRecoilValue(currentMarketState);

	function getLink(link: string) {
		return link.slice(0, 7) === '/market' ? `/market/?asset=${currentMarket}` : link;
	}

	const formatOptionLabel = ({ label, Icon, link, isActive, onClick }: ReactSelectOptionProps) => {
		if (label === 'header.nav.markets')
			return (
				<MenuInside isDropDown isActive={isActive} onClick={onClick}>
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
				{DESKTOP_NAV_LINKS.map(({ i18nLabel, link, links }) => {
					const routeBase = asPath.split('/')[1];
					const linkBase = link.split('/')[1];
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

					const options = links.map((l) => {
						return { label: l.i18nLabel, Icon: l.Icon, link: l.link, onClick: () => {} };
					});

					return (
						<DropDownSelect
							key={url}
							variant="transparent"
							formatOptionLabel={formatOptionLabel}
							controlHeight={34}
							options={options}
							value={{ label: i18nLabel, isActive }}
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
