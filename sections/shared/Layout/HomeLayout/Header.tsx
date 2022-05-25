import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import ROUTES from 'constants/routes';

import { MobileHiddenView, MobileOnlyView } from 'components/Media';
import Button from 'components/Button';

import UserMenu from '../AppLayout/Header/UserMenu';
import AppHeader from '../AppLayout/Header';
import Logo from '../Logo';
import { GridDivCenteredCol, TextButton } from 'styles/common';
import ArrowUpRightIcon from 'assets/svg/app/arrow-up-right-tg.svg';
import CaretDownGrayIcon from 'assets/svg/app/caret-down-gray-slim.svg';

import SmoothScroll from 'sections/homepage/containers/SmoothScroll';
import { useRecoilValue } from 'recoil';
import { isL2State } from 'store/wallet';
import router from 'next/router';
import { EXTERNAL_LINKS } from 'constants/links';

const Header: FC = () => {
	const { t } = useTranslation();
	const { howItWorksRef, faqRef, scrollToRef } = SmoothScroll.useContainer();
	const isL2 = useRecoilValue(isL2State);

	const links = useMemo(
		() => [
			{
				id: 'market',
				label: t('homepage.nav.markets'),
				onClick: () => {
					return router.push(ROUTES.Markets.Home);
				},
			},
			{
				id: 'governance',
				label: t('homepage.nav.governance'),
				ref: howItWorksRef,
				icon: <CaretDownGrayIcon />,
			},
			{
				id: 'socials',
				label: t('homepage.nav.socials'),
				ref: faqRef,
				icon: <CaretDownGrayIcon />,
			},
			{
				id: 'blogs',
				label: t('homepage.nav.blog'),
				icon: <ArrowUpRightIcon />,
				onClick: () => window.open(EXTERNAL_LINKS.Social.Mirror, '_blank'),
			},
		],
		// eslint-disable-next-line
		[t]
	);

	return (
		<>
			<MobileHiddenView>
				<Container>
					<Logo isL2={isL2} isHomePage={true} />
					<Links>
						{links.map(({ id, label, ref, icon, onClick }) => (
							<StyledTextButton
								key={id}
								onClick={() => {
									ref ? scrollToRef(ref) : onClick?.();
								}}
							>
								{label}
								{icon}
							</StyledTextButton>
						))}
					</Links>
					<MenuContainer>
						<UserMenu />
						<Link href={ROUTES.Home.Overview}>
							<Button variant="primary" isRounded={false} size="sm">
								{t('homepage.nav.start-trade')}
							</Button>
						</Link>
					</MenuContainer>
				</Container>
			</MobileHiddenView>
			<MobileOnlyView>
				<AppHeader />
			</MobileOnlyView>
		</>
	);
};

const Container = styled.header`
	display: grid;
	align-items: center;
	width: 100%;
	grid-template-columns: 1fr 1fr 1fr;
`;

const Links = styled.div`
	display: flex;
	flex-direction: row;
	white-space: nowrap;
	justify-self: center;
`;

const StyledTextButton = styled(TextButton)`
	display: flex;
	flex-direction: row;
	align-items: center;
	font-size: 15px;
	line-height: 15px;
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.common.tertiaryGray};
	margin: 0px 20px;
	&:hover {
		color: ${(props) => props.theme.colors.white};
	}
	svg {
		margin-left: 5px;
	}
`;

const MenuContainer = styled(GridDivCenteredCol)`
	grid-gap: 24px;
	justify-self: end;
`;

export default Header;
