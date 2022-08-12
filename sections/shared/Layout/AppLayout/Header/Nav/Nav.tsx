import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import { currentMarketState } from 'store/futures';
import { linkCSS } from 'styles/common';

import { menuLinksState } from '../states';

const Nav: FC = () => {
	const { t } = useTranslation();
	const { asPath } = useRouter();
	const menuLinks = useRecoilValue(menuLinksState);
	const currentMarket = useRecoilValue(currentMarketState);

	function getLink(link: string) {
		return link.slice(0, 7) === '/market' ? `/market/?asset=${currentMarket}` : link;
	}

	return (
		<nav>
			<MenuLinks>
				{menuLinks.map(({ i18nLabel, link }) => {
					const routeBase = asPath.split('/')[1];
					const linkBase = link.split('/')[1];
					const isActive = routeBase === linkBase;

					return (
						<MenuLinkItem key={getLink(link)} isActive={isActive}>
							<Link href={getLink(link)}>{t(i18nLabel)}</Link>
						</MenuLinkItem>
					);
				})}
			</MenuLinks>
		</nav>
	);
};

const MenuLinks = styled.ul`
	display: flex;
`;

const MenuLinkItem = styled.li<{ isActive: boolean }>`
	a {
		${linkCSS};
		padding: 8px 13px;
		margin-right: 2px;
		font-family: ${(props) => props.theme.fonts.bold};
		font-size: 15px;
		text-transform: capitalize;
		border-radius: 100px;
		background: transparent;
		color: ${(props) =>
			props.isActive
				? props.theme.colors.selectedTheme.button.text
				: props.theme.colors.selectedTheme.gray};
		&:hover {
			background: ${(props) => props.theme.colors.selectedTheme.button.fill};
		}
	}
`;

export default Nav;
