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

	function getLink(link: string) {
		if (link.slice(0, 7) === '/market') {
			// Get lastVisited from local storage
			const lastVisitedMarket: string | null | undefined = getLastVisited();

			if (lastVisitedMarket !== null || lastVisitedMarket !== undefined) {
				return lastVisitedMarket?.slice(8);
			} else {
				return link;
			}
		} else {
			return link;
		}
	}

	function getLastVisited() {
		if (typeof window !== 'undefined') {
			console.log('we are running on the client');
			const lastVisitedMarket = localStorage.getItem('lastVisitedMarket');
			return lastVisitedMarket;
		} else {
			console.log('we are running on the server');
		}
	}

	return (
		<nav>
			<MenuLinks>
				{menuLinks.map(({ i18nLabel, link }) => {
					console.log('Link: ', link);

					const isActive =
						asPath === link ||
						(asPath.includes('dashboard') && link.includes('dashboard')) ||
						(asPath.includes('market') && link.includes('market')) ||
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
