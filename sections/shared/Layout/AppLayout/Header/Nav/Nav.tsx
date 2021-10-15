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
	return (
		<nav>
			<MenuLinks>
				{menuLinks.map(({ i18nLabel, link }) => {
					const isActive =
						asPath === link ||
						(asPath.includes('market') && link.includes('market')) ||
						(asPath.includes('leaderboard') && link.includes('leaderboard'));
					return (
						<MenuLinkItem key={link} isActive={isActive}>
							<Link href={link}>
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
		text-transform: capitalize;
		color: ${(props) => (props.isActive ? props.theme.colors.white : props.theme.colors.silver)};
		&:hover {
			color: ${(props) => props.theme.colors.white};
		}
	}
`;

export default Nav;
