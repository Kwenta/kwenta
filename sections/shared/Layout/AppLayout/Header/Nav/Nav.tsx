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

	function getLink(link: string): string | undefined {
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
					const isActive =
						asPath === link ||
						(asPath.includes('dashboard') && link.includes('dashboard')) ||
						(asPath.includes('market') && link.includes('market')) ||
						(asPath.includes('exchange') && link.includes('exchange')) ||
						(asPath.includes('leaderboard') && link.includes('leaderboard')) ||
						(asPath.includes('earn') && link.includes('earn'));
					return (
						<MenuLinkItem key={`${getLink(link)}`} isActive={isActive}>
							<Link href={`${getLink(link)}`}>
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
	padding-right: 20px;
	a {
		${linkCSS};
		font-family: ${(props) => props.theme.fonts.bold};
		font-size: 15px;
		text-transform: capitalize;
		color: ${(props) =>
			props.isActive
				? props.theme.colors.common.primaryGold
				: props.theme.colors.common.secondaryGray};
		&:hover {
			color: ${(props) => props.theme.colors.white};
		}
	}
`;

export default Nav;
