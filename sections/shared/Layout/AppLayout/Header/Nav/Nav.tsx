import styled from 'styled-components';
import { FC } from 'react';
import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { useTranslation } from 'react-i18next';

import { linkCSS } from 'styles/common';

import { menuLinksState } from '../states';

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
				return lastVisited?.slice(8);
			} else {
				return link;
			}
		} else {
			return link;
		}
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
							<Link href={getLink(link)}>
								<a>{t(i18nLabel)}</a>
							</Link>
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
